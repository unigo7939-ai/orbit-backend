-- ORBIT Alpha — 0001 init: extensions, enums, helpers
-- Run order: 0001 -> 0002 -> 0003 -> 0004 -> 0005 -> 0006

create extension if not exists pgcrypto;

-- ---- Enums ----
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

-- ---- Helper: auto-update updated_at ----
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
