-- ORBIT Alpha — 0004 Row Level Security
--
-- Strategy:
--   * Public read tables: anon/authenticated may SELECT (server anon client).
--   * users / subscriptions: NO public policy -> only service_role (bypasses
--     RLS) can access. App enforces "owner or admin" in route handlers.
--   * All writes go through service_role (bypasses RLS) after app-level
--     authorization checks. No INSERT/UPDATE/DELETE policies for anon.

alter table users enable row level security;
alter table signal_categories enable row level security;
alter table signal_subcategories enable row level security;
alter table signals enable row level security;
alter table predictions enable row level security;
alter table results enable row level security;
alter table subscriptions enable row level security;
alter table score_config enable row level security;
alter table plans enable row level security;

-- ---- Public read policies ----
drop policy if exists public_read_categories on signal_categories;
create policy public_read_categories on signal_categories
  for select using (true);

drop policy if exists public_read_subcategories on signal_subcategories;
create policy public_read_subcategories on signal_subcategories
  for select using (true);

drop policy if exists public_read_signals on signals;
create policy public_read_signals on signals
  for select using (true);

drop policy if exists public_read_predictions on predictions;
create policy public_read_predictions on predictions
  for select using (true);

drop policy if exists public_read_results on results;
create policy public_read_results on results
  for select using (true);

drop policy if exists public_read_plans on plans;
create policy public_read_plans on plans
  for select using (active = true);

drop policy if exists public_read_score_config on score_config;
create policy public_read_score_config on score_config
  for select using (true);

-- users and subscriptions intentionally have RLS enabled with NO policies:
-- anon/authenticated get zero rows; service_role bypasses RLS for server use.
