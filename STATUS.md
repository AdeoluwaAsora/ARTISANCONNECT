# ArtisanConnect — Full-Stack Project Status

## What this is

ArtisanConnect is a marketplace connecting customers with local artisans (electricians,
plumbers, carpenters, mechanics, painters, AC technicians, solar installers, housing agents)
— similar in spirit to an Uber-for-tradespeople. Customers post jobs, artisans bid, jobs get
assigned, work happens, payment is released, reviews get left.

This file exists so a new contributor (human or AI) can pick up exactly where things left off
without re-deriving the architecture from scratch. **Read it fully before writing any code —
it reflects real decisions already made, not just plans.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router v7, TanStack Query, Axios, React Hook Form + Zod, CSS Modules (no UI framework) |
| API | ASP.NET Core 9 Web API, Clean Architecture, CQRS via MediatR |
| Database | PostgreSQL 16 + PostGIS (geospatial), via Npgsql EF Core provider |
| ORM | Entity Framework Core 9, code-first migrations |
| Auth | JWT access tokens + rotating refresh tokens (custom, not ASP.NET Identity) |
| Validation | FluentValidation (backend, via MediatR pipeline), Zod (frontend) |
| Caching | Redis (StackExchange.Redis) — wired up, not yet used by any feature |
| Real-time | SignalR — `ChatHub` at `/hubs/chat` (chat messages, receipts, typing, presence). JWT passed as `?access_token=` for `/hubs` paths. |
| Docs | Swagger / OpenAPI (Development environment only) |
| Containers | Docker Compose: `frontend` (nginx), `api`, `postgres` (postgis/postgis image), `redis` |
| Logging | Serilog, console sink |

---

## How to run the full stack

```bash
cp .env.example .env   # fill in POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET (32+ chars)
docker compose up --build
```

- **Frontend:** `http://localhost:3000`
- **API:** `http://localhost:8080` - Swagger (dev only): `http://localhost:8080/swagger` - Health: `http://localhost:8080/health`

nginx serves the frontend and reverse-proxies `/api/*` and `/hubs/*` to the `api` container,
so the browser only ever talks to port 3000.

**Migrations are NOT run automatically on container start.** After any entity change:
```bash
dotnet ef migrations add <DescriptiveName> --project src/ArtisanConnect.Infrastructure --startup-project src/ArtisanConnect.API
dotnet ef database update --project src/ArtisanConnect.Infrastructure --startup-project src/ArtisanConnect.API
```
Requires Postgres running first (`docker compose up -d postgres redis`) since `dotnet ef` runs
on the host, not in a container.

---

## Backend Architecture — Clean Architecture, strictly layered

```
src/ArtisanConnect.Core            Domain entities, enums. Zero framework dependencies
                                    (only NetTopologySuite for geo types).

src/ArtisanConnect.Application     CQRS Commands/Queries + Handlers (MediatR), FluentValidation
                                    validators, DTOs (*Result classes), and the INTERFACES that
                                    Infrastructure implements (IApplicationDbContext,
                                    ICurrentUserService, ITokenService, IPasswordHasher,
                                    IEmailSender, IJwtSettingsAccessor). Depends only on Core.

src/ArtisanConnect.Infrastructure  Implements Application's interfaces. EF Core DbContext +
                                    entity configurations, Npgsql/PostGIS, Redis, JWT bearer
                                    scheme + role policies, password hashing, email (currently
                                    logs instead of sending).

src/ArtisanConnect.API             Program.cs (composition root), Controllers, DTOs (*Request
                                    classes), global exception middleware, Swagger/CORS/
                                    rate-limiting config.
```

**Dependency rule**: `API -> Infrastructure -> Application -> Core`, never the reverse. Core
and Application never reference Infrastructure or API.

### Feature folder pattern (Application layer)

Every feature lives under `Features/<Area>/<FeatureName>/` with up to 3 files:
```
Features/Authentication/Register/
  RegisterCommand.cs              (or *Query.cs for reads)
  RegisterCommandValidator.cs     (FluentValidation rules — optional if nothing to validate)
  RegisterCommandHandler.cs       (the actual logic)
```
Controllers only translate between wire DTOs (`*Request` in `API/Controllers/`) and internal
Commands/Queries — they contain no business logic.

### Adding a new entity — the checklist every backend feature follows

1. Entity class in `Core/Entities/` (inherits `BaseEntity` — gives `Id`, `CreatedAtUtc`,
   `UpdatedAtUtc`, `IsDeleted` soft-delete, `RowVersion` optimistic concurrency)
2. EF configuration class in `Infrastructure/Persistence/Configurations/`
   (`IEntityTypeConfiguration<T>`) — picked up automatically via
   `ApplyConfigurationsFromAssembly`, no manual registration needed
3. Add `DbSet<T>` to **both**:
   - `Application/Common/Interfaces/IApplicationDbContext.cs` (the interface)
   - `Infrastructure/Persistence/ApplicationDbContext.cs` (the implementation, as
     `public DbSet<T> Name => Set<T>();`)
4. Generate + apply a migration (see "How to run" above), then commit **all three** changed
   files together: `<timestamp>_<Name>.cs`, its `.Designer.cs`, and the updated
   `ApplicationDbContextModelSnapshot.cs`. Leaving the snapshot out makes EF think the change
   never happened, and the next migration tries to apply it again (this happened with AddBids).

### Standard response envelope (both sides agree on this shape)

Every endpoint returns `ApiResponse<T>` (`Application/Common/Models/ApiResponse.cs` on the
backend, `src/types/api.ts`'s `ApiResponse<T>` on the frontend):
```json
{ "success": true, "message": "...", "data": { ... }, "errors": [], "timestampUtc": "..." }
```
List endpoints return `PaginatedList<T>` inside `data` (page size capped at 50 server-side).
**Frontend always checks `.success` before trusting `.data`** — see `src/api/authApi.ts` for
the pattern.

### Exception -> HTTP status mapping

| Exception (`Application/Common/Exceptions/`) | HTTP Status | When to use |
|---|---|---|
| `ValidationException` (ours, not FluentValidation's) | 400 | Thrown automatically by the pipeline behavior on validator failure |
| `BadRequestException` | 400 | Input well-formed but semantically invalid (e.g. expired reset token) |
| `UnauthorizedAccessException` (built-in .NET type) | 401 | "We don't know who you are" / bad credentials |
| `ForbiddenAccessException` | 403 | "We know who you are, the answer is no" |
| `NotFoundException` | 404 | Entity doesn't exist |
| `ConflictException` | 409 | Valid input conflicts with current state (duplicate email, editing a non-Open job) |

### Auth model

- Custom JWT + rotating refresh tokens — **not** ASP.NET Core Identity.
- Refresh tokens stored **hashed** (SHA-256), rotated on every use; reuse of an
  already-rotated token revokes every active session for that user (theft-detection heuristic).
- Roles: `Customer = 1, Artisan = 2, Admin = 3` (enum on `User.Role`, stored as **string** in
  DB, sent as **string** in API responses e.g. `"Artisan"` — frontend's `UserRoleName` type
  matches this; only the *register request payload* sends role as a number).
  Admin accounts cannot self-register.
- Policies: `RequireCustomerRole`, `RequireArtisanRole`, `RequireAdminRole` via
  `[Authorize(Policy = "...")]`.
- **Frontend mirrors this**: `src/routes/ProtectedRoute.tsx` guards routes by role,
  `src/store/authSession.ts` + `AuthContext.tsx` hold the session client-side, JWT auto-refresh
  handled by an Axios interceptor in `src/api/client.ts`.

### Geospatial (PostGIS)

`Job.Location` is a `NetTopologySuite.Geometries.Point`, mapped to a Postgres
`geography (Point, 4326)` column with a GiST index. **Convention:
`new Point(longitude, latitude)` — X is longitude, Y is latitude, easy to get backwards.**
`ArtisanProfile.Location` (nullable, same column type + GiST index) is the artisan's service
location; Nearby Search filters with `IsWithinDistance` → `ST_DWithin` and orders by
`Distance` → `ST_Distance` (both metres on geography). **Privacy rule: other users only ever
get a distance, never an artisan's coordinates** (`ArtisanSummaryResult` has none; only the
artisan's own `GET /users/me` includes them).

---

## Frontend Architecture — feature-based, no UI framework

```
artisanconnect_frontend/src/
  api/              -> client.ts (Axios + interceptors), unwrap.ts (ApiError helpers), and one
                       *Api.ts per backend area: auth, jobs, bids, artisans, notifications, chat
  components/
    ui/             -> Button, Card, Badge, PulseDot, Tabs, Switch (+ index.ts barrel)
    forms/          -> Input, Textarea, PasswordInput, Select, Checkbox (+ index.ts barrel)
    layout/         -> Navbar, Footer, Sidebar, Topbar
    common/         -> StatCard, JobCard
  features/
    auth/           -> Zod schemas, AuthLayout
    artisans/       -> ArtisanCard, ArtisanFilters, ArtisansMapView, SearchOriginPicker,
                       ArtisanSettingsForm, useSearchOrigin
    jobs/           -> Zod schemas, StepIndicator, 5 wizard steps
    bids/           -> BidCard, SubmitBidForm
    chat/           -> ConversationList, ChatWindow, MessageBubble, TypingIndicator,
                       chatHub.ts (SignalR), useChatHubConnection, useStartChat
    notifications/  -> NotificationBell
    landing/        -> all marketing page sections
  pages/            -> route-level pages, organized by customer/ artisan/ jobs/ chat/ auth/
  store/            -> authSession.ts, AuthContext.tsx
  routes/           -> AppRoutes.tsx, ProtectedRoute.tsx
  layouts/          -> MainLayout (public site), DashboardLayout (authenticated app shell)
  types/            -> auth.ts, api.ts, job.ts, bid.ts, artisan.ts, chat.ts, notification.ts
  hooks/            -> usePageTitle, useGeolocation
  lib/              -> cities, initials, timeAgo (small shared helpers)
  styles/           -> tokens.css (colors/type/spacing/radius/shadow/motion), global.css
```

**When adding a new component to `ui/` or `forms/`, always add its export to that folder's
barrel `index.ts` too** — forgetting this was a recurring source of build breaks.

---

## What's DONE

### Backend (tested working in Swagger against real Postgres)
- Clean Architecture solution structure, Docker Compose, JWT bearer auth + role policies,
  global exception handling, Swagger with Bearer auth, Serilog request logging, IP rate
  limiting, health checks
- **Auth:** register (Customer/Artisan — Artisan requires `trade` + `yearsOfExperience`,
  creates `ArtisanProfile` in the same transaction), login, refresh-token (rotating, reuse
  detection), logout, forgot-password (generic response, no email enumeration, logs token to
  console — see Known Gaps), reset-password (single-use token, revokes all sessions)
- **Profiles:** `GET/PUT /api/v1/users/me`, `PUT /api/v1/artisans/me/profile` (now also takes
  the service location: `latitude`/`longitude` — both or neither, neither clears it — and
  `city`).
- **Artisans (public, no sign-in):** `GET /api/v1/artisans/nearby?latitude&longitude` (required)
  `&radiusKm` (default 50, max 200) `&trade&verifiedOnly&availableOnly`, nearest first;
  `GET /api/v1/artisans/{userId}` (optional `latitude`/`longitude` for a distance). Both return
  `ArtisanSummaryResult` with `JobsCompleted` counted from Completed jobs. Artisans without a
  location, or whose account is inactive, are left out.
- **Jobs:** create, get by id, get own (paginated), update (owner-only, Open-status-only),
  cancel (owner-only, Open-status-only), and `GET /api/v1/jobs/open` (Artisan-only, paginated,
  optional `?trade=` filter) for the artisan "Find Jobs" page. Budget is a range:
  `BudgetMin`/`BudgetMax` (validated max >= min); migration `SplitJobBudgetIntoRange` renamed
  the old `Budget` column so existing data survives. `Job.Status`: `Open -> Assigned ->
  InProgress -> Completed`, or `-> Cancelled` — accepting a bid sets `Assigned`; nothing sets
  `InProgress`/`Completed` yet. `JobResult` includes `BidCount` (excludes withdrawn) and
  `AssignedArtisanName`; every handler maps through `Features/Jobs/JobProjections.cs`.
- **Bids:** `Bid` entity (JobId, ArtisanId = artisan's `User.Id`, Amount, EtaMinutes, Message,
  Status `Pending/Accepted/Rejected/Withdrawn`). Endpoints:
  - `POST /api/v1/jobs/{jobId}/bids` (Artisan) — job must be Open; one active bid per
    artisan per job (can bid again after withdrawing).
  - `GET /api/v1/jobs/{jobId}/bids` — job owner sees all live bids; an artisan sees only
    their own; anyone else gets 403.
  - `GET /api/v1/bids/my` (Artisan), `PUT /api/v1/bids/{id}` and
    `POST /api/v1/bids/{id}/withdraw` (owning Artisan, Pending bids only).
  - `POST /api/v1/bids/{id}/accept` (owning Customer) — in one `SaveChangesAsync`: bid
    Accepted, job Assigned + `AssignedArtisanId`, every other pending bid Rejected.
  - `POST /api/v1/bids/{id}/reject` (owning Customer).
  Two filtered unique indexes back the rules in the database: one active bid per
  artisan/job, and one Accepted bid per job (a racing second accept gets a 409).
  Cancelling a job rejects its pending bids.
- **Notifications (in-app only):** `Notification` entity (UserId, Type, Title, Message,
  optional JobId, IsRead/ReadAtUtc). Created in the **same `SaveChangesAsync`** as the change
  they describe, via `Features/Notifications/NotificationFactory.cs` (all wording lives
  there). Triggers: `NewBid` → customer; `BidAccepted` → artisan; `BidRejected` → artisan
  (declined, or another bid accepted); `JobCancelled` → artisans with pending bids. Endpoints
  (any signed-in user, own notifications only): `GET /api/v1/notifications?unreadOnly`,
  `GET /api/v1/notifications/unread-count`, `POST /api/v1/notifications/{id}/read`,
  `POST /api/v1/notifications/read-all`. Still to add as those flows appear: `JobCompleted`
  (Contracts) and `ArtisanVerified` (Admin), plus push/SMS/email delivery.
- **Chat:** `Conversation` (one per customer–artisan pair, unique index; optional `JobId` tag;
  denormalised `LastMessageAtUtc`/`LastMessagePreview`; per-participant
  `CustomerLastReadAtUtc`/`ArtisanLastReadAtUtc`, which drive unread counts **and** read
  receipts, so there's no per-message read row) and `ChatMessage` (Content ≤ 2000). **Who can
  chat:** customers → any active artisan; artisans → only customers whose job they've bid on
  (any bid status); enforced in `StartConversationCommandHandler`. Non-participants get 404.
  REST (`/api/v1/conversations`): `POST` start/open `{participantId, jobId?}`, `GET` list,
  `GET {id}/messages` (newest first), `POST {id}/messages`, `POST {id}/read`.
  **SignalR** `ChatHub` at `/hubs/chat` (`API/Hubs/`) carries live events only — sending/reading
  go through REST: server → client `ReceiveMessage`, `ConversationRead`, `UserTyping`,
  `PresenceChanged`; client → server `Typing(conversationId, isTyping)`. Handlers push via
  `IChatNotifier` (Application interface, implemented in API as `SignalRChatNotifier`) after
  saving; online status via `IPresenceTracker` (in-memory singleton in Infrastructure — **move
  to Redis before running more than one API instance**). Text only: images need File uploads.

### Frontend (built, wired to the real backend where endpoints exist)
- **Landing page** — full marketing site: hero (custom radar illustration), 9 trade
  categories, popular services, how-it-works, featured artisans, testimonials, stats, CTA,
  download-app section, smooth-scroll anchor nav
- **Auth** — Login, Customer Register, Artisan Register, Forgot Password, Reset Password, all
  calling the real backend endpoints above
- **Design system** — full token set (`tokens.css`): Poppins/Inter type scale, 8pt spacing,
  radius, shadow (intentionally very subtle), motion
- **Dashboard template** — role-aware `Sidebar` + `Topbar` shell (`DashboardLayout`)
- **Customer & Artisan dashboards** — stat cards, recent activity, quick actions
- **Find Nearby Artisans** — real search via `src/api/artisansApi.ts`: filters (trade,
  distance, verified, online = `IsAvailable`), list view, **custom stylized map view**
  (placeholder — no Google Maps/Mapbox key yet; swap point commented in `ArtisansMapView.tsx`;
  pins are positioned without coordinates). "Searching near" comes from
  `SearchOriginPicker` / `useSearchOrigin` (browser GPS or a city centre from `lib/cities.ts`),
  remembered in localStorage and shared with the customer dashboard. Rating filter removed
  until Reviews exist.
- **Profiles** — Artisan Settings tab saves for real (`ArtisanSettingsForm`: trade, experience,
  rate, bio, availability, service location with GPS or city). Artisan dashboard's Online switch
  saves `IsAvailable` and prompts artisans with no location to set one. Portfolio,
  certificates and reviews tabs show "coming soon" (need File uploads / Reviews). Public
  artisan profile page is real. Customer "saved artisans" tab shows a "not available yet" note
  (no backend for saved artisans).
- **Jobs** — 5-step Post Job wizard, Job Details page, My Jobs / Find Jobs listings, all on
  the real backend via `src/api/jobsApi.ts`. The Location step has a "Use my current
  location" (browser GPS) button; if skipped, the job is placed at the centre of the chosen
  city from `lib/cities.ts`. Replace with real geocoding once a maps key exists.
- **Bidding** — submit/withdraw (artisan) and accept/reject (customer) on the Job Details
  page, plus My Bids and dashboard lists, all on the real backend via `src/api/bidsApi.ts`.
  Artisan rating and distance on bid cards are hidden until Reviews / Nearby Search exist.
  Editing a bid is API-only (`bidsApi.update`); there's no edit form yet.
- **Notifications** — real bell in the `Topbar` (`features/notifications/NotificationBell`):
  unread badge polled every 30 s, dropdown of the 20 newest, click opens the job and marks it
  read, "Mark all as read". A rising unread count also refreshes bid/job queries. Could move
  from polling to a push over the chat hub (`IChatNotifier`-style) later.
- **Chat** — real, via `src/api/chatApi.ts` (REST) + `features/chat/chatHub.ts` (one shared
  SignalR connection, started/stopped by `useChatHubConnection` in `DashboardLayout`). Live
  messages, read receipts, typing indicator, online dots. "Messages" sidebar link with unread
  total. Chats open from "Message" buttons (`useStartChat`) on: artisan public profile
  (customers), bid cards and the assigned-job page (customer), and the job page (artisan who
  bid). Image attach button hidden until File uploads. The open conversation is the `?c=` URL
  param.
- Note: `/find-artisans` and `/artisans/:id` sit inside the signed-in `ProtectedRoute`, even
  though their API endpoints are public. Move them out if visitors should search before signing
  up.

---

## Frontend/backend are currently OUT OF SYNC on several features

This is the most important thing to know before writing new code: several features have a
**fully built frontend UI running on mock data, but zero backend support**. Auth and Jobs are
now fully wired end to end.

| Feature | Frontend | Backend |
|---|---|---|
| Auth | real | real |
| Jobs (create/get/list/open-list/cancel) | real (`api/jobsApi.ts`); job photos local-only; "Mark as completed" button hidden until Contracts | real |
| Bidding | real (`api/bidsApi.ts`); no edit-bid form yet | real |
| Find Nearby Artisans | real (`api/artisansApi.ts`) + stylized placeholder map | real (PostGIS `ST_DWithin`) |
| Chat | real (`api/chatApi.ts` + `features/chat/chatHub.ts`); text only | real (REST + SignalR `ChatHub`) |
| Notifications | real bell + dropdown (`api/notificationsApi.ts`), polled every 30 s | real (in-app only) |
| Reviews & Ratings | mock display only | not started |
| Contracts & Payments | not started | not started |
| Admin dashboard | not started | not started |
| AI features | not started | not started |
| Trust/anti-fraud | not started | not started |
| File uploads | local preview only (`URL.createObjectURL`), nothing persisted | no storage abstraction built |

**Recommended next step: Contracts & Payments** — next unchecked item below. Needs a research pass on the Nomba payment API first.

---

## Fixed — artisan registration field name

Artisan sign-up used to fail with "Trade is required… / Years of experience is required…"
because the register page never sent those fields. It now sends `yearsOfExperience` and
`trade` — **as the enum number** (`TradeValue` in `src/types/api.ts`), since the API has no
string-enum converter (see Conventions).

---

## What's LEFT — recommended build order

Each backend item needs: entity (if new) -> EF config -> DbSet wiring -> migration ->
Command/Query + Handler + Validator -> Controller -> tested in Swagger -> **frontend swapped
from its mock service to the real endpoint** (the mock services were deliberately built with
matching function signatures so this swap shouldn't require touching the consuming
components/pages).

- [x] **Fix artisan registration field name** (see above)
- [x] **Wire frontend Jobs to real backend** (plus budget range, open-jobs endpoint, GPS/city location)
- [x] **Bidding** — see "Bids" under What's DONE. Mock `mockBids.ts`/`mockJobs.ts` deleted.
- [x] **Find Nearby Artisans** — done (see What's DONE). Still to do later: a rating filter once
      Reviews exist, and a real Google Maps/Mapbox map (`ArtisansMapView.tsx`) once there's an
      API key.
- [x] **Notifications** — in-app, see What's DONE. Later: `JobCompleted`/`ArtisanVerified`
      triggers and a push/SMS/email channel (none chosen yet).
- [x] **Chat / SignalR** — see What's DONE. Later: image messages (needs File uploads), older
      message paging in the UI, Redis-backed presence for multiple API instances.
      **Migration:** generate `AddChat` if `Infrastructure/Migrations/` has none.
- [ ] **Contracts & Payments** — `Contract`, `Payment` entities, escrow logic. Payment
      provider (Nomba, per original spec) not yet integrated — needs its own research pass.
- [ ] **Reviews & Ratings** — `Review` entity tied to a completed Job. Updates
      `ArtisanProfile`'s average rating (denormalized field — doesn't exist yet, add it).
- [ ] **Trust & Anti-Fraud** — security deposits, reputation score, new-artisan job-value
      limits. Depends on Bidding/Payments/Reviews existing first.
- [ ] **Admin** — approve/reject/suspend artisans (flips `ArtisanProfile.IsVerified`, which
      exists but is checked nowhere yet), dispute resolution, dashboard stats.
- [ ] **AI Features** — price estimation, artisan matching, fraud detection. Deliberately
      last: needs real historical Job/Bid/Payment data to be useful.
- [ ] **File uploads** — profile pictures, certificates, government ID, job images, chat
      images. Needs a provider decision (Azure Blob vs S3) and an `IFileStorageService`
      abstraction (planned, never built) before starting. Frontend currently only does local
      `URL.createObjectURL()` previews with nothing persisted server-side.

### Known gaps / not yet handled anywhere
- Email is not actually sent (logged only) — replace `LoggingEmailSender` before Forgot
  Password is production-usable.
- No refresh-token cleanup job (expired/revoked tokens accumulate indefinitely).
- **Optimistic concurrency is not actually on.** `BaseEntity.RowVersion`'s comment says it's
  mapped to Postgres `xmin`, but no EF configuration does that; it's a plain `bigint` column
  that never changes. Bidding relies on unique indexes instead. Wire up `xmin`
  (`.IsRowVersion()`) before features where two writers can collide on the same row (Admin,
  Payments).
- No rate limiting tuned beyond `login`/`forgot-password` — add more as sensitive endpoints
  are built.
- No separate `CustomerProfile` entity — saved addresses/saved artisans have nowhere to live
  server-side yet (frontend's "saved artisans" UI is currently local-state only).
- Frontend auth session pragmatically stores the refresh token in `localStorage` on
  "remember me" (not an httpOnly cookie) since the backend returns it in the response body —
  documented tradeoff in `src/store/authSession.ts`, would need a backend change (cookie-based
  refresh) to tighten.
- Production secrets handling — `.env` holds secrets in plaintext for local dev; needs a real
  secrets manager before any production deploy.

---

## Conventions to keep

### Backend
- **Enums stored as strings in Postgres** (`HasConversion<string>()` in every EF config).
- **Guids generated client-side** (`BaseEntity.Id = Guid.NewGuid()` at construction).
- **One `SaveChangesAsync` per logical operation**, even across multiple entities.
- **Never log a raw password or raw refresh/reset token** — only hashes are persisted.
- **Controllers contain no business logic** — build Command/Query, `_mediator.Send(...)`,
  wrap in `ApiResponse`. More than ~15 lines in a controller method means logic leaked into
  the wrong layer.
- **Ownership/role checks happen in the Handler**, not just via `[Authorize]` (the policy
  can't know which specific job belongs to which specific customer).
- **Enums: numbers in, names out.** No `JsonStringEnumConverter` is registered, so request
  bodies must send enums as numbers (`role`, `trade`, `requiredTrade`, `urgency`), while
  responses return them as names (`"AcTechnician"`, `"InProgress"`). Query-string enums
  (e.g. `?trade=`) accept either.
- **Renaming a column?** Hand-edit the generated migration to use `RenameColumn` — EF's default
  is drop + add, which loses data (see `SplitJobBudgetIntoRange`).

### Frontend
- **CSS Modules only** — no Tailwind/Bootstrap/MUI. All colors/spacing/type pull from
  `tokens.css` variables, never hardcoded.
- **API modules** live in `src/api/*Api.ts` (template: `jobsApi.ts`). They map backend
  `*Result` shapes to the frontend types and use `unwrap()` / `rethrowApiError()` from
  `src/api/unwrap.ts`, so pages get plain data or an `ApiError` carrying the backend's message.
  All the old `src/services/mock*.ts` services have been replaced and deleted.
- **Auth session lives in plain module state** (`authSession.ts`), not React state, so the
  Axios interceptor (`api/client.ts`) can reach it without a circular import;
  `AuthContext.tsx` wraps it for components via `useAuth()`.
- **One page-title source** — dashboard pages call `usePageTitle("...")` rather than each
  rendering its own `<h1>`; this drives the `Topbar` heading.
- Known recurring issue: **stale duplicate files** (e.g. an old `features/auth/api.ts`
  lingering alongside the correct `api/authApi.ts`) caused repeated confusing build errors.
  Before assuming a file needs edits, check whether an old duplicate exists elsewhere and
  should be deleted instead.

---

## For whoever (or whatever) picks this up next

Start with the "Known immediate fix" above (small, unblocks artisan registration), then the
frontend Jobs-to-real-backend swap (unlocks realistic end-to-end testing), then work the
"What's LEFT" checklist top to bottom — it's already in dependency order. For new backend
features, `Features/Jobs/` is the clearest existing template to copy (entity with a
non-trivial field, ownership checks, status-based rules, pagination). For new frontend
features, follow whichever existing feature under `src/features/` is closest in shape (e.g.
`bids/` for another simple CRUD-ish flow, `jobs/` for another multi-step form).
