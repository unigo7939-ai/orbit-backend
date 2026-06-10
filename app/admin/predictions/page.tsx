import { listPredictions, listSignals } from '@/lib/admin/queries';
import { getAdminT } from '@/lib/i18n/server';
import { PredictionForm } from './PredictionForm';

export const dynamic = 'force-dynamic';

export default async function PredictionsPage() {
  const [signals, predictions, t] = await Promise.all([
    listSignals(),
    listPredictions(),
    getAdminT(),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">{t.predictions.title}</h1>
      <p className="admin-page-desc">{t.predictions.description}</p>
      <PredictionForm signals={signals} predictions={predictions} />
    </div>
  );
}
