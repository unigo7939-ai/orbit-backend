import { getAdminLocale } from '@/lib/i18n/server';
import { AdminI18nProvider } from '@/components/AdminI18nProvider';
import { HomeLinks } from './home/HomeLinks';

export default async function HomePage() {
  const locale = await getAdminLocale();

  return (
    <AdminI18nProvider initialLocale={locale}>
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <HomeLinks />
      </main>
    </AdminI18nProvider>
  );
}
