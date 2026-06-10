/**
 * Centralised environment access. Server-only secrets must never be imported
 * into client components. Public values use the NEXT_PUBLIC_ prefix.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const serverEnv = {
  get supabaseUrl() {
    return required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseAnonKey() {
    return required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
  get supabaseServiceRoleKey() {
    return required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get sessionSecret() {
    return required('SESSION_SECRET', process.env.SESSION_SECRET);
  },
  get siweDomain() {
    return process.env.SIWE_DOMAIN ?? 'localhost:3000';
  },
  get baseRpcUrl() {
    return process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';
  },
  get paymentWalletAddress() {
    return required('PAYMENT_WALLET_ADDRESS', process.env.PAYMENT_WALLET_ADDRESS).toLowerCase();
  },
  get usdcContractBase() {
    return (
      process.env.USDC_CONTRACT_BASE ?? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    ).toLowerCase();
  },
  get adminWalletAddress() {
    return (process.env.ADMIN_WALLET_ADDRESS ?? '').toLowerCase();
  },
  get upstashUrl() {
    return process.env.UPSTASH_REDIS_REST_URL ?? '';
  },
  get upstashToken() {
    return process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
  },
};
