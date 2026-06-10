# ORBIT Alpha Backend — Vercel Deployment

## Prerequisites

- GitHub repo with `orbit-backend` project
- Supabase project `orbit-alpha` (schema applied)
- Vercel account

## 1. Import project

1. [Vercel Dashboard](https://vercel.com/) → **Add New** → **Project**
2. Import the repository; set **Root Directory** to `orbit-backend` if the repo is monorepo
3. Framework: **Next.js** (auto-detected)

## 2. Environment variables

Add in **Settings → Environment Variables** (Production + Preview):

| Variable | Required | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `sb_secret_...` |
| `SESSION_SECRET` | Yes | 32+ char random hex |
| `SIWE_DOMAIN` | Yes | `your-domain.vercel.app` (no protocol) |
| `ADMIN_WALLET_ADDRESS` | Yes | Your admin wallet `0x...` |
| `PAYMENT_WALLET_ADDRESS` | Yes | `0x0b3a4F0a8C9834E8A9b22e1AFD1c3Ae3B919E09f` |
| `USDC_CONTRACT_BASE` | Yes | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| `BASE_RPC_URL` | Yes | `https://mainnet.base.org` |
| `UPSTASH_REDIS_REST_URL` | No | For distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | |

> After deploy, set `SIWE_DOMAIN` to your production hostname and redeploy.

## 3. Deploy

```bash
npm run build
```

Vercel runs `npm run build` automatically on push. Manual:

```bash
npx vercel --prod
```

## 4. Post-deploy checks

- `GET https://your-app.vercel.app/api/health` → `{ "ok": true }`
- `GET https://your-app.vercel.app/api/categories` → 5 categories
- `https://your-app.vercel.app/login` → wallet login
- `https://your-app.vercel.app/admin` → redirects to login if not authed

## 5. Custom domain (optional)

Vercel → Project → **Settings → Domains** → add domain → update `SIWE_DOMAIN` env → redeploy.

## 6. Supabase

Ensure RLS policies are applied (`supabase/migrations/0004_rls.sql`).  
Create `avatars` storage bucket (public read) if using profile avatars.
