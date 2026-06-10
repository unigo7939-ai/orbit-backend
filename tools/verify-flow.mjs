/**
 * End-to-end verification:
 *  login → create signal → prediction → result → track-record → public API
 *
 * Usage: node --env-file=.env.local tools/verify-flow.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { SiweMessage } from 'siwe';
import { privateKeyToAccount } from 'viem/accounts';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const TEST_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const TEST_ASSET = 'BTC_E2E_VERIFY';

const account = privateKeyToAccount(TEST_KEY);
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

let passed = 0;
let failed = 0;

function ok(label, detail = '') {
  passed++;
  console.log(`  ✅ ${label}${detail ? ` — ${detail}` : ''}`);
}

function fail(label, detail = '') {
  failed++;
  console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
}

function jar(res, prev = '') {
  const set = res.headers.getSetCookie?.() ?? [];
  const fresh = set.map((c) => c.split(';')[0]).join('; ');
  return fresh || prev;
}

async function login() {
  const nonceRes = await fetch(`${BASE}/api/auth/nonce`);
  if (!nonceRes.ok) throw new Error(`nonce ${nonceRes.status}`);
  const cookie1 = jar(nonceRes);
  const { nonce: rawNonce, domain } = await nonceRes.json();
  const nonce = String(rawNonce).trim();

  const message = new SiweMessage({
    domain: domain ?? 'localhost:3000',
    address: account.address,
    statement: 'Sign in to ORBIT Admin',
    uri: BASE,
    version: '1',
    chainId: 8453,
    nonce,
    issuedAt: new Date().toISOString(),
  }).prepareMessage();
  const signature = await account.signMessage({ message });

  const verifyRes = await fetch(`${BASE}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie1 },
    body: JSON.stringify({ message, signature }),
  });
  const data = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(`verify: ${JSON.stringify(data)}`);
  return { cookie: jar(verifyRes, cookie1), user: data.user };
}

async function cleanup() {
  const { data: signals } = await sb
    .from('signals')
    .select('id')
    .eq('asset', TEST_ASSET);
  if (signals?.length) {
    const ids = signals.map((s) => s.id);
    await sb.from('predictions').delete().in('signal_id', ids);
    await sb.from('results').delete().in('signal_id', ids);
    await sb.from('signals').delete().eq('asset', TEST_ASSET);
  }
  await sb
    .from('users')
    .delete()
    .eq('wallet_address', account.address.toLowerCase());
}

async function main() {
  console.log('\n🔬 ORBIT Alpha — E2E Flow Verification\n');
  console.log(`Base URL: ${BASE}`);
  console.log(`Test wallet: ${account.address}\n`);

  let cookie = '';
  let signalId = '';

  // 0. Pre-cleanup
  await cleanup();

  // 1. Login
  console.log('1) SIWE Login');
  try {
    const { cookie: c, user } = await login();
    cookie = c;
    if (user.role === 'super_admin' || user.role === 'admin') {
      ok('Login', `role=${user.role}`);
    } else {
      fail('Login', `expected admin, got ${user.role}`);
    }
  } catch (e) {
    fail('Login', e.message);
    process.exit(1);
  }

  // 2. Create signal
  console.log('\n2) Create Signal (POST /api/signals)');
  const signalBody = {
    asset: TEST_ASSET,
    opportunity_type: 'momentum',
    status: 'high_conviction',
    risk_level: 'medium',
    time_window_days: 30,
    summary: 'E2E verify flow',
    reason: 'Automated test',
    money_flow_score: 80,
    growth_score: 60,
    social_score: 70,
    market_structure_score: 50,
    ai_conviction_score: 90,
  };
  const createRes = await fetch(`${BASE}/api/signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(signalBody),
  });
  const created = await createRes.json();
  if (createRes.status === 201 && created.signal?.orbit_score === 70) {
    signalId = created.signal.id;
    ok('Create signal', `orbit_score=70, id=${signalId.slice(0, 8)}…`);
  } else {
    fail('Create signal', `${createRes.status} ${JSON.stringify(created)}`);
  }

  // 3. Prediction
  console.log('\n3) Create Prediction (POST /api/predictions)');
  if (signalId) {
    const predRes = await fetch(`${BASE}/api/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        signal_id: signalId,
        entry_price: 65000,
        target_price: 72000,
        invalid_price: 60000,
        position_size: 0.1,
        action_type: 'buy',
      }),
    });
    const pred = await predRes.json();
    if (predRes.status === 201 && pred.prediction?.id) {
      ok('Create prediction', `entry=65000 target=72000`);
    } else {
      fail('Create prediction', `${predRes.status} ${JSON.stringify(pred)}`);
    }
  } else {
    fail('Create prediction', 'skipped — no signal id');
  }

  // 4. Result (win)
  console.log('\n4) Create Result (POST /api/results)');
  if (signalId) {
    const resRes = await fetch(`${BASE}/api/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        signal_id: signalId,
        return_percent: 12.5,
        status: 'win',
        notes: 'E2E verify win',
      }),
    });
    const resData = await resRes.json();
    if (resRes.status === 201 && resData.result?.status === 'win') {
      ok('Create result', `return=12.5% status=win`);
    } else {
      fail('Create result', `${resRes.status} ${JSON.stringify(resData)}`);
    }
  } else {
    fail('Create result', 'skipped — no signal id');
  }

  // 5. Track record (Settings stats)
  console.log('\n5) Track Record (GET /api/track-record)');
  const trRes = await fetch(`${BASE}/api/track-record`);
  const tr = await trRes.json();
  const s = tr.summary;
  if (
    trRes.ok &&
    s?.verified_signals >= 1 &&
    s?.wins >= 1 &&
    Number(s?.win_rate) === 100
  ) {
    ok('Track record', `win_rate=${s.win_rate}% verified=${s.verified_signals}`);
  } else {
    fail('Track record', JSON.stringify(s));
  }

  // 6. Public API
  console.log('\n6) Public API (GET /api/signals)');
  const pubRes = await fetch(`${BASE}/api/signals`);
  const pub = await pubRes.json();
  const found = pub.items?.some((i) => i.asset === TEST_ASSET);
  if (pubRes.ok && pub.total >= 1 && found) {
    ok('Public signals', `total=${pub.total}, BTC_E2E_VERIFY found`);
  } else {
    fail('Public signals', `total=${pub.total} found=${found}`);
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test data…');
  await cleanup();
  console.log('   Done.\n');

  console.log(`\n📊 Result: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('\n💥 Fatal:', e);
  cleanup().finally(() => process.exit(1));
});
