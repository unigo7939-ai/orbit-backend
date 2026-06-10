import { getScoreConfig } from '@/lib/admin/queries';
import { getAdminT } from '@/lib/i18n/server';
import { ScoreForm } from './ScoreForm';

export const dynamic = 'force-dynamic';

export default async function ScorePage() {
  const [config, t] = await Promise.all([getScoreConfig(), getAdminT()]);

  return (
    <div>
      <h1 className="admin-page-title">{t.score.title}</h1>
      <p className="admin-page-desc">{t.score.description}</p>
      <ScoreForm config={config} />
    </div>
  );
}
