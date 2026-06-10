'use client';

import { useAdminI18n } from '@/components/AdminI18nProvider';

export function LogoutButton() {
  const { t } = useAdminI18n();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <button type="button" className="btn-ghost" onClick={logout}>
      {t.common.logout}
    </button>
  );
}
