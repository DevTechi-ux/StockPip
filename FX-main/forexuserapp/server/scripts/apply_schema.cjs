#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sqlPath = path.resolve(__dirname, '..', '..', '..', 'mysql_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Could not find mysql_schema.sql at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'forex_final',
    multipleStatements: true
  };

  console.log('Connecting to MySQL with', { host: config.host, port: config.port, user: config.user });

  const connection = await mysql.createConnection(config);
  try {
    console.log('Applying schema... This may take a few seconds.');

    // Split SQL into statements and run individually to allow partial re-apply
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

    let errors = 0;
    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (e) {
        errors++;
        const msg = e && e.message ? e.message : String(e);
        console.warn('Warning: statement failed (continuing):', msg.slice(0, 200));
      }
    }

    if (errors === 0) {
      console.log('✅ Schema applied successfully.');
    } else {
      console.log(`⚠️ Schema applied with ${errors} non-fatal errors. Review output.`);
      process.exitCode = 0; // not fatal; user can inspect warnings
    }
  } catch (err) {
    console.error('Fatal error applying schema:', err.message || err);
    process.exitCode = 2;
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
