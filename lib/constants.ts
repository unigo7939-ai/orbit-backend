/** Enum values mirrored from the database (single source of truth for the app). */

export const USER_ROLES = ['user', 'admin', 'super_admin'] as const;
export const USER_STATUSES = ['active', 'banned'] as const;
export const PLAN_TYPES = ['free', 'alpha', 'pro'] as const;
export const SUB_STATUSES = ['inactive', 'active', 'expired'] as const;
export const OPPORTUNITY_TYPES = [
  'momentum',
  'value',
  'narrative',
  'event',
  'contrarian',
] as const;
export const SIGNAL_STATUSES = [
  'watch',
  'research',
  'build_position',
  'high_conviction',
  'risk_alert',
] as const;
export const RISK_LEVELS = ['low', 'medium', 'high', 'extreme'] as const;
export const RESULT_STATUSES = [
  'win',
  'loss',
  'breakeven',
  'invalidated',
  'pending',
] as const;
export const PAYMENT_ASSETS = ['usdc', 'eth'] as const;
export const ACTION_TYPES = ['buy', 'sell', 'hold', 'accumulate', 'reduce'] as const;
export const TIME_WINDOWS = [7, 14, 30, 60] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type PlanType = (typeof PLAN_TYPES)[number];
export type SubStatus = (typeof SUB_STATUSES)[number];
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type ResultStatus = (typeof RESULT_STATUSES)[number];
export type PaymentAsset = (typeof PAYMENT_ASSETS)[number];
export type ActionType = (typeof ACTION_TYPES)[number];
export type TimeWindow = (typeof TIME_WINDOWS)[number];

/** Default Orbit Score weights (admin-configurable, total 100). */
export const DEFAULT_SCORE_WEIGHTS = {
  money_flow: 30,
  growth: 25,
  social_momentum: 20,
  market_structure: 15,
  ai_conviction: 10,
} as const;

/** Default plan pricing in USDC (admin-configurable via `plans` table). */
export const DEFAULT_PLAN_PRICES: Record<PlanType, number> = {
  free: 0,
  alpha: 19,
  pro: 99,
};
