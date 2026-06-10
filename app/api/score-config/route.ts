import { getAnonClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth/guards';
import { scoreConfigSchema } from '@/lib/validation/schemas';
import { getScoreWeights } from '@/lib/score/orbitScore';

export const dynamic = 'force-dynamic';

/** Public: current Orbit Score weights. */
export async function GET() {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from('score_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    return ok({ config: data ?? (await getScoreWeights()) });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Admin: update Orbit Score weights (applies to new/edited signals). */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = scoreConfigSchema.parse(await request.json());

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('score_config')
      .upsert({ id: 1, ...body, updated_by: admin.userId })
      .select('*')
      .single();
    if (error) throw error;

    return ok({ config: data });
  } catch (e) {
    return errorResponse(e);
  }
}
