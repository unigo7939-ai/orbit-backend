import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { requireAuth } from '@/lib/auth/guards';
import { getUserById } from '@/lib/auth/users';
import { NotFoundError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/** Auth: current subscription status + history for the logged-in user. */
export async function GET() {
  try {
    const siwe = await requireAuth();
    const user = await getUserById(siwe.userId);
    if (!user) throw new NotFoundError('User not found');

    const supabase = getAdminClient();
    const { data: history, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', siwe.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return ok({
      current: {
        plan: user.subscription_plan,
        status: user.subscription_status,
      },
      history: history ?? [],
    });
  } catch (e) {
    return errorResponse(e);
  }
}
