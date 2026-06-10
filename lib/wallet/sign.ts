import { stringToHex } from 'viem';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

function isSignature(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('0x') && value.length > 10;
}

/**
 * Try several wallet RPC shapes. MetaMask sometimes crashes its own UI
 * (BigNumber 15-digit bug) on personal_sign; wallet_sign or hex encoding
 * may use a different code path.
 */
export async function signSiweMessage(
  provider: EthereumProvider,
  message: string,
  address: string,
): Promise<string> {
  const attempts: { method: string; params: unknown[] }[] = [
    { method: 'wallet_sign', params: [{ account: address, message }] },
    { method: 'wallet_sign', params: [{ account: address, message: stringToHex(message) }] },
    { method: 'personal_sign', params: [message, address] },
    { method: 'personal_sign', params: [stringToHex(message), address] },
    { method: 'personal_sign', params: [address, message] },
  ];

  let lastError: Error | null = null;
  for (const { method, params } of attempts) {
    try {
      const result = await provider.request({ method, params });
      if (isSignature(result)) {
        return result;
      }
    } catch (e) {
      lastError = e as Error;
      const msg = lastError.message ?? '';
      if (
        msg.includes('not supported') ||
        msg.includes('Method not found') ||
        msg.includes('does not exist')
      ) {
        continue;
      }
    }
  }

  throw lastError ?? new Error('Wallet signing failed');
}
