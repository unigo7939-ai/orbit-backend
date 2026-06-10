import type {
  ActionType,
  OpportunityType,
  PaymentAsset,
  PlanType,
  ResultStatus,
  RiskLevel,
  SignalStatus,
  SubStatus,
  UserRole,
  UserStatus,
} from '@/lib/constants';

export interface User {
  id: string;
  wallet_address: string;
  nickname: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  subscription_plan: PlanType;
  subscription_status: SubStatus;
  created_at: string;
  updated_at: string;
}

export interface SignalCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface SignalSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Signal {
  id: string;
  asset: string;
  category_id: string | null;
  subcategory_id: string | null;
  opportunity_type: OpportunityType;
  status: SignalStatus;
  risk_level: RiskLevel;
  time_window_days: number;
  summary: string | null;
  reason: string | null;
  money_flow_score: number;
  growth_score: number;
  social_score: number;
  market_structure_score: number;
  ai_conviction_score: number;
  orbit_score: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  signal_id: string;
  entry_price: number | null;
  target_price: number | null;
  invalid_price: number | null;
  position_size: number | null;
  action_type: ActionType;
  published_at: string;
}

export interface Result {
  id: string;
  signal_id: string;
  return_percent: number | null;
  status: ResultStatus;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  payment_asset: PaymentAsset | null;
  payment_hash: string | null;
  amount: number | null;
  start_date: string;
  end_date: string | null;
  status: SubStatus;
  created_at: string;
}

export interface ScoreConfig {
  id: number;
  money_flow: number;
  growth: number;
  social_momentum: number;
  market_structure: number;
  ai_conviction: number;
  updated_by: string | null;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: PlanType;
  price_usdc: number;
  duration_days: number;
  features: string[];
  active: boolean;
  created_at: string;
}

export interface TrackRecordSummary {
  total_signals: number;
  verified_signals: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  avg_return: number | null;
  max_return: number | null;
  max_drawdown: number | null;
}
