'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminI18n } from '@/components/AdminI18nProvider';

const NAV = [
  { href: '/admin', key: 'dashboard' as const, exact: true },
  { href: '/admin/signals', key: 'signals' as const },
  { href: '/admin/predictions', key: 'predictions' as const },
  { href: '/admin/results', key: 'results' as const },
  { href: '/admin/users', key: 'users' as const },
  { href: '/admin/subscriptions', key: 'subscriptions' as const },
  { href: '/admin/score', key: 'score' as const },
  { href: '/admin/settings', key: 'settings' as const },
];

export function AdminNav() {
  const pathname = usePathname();
  const { t } = useAdminI18n();

  return (
    <nav className="admin-nav">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-link${active ? ' active' : ''}`}
          >
            {t.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
