import { getAdminClient } from '@/lib/supabase/admin';
import { errorResponse, ok } from '@/lib/http';
import { requireAuth } from '@/lib/auth/guards';
import { verifyPaymentSchema } from '@/lib/validation/schemas';
import { verifyOnchainPayment } from '@/lib/chain/payment';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import type { Plan } from '@/lib/types/db';

export const dynamic = 'force-dynamic';

/**
 * Auth: verify a Base payment tx and activate the subscription.
 * Body: { tx_hash, plan, asset }
 */
export async function POST(request: Request) {
  try {
    const siwe = await requireAuth();
    const body = verifyPaymentSchema.parse(await request.json());

    if (body.plan === 'free') {
      throw new ValidationError('Free plan does not require payment');
    }

    const supabase = getAdminClient();

    const { data: plan, error: planErr } = await supabase
      .from('plans')
      .select('*')
      .eq('name', body.plan)
      .eq('active', true)
      .maybeSingle<Plan>();
    if (planErr) throw planErr;
    if (!plan) throw new NotFoundError('Plan not found or inactive');

    const txHash = body.tx_hash.toLowerCase();

    const { data: dup, error: dupErr } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('payment_hash', txHash)
      .maybeSingle();
    if (dupErr) throw dupErr;
    if (dup) throw new ConflictError('This payment has already been used');

    const { amount } = await verifyOnchainPayment({
      txHash,
      asset: body.asset,
      minUsdc: plan.price_usdc,
    });

    const start = new Date();
    const end = new Date(start.getTime() + plan.duration_days * 86_400_000);

    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .insert({
        user_id: siwe.userId,
        plan: body.plan,
        payment_asset: body.asset,
        payment_hash: txHash,
        amount,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        status: 'active',
      })
      .select('*')
      .single();
    if (subErr) throw subErr;

    const { error: userErr } = await supabase
      .from('users')
      .update({ subscription_plan: body.plan, subscription_status: 'active' })
      .eq('id', siwe.userId);
    if (userErr) throw userErr;

    return ok({ subscription: sub }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
