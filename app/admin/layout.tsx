import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAdminLocale, getAdminT } from '@/lib/i18n/server';
import { AdminI18nProvider } from '@/components/AdminI18nProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AdminNav } from './AdminNav';
import { LogoutButton } from './LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const role = session.siwe?.role;
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/login');
  }

  const [locale, adminT] = await Promise.all([getAdminLocale(), getAdminT()]);
  const shortAddr = session.siwe?.address
    ? `${session.siwe.address.slice(0, 6)}…${session.siwe.address.slice(-4)}`
    : '';

  return (
    <AdminI18nProvider initialLocale={locale}>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span>{adminT.common.brand}</span>
            <span className="admin-brand-badge">{adminT.common.adminBadge}</span>
          </div>
          <AdminNav />
        </aside>
        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-header-left">
              <div className="admin-wallet">
                <span className="admin-wallet-dot" />
                <span title={session.siwe?.address}>{shortAddr}</span>
              </div>
              <LanguageSwitcher />
            </div>
            <LogoutButton />
          </header>
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </AdminI18nProvider>
  );
}
