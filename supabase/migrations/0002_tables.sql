-- ORBIT Alpha — 0002 tables

-- ---- users ----
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

-- ---- signal_categories ----
create table if not exists signal_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---- signal_subcategories ----
create table if not exists signal_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references signal_categories(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

-- ---- signals ----
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

-- ---- predictions ----
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

-- ---- results ----
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references signals(id) on delete cascade,
  return_percent numeric(12, 4),
  status result_status not null default 'pending',
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- ---- subscriptions ----
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

-- ---- score_config (singleton) ----
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

-- ---- plans ----
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name plan_type not null unique,
  price_usdc numeric(12, 2) not null default 0,
  duration_days int not null default 30,
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
