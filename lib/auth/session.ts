import 'server-only';
import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { serverEnv } from '@/lib/env';
import type { UserRole } from '@/lib/constants';

export interface SessionData {
  /** Server-issued nonce, set by /api/auth/nonce, consumed by /api/auth/verify. */
  nonce?: string;
  /** Present once the wallet has been verified via SIWE. */
  siwe?: {
    address: string;
    userId: string;
    role: UserRole;
  };
}

export const SESSION_COOKIE = 'orbit_session';

function getSessionOptions(): SessionOptions {
  return {
    password: serverEnv.sessionSecret,
    cookieName: SESSION_COOKIE,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}
