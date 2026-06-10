import { z } from 'zod';
import { getAnonClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { requireAdmin } from '@/lib/auth/guards';
import { signalUpdateSchema } from '@/lib/validation/schemas';
import {
  computeOrbitScore,
  getScoreWeights,
  type ScoreComponents,
} from '@/lib/score/orbitScore';

export const dynamic = 'force-dynamic';

function assertUuid(id: string): void {
  if (!z.uuid().safeParse(id).success) {
    throw new ValidationError('Invalid signal id');
  }
}

const DETAIL_SELECT = `
  *,
  category:signal_categories(id, name, slug),
  subcategory:signal_subcategories(id, name, slug),
  predictions(*),
  results(*)
`;

/** Public: full signal detail incl. category, predictions and results. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    assertUuid(id);

    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from('signals')
      .select(DETAIL_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError('Signal not found');

    return ok({ signal: data });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Admin: update a signal; Orbit Score is recomputed from merged components. */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    assertUuid(id);

    const body = signalUpdateSchema.parse(await request.json());
    const supabase = getAdminClient();

    const { data: existing, error: findErr } = await supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) throw new NotFoundError('Signal not found');

    const merged = { ...existing, ...body } as ScoreComponents;
    const weights = await getScoreWeights();
    const orbit_score = computeOrbitScore(merged, weights);

    const { data, error } = await supabase
      .from('signals')
      .update({ ...body, orbit_score })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    return ok({ signal: data });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Admin: delete a signal (cascades predictions & results). */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    assertUuid(id);

    const supabase = getAdminClient();
    const { error } = await supabase.from('signals').delete().eq('id', id);
    if (error) throw error;

    return ok({ deleted: true });
  } catch (e) {
    return errorResponse(e);
  }
}
