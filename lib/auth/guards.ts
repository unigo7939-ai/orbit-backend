import 'server-only';
import { getSession, type SessionData } from '@/lib/auth/session';
import { AuthError, ForbiddenError } from '@/lib/errors';

export type AuthedSession = NonNullable<SessionData['siwe']>;

/** Require a logged-in wallet. Throws AuthError (401) otherwise. */
export async function requireAuth(): Promise<AuthedSession> {
  const session = await getSession();
  if (!session.siwe) {
    throw new AuthError();
  }
  return session.siwe;
}

/** Require admin or super_admin. Throws ForbiddenError (403) otherwise. */
export async function requireAdmin(): Promise<AuthedSession> {
  const siwe = await requireAuth();
  if (siwe.role !== 'admin' && siwe.role !== 'super_admin') {
    throw new ForbiddenError('Admin access required');
  }
  return siwe;
}

/** Require super_admin specifically. */
export async function requireSuperAdmin(): Promise<AuthedSession> {
  const siwe = await requireAuth();
  if (siwe.role !== 'super_admin') {
    throw new ForbiddenError('Super admin access required');
  }
  return siwe;
}
