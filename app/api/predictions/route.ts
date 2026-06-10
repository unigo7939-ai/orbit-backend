import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { requireAdmin } from '@/lib/auth/guards';
import { predictionCreateSchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

/** Admin: attach a prediction (entry/target/invalid + action) to a signal. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = predictionCreateSchema.parse(await request.json());

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        ...body,
        published_at: body.published_at ?? new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;

    return ok({ prediction: data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
