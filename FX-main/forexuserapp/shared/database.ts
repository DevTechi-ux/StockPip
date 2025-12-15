import mysql from 'mysql2/promise';

// MySQL Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3309'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forex_final',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed:', error);
    return false;
  }
}

// Execute query with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error };
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  const query = `
    SELECT u.*, au.role as admin_role, au.permissions 
    FROM users u 
    LEFT JOIN admin_users au ON u.id = au.user_id 
    WHERE u.email = ? AND u.is_active = TRUE
  `;
  const result = await executeQuery(query, [email]);
  return result.success ? result.data[0] : null;
}

// Get user by ID
export async function getUserById(id: string) {
  const query = `
    SELECT u.*, au.role as admin_role, au.permissions 
    FROM users u 
    LEFT JOIN admin_users au ON u.id = au.user_id 
    WHERE u.id = ? AND u.is_active = TRUE
  `;
  const result = await executeQuery(query, [id]);
  return result.success ? result.data[0] : null;
}

// Create new user
export async function createUser(userData: {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: 'admin' | 'user';
}) {
  const query = `
    INSERT INTO users (id, email, password, first_name, last_name, user_type) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const result = await executeQuery(query, [
    userData.id,
    userData.email,
    userData.password,
    userData.firstName,
    userData.lastName,
    userData.userType || 'user'
  ]);
  
  if (result.success && userData.userType === 'admin') {
    // Create admin user record
    const adminQuery = `
      INSERT INTO admin_users (user_id, role, permissions) 
      VALUES (?, 'admin', '{"users": true, "trading": true}')
    `;
    await executeQuery(adminQuery, [userData.id]);
  }
  
  return result;
}

// Get user's trading account
export async function getUserTradingAccount(userId: string) {
  const query = `
    SELECT * FROM trading_accounts 
    WHERE user_id = ? AND is_active = TRUE 
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const result = await executeQuery(query, [userId]);
  return result.success ? result.data[0] : null;
}

// Create trading account for user
export async function createTradingAccount(userId: string, accountNumber: string) {
  const query = `
    INSERT INTO trading_accounts (id, user_id, account_number, balance, equity, leverage, currency) 
    VALUES (?, ?, ?, 0.00, 0.00, 500, 'USD')
  `;
  const accountId = `acc-${userId}-${Date.now()}`;
  const result = await executeQuery(query, [accountId, userId, accountNumber]);
  return result;
}

// Get user positions
export async function getUserPositions(userId: string) {
  const query = `
    SELECT p.*, ta.account_number 
    FROM positions p 
    JOIN trading_accounts ta ON p.account_id = ta.id 
    WHERE p.user_id = ? AND p.status = 'OPEN' 
    ORDER BY p.open_time DESC
  `;
  const result = await executeQuery(query, [userId]);
  return result.success ? result.data : [];
}

// Get user trading history
export async function getUserTradingHistory(userId: string, limit = 500) {
  const query = `
    SELECT th.*, ta.account_number 
    FROM trading_history th 
    JOIN trading_accounts ta ON th.account_id = ta.id 
    WHERE th.user_id = ? 
    ORDER BY th.close_time DESC 
    LIMIT ?
  `;
  const result = await executeQuery(query, [userId, limit]);
  return result.success ? result.data : [];
}

// Update user last login
export async function updateUserLastLogin(userId: string) {
  const query = `UPDATE users SET last_login = NOW() WHERE id = ?`;
  return await executeQuery(query, [userId]);
}

// Get all users (for admin)
export async function getAllUsers(limit = 100, offset = 0) {
  const query = `
    SELECT u.*, au.role as admin_role, ta.balance, ta.equity 
    FROM users u 
    LEFT JOIN admin_users au ON u.id = au.user_id 
    LEFT JOIN trading_accounts ta ON u.id = ta.user_id AND ta.is_active = TRUE 
    ORDER BY u.created_at DESC 
    LIMIT ? OFFSET ?
  `;
  const result = await executeQuery(query, [limit, offset]);
  return result.success ? result.data : [];
}

// Get platform statistics (for admin)
export async function getPlatformStats() {
  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users WHERE user_type = "user" AND is_active = TRUE',
    totalAdmins: 'SELECT COUNT(*) as count FROM users WHERE user_type = "admin" AND is_active = TRUE',
    totalPositions: 'SELECT COUNT(*) as count FROM positions WHERE status = "OPEN"',
    totalVolume: 'SELECT SUM(lot_size * entry_price) as volume FROM positions WHERE status = "OPEN"'
  };
  
  const stats: any = {};
  for (const [key, query] of Object.entries(queries)) {
    const result = await executeQuery(query);
    stats[key] = result.success ? result.data[0] : { count: 0, volume: 0 };
  }
  
  return stats;
}

export default pool;