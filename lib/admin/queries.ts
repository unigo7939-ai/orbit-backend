import 'server-only';
import { getAdminClient } from '@/lib/supabase/admin';
import type {
  Plan,
  ScoreConfig,
  Signal,
  SignalCategory,
  SignalSubcategory,
  TrackRecordSummary,
  User,
} from '@/lib/types/db';

export async function listSignals(limit = 50) {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Signal[];
}

export async function listCategories() {
  const sb = getAdminClient();
  const [{ data: cats, error: cErr }, { data: subs, error: sErr }] =
    await Promise.all([
      sb.from('signal_categories').select('*').order('sort_order'),
      sb.from('signal_subcategories').select('*').order('sort_order'),
    ]);
  if (cErr) throw cErr;
  if (sErr) throw sErr;
  const subByCat = new Map<string, SignalSubcategory[]>();
  for (const s of (subs ?? []) as SignalSubcategory[]) {
    const list = subByCat.get(s.category_id) ?? [];
    list.push(s);
    subByCat.set(s.category_id, list);
  }
  return ((cats ?? []) as SignalCategory[]).map((c) => ({
    ...c,
    subcategories: subByCat.get(c.id) ?? [],
  }));
}

export async function listPredictions(limit = 50) {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('predictions')
    .select('*, signal:signals(id, asset)')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listResults(limit = 50) {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('results')
    .select('*, signal:signals(id, asset)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listUsers(limit = 100) {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as User[];
}

export async function listSubscriptions(limit = 100) {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('subscriptions')
    .select('*, user:users(wallet_address, nickname)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getScoreConfig(): Promise<ScoreConfig> {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('score_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle<ScoreConfig>();
  if (error) throw error;
  return (
    data ?? {
      id: 1,
      money_flow: 30,
      growth: 25,
      social_momentum: 20,
      market_structure: 15,
      ai_conviction: 10,
      updated_by: null,
      updated_at: new Date().toISOString(),
    }
  );
}

export async function listPlans(): Promise<Plan[]> {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('plans')
    .select('*')
    .order('price_usdc');
  if (error) throw error;
  return (data ?? []) as Plan[];
}

export async function getTrackRecord(): Promise<TrackRecordSummary> {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('track_record_summary')
    .select('*')
    .maybeSingle<TrackRecordSummary>();
  if (error) throw error;
  return (
    data ?? {
      total_signals: 0,
      verified_signals: 0,
      wins: 0,
      losses: 0,
      win_rate: null,
      avg_return: null,
      max_return: null,
      max_drawdown: null,
    }
  );
}
