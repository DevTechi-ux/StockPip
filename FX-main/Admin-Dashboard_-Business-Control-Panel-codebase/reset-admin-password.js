import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Database configuration
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'forex_final'
};

async function resetAdminPassword() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    const email = 'admin@ventablack.com';
    const newPassword = 'admin123';
    
    // Check if admin exists
    console.log(`🔍 Checking for admin user: ${email}`);
    const [users] = await connection.execute(
      "SELECT id, email, first_name, last_name, user_type, is_active FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found. Creating new admin user...\n');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const adminId = 'admin-001';
      
      await connection.execute(
        `INSERT INTO users (id, email, password, first_name, last_name, user_type, is_active, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [adminId, email, hashedPassword, 'Admin', 'User', 'admin', 1]
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', newPassword);
      console.log('');
    } else {
      console.log('✅ Admin user found:', users[0].email);
      console.log('📝 User details:', {
        id: users[0].id,
        name: `${users[0].first_name} ${users[0].last_name}`,
        type: users[0].user_type,
        active: users[0].is_active
      });
      console.log('');
      
      // Reset password
      console.log('🔄 Resetting password...');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await connection.execute(
        'UPDATE users SET password = ?, is_active = 1 WHERE email = ?',
        [hashedPassword, email]
      );
      
      console.log('✅ Password reset successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 New Password:', newPassword);
      console.log('');
    }

    // Verify the password
    console.log('🔍 Verifying new password...');
    const [verifyUsers] = await connection.execute(
      "SELECT password FROM users WHERE email = ?",
      [email]
    );
    
    if (verifyUsers.length > 0) {
      const storedHash = verifyUsers[0].password;
      const matches = await bcrypt.compare(newPassword, storedHash);
      
      if (matches) {
        console.log('✅ Password verification: SUCCESS');
        console.log('');
        console.log('🎉 You can now login with:');
        console.log('   Email:', email);
        console.log('   Password:', newPassword);
      } else {
        console.log('❌ Password verification: FAILED');
        console.log('⚠️  There might be an issue with password hashing');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 MySQL is not running. Please start MySQL and try again.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
resetAdminPassword().then(() => {
  console.log('\n✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
