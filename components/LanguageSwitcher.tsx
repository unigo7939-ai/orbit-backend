'use client';

import { LOCALE_OPTIONS } from '@/lib/i18n/config';
import type { AdminLocale } from '@/lib/i18n/types';
import { useAdminI18n } from './AdminI18nProvider';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useAdminI18n();

  return (
    <label className="lang-switcher">
      <span className="lang-switcher-label">{t.common.language}</span>
      <select
        className="lang-switcher-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as AdminLocale)}
        aria-label={t.common.language}
      >
        {LOCALE_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
