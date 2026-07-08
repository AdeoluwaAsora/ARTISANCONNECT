# ArtisanConnect

An AI-powered artisan discovery, negotiation, and secure payment marketplace connecting customers with verified local tradespeople — electricians, plumbers, carpenters, and more.

## Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing-page.png)

### Login
![Login](docs/screenshots/login.png)

### Customer Dashboard
![Customer Dashboard](docs/screenshots/customer-dashboard.png)

### Artisan Dashboard
![Artisan Dashboard](docs/screenshots/artisan-dashboard.png)

### Find Nearby Artisans
![Find Artisans](docs/screenshots/find-artisans.png)

### Post a Job
![Post a Job](docs/screenshots/post-job.png)

### Real-Time Chat
![Chat](docs/screenshots/chat.png)

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, Axios, React Hook Form, Zod, CSS Modules

**Backend:** ASP.NET Core 9, PostgreSQL (PostGIS), Redis, JWT authentication

**Infrastructure:** Docker, Docker Compose, nginx

## Getting Started

\`\`\`bash
docker compose up --build
\`\`\`

Then open http://localhost:3000

## Project Structure

- \`artisanconnect_frontend/\` — React frontend
- \`src/\` — .NET backend (Core, Application, Infrastructure, API)
- \`docker-compose.yml\` — full stack orchestration