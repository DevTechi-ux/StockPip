#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sqlPath = path.resolve(__dirname, '..', '..', 'mysql_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Could not find mysql_schema.sql at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Use environment variables with sensible defaults
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  console.log('Connecting to MySQL with', { host: config.host, port: config.port, user: config.user });

  const connection = await mysql.createConnection(config);
  try {
    console.log('Applying schema... This may take a few seconds.');
    // Execute entire file as multiple statements
    await connection.query(sql);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err.message || err);
    process.exitCode = 2;
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
