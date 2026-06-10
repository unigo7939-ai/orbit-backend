-- ORBIT Alpha — 0005 seed data (idempotent)

-- ---- Categories ----
insert into signal_categories (name, slug, sort_order) values
  ('AI', 'ai', 1),
  ('Crypto', 'crypto', 2),
  ('RWA', 'rwa', 3),
  ('DePIN', 'depin', 4),
  ('Infrastructure', 'infrastructure', 5)
on conflict (slug) do nothing;

-- ---- Subcategories ----
insert into signal_subcategories (category_id, name, slug, sort_order)
select c.id, x.name, x.slug, x.sort_order
from (values
  -- Crypto
  ('crypto', 'BTC Ecosystem', 'btc', 1),
  ('crypto', 'ETH Ecosystem', 'eth', 2),
  ('crypto', 'SOL Ecosystem', 'sol', 3),
  ('crypto', 'Base Ecosystem', 'base', 4),
  ('crypto', 'BNB Ecosystem', 'bnb', 5),
  ('crypto', 'Emerging Chains', 'emerging-chains', 6),
  -- AI
  ('ai', 'AI Agent', 'ai-agent', 1),
  ('ai', 'AI Infrastructure', 'ai-infrastructure', 2),
  ('ai', 'AI Application', 'ai-application', 3),
  -- RWA
  ('rwa', 'Stablecoin', 'stablecoin', 1),
  ('rwa', 'Tokenized Assets', 'tokenized-assets', 2),
  ('rwa', 'On-chain Finance', 'onchain-finance', 3),
  -- DePIN
  ('depin', 'Storage', 'storage', 1),
  ('depin', 'GPU', 'gpu', 2),
  ('depin', 'Network', 'network', 3),
  ('depin', 'Energy', 'energy', 4),
  -- Infrastructure
  ('infrastructure', 'Oracle', 'oracle', 1),
  ('infrastructure', 'Cross-chain', 'cross-chain', 2),
  ('infrastructure', 'Data Layer', 'data-layer', 3),
  ('infrastructure', 'Middleware', 'middleware', 4)
) as x(category_slug, name, slug, sort_order)
join signal_categories c on c.slug = x.category_slug
on conflict (category_id, slug) do nothing;

-- ---- Plans ----
insert into plans (name, price_usdc, duration_days, features, active) values
  ('free', 0, 36500, '["Public signals", "Track record"]'::jsonb, true),
  ('alpha', 19, 30, '["All signals", "Predictions", "Risk alerts"]'::jsonb, true),
  ('pro', 99, 30, '["Everything in Alpha", "Priority access", "Pro analytics"]'::jsonb, true)
on conflict (name) do nothing;

-- ---- Score config (singleton) ----
insert into score_config (id, money_flow, growth, social_momentum, market_structure, ai_conviction)
values (1, 30, 25, 20, 15, 10)
on conflict (id) do nothing;
