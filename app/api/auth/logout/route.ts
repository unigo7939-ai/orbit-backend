import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { errorResponse } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
