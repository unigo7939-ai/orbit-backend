import { listSubscriptions } from '@/lib/admin/queries';
import { getAdminT } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

type SubRow = {
  id: string;
  plan: string;
  payment_asset: string | null;
  payment_hash: string | null;
  amount: number | null;
  start_date: string;
  end_date: string | null;
  status: string;
  user: { wallet_address: string; nickname: string | null } | null;
};

export default async function SubscriptionsPage() {
  const [rows, t] = await Promise.all([
    listSubscriptions() as Promise<SubRow[]>,
    getAdminT(),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">{t.subscriptions.title}</h1>
      <p className="admin-page-desc">{t.subscriptions.description}</p>
      {rows.length === 0 ? (
        <div className="empty-state">{t.common.empty}</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.common.wallet}</th>
                <th>{t.common.plan}</th>
                <th>{t.subscriptions.amount}</th>
                <th>{t.subscriptions.payment}</th>
                <th>{t.subscriptions.period}</th>
                <th>{t.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {s.user?.nickname ?? s.user?.wallet_address?.slice(0, 12) ?? '—'}
                  </td>
                  <td><span className="badge">{s.plan}</span></td>
                  <td>{s.amount ?? '—'} {s.payment_asset?.toUpperCase()}</td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {s.payment_hash ? `${s.payment_hash.slice(0, 10)}…` : '—'}
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {new Date(s.start_date).toLocaleDateString()}
                    {s.end_date ? ` → ${new Date(s.end_date).toLocaleDateString()}` : ''}
                  </td>
                  <td><span className="badge muted">{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
