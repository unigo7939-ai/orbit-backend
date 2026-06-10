import { cookies } from 'next/headers';
import { adminTranslations } from './locales';
import { DEFAULT_LOCALE, isAdminLocale, LOCALE_COOKIE } from './config';
import type { AdminLocale } from './types';

export async function getAdminLocale(): Promise<AdminLocale> {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  return isAdminLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function getAdminT() {
  const locale = await getAdminLocale();
  return adminTranslations[locale];
}
