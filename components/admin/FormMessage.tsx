'use client';

export function FormMessage({
  type,
  text,
}: {
  type: 'ok' | 'err' | null;
  text: string;
}) {
  if (!type || !text) return null;
  return <div className={`form-msg ${type}`}>{text}</div>;
}
