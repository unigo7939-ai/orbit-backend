import { z } from 'zod';
import {
  ACTION_TYPES,
  OPPORTUNITY_TYPES,
  PAYMENT_ASSETS,
  PLAN_TYPES,
  RESULT_STATUSES,
  RISK_LEVELS,
  SIGNAL_STATUSES,
} from '@/lib/constants';

const score = z.number().int().min(0).max(100);
const slug = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with dashes');

export const signalCreateSchema = z.object({
  asset: z.string().min(1).max(64),
  category_id: z.uuid().nullish(),
  subcategory_id: z.uuid().nullish(),
  opportunity_type: z.enum(OPPORTUNITY_TYPES),
  status: z.enum(SIGNAL_STATUSES).default('watch'),
  risk_level: z.enum(RISK_LEVELS).default('medium'),
  time_window_days: z.union([
    z.literal(7),
    z.literal(14),
    z.literal(30),
    z.literal(60),
  ]),
  summary: z.string().max(2000).nullish(),
  reason: z.string().max(5000).nullish(),
  money_flow_score: score.default(0),
  growth_score: score.default(0),
  social_score: score.default(0),
  market_structure_score: score.default(0),
  ai_conviction_score: score.default(0),
});

export const signalUpdateSchema = signalCreateSchema.partial();

export const predictionCreateSchema = z.object({
  signal_id: z.uuid(),
  entry_price: z.number().nullish(),
  target_price: z.number().nullish(),
  invalid_price: z.number().nullish(),
  position_size: z.number().nullish(),
  action_type: z.enum(ACTION_TYPES).default('buy'),
  published_at: z.string().nullish(),
});

export const resultCreateSchema = z.object({
  signal_id: z.uuid(),
  return_percent: z.number().nullish(),
  status: z.enum(RESULT_STATUSES).default('pending'),
  verified_at: z.string().nullish(),
  notes: z.string().max(5000).nullish(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(64),
  slug,
  sort_order: z.number().int().min(0).default(0),
  /** When present, creates a subcategory under this category. */
  category_id: z.uuid().nullish(),
});

export const scoreConfigSchema = z.object({
  money_flow: score,
  growth: score,
  social_momentum: score,
  market_structure: score,
  ai_conviction: score,
});

export const planUpsertSchema = z.object({
  name: z.enum(PLAN_TYPES),
  price_usdc: z.number().min(0),
  duration_days: z.number().int().min(1),
  features: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export const profileUpdateSchema = z.object({
  nickname: z.string().min(1).max(64).nullish(),
  avatar_url: z.string().url().max(500).nullish(),
});

export const verifyPaymentSchema = z.object({
  tx_hash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'invalid tx hash'),
  plan: z.enum(PLAN_TYPES),
  asset: z.enum(PAYMENT_ASSETS),
});
