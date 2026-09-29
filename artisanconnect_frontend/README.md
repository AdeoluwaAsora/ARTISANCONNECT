# ArtisanConnect — Frontend

Production-oriented React 19 + TypeScript frontend for the ArtisanConnect
marketplace, built feature-by-feature against a Feature-Based Architecture,
consuming an ASP.NET Core 9 Web API backend.

## Stack

- React 19 + TypeScript + Vite
- React Router v7 (data router)
- TanStack Query (server state)
- Axios (API layer, with interceptors — added as the API feature lands)
- React Hook Form + Zod (forms/validation)
- SignalR client (real-time chat / location — added with the Chat/Tracking features)
- Framer Motion (motion — added as interactive features land)
- CSS Modules (no UI framework; every component is hand-built)

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173 and proxies `/api` and `/hubs`
to the ASP.NET Core backend (configured in `vite.config.ts` — update the
target to match your local API port).

## What's built so far (Phase 0)

- [x] Project architecture & folder structure (`src/`)
- [x] Design system: colors, type scale, spacing, radius, shadow, motion
      tokens in `src/styles/tokens.css`
- [x] Global resets & typography utilities in `src/styles/global.css`
- [x] Routing skeleton (`src/routes/AppRoutes.tsx`) on React Router v7
- [x] Core reusable UI components: `Button`, `Badge`, `Card`, `PulseDot`
      (`src/components/ui`)
- [x] App shell: `Navbar`, `Footer`, `MainLayout`
- [x] Landing page with 9 sections (Hero, Categories, Popular Services,
      How It Works, Featured Artisans, Stats, Testimonials, CTA, Download App)

## Folder structure

```
src/
  api/            # axios instance + endpoint modules (per feature, as added)
  components/
    common/       # cross-feature presentational components
    layout/       # Navbar, Footer, Sidebar
    forms/        # shared form primitives (added with Auth/Post Job)
    ui/           # Button, Card, Badge, PulseDot, etc.
    maps/         # map + radar components (added with Find Artisans)
    chat/         # chat UI (added with Chat feature)
  features/
    auth/ customer/ artisan/ jobs/ bids/ reviews/ notifications/ admin/
    landing/      # marketing site sections
  hooks/          # shared hooks (useDebounce, useGeolocation, etc.)
  layouts/        # MainLayout, AdminLayout, FocusLayout
  pages/          # route-level page components
  routes/         # route table
  services/       # SignalR client, storage helpers, etc.
  store/          # auth context / global client state
  styles/         # tokens.css, global.css
  types/          # shared TypeScript interfaces (User, Job, Bid, etc.)
  utils/          # formatters, validators, helpers
```

## Next up (feature-by-feature, pending approval)

1. Authentication (Customer/Artisan registration, Login, Forgot/Reset Password)
2. Find Nearby Artisans (map + list + filters)
3. Customer & Artisan dashboards
4. Post Job (multi-step form)
5. Bidding, Chat, Reviews, Notifications
6. Admin dashboard
