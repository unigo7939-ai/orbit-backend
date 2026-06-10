import { listResults, listSignals } from '@/lib/admin/queries';
import { getAdminT } from '@/lib/i18n/server';
import { ResultForm } from './ResultForm';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const [signals, results, t] = await Promise.all([
    listSignals(),
    listResults(),
    getAdminT(),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">{t.results.title}</h1>
      <p className="admin-page-desc">{t.results.description}</p>
      <ResultForm signals={signals} results={results} />
    </div>
  );
}
