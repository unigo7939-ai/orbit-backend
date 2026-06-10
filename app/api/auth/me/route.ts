import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/users';
import { errorResponse } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Lightweight session check; returns the current user if authenticated. */
export async function GET() {
  try {
    const session = await getSession();
    if (!session.siwe) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    const user = await getUserById(session.siwe.userId);
    if (!user) {
      session.destroy();
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        address: user.wallet_address,
        role: user.role,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        subscription_plan: user.subscription_plan,
        subscription_status: user.subscription_status,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
