import { listCategories, listSignals } from '@/lib/admin/queries';
import { getAdminT } from '@/lib/i18n/server';
import { SignalManager } from './SignalManager';

export const dynamic = 'force-dynamic';

export default async function SignalsPage() {
  const [signals, categories, t] = await Promise.all([
    listSignals(),
    listCategories(),
    getAdminT(),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">{t.signals.title}</h1>
      <p className="admin-page-desc">{t.signals.description}</p>
      <SignalManager signals={signals} categories={categories} />
    </div>
  );
}
