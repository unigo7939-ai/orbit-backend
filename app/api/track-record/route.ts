import { getAnonClient } from '@/lib/supabase/server';
import { errorResponse, ok } from '@/lib/http';
import type { TrackRecordSummary } from '@/lib/types/db';

export const dynamic = 'force-dynamic';

/** Public: aggregated track record (win rate, returns, drawdown, counts). */
export async function GET() {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from('track_record_summary')
      .select('*')
      .maybeSingle<TrackRecordSummary>();

    if (error) throw error;

    const summary: TrackRecordSummary = data ?? {
      total_signals: 0,
      verified_signals: 0,
      wins: 0,
      losses: 0,
      win_rate: null,
      avg_return: null,
      max_return: null,
      max_drawdown: null,
    };

    return ok({ summary });
  } catch (e) {
    return errorResponse(e);
  }
}
