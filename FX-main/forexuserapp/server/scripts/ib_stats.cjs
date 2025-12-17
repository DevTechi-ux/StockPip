#!/usr/bin/env node
const mysql = require('mysql2/promise');

async function main() {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'forex_final'
  };

  console.log('Connecting to MySQL with', { host: config.host, port: config.port, user: config.user, database: config.database });

  const conn = await mysql.createConnection(config);
  try {
    const queries = {
      total_ib_accounts: 'SELECT COUNT(*) as cnt FROM ib_accounts',
      approved_ib_accounts: "SELECT COUNT(*) as cnt FROM ib_accounts WHERE status = 'approved'",
      total_referrals: 'SELECT COUNT(*) as cnt FROM ib_referrals',
      pending_commissions: "SELECT COUNT(*) as cnt, COALESCE(SUM(commission_amount),0) as total_amount FROM ib_commissions WHERE status = 'pending'",
      pending_withdrawals: "SELECT COUNT(*) as cnt, COALESCE(SUM(amount),0) as total_amount FROM ib_withdrawals WHERE status = 'pending'",
      total_pending_earnings: 'SELECT COALESCE(SUM(pending_earnings),0) as total_pending FROM ib_accounts'
    };

    for (const [key, q] of Object.entries(queries)) {
      const [rows] = await conn.query(q);
      console.log(`${key}:`, rows[0]);
    }

    console.log('\nTop 10 IBs by pending_earnings:');
    const [top] = await conn.query(`SELECT id, ib_name, referral_code, pending_earnings FROM ib_accounts ORDER BY pending_earnings DESC LIMIT 10`);
    console.table(top);

  } catch (err) {
    console.error('Error running stats:', err.message || err);
    process.exitCode = 2;
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
