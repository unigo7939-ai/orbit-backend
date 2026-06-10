'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminI18n } from '@/components/AdminI18nProvider';
import { FormMessage } from '@/components/admin/FormMessage';
import type { ScoreConfig } from '@/lib/types/db';

type Props = { config: ScoreConfig };

export function ScoreForm({ config }: Props) {
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
      money_flow: Number(fd.get('money_flow')),
      growth: Number(fd.get('growth')),
      social_momentum: Number(fd.get('social_momentum')),
      market_structure: Number(fd.get('market_structure')),
      ai_conviction: Number(fd.get('ai_conviction')),
    };
    const res = await fetch('/api/score-config', {
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
    router.refresh();
  }

  return (
    <div className="admin-panel" style={{ maxWidth: 480 }}>
      <h2 className="admin-panel-title">{t.score.weights}</h2>
      <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {t.score.totalHint}
      </p>
      <form className="admin-form" onSubmit={submit}>
        {(
          [
            ['money_flow', t.score.moneyFlow, config.money_flow],
            ['growth', t.score.growth, config.growth],
            ['social_momentum', t.score.social, config.social_momentum],
            ['market_structure', t.score.marketStructure, config.market_structure],
            ['ai_conviction', t.score.aiConviction, config.ai_conviction],
          ] as const
        ).map(([name, label, val]) => (
          <div className="form-field" key={name}>
            <label>{label}</label>
            <input name={name} type="number" min={0} max={100} defaultValue={val} required />
          </div>
        ))}
        <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={busy}>
          {busy ? '…' : t.common.save}
        </button>
        <FormMessage type={msg?.type ?? null} text={msg?.text ?? ''} />
      </form>
    </div>
  );
}
