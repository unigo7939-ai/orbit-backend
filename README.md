# ORBIT Alpha — Backend

AI Opportunity Intelligence Network — REST API + Admin CMS.
Stack: Next.js (App Router) · Supabase PostgreSQL · SIWE · viem (Base) · Vercel.

See [`PLAN.md`](./PLAN.md) for the full technical design and [`SUPABASE-SETUP.md`](./SUPABASE-SETUP.md) for database setup.

## Getting started

```bash
npm install --registry=https://registry.npmmirror.com
cp .env.example .env.local   # then fill in the Supabase keys
npm run dev                  # http://localhost:3000
```

Health check: `GET /api/health`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Structure

```
app/api/*    Route handlers (REST API)
app/admin/*  Admin CMS pages
lib/         Supabase clients, auth, chain, scoring, validation
supabase/    SQL migrations
```

## Milestones

- [x] M0 Scaffold
- [x] M1 Database migrations
- [x] M2 SIWE auth
- [x] M3 Public read APIs
- [x] M4 Admin APIs + Orbit Score
- [x] M5 Profile / subscription / payment verification
- [x] M6 Admin CMS + rate limiting + deploy
