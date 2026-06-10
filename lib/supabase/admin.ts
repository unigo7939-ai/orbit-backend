import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env';

/**
 * Service-role client. Bypasses RLS — use ONLY in server code (route handlers,
 * server actions) and only after enforcing app-level authorization.
 */
let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
