import 'server-only';
import {
  createPublicClient,
  decodeEventLog,
  formatEther,
  http,
  parseAbiItem,
  type Hash,
} from 'viem';
import { base } from 'viem/chains';
import { serverEnv } from '@/lib/env';
import { ValidationError } from '@/lib/errors';
import type { PaymentAsset } from '@/lib/constants';

const transferEvent = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
);
const transferAbi = [transferEvent] as const;

const USDC_DECIMALS = 6;

function client() {
  return createPublicClient({
    chain: base,
    transport: http(serverEnv.baseRpcUrl),
  });
}

export interface PaymentVerification {
  amount: number;
  asset: PaymentAsset;
}

/**
 * Verify an on-chain payment to the configured wallet on Base mainnet.
 * - USDC: sums ERC-20 Transfer events to the wallet, requires >= minUsdc.
 * - ETH: requires the tx recipient to be the wallet with a non-zero value.
 * Throws ValidationError on any mismatch.
 */
export async function verifyOnchainPayment(params: {
  txHash: string;
  asset: PaymentAsset;
  minUsdc: number;
}): Promise<PaymentVerification> {
  const { txHash, asset, minUsdc } = params;
  const hash = txHash as Hash;
  const wallet = serverEnv.paymentWalletAddress;
  const publicClient = client();

  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash });
  } catch {
    throw new ValidationError('Transaction not found on Base');
  }
  if (receipt.status !== 'success') {
    throw new ValidationError('Transaction was not successful');
  }

  if (asset === 'eth') {
    const tx = await publicClient.getTransaction({ hash });
    if (!tx.to || tx.to.toLowerCase() !== wallet) {
      throw new ValidationError('ETH payment recipient mismatch');
    }
    if (tx.value <= 0n) {
      throw new ValidationError('ETH payment value is zero');
    }
    return { amount: Number(formatEther(tx.value)), asset };
  }

  // USDC: scan Transfer logs from the USDC contract to the wallet.
  let received = 0n;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== serverEnv.usdcContractBase) continue;
    try {
      const decoded = decodeEventLog({
        abi: transferAbi,
        data: log.data,
        topics: log.topics,
      });
      if (
        decoded.eventName === 'Transfer' &&
        decoded.args.to.toLowerCase() === wallet
      ) {
        received += decoded.args.value;
      }
    } catch {
      // not a Transfer log we can decode; skip
    }
  }

  const required = BigInt(Math.round(minUsdc * 10 ** USDC_DECIMALS));
  if (received < required) {
    throw new ValidationError('Insufficient USDC amount received');
  }

  return { amount: Number(received) / 10 ** USDC_DECIMALS, asset };
}
