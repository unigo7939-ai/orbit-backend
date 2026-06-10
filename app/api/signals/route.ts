import { z } from 'zod';
import { getAnonClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { parsePagination } from '@/lib/api/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { signalCreateSchema } from '@/lib/validation/schemas';
import { computeOrbitScore, getScoreWeights } from '@/lib/score/orbitScore';
import {
  OPPORTUNITY_TYPES,
  RISK_LEVELS,
  SIGNAL_STATUSES,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

const SIGNAL_SELECT = `
  id, asset, opportunity_type, status, risk_level, time_window_days,
  summary, reason, orbit_score,
  money_flow_score, growth_score, social_score, market_structure_score, ai_conviction_score,
  created_at, updated_at,
  category:signal_categories(id, name, slug),
  subcategory:signal_subcategories(id, name, slug)
`;

const SORTABLE = {
  newest: { column: 'created_at', ascending: false },
  oldest: { column: 'created_at', ascending: true },
  score: { column: 'orbit_score', ascending: false },
} as const;

const filterSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  status: z.enum(SIGNAL_STATUSES).optional(),
  opportunity_type: z.enum(OPPORTUNITY_TYPES).optional(),
  risk_level: z.enum(RISK_LEVELS).optional(),
  sort: z.enum(['newest', 'oldest', 'score']).default('newest'),
});

/** Public: list signals with filters + pagination. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams);
    const filters = filterSchema.parse({
      category: searchParams.get('category') ?? undefined,
      subcategory: searchParams.get('subcategory') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      opportunity_type: searchParams.get('opportunity_type') ?? undefined,
      risk_level: searchParams.get('risk_level') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
    });

    const supabase = getAnonClient();

    let categoryId: string | null = null;
    if (filters.category) {
      const { data } = await supabase
        .from('signal_categories')
        .select('id')
        .eq('slug', filters.category)
        .maybeSingle<{ id: string }>();
      if (!data) return ok({ items: [], total: 0, limit, offset });
      categoryId = data.id;
    }

    let subcategoryId: string | null = null;
    if (filters.subcategory) {
      const { data } = await supabase
        .from('signal_subcategories')
        .select('id')
        .eq('slug', filters.subcategory)
        .maybeSingle<{ id: string }>();
      if (!data) return ok({ items: [], total: 0, limit, offset });
      subcategoryId = data.id;
    }

    let query = supabase
      .from('signals')
      .select(SIGNAL_SELECT, { count: 'exact' });

    if (categoryId) query = query.eq('category_id', categoryId);
    if (subcategoryId) query = query.eq('subcategory_id', subcategoryId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.opportunity_type)
      query = query.eq('opportunity_type', filters.opportunity_type);
    if (filters.risk_level) query = query.eq('risk_level', filters.risk_level);

    const sort = SORTABLE[filters.sort];
    query = query
      .order(sort.column, { ascending: sort.ascending })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return ok({ items: data ?? [], total: count ?? 0, limit, offset });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Admin: create a signal. Orbit Score is computed from weighted components. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = signalCreateSchema.parse(await request.json());

    const weights = await getScoreWeights();
    const orbit_score = computeOrbitScore(body, weights);

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('signals')
      .insert({ ...body, orbit_score, created_by: admin.userId })
      .select('*')
      .single();

    if (error) throw error;
    return ok({ signal: data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
