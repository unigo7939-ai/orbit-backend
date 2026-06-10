-- ============================================================================
-- ORBIT Alpha — full schema (all migrations combined)
-- Paste this ENTIRE file into Supabase SQL Editor and Run once.
-- Safe to re-run (idempotent).
-- ============================================================================

-- ========================= 0001 init =========================
create extension if not exists pgcrypto;

do $$ begin
  create type user_role as enum ('user', 'admin', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_status as enum ('active', 'banned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_type as enum ('free', 'alpha', 'pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sub_status as enum ('inactive', 'active', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type opportunity_type as enum ('momentum', 'value', 'narrative', 'event', 'contrarian');
exception when duplicate_object then null; end $$;

do $$ begin
  create type signal_status as enum ('watch', 'research', 'build_position', 'high_conviction', 'risk_alert');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_level as enum ('low', 'medium', 'high', 'extreme');
exception when duplicate_object then null; end $$;

do $$ begin
  create type result_status as enum ('win', 'loss', 'breakeven', 'invalidated', 'pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_asset as enum ('usdc', 'eth');
exception when duplicate_object then null; end $$;

do $$ begin
  create type action_type as enum ('buy', 'sell', 'hold', 'accumulate', 'reduce');
exception when duplicate_object then null; end $$;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ========================= 0002 tables =========================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  nickname text,
  avatar_url text,
  role user_role not null default 'user',
  status user_status not null default 'active',
  subscription_plan plan_type not null default 'free',
  subscription_status sub_status not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallet_address_lowercase check (wallet_address = lower(wallet_address))
);

create table if not exists signal_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists signal_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references signal_categories(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  asset text not null,
  category_id uuid references signal_categories(id) on delete set null,
  subcategory_id uuid references signal_subcategories(id) on delete set null,
  opportunity_type opportunity_type not null,
  status signal_status not null default 'watch',
  risk_level risk_level not null default 'medium',
  time_window_days int not null check (time_window_days in (7, 14, 30, 60)),
  summary text,
  reason text,
  money_flow_score int not null default 0 check (money_flow_score between 0 and 100),
  growth_score int not null default 0 check (growth_score between 0 and 100),
  social_score int not null default 0 check (social_score between 0 and 100),
  market_structure_score int not null default 0 check (market_structure_score between 0 and 100),
  ai_conviction_score int not null default 0 check (ai_conviction_score between 0 and 100),
  orbit_score int not null default 0 check (orbit_score between 0 and 100),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references signals(id) on delete cascade,
  entry_price numeric(38, 10),
  target_price numeric(38, 10),
  invalid_price numeric(38, 10),
  position_size numeric(10, 4),
  action_type action_type not null default 'buy',
  published_at timestamptz not null default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references signals(id) on delete cascade,
  return_percent numeric(12, 4),
  status result_status not null default 'pending',
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan plan_type not null,
  payment_asset payment_asset,
  payment_hash text unique,
  amount numeric(38, 10),
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status sub_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists score_config (
  id int primary key default 1,
  money_flow int not null default 30,
  growth int not null default 25,
  social_momentum int not null default 20,
  market_structure int not null default 15,
  ai_conviction int not null default 10,
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint score_config_singleton check (id = 1)
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name plan_type not null unique,
  price_usdc numeric(12, 2) not null default 0,
  duration_days int not null default 30,
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========================= 0003 indexes & triggers =========================
create index if not exists idx_signals_category on signals(category_id);
create index if not exists idx_signals_subcategory on signals(subcategory_id);
create index if not exists idx_signals_status on signals(status);
create index if not exists idx_signals_opportunity on signals(opportunity_type);
create index if not exists idx_signals_created_at on signals(created_at desc);
create index if not exists idx_signals_orbit_score on signals(orbit_score desc);
create index if not exists idx_predictions_signal on predictions(signal_id);
create index if not exists idx_results_signal on results(signal_id);
create index if not exists idx_results_status on results(status);
create index if not exists idx_subscriptions_user on subscriptions(user_id);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_subcategories_category on signal_subcategories(category_id);

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

drop trigger if exists trg_signals_updated_at on signals;
create trigger trg_signals_updated_at
  before update on signals
  for each row execute function set_updated_at();

drop trigger if exists trg_score_config_updated_at on score_config;
create trigger trg_score_config_updated_at
  before update on score_config
  for each row execute function set_updated_at();

-- ========================= 0004 RLS =========================
alter table users enable row level security;
alter table signal_categories enable row level security;
alter table signal_subcategories enable row level security;
alter table signals enable row level security;
alter table predictions enable row level security;
alter table results enable row level security;
alter table subscriptions enable row level security;
alter table score_config enable row level security;
alter table plans enable row level security;

drop policy if exists public_read_categories on signal_categories;
create policy public_read_categories on signal_categories for select using (true);

drop policy if exists public_read_subcategories on signal_subcategories;
create policy public_read_subcategories on signal_subcategories for select using (true);

drop policy if exists public_read_signals on signals;
create policy public_read_signals on signals for select using (true);

drop policy if exists public_read_predictions on predictions;
create policy public_read_predictions on predictions for select using (true);

drop policy if exists public_read_results on results;
create policy public_read_results on results for select using (true);

drop policy if exists public_read_plans on plans;
create policy public_read_plans on plans for select using (active = true);

drop policy if exists public_read_score_config on score_config;
create policy public_read_score_config on score_config for select using (true);

-- ========================= 0005 seed =========================
insert into signal_categories (name, slug, sort_order) values
  ('AI', 'ai', 1),
  ('Crypto', 'crypto', 2),
  ('RWA', 'rwa', 3),
  ('DePIN', 'depin', 4),
  ('Infrastructure', 'infrastructure', 5)
on conflict (slug) do nothing;

insert into signal_subcategories (category_id, name, slug, sort_order)
select c.id, x.name, x.slug, x.sort_order
from (values
  ('crypto', 'BTC Ecosystem', 'btc', 1),
  ('crypto', 'ETH Ecosystem', 'eth', 2),
  ('crypto', 'SOL Ecosystem', 'sol', 3),
  ('crypto', 'Base Ecosystem', 'base', 4),
  ('crypto', 'BNB Ecosystem', 'bnb', 5),
  ('crypto', 'Emerging Chains', 'emerging-chains', 6),
  ('ai', 'AI Agent', 'ai-agent', 1),
  ('ai', 'AI Infrastructure', 'ai-infrastructure', 2),
  ('ai', 'AI Application', 'ai-application', 3),
  ('rwa', 'Stablecoin', 'stablecoin', 1),
  ('rwa', 'Tokenized Assets', 'tokenized-assets', 2),
  ('rwa', 'On-chain Finance', 'onchain-finance', 3),
  ('depin', 'Storage', 'storage', 1),
  ('depin', 'GPU', 'gpu', 2),
  ('depin', 'Network', 'network', 3),
  ('depin', 'Energy', 'energy', 4),
  ('infrastructure', 'Oracle', 'oracle', 1),
  ('infrastructure', 'Cross-chain', 'cross-chain', 2),
  ('infrastructure', 'Data Layer', 'data-layer', 3),
  ('infrastructure', 'Middleware', 'middleware', 4)
) as x(category_slug, name, slug, sort_order)
join signal_categories c on c.slug = x.category_slug
on conflict (category_id, slug) do nothing;

insert into plans (name, price_usdc, duration_days, features, active) values
  ('free', 0, 36500, '["Public signals", "Track record"]'::jsonb, true),
  ('alpha', 19, 30, '["All signals", "Predictions", "Risk alerts"]'::jsonb, true),
  ('pro', 99, 30, '["Everything in Alpha", "Priority access", "Pro analytics"]'::jsonb, true)
on conflict (name) do nothing;

insert into score_config (id, money_flow, growth, social_momentum, market_structure, ai_conviction)
values (1, 30, 25, 20, 15, 10)
on conflict (id) do nothing;

-- ========================= 0006 track record view =========================
create or replace view track_record_summary
with (security_invoker = true) as
select
  (select count(*) from signals)                                          as total_signals,
  count(*) filter (where r.status <> 'pending')                           as verified_signals,
  count(*) filter (where r.status = 'win')                                as wins,
  count(*) filter (where r.status = 'loss')                               as losses,
  round(
    100.0 * count(*) filter (where r.status = 'win')
    / nullif(count(*) filter (where r.status <> 'pending'), 0)
  , 2)                                                                    as win_rate,
  round(avg(r.return_percent) filter (where r.status <> 'pending'), 2)    as avg_return,
  round(max(r.return_percent), 2)                                         as max_return,
  round(least(min(r.return_percent), 0), 2)                              as max_drawdown
from results r;

grant select on track_record_summary to anon, authenticated;
