import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { verifySiwe } from '@/lib/auth/siwe';
import { upsertUserOnLogin } from '@/lib/auth/users';
import { serverEnv } from '@/lib/env';
import { AuthError } from '@/lib/errors';
import { errorResponse } from '@/lib/http';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});

/** Verify SIWE signature, upsert the user, and establish a session. */
export async function POST(request: Request) {
  try {
    rateLimit(`verify:${clientIp(request)}`, 10, 60_000);
    const session = await getSession();
    const body = bodySchema.parse(await request.json());

    if (!session.nonce) {
      throw new AuthError('Missing or expired nonce');
    }

    const { address } = await verifySiwe(
      body.message,
      body.signature,
      session.nonce,
      serverEnv.siweDomain,
    );

    const user = await upsertUserOnLogin(address);

    session.nonce = undefined;
    session.siwe = {
      address: user.wallet_address,
      userId: user.id,
      role: user.role,
    };
    await session.save();

    return NextResponse.json({
      ok: true,
      user: {
        address: user.wallet_address,
        role: user.role,
        nickname: user.nickname,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
