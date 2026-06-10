'use client';

import { useState } from 'react';
import { SiweMessage } from 'siwe';
import { getAddress } from 'viem';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAdminI18n } from '@/components/AdminI18nProvider';
import { signSiweMessage } from '@/lib/wallet/sign';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

function getProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
}

export default function LoginPage() {
  const { t } = useAdminI18n();
  const [status, setStatus] = useState<string>('');
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setStatus('');
    try {
      const provider = getProvider();
      if (!provider) {
        setStatus(t.login.noWallet);
        return;
      }

      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[];
      const address = getAddress(accounts[0]);

      const chainIdHex = (await provider.request({
        method: 'eth_chainId',
      })) as string;
      const chainId = Number.parseInt(chainIdHex, 16);

      const nonceRes = await fetch('/api/auth/nonce');
      const nonceData = (await nonceRes.json()) as {
        nonce?: string;
        domain?: string;
        error?: string;
      };
      if (!nonceRes.ok || !nonceData.nonce || !nonceData.domain) {
        setStatus(
          `${t.login.loginFailed}: ${nonceData.error ?? 'Failed to fetch nonce'}`,
        );
        return;
      }

      const safeChainId =
        Number.isFinite(chainId) && chainId > 0 ? chainId : 8453;

      // Omit `statement` — CJK text breaks strict EIP-4361 parsers in MetaMask/Rabby.
      const message = new SiweMessage({
        domain: nonceData.domain,
        address,
        uri: `https://${nonceData.domain}`,
        version: '1',
        chainId: safeChainId,
        nonce: nonceData.nonce.trim(),
        issuedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      }).prepareMessage();

      const signature = await signSiweMessage(provider, message, address);

      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus(`${t.login.loginFailed}: ${data.error ?? res.status}`);
        return;
      }

      if (data.user?.role === 'admin' || data.user?.role === 'super_admin') {
        window.location.href = '/admin';
      } else {
        setStatus(t.login.notAdmin);
      }
    } catch (e) {
      setStatus(`${t.login.errorPrefix}: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-top">
          <div className="login-logo">
            <span className="login-logo-dot" />
            <h1 className="login-title">{t.login.title}</h1>
          </div>
          <LanguageSwitcher />
        </div>
        <p className="login-subtitle">{t.login.subtitle}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={login}
          disabled={busy}
        >
          {busy ? t.login.signing : t.login.connect}
        </button>
        <p className="login-hint">{t.login.metamaskHint}</p>
        {status && <p className="login-status">{status}</p>}
      </div>
    </div>
  );
}
