import 'server-only';

/** Strip accidental protocol/path from a configured domain value. */
function cleanDomain(value: string): string {
  return value.replace(/^https?:\/\//, '').split('/')[0].trim();
}

/**
 * Resolve the SIWE domain for the current request.
 * Prefer the actual Host header in production so login works even if
 * SIWE_DOMAIN env lags behind the Vercel-assigned hostname.
 */
export function resolveSiweDomain(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-host');
  const host = forwarded ?? request.headers.get('host');
  if (host) {
    return cleanDomain(host.split(',')[0]);
  }

  const fromEnv = process.env.SIWE_DOMAIN;
  if (fromEnv) {
    return cleanDomain(fromEnv);
  }

  return 'localhost:3000';
}
