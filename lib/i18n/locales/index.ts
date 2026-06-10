import type { AdminLocale, AdminTranslation } from '../types';
import en from './en';
import zhCN from './zh-CN';

export const adminTranslations: Record<AdminLocale, AdminTranslation> = {
  en,
  'zh-CN': zhCN,
};
