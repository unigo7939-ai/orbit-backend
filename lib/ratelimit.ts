import { AppError } from '@/lib/errors';

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

/** Simple in-memory rate limiter (per server instance). */
export function rateLimit(key: string, max = 30, windowMs = 60_000): void {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= max) {
    throw new AppError('Too many requests', 429);
  }

  bucket.count += 1;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}
