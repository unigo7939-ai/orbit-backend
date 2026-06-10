-- ORBIT Alpha — 0006 track record summary view

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
