'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { adminTranslations } from '@/lib/i18n/locales';
import { DEFAULT_LOCALE, isAdminLocale, LOCALE_COOKIE } from '@/lib/i18n/config';
import type { AdminLocale, AdminTranslation } from '@/lib/i18n/types';

type AdminI18nContextValue = {
  locale: AdminLocale;
  t: AdminTranslation;
  setLocale: (locale: AdminLocale) => void;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

function readCookieLocale(): AdminLocale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const raw = match ? decodeURIComponent(match[1]) : undefined;
  return isAdminLocale(raw) ? raw : DEFAULT_LOCALE;
}

function writeCookieLocale(locale: AdminLocale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

type Props = {
  children: ReactNode;
  initialLocale?: AdminLocale;
};

export function AdminI18nProvider({ children, initialLocale }: Props) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AdminLocale>(initialLocale ?? DEFAULT_LOCALE);

  useEffect(() => {
    if (!initialLocale) {
      setLocaleState(readCookieLocale());
    }
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en';
  }, [locale]);

  const setLocale = useCallback(
    (next: AdminLocale) => {
      writeCookieLocale(next);
      setLocaleState(next);
      router.refresh();
    },
    [router],
  );

  const value = useMemo<AdminI18nContextValue>(
    () => ({
      locale,
      t: adminTranslations[locale],
      setLocale,
    }),
    [locale, setLocale],
  );

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error('useAdminI18n must be used within AdminI18nProvider');
  }
  return ctx;
}
