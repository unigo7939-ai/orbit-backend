import { listUsers } from '@/lib/admin/queries';
import { getAdminT } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const [users, t] = await Promise.all([listUsers(), getAdminT()]);

  return (
    <div>
      <h1 className="admin-page-title">{t.users.title}</h1>
      <p className="admin-page-desc">{t.users.description}</p>
      {users.length === 0 ? (
        <div className="empty-state">{t.common.empty}</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.common.wallet}</th>
                <th>{t.users.nickname}</th>
                <th>{t.common.role}</th>
                <th>{t.users.subscription}</th>
                <th>{t.common.created}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {u.wallet_address.slice(0, 10)}…{u.wallet_address.slice(-6)}
                  </td>
                  <td>{u.nickname ?? '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'super_admin' ? 'success' : ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.subscription_plan}
                    <span className="badge muted" style={{ marginLeft: 6 }}>
                      {u.subscription_status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
