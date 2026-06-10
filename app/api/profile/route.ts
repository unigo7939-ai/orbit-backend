import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { requireAuth } from '@/lib/auth/guards';
import { getUserById } from '@/lib/auth/users';
import { profileUpdateSchema } from '@/lib/validation/schemas';
import { NotFoundError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/** Auth: current user's profile. */
export async function GET() {
  try {
    const siwe = await requireAuth();
    const user = await getUserById(siwe.userId);
    if (!user) throw new NotFoundError('User not found');
    return ok({ user });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Auth: update own nickname / avatar. */
export async function PATCH(request: Request) {
  try {
    const siwe = await requireAuth();
    const body = profileUpdateSchema.parse(await request.json());

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('users')
      .update(body)
      .eq('id', siwe.userId)
      .select('*')
      .single();
    if (error) throw error;

    return ok({ user: data });
  } catch (e) {
    return errorResponse(e);
  }
}
