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
| Real-time | SignalR — package/DI wired up on backend, no hubs built yet. Frontend chat UI is fully built against mock data with a clearly marked swap point. |
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
4. Generate + apply a migration (see "How to run" above)

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
This is what will power Nearby Artisan Search (`ST_DWithin`/`ST_Distance`) — no such query
exists yet. **`ArtisanProfile` has no `Location` column yet** — required before that search
can actually work, since it's what gets queried against a job's location.

---

## Frontend Architecture — feature-based, no UI framework

```
artisanconnect_frontend/src/
  api/              -> apiClient (Axios + interceptors), authApi
  components/
    ui/             -> Button, Card, Badge, PulseDot, Tabs, Switch (+ index.ts barrel)
    forms/          -> Input, Textarea, PasswordInput, Select, Checkbox (+ index.ts barrel)
    layout/         -> Navbar, Footer, Sidebar, Topbar
    common/         -> StatCard, JobCard
  features/
    auth/           -> Zod schemas, AuthLayout
    artisans/       -> ArtisanCard, ArtisanFilters, ArtisansMapView
    jobs/           -> Zod schemas, StepIndicator, 5 wizard steps
    bids/           -> BidCard, SubmitBidForm
    chat/           -> ConversationList, ChatWindow, MessageBubble, TypingIndicator
    landing/        -> all marketing page sections
  pages/            -> route-level pages, organized by customer/ artisan/ jobs/ chat/ auth/
  services/         -> mock*.ts data services (jobs, bids, artisans, chat) + delay.ts
  store/            -> authSession.ts, AuthContext.tsx
  routes/           -> AppRoutes.tsx, ProtectedRoute.tsx
  layouts/          -> MainLayout (public site), DashboardLayout (authenticated app shell)
  types/            -> auth.ts, api.ts, job.ts, bid.ts, artisan.ts, chat.ts
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
- **Profiles:** `GET/PUT /api/v1/users/me`, `PUT /api/v1/artisans/me/profile`
- **Jobs:** create, get by id, get own (paginated), update (owner-only, Open-status-only),
  cancel (owner-only, Open-status-only). `Job.Status`: `Open -> Assigned -> InProgress ->
  Completed`, or `-> Cancelled` — nothing outside this module sets the latter three yet.

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
- **Find Nearby Artisans** — filters, list view, **custom stylized map view** (placeholder —
  no Google Maps/Mapbox API key available yet; swap point commented in `ArtisansMapView.tsx`)
- **Profiles** — Customer (saved artisans, job history, settings tabs), Artisan (portfolio,
  certificates, reviews, settings tabs), public artisan profile page
- **Jobs** — 5-step Post Job wizard, Job Details page, My Jobs / Find Jobs listings
- **Bidding** — submit/accept/reject UI, wired into Job Details page
- **Chat** — conversation list, message bubbles (read receipts), typing indicator, image
  attachments

---

## Frontend/backend are currently OUT OF SYNC on several features

This is the most important thing to know before writing new code: several features have a
**fully built frontend UI running on mock data, but zero backend support**, while Jobs has
**real backend endpoints the frontend isn't using yet**. Straightening this out should happen
before building anything net-new.

| Feature | Frontend | Backend |
|---|---|---|
| Auth | real | real |
| Jobs (create/get/list/update/cancel) | mock (`mockJobs.ts`) | real, unused by frontend |
| Bidding | mock (`mockBids.ts`) | not started |
| Find Nearby Artisans | mock + stylized map | not started (PostGIS column exists on `Job`, not on `ArtisanProfile` yet) |
| Chat | mock (`mockChat.ts`, simulated real-time) | not started (SignalR wired up, no hub built; JWT-over-SignalR already configured) |
| Notifications | static badge only, no real list | not started |
| Reviews & Ratings | mock display only | not started |
| Contracts & Payments | not started | not started |
| Admin dashboard | not started | not started |
| AI features | not started | not started |
| Trust/anti-fraud | not started | not started |
| File uploads | local preview only (`URL.createObjectURL`), nothing persisted | no storage abstraction built |

**Recommended next step: wire Jobs to the real backend first** — it's the one place backend
is ahead of frontend, and it's low-risk, high-value (unblocks testing Bidding realistically
once that's built too).

---

## Known immediate fix — artisan registration field name

The frontend was recently hitting this validation error:
```json
{ "errors": ["Trade is required for artisan registration.", "Years of experience is required for artisan registration."] }
```
**Resolved by this doc**: the backend's actual field name is **`yearsOfExperience`**
(camelCase, matching the backend's own wording), not `yearsExperience` as the frontend
currently has it. Fix:

1. `src/types/auth.ts` — add to `RegisterPayload`:
   ```ts
   trade?: string;
   yearsOfExperience?: number;
   ```
2. `src/pages/auth/ArtisanRegisterPage.tsx` — in the `authApi.register({...})` call, add:
   ```ts
   trade: values.trade,
   yearsOfExperience: values.yearsExperience,
   ```
   (the form field itself can keep its internal name `yearsExperience` — only the API payload
   key needs to match the backend exactly)

---

## What's LEFT — recommended build order

Each backend item needs: entity (if new) -> EF config -> DbSet wiring -> migration ->
Command/Query + Handler + Validator -> Controller -> tested in Swagger -> **frontend swapped
from its mock service to the real endpoint** (the mock services were deliberately built with
matching function signatures so this swap shouldn't require touching the consuming
components/pages).

- [ ] **Fix artisan registration field name** (see above — small, do first)
- [ ] **Wire frontend Jobs to real backend** (backend already built — see sync table above)
- [ ] **Bidding** — `Bid` entity (JobId, ArtisanId, Amount, Message, Status). Submit/edit/
      withdraw (Artisan), view-all/accept (Customer). Accepting one bid must, in the same
      transaction: set `Job.Status = Assigned`, set `Job.AssignedArtisanId`, set every other
      bid on that job to `Rejected`. Frontend UI already built — swap `mockBids.ts`.
- [ ] **Find Nearby Artisans** — first real use of PostGIS. Add `Location` column to
      `ArtisanProfile`, query via `ST_DWithin`. Filters: trade, rating (needs Reviews first),
      distance, availability, verified-only. Frontend already built — swap `mockArtisans.ts`
      and replace the placeholder map (`ArtisansMapView.tsx`) with real Google
      Maps/Mapbox once an API key exists.
- [ ] **Notifications** — `Notification` entity, triggered by: new bid, bid accepted, job
      completed, artisan verified. No delivery mechanism (push/SMS) chosen yet.
- [ ] **Chat / SignalR** — `Conversation` + `Message` entities, build `ChatHub`, map it in
      `Program.cs` (commented placeholder already there: `// app.MapHub<ChatHub>("/hubs/chat");`).
      JWT-over-SignalR already configured — don't redo that part. Frontend UI fully built
      with the swap point clearly marked in `src/services/mockChat.ts`.
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
- No rate limiting tuned beyond `login`/`forgot-password` — add more as sensitive endpoints
  are built.
- `ArtisanProfile` has no `Location` column (blocks Nearby Search — see above).
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

### Frontend
- **CSS Modules only** — no Tailwind/Bootstrap/MUI. All colors/spacing/type pull from
  `tokens.css` variables, never hardcoded.
- **Mock services pattern** (`src/services/mock*.ts`) simulate latency via a shared `delay()`
  helper and match the function signatures a real API module would use, so swapping to real
  endpoints is a contained change.
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
