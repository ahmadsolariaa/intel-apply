# Intel Apply — Agent Portal

Next.js + HeroUI Pro agent portal with working Applications, Contracts, Commissions, and Analytics.

## Stack

- Next.js 16 (App Router)
- HeroUI / HeroUI Pro
- Prisma + **SQLite** locally (`prisma/dev.db`)
- Cookie session auth (JWT via `jose`)

> For Koyeb production, switch Prisma `provider` to `postgresql` and set `DATABASE_URL` to your Postgres connection string.

## Setup

```bash
cd web
cp .env.example .env
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Open http://localhost:3003

### Demo login

- Email: `goabroad.uz@gmail.com`
- Password: `Poiuytrewq8!`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server on port 3003 |
| `pnpm db:push` | Sync Prisma schema |
| `pnpm db:seed` | Seed demo user + data |
| `pnpm db:reset` | Reset DB + seed |
| `pnpm build` | Production build |

## Features

- Login / logout
- **My Applications** — list, tabs, search, pagination, create, detail, tasks, document upload, delete
- **Contract Hub** — list, tabs, search, create, detail/status, delete
- **Commission Hub** — KPI cards, pipeline statuses, create, detail, advance status
- **Analytics** — live aggregates with period/institution filters
- Global search + notifications in the top bar

## Uploads

Application documents are stored under `public/uploads/`.
