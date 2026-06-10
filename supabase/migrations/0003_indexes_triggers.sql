-- ORBIT Alpha — 0003 indexes & triggers

-- ---- Indexes ----
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

-- ---- updated_at triggers ----
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
