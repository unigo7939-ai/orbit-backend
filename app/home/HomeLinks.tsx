'use client';

import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAdminI18n } from '@/components/AdminI18nProvider';

export function HomeLinks() {
  const { t } = useAdminI18n();

  return (
    <>
      <div className="home-lang-row">
        <LanguageSwitcher />
      </div>
      <h1 className="admin-page-title" style={{ fontSize: '1.75rem' }}>
        {t.home.title}
      </h1>
      <p className="admin-page-desc">{t.home.description}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/api/health" className="btn-ghost" style={{ textDecoration: 'none' }}>
          {t.home.healthCheck}
        </Link>
        <Link href="/login" className="btn-primary" style={{ width: 'auto', textDecoration: 'none' }}>
          {t.home.adminLogin}
        </Link>
      </div>
    </>
  );
}
