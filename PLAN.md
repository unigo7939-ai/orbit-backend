# ORBIT Alpha v0.1 — Backend Technical Plan

> AI Opportunity Intelligence Network — backend + admin CMS
> Source of truth: `ORBIT Alpha v0.1 后端开发文档.docx`

## 1. Scope (Alpha)

**Build now**

- REST API (public / authenticated / admin) per spec
- SIWE (Sign-In With Ethereum) authentication
- Supabase PostgreSQL schema + RLS + seeds
- Orbit Score engine (5 weighted components, admin-configurable)
- Track Record engine (auto-calculated stats)
- Subscriptions with on-chain (Base) USDC/ETH payment verification
- Simple Admin CMS UI (Dashboard, Signals, Predictions, Results, Users, Subscriptions, Orbit Score, Settings)

**Do NOT build in Alpha (reserved)**

Twitter automation, AI signal engine, NFT system, Universe system, public leaderboard, marketplace, autonomous agent, DAO.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| API | Route Handlers under `app/api/*` |
| Database | Supabase PostgreSQL |
| Auth | SIWE + encrypted httpOnly cookie session (`iron-session`) |
| Storage | Supabase Storage (avatars) |
| Chain reads | `viem` (Base mainnet, payment verification) |
| Validation | `zod` |
| Rate limit | `@upstash/ratelimit` + `@upstash/redis` (optional) |
| Deployment | Vercel |

## 3. Project Structure

```
orbit-backend/
├─ app/
│  ├─ api/
│  │  ├─ auth/{nonce,verify,logout}/route.ts
│  │  ├─ signals/route.ts            # GET public / POST admin
│  │  ├─ signals/[id]/route.ts       # GET / PUT / DELETE admin
│  │  ├─ predictions/route.ts        # POST admin
│  │  ├─ results/route.ts            # POST admin
│  │  ├─ track-record/route.ts       # GET public
│  │  ├─ categories/route.ts         # GET public / POST admin
│  │  ├─ score-config/route.ts       # GET / POST admin
│  │  ├─ plans/route.ts              # GET / POST admin
│  │  ├─ profile/route.ts            # GET auth
│  │  └─ subscription/{route,verify-payment}.ts
│  ├─ admin/                         # Admin CMS pages
│  │  ├─ layout.tsx                  # admin guard + nav
│  │  ├─ page.tsx                    # Dashboard
│  │  ├─ signals/page.tsx
│  │  ├─ predictions/page.tsx
│  │  ├─ results/page.tsx
│  │  ├─ users/page.tsx
│  │  ├─ subscriptions/page.tsx
│  │  ├─ score/page.tsx              # Orbit Score weights
│  │  └─ settings/page.tsx
│  └─ login/page.tsx                 # SIWE connect
├─ lib/
│  ├─ supabase/{server,admin}.ts
│  ├─ auth/{siwe,session,guards}.ts
│  ├─ chain/payment.ts
│  ├─ score/orbitScore.ts
│  ├─ trackRecord.ts
│  └─ validation/*.ts
├─ supabase/migrations/*.sql
├─ .env.example
└─ package.json
```

## 4. Database Schema

### Enums

- `user_role`: user | admin | super_admin
- `user_status`: active | banned
- `plan_type`: free | alpha | pro
- `sub_status`: inactive | active | expired
- `opportunity_type`: momentum | value | narrative | event | contrarian
- `signal_status`: watch | research | build_position | high_conviction | risk_alert
- `risk_level`: low | medium | high | extreme
- `result_status`: win | loss | breakeven | invalidated | pending
- `payment_asset`: usdc | eth
- `action_type`: buy | sell | hold | accumulate | reduce

### Tables

**users** — id (uuid pk), wallet_address (text unique, lowercase), nickname, avatar_url, role (user_role, default user), status (user_status, default active), subscription_plan (plan_type, default free), subscription_status (sub_status, default inactive), created_at, updated_at

**signal_categories** — id, name (unique), slug (unique), sort_order
Seed: AI, Crypto, RWA, DePIN, Infrastructure

**signal_subcategories** — id, category_id (fk), name, slug, sort_order
Seed mapping:
- Crypto → BTC Ecosystem, ETH Ecosystem, SOL Ecosystem, Base Ecosystem, BNB Ecosystem, Emerging Chains
- AI → AI Agent, AI Infrastructure, AI Application
- RWA → Stablecoin, Tokenized Assets, On-chain Finance
- DePIN → Storage, GPU, Network, Energy
- Infrastructure → Oracle, Cross-chain, Data Layer, Middleware

**signals** — id, asset, category_id (fk), subcategory_id (fk), opportunity_type, status (signal_status), risk_level, time_window_days (7|14|30|60), summary, reason, money_flow_score (0-100), growth_score, social_score, market_structure_score, ai_conviction_score, orbit_score (computed 0-100), created_by (fk users), created_at, updated_at

**predictions** — id, signal_id (fk), entry_price (numeric), target_price, invalid_price, position_size, action_type, published_at

**results** — id, signal_id (fk), return_percent (numeric), status (result_status), verified_at, notes

**subscriptions** — id, user_id (fk), plan, payment_asset, payment_hash (unique), amount (numeric), start_date, end_date, status

**score_config** (singleton) — id, money_flow (30), growth (25), social_momentum (20), market_structure (15), ai_conviction (10), updated_by, updated_at

**plans** — id, name (plan_type), price_usdc (numeric), duration_days (int), features (jsonb), active (bool)
Seed: Free/0, Alpha/19, Pro/99

### RLS

- Public SELECT: signals, signal_categories, signal_subcategories, results, plans, track_record view.
- users / subscriptions: owner or admin only.
- All writes via server `service_role` + in-code role check.

## 5. Orbit Score

`orbit_score = round( Σ(component_i * weight_i) / Σ(weight_i) )`, components 0-100, weights from `score_config` (default 30/25/20/15/10). Weight changes apply to new/edited signals only; historical scores are snapshots.

## 6. SIWE Auth Flow

1. `GET /api/auth/nonce` → server stores nonce in session.
2. Wallet signs SIWE message → `POST /api/auth/verify {message, signature}`.
3. Server verifies signature + nonce + domain → upsert `users` (auto-create on first login) → write encrypted cookie.
4. `requireAuth()` / `requireAdmin()` guards read role from cookie.

Bootstrap: `ADMIN_WALLET_ADDRESS` env → seeded as `super_admin` (username `orbit_admin`).

## 7. Subscription & Payment

Plans: Free 0 / Alpha 19 USDC / Pro 99 USDC per month, paid to `PAYMENT_WALLET_ADDRESS` (`0x0b3a4F0a8C9834E8A9b22e1AFD1c3Ae3B919E09f`) on Base mainnet.

Flow: client transfers → gets `txHash` → `POST /api/subscription/verify-payment {txHash, plan, asset}` → server uses viem to read the Base tx: validate recipient, amount, confirmations, and `payment_hash` uniqueness → insert `subscriptions`, update `users.subscription_*`.

## 8. Track Record Engine

SQL view `track_record_summary` over `results`: win_rate, avg_return, max_return, max_drawdown, total_signals, verified_signals. Exposed via `GET /api/track-record` (optional category/time filters).

## 9. API Summary

| Method | Path | Access |
|---|---|---|
| GET | /api/signals | public |
| GET | /api/signals/:id | public |
| GET | /api/results | public |
| GET | /api/track-record | public |
| GET | /api/categories | public |
| GET | /api/profile | auth |
| GET | /api/subscription | auth |
| POST | /api/subscription/verify-payment | auth |
| POST/PUT/DELETE | /api/signals(/:id) | admin |
| POST | /api/predictions | admin |
| POST | /api/results | admin |
| POST | /api/categories | admin |
| POST | /api/score-config | admin |
| POST | /api/plans | admin |
| GET/POST | /api/auth/nonce, /verify, /logout | public |

## 10. Security

RLS, rate limiting (per IP/wallet), zod input validation, SIWE wallet verification, admin permission re-check, `service_role` key server-only, CORS allowlist.

## 11. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
SIWE_DOMAIN=
BASE_RPC_URL=
PAYMENT_WALLET_ADDRESS=0x0b3a4F0a8C9834E8A9b22e1AFD1c3Ae3B919E09f
USDC_CONTRACT_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
ADMIN_WALLET_ADDRESS=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 12. Milestones

- M0 Scaffold: Next.js + TS, deps, env, Supabase clients
- M1 Database: migrations (enums, tables, indexes, RLS, seeds)
- M2 Auth: SIWE nonce/verify/logout, session, guards
- M3 Public read APIs: signals, categories, results, track-record
- M4 Admin APIs + Orbit Score engine
- M5 Profile / subscription + on-chain payment verification
- M6 Admin CMS pages + rate limiting + deploy docs
