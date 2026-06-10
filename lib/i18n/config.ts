import type { AdminLocale } from './types';

export const LOCALE_COOKIE = 'orbit-admin-locale';
export const DEFAULT_LOCALE: AdminLocale = 'en';

export const LOCALE_OPTIONS: { id: AdminLocale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'zh-CN', label: '中文简体' },
];

export function isAdminLocale(value: string | undefined | null): value is AdminLocale {
  return value === 'en' || value === 'zh-CN';
}
