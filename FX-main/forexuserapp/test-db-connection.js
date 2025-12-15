import mysql from 'mysql2/promise';

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // XAMPP default password is usually empty
  database: process.env.DB_NAME || 'forex_final',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to XAMPP MySQL database...');
    console.log('📋 Connection details:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Password: ${dbConfig.password ? '***' : '(empty)'}`);
    console.log('');

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to XAMPP MySQL database!');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 MySQL Version: ${rows[0].version}`);
    
    // Check if database exists and show tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tables found: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('📝 Available tables:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('⚠️  No tables found. You may need to run the schema file.');
    }
    
    await connection.end();
    console.log('🔌 Connection closed successfully.');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('💡 Troubleshooting tips:');
      console.log('   1. Make sure XAMPP is running');
      console.log('   2. Check if MySQL service is started in XAMPP Control Panel');
      console.log('   3. Verify username/password (XAMPP default is root with no password)');
      console.log('   4. Check if database "forex_trading" exists');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('');
      console.log('💡 Database "forex_trading" does not exist.');
      console.log('   Please create the database first:');
      console.log('   1. Open phpMyAdmin (http://localhost/phpmyadmin)');
      console.log('   2. Create database named "forex_trading"');
      console.log('   3. Import the mysql_schema.sql file');
    }
    
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('');
    console.log('🎉 Database connection test completed successfully!');
    process.exit(0);
  } else {
    console.log('');
    console.log('💥 Database connection test failed!');
    process.exit(1);
  }
});
