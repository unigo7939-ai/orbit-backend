import { getTrackRecord, listPlans } from '@/lib/admin/queries';
import { getAdminT } from '@/lib/i18n/server';
import { serverEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [track, plans, t] = await Promise.all([
    getTrackRecord(),
    listPlans(),
    getAdminT(),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">{t.settings.title}</h1>
      <p className="admin-page-desc">{t.settings.description}</p>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card accent">
          <div className="stat-card-label">{t.settings.winRate}</div>
          <div className="stat-card-value">
            {track.win_rate != null ? `${track.win_rate}%` : '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">{t.settings.avgReturn}</div>
          <div className="stat-card-value">
            {track.avg_return != null ? `${track.avg_return}%` : '—'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">{t.settings.verified}</div>
          <div className="stat-card-value">{track.verified_signals}</div>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2 className="admin-panel-title">{t.settings.plans}</h2>
          <div className="data-table-wrap" style={{ border: 'none', background: 'transparent' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.common.plan}</th>
                  <th>USDC</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td><span className="badge">{p.name}</span></td>
                    <td>{p.price_usdc}</td>
                    <td>{p.duration_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="admin-panel">
          <h2 className="admin-panel-title">Platform</h2>
          <dl style={{ margin: 0, fontSize: '0.875rem', lineHeight: 2 }}>
            <dt style={{ color: 'var(--text-muted)', display: 'inline' }}>{t.settings.chain}: </dt>
            <dd style={{ display: 'inline', margin: 0 }}>Base Mainnet</dd>
            <br />
            <dt style={{ color: 'var(--text-muted)', display: 'inline' }}>
              {t.settings.paymentWallet}:{' '}
            </dt>
            <dd style={{ display: 'inline', margin: 0, fontFamily: 'monospace', fontSize: '0.78rem' }}>
              {serverEnv.paymentWalletAddress}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
