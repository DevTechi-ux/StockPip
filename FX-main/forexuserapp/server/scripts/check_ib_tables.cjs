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

  const connection = await mysql.createConnection(config);
  try {
    const tables = ['ib_accounts', 'ib_referrals', 'ib_commissions', 'ib_withdrawals', 'ib_settings'];
    for (const t of tables) {
      try {
        const [rows] = await connection.query(`SHOW TABLES LIKE ?`, [t]);
        if (rows.length === 0) {
          console.log(`Table not found: ${t}`);
          continue;
        }
        console.log('\n---', t, '---');
        const [cols] = await connection.query(`DESCRIBE \`${t}\``);
        console.table(cols);
      } catch (e) {
        console.error(`Error checking table ${t}:`, e.message || e);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err.message || err);
    process.exitCode = 2;
  } finally {
    await connection.end();
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
