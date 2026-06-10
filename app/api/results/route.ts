import { z } from 'zod';
import { getAnonClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { parsePagination } from '@/lib/api/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { resultCreateSchema } from '@/lib/validation/schemas';
import { RESULT_STATUSES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const RESULT_SELECT = `
  id, return_percent, status, verified_at, notes, created_at,
  signal:signals(id, asset, orbit_score, opportunity_type)
`;

const filterSchema = z.object({
  status: z.enum(RESULT_STATUSES).optional(),
});

/** Public: list verified results / track entries with pagination. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams);
    const filters = filterSchema.parse({
      status: searchParams.get('status') ?? undefined,
    });

    const supabase = getAnonClient();
    let query = supabase
      .from('results')
      .select(RESULT_SELECT, { count: 'exact' });

    if (filters.status) query = query.eq('status', filters.status);

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return ok({ items: data ?? [], total: count ?? 0, limit, offset });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Admin: record a result for a signal. Auto-stamps verified_at when resolved. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = resultCreateSchema.parse(await request.json());

    const verified_at =
      body.verified_at ??
      (body.status !== 'pending' ? new Date().toISOString() : null);

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('results')
      .insert({ ...body, verified_at })
      .select('*')
      .single();
    if (error) throw error;

    return ok({ result: data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
