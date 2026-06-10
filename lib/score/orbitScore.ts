import 'server-only';
import { getAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_SCORE_WEIGHTS } from '@/lib/constants';
import type { ScoreConfig } from '@/lib/types/db';

export interface ScoreComponents {
  money_flow_score: number;
  growth_score: number;
  social_score: number;
  market_structure_score: number;
  ai_conviction_score: number;
}

export interface ScoreWeights {
  money_flow: number;
  growth: number;
  social_momentum: number;
  market_structure: number;
  ai_conviction: number;
}

/** Load admin-configurable weights, falling back to defaults. */
export async function getScoreWeights(): Promise<ScoreConfig> {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('score_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle<ScoreConfig>();

  if (data) return data;
  return {
    id: 1,
    ...DEFAULT_SCORE_WEIGHTS,
    updated_by: null,
    updated_at: new Date().toISOString(),
  };
}

/** Weighted Orbit Score (0-100) from the 5 component sub-scores. */
export function computeOrbitScore(
  components: ScoreComponents,
  weights: ScoreWeights,
): number {
  const total =
    weights.money_flow +
    weights.growth +
    weights.social_momentum +
    weights.market_structure +
    weights.ai_conviction;

  if (total <= 0) return 0;

  const weighted =
    components.money_flow_score * weights.money_flow +
    components.growth_score * weights.growth +
    components.social_score * weights.social_momentum +
    components.market_structure_score * weights.market_structure +
    components.ai_conviction_score * weights.ai_conviction;

  return Math.max(0, Math.min(100, Math.round(weighted / total)));
}
