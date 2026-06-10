import { getAnonClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth/guards';
import { planUpsertSchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

/** Public: list active subscription plans. */
export async function GET() {
  try {
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('price_usdc', { ascending: true });
    if (error) throw error;
    return ok({ plans: data ?? [] });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Admin: create or update a plan (keyed by unique name). */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = planUpsertSchema.parse(await request.json());

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('plans')
      .upsert(body, { onConflict: 'name' })
      .select('*')
      .single();
    if (error) throw error;

    return ok({ plan: data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
