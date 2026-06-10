import { getAdminClient } from '@/lib/supabase/admin';
import { getAdminT } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

async function getCounts() {
  const supabase = getAdminClient();
  const head = { count: 'exact' as const, head: true };
  const [signals, users, subs, results, predictions] = await Promise.all([
    supabase.from('signals').select('*', head),
    supabase.from('users').select('*', head),
    supabase.from('subscriptions').select('*', head),
    supabase.from('results').select('*', head),
    supabase.from('predictions').select('*', head),
  ]);
  return {
    signals: signals.count ?? 0,
    users: users.count ?? 0,
    subscriptions: subs.count ?? 0,
    results: results.count ?? 0,
    predictions: predictions.count ?? 0,
  };
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`stat-card${accent ? ' accent' : ''}`}>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}

export default async function AdminDashboard() {
  const [counts, t] = await Promise.all([getCounts(), getAdminT()]);

  return (
    <div>
      <h1 className="admin-page-title">{t.dashboard.title}</h1>
      <p className="admin-page-desc">{t.dashboard.description}</p>
      <div className="stat-grid">
        <StatCard label={t.dashboard.stats.signals} value={counts.signals} accent />
        <StatCard label={t.dashboard.stats.predictions} value={counts.predictions} />
        <StatCard label={t.dashboard.stats.results} value={counts.results} />
        <StatCard label={t.dashboard.stats.users} value={counts.users} accent />
        <StatCard label={t.dashboard.stats.subscriptions} value={counts.subscriptions} />
      </div>
    </div>
  );
}
