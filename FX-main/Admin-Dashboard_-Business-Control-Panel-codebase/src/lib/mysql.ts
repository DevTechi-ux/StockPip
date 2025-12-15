import mysql from 'mysql2/promise';

// MySQL Database Configuration for Admin Dashboard
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'), // Standard MySQL port
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forex_final',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);
// Log effective DB host once at startup to help diagnose env issues
console.log('[Admin DB] Connecting to MySQL', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// Execute query with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows };
  } catch (error: any) {
    console.error('Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    
    // Return a more detailed error
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
      ? error 
      : JSON.stringify(error);
    
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(errorMessage),
      errorMessage: errorMessage,
      code: error?.code || 'UNKNOWN_ERROR'
    };
  }
}

// Get all users (for admin dashboard)
export async function getAllUsers(limit = 100, offset = 0) {
  try {
    // Try without the WHERE clause first to see if we get any users
    const query = `SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    console.log('Executing getAllUsers query with params:', [limit, offset]);
    
    const [rows] = await pool.execute(query, [limit, offset]);
    console.log('Direct query result type:', typeof rows, 'length:', Array.isArray(rows) ? rows.length : 'not array');
    console.log('First few rows:', Array.isArray(rows) ? rows.slice(0, 2) : rows);
    
    if (Array.isArray(rows)) {
      console.log('Found', rows.length, 'users directly');
      // Filter active users in JavaScript for now
      const activeUsers = rows.filter((user: any) => user.is_active === 1);
      console.log('Active users:', activeUsers.length);
      return activeUsers;
    }
    
    console.log('No users found or rows is not an array');
    return [];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

// Get platform statistics
export async function getPlatformStats() {
  try {
    const queries = {
      totalUsers: 'SELECT COUNT(*) as count FROM users WHERE user_type = "user" AND is_active = TRUE',
      totalAdmins: 'SELECT COUNT(*) as count FROM users WHERE user_type = "admin" AND is_active = TRUE',
      totalPositions: 'SELECT COUNT(*) as count FROM positions WHERE status = "OPEN"',
      totalVolume: 'SELECT COALESCE(SUM(ABS(lot_size * entry_price)), 0) as volume FROM positions WHERE status = "OPEN"',
      pendingDeposits: 'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount FROM fund_requests WHERE request_type = "DEPOSIT" AND status = "PENDING"',
      totalBalance: 'SELECT COALESCE(SUM(balance), 0) as total_balance FROM trading_accounts WHERE is_active = TRUE',
      bannedUsers: 'SELECT COUNT(*) as count FROM users WHERE is_banned = TRUE'
    };
    
    const stats: any = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await executeQuery(query);
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        stats[key] = result.data[0];
      } else {
        // Fill in a sensible default based on the expected properties
        // Choose structure with all relevant fields (to avoid UI/logic errors)
        if (key === 'totalUsers' || key === 'totalAdmins' || key === 'totalPositions' || key === 'bannedUsers') {
          stats[key] = { count: 0 };
        } else if (key === 'totalVolume') {
          stats[key] = { volume: 0 };
        } else if (key === 'pendingDeposits') {
          stats[key] = { count: 0, amount: 0 };
        } else if (key === 'totalBalance') {
          stats[key] = { total_balance: 0 };
        } else {
          stats[key] = {};
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return {
      totalUsers: { count: 0 },
      totalAdmins: { count: 0 },
      totalPositions: { count: 0 },
      totalVolume: { volume: 0 },
      pendingDeposits: { count: 0, amount: 0 },
      totalBalance: { total_balance: 0 },
      bannedUsers: { count: 0 }
    };
  }
}

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Admin Dashboard MySQL Database connected successfully');
    console.log('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Admin Dashboard MySQL Database connection failed:', error);
    console.error('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    return false;
  }
}

export default pool;

