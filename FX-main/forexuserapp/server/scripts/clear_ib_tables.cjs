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

  const confirm = process.env.CONFIRM_CLEAR === '1' || process.env.CONFIRM_CLEAR === 'true';

  console.log('Connecting to MySQL with', { host: config.host, port: config.port, user: config.user, database: config.database });
  console.log('CONFIRM_CLEAR:', confirm);

  const connection = await mysql.createConnection(config);
  try {
    const tables = ['ib_accounts', 'ib_referrals', 'ib_commissions', 'ib_withdrawals'];

    for (const t of tables) {
      try {
        const [exists] = await connection.query(`SHOW TABLES LIKE ?`, [t]);
        if (exists.length === 0) {
          console.log(`Table not found: ${t}`);
          continue;
        }

        const [before] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${t}\``);
        const beforeCnt = before[0] && before[0].cnt ? before[0].cnt : 0;
        console.log(`${t}: rows before = ${beforeCnt}`);

        if (confirm) {
          // Use DELETE to avoid TRUNCATE permission issues, then reset AUTO_INCREMENT
          await connection.query(`DELETE FROM \`${t}\``);
          await connection.query(`ALTER TABLE \`${t}\` AUTO_INCREMENT = 1`);
          const [after] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${t}\``);
          const afterCnt = after[0] && after[0].cnt ? after[0].cnt : 0;
          console.log(`${t}: rows after = ${afterCnt}`);
        } else {
          console.log(`Dry run: to actually clear this table set CONFIRM_CLEAR=1 and re-run.`);
        }
      } catch (e) {
        console.error(`Error operating on table ${t}:`, e.message || e);
      }
    }

    if (!confirm) {
      console.log('\nNo tables were modified. To clear the IB tables, re-run with CONFIRM_CLEAR=1');
    } else {
      console.log('\nAll requested IB tables cleared.');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message || err);
    process.exitCode = 2;
  } finally {
    await connection.end();
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
