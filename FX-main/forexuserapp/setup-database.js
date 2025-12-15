import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // XAMPP default password is usually empty
  database: process.env.DB_NAME || 'forex_final'
};

async function setupDatabase() {
  try {
    console.log(`🔄 Setting up ${process.env.DB_NAME || 'forex_final'} database...`);
    
    // First connect without specifying database to create it
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'forex_final';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database ${dbName} created/verified`);
    
    // Switch to the database
    await connection.execute(`USE ${dbName}`);
    
    // Read and execute schema file
    const schemaPath = path.join(process.cwd(), '..', 'mysql_schema.sql');
    console.log(`📄 Reading schema file: ${schemaPath}`);
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      console.log(`📋 Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement && !statement.startsWith('--')) {
          try {
            await connection.execute(statement);
            console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
          } catch (error) {
            if (!error.message.includes('already exists')) {
              console.log(`⚠️  Statement ${i + 1} warning: ${error.message}`);
            }
          }
        }
      }
      
      console.log('✅ Schema imported successfully');
    } else {
      console.log('⚠️  Schema file not found, skipping import');
    }
    
    // Show tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Database now contains ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('🎉 Database setup completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 XAMPP MySQL is not running. Please:');
      console.log('   1. Open XAMPP Control Panel');
      console.log('   2. Start MySQL service');
      console.log('   3. Run this script again');
    }
    
    return false;
  }
}

// Run the setup
setupDatabase().then(success => {
  if (success) {
    console.log('');
    console.log('🚀 Your database is ready! You can now run your application.');
    process.exit(0);
  } else {
    console.log('');
    console.log('💥 Database setup failed!');
    process.exit(1);
  }
});
