'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminI18n } from '@/components/AdminI18nProvider';
import { FormMessage } from '@/components/admin/FormMessage';
import type { Signal } from '@/lib/types/db';

type CategoryOption = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

type Props = {
  signals: Signal[];
  categories: CategoryOption[];
};

export function SignalManager({ signals, categories }: Props) {
  const { t } = useAdminI18n();
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [catId, setCatId] = useState('');
  const subs = categories.find((c) => c.id === catId)?.subcategories ?? [];

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      asset: String(fd.get('asset')),
      category_id: catId || null,
      subcategory_id: String(fd.get('subcategory_id') || '') || null,
      opportunity_type: String(fd.get('opportunity_type')),
      status: String(fd.get('status')),
      risk_level: String(fd.get('risk_level')),
      time_window_days: Number(fd.get('time_window_days')),
      summary: String(fd.get('summary') || '') || null,
      reason: String(fd.get('reason') || '') || null,
      money_flow_score: Number(fd.get('money_flow_score') || 0),
      growth_score: Number(fd.get('growth_score') || 0),
      social_score: Number(fd.get('social_score') || 0),
      market_structure_score: Number(fd.get('market_structure_score') || 0),
      ai_conviction_score: Number(fd.get('ai_conviction_score') || 0),
    };
    const res = await fetch('/api/signals', {
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
    setCatId('');
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(t.signals.confirmDelete)) return;
    const res = await fetch(`/api/signals/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setMsg({ type: 'err', text: data.error ?? t.common.failed });
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-grid-2">
      <div className="admin-panel">
        <h2 className="admin-panel-title">{t.signals.createTitle}</h2>
        <form className="admin-form" onSubmit={create}>
          <div className="form-row">
            <div className="form-field">
              <label>{t.common.asset}</label>
              <input name="asset" required placeholder="BTC" />
            </div>
            <div className="form-field">
              <label>{t.signals.opportunity}</label>
              <select name="opportunity_type" required defaultValue="momentum">
                <option value="momentum">Momentum</option>
                <option value="value">Value</option>
                <option value="narrative">Narrative</option>
                <option value="event">Event</option>
                <option value="contrarian">Contrarian</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Category</label>
              <select value={catId} onChange={(e) => setCatId(e.target.value)}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Subcategory</label>
              <select name="subcategory_id" disabled={!catId}>
                <option value="">—</option>
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>{t.common.status}</label>
              <select name="status" defaultValue="watch">
                <option value="watch">Watch</option>
                <option value="research">Research</option>
                <option value="build_position">Build Position</option>
                <option value="high_conviction">High Conviction</option>
                <option value="risk_alert">Risk Alert</option>
              </select>
            </div>
            <div className="form-field">
              <label>{t.signals.risk}</label>
              <select name="risk_level" defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>{t.signals.timeWindow}</label>
            <select name="time_window_days" defaultValue={30}>
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </div>
          <div className="form-field">
            <label>{t.signals.summary}</label>
            <textarea name="summary" />
          </div>
          <div className="form-field">
            <label>{t.signals.reason}</label>
            <textarea name="reason" />
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t.signals.scores}
          </p>
          <div className="form-row">
            <div className="form-field">
              <label>Money Flow</label>
              <input name="money_flow_score" type="number" min={0} max={100} defaultValue={0} />
            </div>
            <div className="form-field">
              <label>Growth</label>
              <input name="growth_score" type="number" min={0} max={100} defaultValue={0} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Social</label>
              <input name="social_score" type="number" min={0} max={100} defaultValue={0} />
            </div>
            <div className="form-field">
              <label>Market</label>
              <input name="market_structure_score" type="number" min={0} max={100} defaultValue={0} />
            </div>
          </div>
          <div className="form-field">
            <label>AI Conviction</label>
            <input name="ai_conviction_score" type="number" min={0} max={100} defaultValue={0} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={busy}>
            {busy ? '…' : t.common.create}
          </button>
          <FormMessage type={msg?.type ?? null} text={msg?.text ?? ''} />
        </form>
      </div>
      <div>
        <h2 className="admin-panel-title">{t.signals.listTitle}</h2>
        {signals.length === 0 ? (
          <div className="empty-state">{t.common.empty}</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.common.asset}</th>
                  <th>{t.signals.orbitScore}</th>
                  <th>{t.common.status}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.asset}</strong></td>
                    <td><span className="badge">{s.orbit_score}</span></td>
                    <td><span className="badge muted">{s.status}</span></td>
                    <td>
                      <button
                        type="button"
                        className="btn-ghost btn-sm btn-danger"
                        onClick={() => remove(s.id)}
                      >
                        {t.common.delete}
                      </button>
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
