import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env';

/**
 * Anon client for RLS-protected reads from server code. Respects row-level
 * security; safe for public data fetching.
 */
export function getAnonClient(): SupabaseClient {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
