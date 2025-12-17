#!/usr/bin/env node
const crypto = require('crypto');

const BASE = process.env.BASE_URL || 'http://localhost:8080';

async function req(path, opts = {}) {
  const url = BASE + path;
  const res = await fetch(url, opts).catch(e=>{ throw new Error('fetch failed:'+e.message)});
  const text = await res.text().catch(()=>null);
  let body = null;
  try { body = text ? JSON.parse(text) : null } catch(e) { body = text }
  return { status: res.status, body };
}

function randEmail() { return `e2e+${crypto.randomBytes(4).toString('hex')}@example.com`; }

async function main(){
  console.log('Starting IB end-to-end test');

  // 1. Register IB user
  const ibEmail = randEmail();
  const ibPass = 'Test1234!';
  console.log('Register IB user', ibEmail);
  const regIb = await req('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ firstName:'IB', lastName:'Tester', email: ibEmail, password: ibPass }) });
  console.log('register ->', regIb.status, regIb.body && regIb.body.message);

  // login IB
  const loginIb = await req('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: ibEmail, password: ibPass }) });
  if (loginIb.status !== 200) throw new Error('IB login failed');
  const ibToken = loginIb.body.token;
  console.log('IB logged in, token length', ibToken.length);

  // 2. Apply to be IB
  const apply = await req('/api/ib/apply', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${ibToken}` }, body: JSON.stringify({ ib_name: 'E2E IB' }) });
  console.log('apply ->', apply.status, apply.body && (apply.body.message || apply.body.error));

  // 3. Admin: find IB account and approve
  const list = await req('/api/admin/ib-accounts');
  if (list.status !== 200) throw new Error('admin list failed');
  const ibs = Array.isArray(list.body) ? list.body : (list.body.success && list.body ? list.body : []);
  const myIb = (ibs || []).find(x => x.user_id === (loginIb.body.user && loginIb.body.user.id) || x.email === ibEmail || x.referral_code);
  const ibId = myIb ? myIb.id : (ibs[0] && ibs[0].id);
  console.log('Found IB id', ibId);

  const approve = await req(`/api/admin/ib-accounts/${ibId}/status`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'approved', commission_rate: 5.00, commission_type: 'per_lot' }) });
  console.log('approve ->', approve.status, approve.body && (approve.body.message || approve.body.error));

  // 4. Get referral code for IB
  const refreshed = await req('/api/admin/ib-accounts');
  const refreshedList = Array.isArray(refreshed.body) ? refreshed.body : (refreshed.body.success ? refreshed.body : []);
  const my = refreshedList.find(x => x.id === ibId);
  const referralCode = my ? my.referral_code : null;
  console.log('Referral code:', referralCode);

  if (!referralCode) throw new Error('no referral code');

  // 5. Register referred client
  const clientEmail = randEmail();
  const clientPass = 'Test1234!';
  console.log('Register referred client', clientEmail);
  const regClient = await req('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ firstName:'Client', lastName:'One', email: clientEmail, password: clientPass, ibReferralCode: referralCode }) });
  console.log('client register ->', regClient.status, regClient.body && regClient.body.message);

  // login client
  const loginClient = await req('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: clientEmail, password: clientPass }) });
  if (loginClient.status !== 200) throw new Error('client login failed');
  const clientToken = loginClient.body.token;
  console.log('Client logged in');

  // 6. Create a close trade for client - call trades/close (requires verifyToken)
  const closeBody = {
    positionId: `pos-${Date.now()}`,
    symbol: 'EURUSD',
    side: 'BUY',
    lot: 1.0,
    entryPrice: 1.1000,
    exitPrice: 1.1100,
    pnl: 100.0,
    marginUsed: 1.0
  };

  console.log('Closing a trade for client to trigger commission');
  const closeRes = await req('/api/trades/close', { method:'POST', headers:{'Content-Type':'application/json', Authorization: `Bearer ${clientToken}`}, body: JSON.stringify(closeBody) });
  console.log('trades/close ->', closeRes.status, closeRes.body && (closeRes.body.message || closeRes.body.error));

  // wait for commission calculation to run
  await new Promise(r => setTimeout(r, 1200));

  // 7. Check IB commissions and pending earnings via admin view
  const ibsAfter = await req('/api/admin/ib-accounts');
  console.log('/api/admin/ib-accounts ->', ibsAfter.status);
  if (ibsAfter.status === 200) {
    const list2 = Array.isArray(ibsAfter.body) ? ibsAfter.body : (ibsAfter.body.success ? ibsAfter.body : []);
    const me = list2.find(x => x.id === ibId);
    console.log('IB pending_earnings:', me ? me.pending_earnings : 'not found');
  } else {
    console.log('Could not fetch admin IB accounts');
  }

  // Also check commissions for IB using IB token
  const loginIb2 = await req('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: ibEmail, password: ibPass }) });
  const ibTok = loginIb2.body.token;
  const comm = await req('/api/ib/commissions', { headers: { Authorization: `Bearer ${ibTok}` } });
  console.log('/api/ib/commissions ->', comm.status, comm.body && (Array.isArray(comm.body) ? `${comm.body.length} items` : JSON.stringify(comm.body).slice(0,200)));

  console.log('E2E finished');
}

main().catch(e => { console.error('E2E error:', e.message); process.exit(1); });
