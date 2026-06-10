import 'server-only';
import { getAdminClient } from '@/lib/supabase/admin';
import { serverEnv } from '@/lib/env';
import type { User } from '@/lib/types/db';
import type { UserRole } from '@/lib/constants';

/**
 * Find-or-create a user on SIWE login. The wallet configured via
 * ADMIN_WALLET_ADDRESS is bootstrapped (or promoted) to super_admin.
 */
export async function upsertUserOnLogin(walletAddress: string): Promise<User> {
  const supabase = getAdminClient();
  const address = walletAddress.toLowerCase();
  const isBootstrapAdmin =
    serverEnv.adminWalletAddress.length > 0 && address === serverEnv.adminWalletAddress;

  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', address)
    .maybeSingle<User>();

  if (selectError) throw selectError;

  if (existing) {
    if (isBootstrapAdmin && existing.role !== 'super_admin') {
      const { data: promoted, error: updateError } = await supabase
        .from('users')
        .update({
          role: 'super_admin',
          nickname: existing.nickname ?? 'orbit_admin',
        })
        .eq('id', existing.id)
        .select('*')
        .single<User>();
      if (updateError) throw updateError;
      return promoted;
    }
    return existing;
  }

  const role: UserRole = isBootstrapAdmin ? 'super_admin' : 'user';
  const nickname = isBootstrapAdmin ? 'orbit_admin' : null;

  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert({ wallet_address: address, role, nickname })
    .select('*')
    .single<User>();

  if (insertError) throw insertError;
  return created;
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle<User>();
  if (error) throw error;
  return data;
}
