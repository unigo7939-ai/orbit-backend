# Supabase Setup Guide (ORBIT Alpha)

Follow these steps once. At the end you'll paste 3 values into `.env.local`.

## 1. Create account & project

1. Go to https://supabase.com → **Sign in** (GitHub login is easiest).
2. **New project**.
   - Organization: create one if prompted (any name).
   - Name: `orbit-alpha`
   - Database Password: generate a strong one and **save it** (needed for direct DB access; not needed for the API keys).
   - Region: pick the one closest to your users (e.g. `Southeast Asia (Singapore)`).
   - Plan: **Free** is fine for Alpha.
3. Click **Create new project** and wait ~2 minutes for provisioning.

## 2. Grab the API credentials

1. In the project, open **Project Settings** (gear icon, bottom-left) → **API**.
2. Copy these three values:

| Supabase label | Goes into env var |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Project API keys → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Project API keys → `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

> The `service_role` key bypasses RLS. **Never** expose it to the browser or commit it. It only lives in server env.

## 3. Storage bucket (for avatars)

1. Left sidebar → **Storage** → **New bucket**.
2. Name: `avatars`, set it **Public** (read), click **Save**.

## 4. Apply database migrations

Two options — pick one:

**Option A — SQL Editor (no install, recommended for first run)**
1. Left sidebar → **SQL Editor** → **New query**.
2. Paste the contents of each file in `supabase/migrations/` in order and **Run**.

**Option B — Supabase CLI (repeatable)**
```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>   # ref is in the Project URL
supabase db push
```

## 5. Fill `.env.local`

Copy `.env.example` → `.env.local` and paste the 3 values from step 2, plus:

- `SESSION_SECRET` — any random 32+ char string (run `openssl rand -hex 32` or just mash keys).
- `ADMIN_WALLET_ADDRESS` — your wallet address; it becomes the `super_admin` (`orbit_admin`) on first login.
- `BASE_RPC_URL` — e.g. `https://mainnet.base.org` (or an Alchemy/Infura Base URL).

## 6. What to send me

Once done, tell me you've created the project. You do **not** need to send me the secret keys — just confirm the project exists and that you've filled `.env.local`. I'll have already written the migration SQL and code so you can run it.
