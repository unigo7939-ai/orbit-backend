import type { ReactNode } from 'react';
import { getAdminLocale } from '@/lib/i18n/server';
import { AdminI18nProvider } from '@/components/AdminI18nProvider';

export default async function LoginLayout({ children }: { children: ReactNode }) {
  const locale = await getAdminLocale();
  return <AdminI18nProvider initialLocale={locale}>{children}</AdminI18nProvider>;
}
