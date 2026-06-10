import 'server-only';
import { SiweMessage } from 'siwe';
import { AuthError } from '@/lib/errors';

export interface VerifiedSiwe {
  address: string;
  chainId: number;
}

/**
 * Verify a SIWE message + signature against the expected nonce and domain.
 * Throws AuthError on failure. EOA signatures are verified offline (ecrecover).
 */
export async function verifySiwe(
  message: string,
  signature: string,
  nonce: string,
  domain: string,
): Promise<VerifiedSiwe> {
  let parsed: SiweMessage;
  try {
    parsed = new SiweMessage(message);
  } catch {
    throw new AuthError('Malformed SIWE message');
  }

  const result = await parsed.verify(
    { signature, nonce, domain },
    { suppressExceptions: true },
  );

  if (!result.success) {
    throw new AuthError(result.error?.type ?? 'SIWE verification failed');
  }

  return {
    address: result.data.address.toLowerCase(),
    chainId: result.data.chainId,
  };
}
