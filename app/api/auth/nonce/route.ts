import { NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import { getSession } from '@/lib/auth/session';
import { errorResponse } from '@/lib/http';
import { clientIp, rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

/** Issue a fresh nonce and store it in the session for SIWE verification. */
export async function GET(request: Request) {
  try {
    rateLimit(`nonce:${clientIp(request)}`, 20, 60_000);
    const session = await getSession();
    session.nonce = generateNonce();
    await session.save();
    return new NextResponse(session.nonce, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
