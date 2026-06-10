'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminI18n } from '@/components/AdminI18nProvider';
import { FormMessage } from '@/components/admin/FormMessage';
import type { Signal } from '@/lib/types/db';

type Row = {
  id: string;
  return_percent: number | null;
  status: string;
  verified_at: string | null;
  signal: { id: string; asset: string } | null;
};

type Props = { signals: Signal[]; results: Row[] };

export function ResultForm({ signals, results }: Props) {
  const { t } = useAdminI18n();
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      signal_id: String(fd.get('signal_id')),
      return_percent: fd.get('return_percent') ? Number(fd.get('return_percent')) : null,
      status: String(fd.get('status')),
      notes: String(fd.get('notes') || '') || null,
    };
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg({ type: 'err', text: data.error ?? t.common.failed });
      return;
    }
    setMsg({ type: 'ok', text: t.common.success });
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="admin-grid-2">
      <div className="admin-panel">
        <h2 className="admin-panel-title">{t.results.createTitle}</h2>
        <form className="admin-form" onSubmit={submit}>
          <div className="form-field">
            <label>{t.predictions.signal}</label>
            <select name="signal_id" required>
              <option value="">—</option>
              {signals.map((s) => (
                <option key={s.id} value={s.id}>{s.asset}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>{t.results.returnPct}</label>
              <input name="return_percent" type="number" step="any" />
            </div>
            <div className="form-field">
              <label>{t.common.status}</label>
              <select name="status" defaultValue="win">
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="breakeven">Breakeven</option>
                <option value="invalidated">Invalidated</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>{t.results.notes}</label>
            <textarea name="notes" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={busy}>
            {busy ? '…' : t.common.create}
          </button>
          <FormMessage type={msg?.type ?? null} text={msg?.text ?? ''} />
        </form>
      </div>
      <div>
        <h2 className="admin-panel-title">{t.results.listTitle}</h2>
        {results.length === 0 ? (
          <div className="empty-state">{t.common.empty}</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.predictions.signal}</th>
                  <th>{t.results.returnPct}</th>
                  <th>{t.common.status}</th>
                  <th>{t.results.verified}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>{r.signal?.asset ?? '—'}</td>
                    <td>
                      <span className={`badge ${r.status === 'win' ? 'success' : r.status === 'loss' ? 'warn' : 'muted'}`}>
                        {r.return_percent != null ? `${r.return_percent}%` : '—'}
                      </span>
                    </td>
                    <td>{r.status}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {r.verified_at ? new Date(r.verified_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
