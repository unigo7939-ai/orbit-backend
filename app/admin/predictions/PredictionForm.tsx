'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminI18n } from '@/components/AdminI18nProvider';
import { FormMessage } from '@/components/admin/FormMessage';
import type { Signal } from '@/lib/types/db';

type Row = {
  id: string;
  entry_price: number | null;
  target_price: number | null;
  action_type: string;
  published_at: string;
  signal: { id: string; asset: string } | null;
};

type Props = { signals: Signal[]; predictions: Row[] };

export function PredictionForm({ signals, predictions }: Props) {
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
      entry_price: fd.get('entry_price') ? Number(fd.get('entry_price')) : null,
      target_price: fd.get('target_price') ? Number(fd.get('target_price')) : null,
      invalid_price: fd.get('invalid_price') ? Number(fd.get('invalid_price')) : null,
      position_size: fd.get('position_size') ? Number(fd.get('position_size')) : null,
      action_type: String(fd.get('action_type')),
    };
    const res = await fetch('/api/predictions', {
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
        <h2 className="admin-panel-title">{t.predictions.createTitle}</h2>
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
              <label>{t.predictions.entry}</label>
              <input name="entry_price" type="number" step="any" />
            </div>
            <div className="form-field">
              <label>{t.predictions.target}</label>
              <input name="target_price" type="number" step="any" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>{t.predictions.invalid}</label>
              <input name="invalid_price" type="number" step="any" />
            </div>
            <div className="form-field">
              <label>{t.predictions.position}</label>
              <input name="position_size" type="number" step="any" />
            </div>
          </div>
          <div className="form-field">
            <label>{t.predictions.action}</label>
            <select name="action_type" defaultValue="buy">
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="hold">Hold</option>
              <option value="accumulate">Accumulate</option>
              <option value="reduce">Reduce</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={busy}>
            {busy ? '…' : t.common.create}
          </button>
          <FormMessage type={msg?.type ?? null} text={msg?.text ?? ''} />
        </form>
      </div>
      <div>
        <h2 className="admin-panel-title">{t.predictions.listTitle}</h2>
        {predictions.length === 0 ? (
          <div className="empty-state">{t.common.empty}</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.predictions.signal}</th>
                  <th>{t.predictions.entry}</th>
                  <th>{t.predictions.target}</th>
                  <th>{t.predictions.action}</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.id}>
                    <td>{p.signal?.asset ?? '—'}</td>
                    <td>{p.entry_price ?? '—'}</td>
                    <td>{p.target_price ?? '—'}</td>
                    <td><span className="badge">{p.action_type}</span></td>
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
