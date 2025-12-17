#!/usr/bin/env node
const crypto = require('crypto');

const BASE = process.env.BASE_URL || 'http://localhost:8080';

async function req(path, opts = {}) {
  const url = BASE + path;
  const res = await fetch(url, opts);
  const text = await res.text().catch(()=>null);
  let body = null;
  try { body = text ? JSON.parse(text) : null } catch(e) { body = text }
  return { status: res.status, body };
}

async function main(){
  const rnd = crypto.randomBytes(4).toString('hex');
  const email = `test+${rnd}@example.com`;
  const password = `P@ssw0rd${rnd}`;

  console.log('Registering user', email);
  const reg = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: 'Smoke', lastName: 'Test', email, password })
  });
  console.log('Register ->', reg.status, reg.body && (reg.body.message || reg.body));

  console.log('Logging in');
  const login = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Login ->', login.status, login.body && (login.body.message || (login.body.user && login.body.user.id) || ''));

  if (!login.body || !login.body.token) {
    console.error('Login failed, aborting smoke test');
    process.exit(1);
  }

  const token = login.body.token;
  console.log('Token received, calling IB endpoints');

  const dashboard = await req('/api/ib/dashboard', { headers: { Authorization: `Bearer ${token}` } });
  console.log('GET /api/ib/dashboard ->', dashboard.status, dashboard.body ? (dashboard.body.message || JSON.stringify(dashboard.body).slice(0,200)) : '');

  const apply = await req('/api/ib/apply', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ib_name: `Smoke IB ${rnd}` }) });
  console.log('POST /api/ib/apply ->', apply.status, apply.body ? (apply.body.message || JSON.stringify(apply.body).slice(0,200)) : '');

  const dashboard2 = await req('/api/ib/dashboard', { headers: { Authorization: `Bearer ${token}` } });
  console.log('GET /api/ib/dashboard (after apply) ->', dashboard2.status, dashboard2.body ? (dashboard2.body.ib ? `ib id=${dashboard2.body.ib.id} status=${dashboard2.body.ib.status}` : JSON.stringify(dashboard2.body).slice(0,200)) : '');

  // Attempt withdraw (expected to fail: not approved / insufficient funds)
  const withdraw = await req('/api/ib/withdraw', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 10, withdrawal_method: 'BANK_TRANSFER', bank_details: { account: '123' } }) });
  console.log('POST /api/ib/withdraw ->', withdraw.status, withdraw.body ? (withdraw.body.error || withdraw.body.message || JSON.stringify(withdraw.body).slice(0,200)) : '');

  console.log('Smoke test complete');
}

main().catch(e=>{ console.error('Fatal:', e); process.exit(1); });
