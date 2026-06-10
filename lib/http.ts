import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors';

/** Convert thrown errors into a consistent JSON error response. */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', issues: e.issues },
      { status: 400 },
    );
  }
  if (e instanceof AppError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[orbit] unhandled error', e);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}
