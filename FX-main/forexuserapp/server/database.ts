import mysql from 'mysql2/promise';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// MySQL Database Configuration
// Connects to MySQL database: forex_trading
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

console.log('🔌 Database Config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  hasPassword: !!dbConfig.password
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log(`✅ MySQL Database connected successfully to ${process.env.DB_NAME || 'forex_final'}`);
    console.log('   Host:', dbConfig.host);
    console.log('   Port:', dbConfig.port);
    console.log('   Database:', dbConfig.database);
    connection.release();
    return true;
  } catch (error: any) {
    console.error('❌ MySQL Database connection failed:', error.message);
    console.error('   Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });
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
    INSERT INTO users (id, email, password, first_name, last_name, user_type, is_active, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
  `;
  const result = await executeQuery(query, [
    userData.id,
    userData.email,
    userData.password,
    userData.firstName,
    userData.lastName,
    userData.userType || 'user'
  ]);
  
  if (result.success) {
    // Create trading account for regular users
    if (!userData.userType || userData.userType === 'user') {
      const accountNumber = `ACC-${userData.id.substring(0, 8).toUpperCase()}`;
      const tradingAccountQuery = `
        INSERT INTO trading_accounts (id, user_id, account_number, balance, equity, margin_used, free_margin, leverage, currency, is_active) 
        VALUES (?, ?, ?, 0.00, 0.00, 0.00, 0.00, 500, 'USD', 1)
      `;
      const tradingAccountId = `ta-${userData.id}`;
      await executeQuery(tradingAccountQuery, [tradingAccountId, userData.id, accountNumber]);
      
      // Create welcome notification for new user
      await executeQuery(`
        INSERT INTO notifications (user_id, type, title, message, data, priority, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        userData.id,
        'system',
        'Welcome to VentaBlack Trading!',
        `Welcome ${userData.firstName} ${userData.lastName}! Your trading account ${accountNumber} has been created successfully. You can now start trading with us.`,
        JSON.stringify({
          account_number: accountNumber,
          account_id: tradingAccountId,
          initial_balance: 0,
          leverage: 500,
          currency: 'USD'
        }),
        'high'
      ]);
    }
    
    // Create admin user record for admin users
    if (userData.userType === 'admin') {
      const adminQuery = `
        INSERT INTO admin_users (user_id, role, permissions) 
        VALUES (?, 'admin', '{"users": true, "trading": true}')
      `;
      await executeQuery(adminQuery, [userData.id]);
    }
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
  try {
    // Simple query without parameters first
    const query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.user_type, u.is_active, u.is_banned, u.created_at
      FROM users u 
      WHERE u.is_active = 1
      ORDER BY u.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    const result = await executeQuery(query);
    
    if (result.success && result.data.length > 0) {
      // Now get trading account data for each user
      const usersWithAccounts = await Promise.all(
        result.data.map(async (user) => {
          const accountQuery = `
            SELECT balance, equity FROM trading_accounts 
            WHERE user_id = '${user.id}' AND is_active = 1 LIMIT 1
          `;
          const accountResult = await executeQuery(accountQuery);
          return {
            ...user,
            balance: accountResult.success && accountResult.data.length > 0 ? accountResult.data[0].balance : 0,
            equity: accountResult.success && accountResult.data.length > 0 ? accountResult.data[0].equity : 0
          };
        })
      );
      return usersWithAccounts;
    }
    
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
}

// Get platform statistics (for admin)
export async function getPlatformStats() {
  try {
    const queries = {
      totalUsers: 'SELECT COUNT(*) as count FROM users WHERE user_type = "user" AND is_active = TRUE',
      totalAdmins: 'SELECT COUNT(*) as count FROM users WHERE user_type = "admin" AND is_active = TRUE',
      totalPositions: 'SELECT COUNT(*) as count FROM positions WHERE status = "OPEN"',
      totalVolume: 'SELECT COALESCE(SUM(ABS(lot_size * entry_price)), 0) as volume FROM positions WHERE status = "OPEN"',
      pendingDeposits: 'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount FROM fund_requests WHERE request_type = "DEPOSIT" AND status = "PENDING"',
      totalBalance: 'SELECT COALESCE(SUM(balance), 0) as total_balance FROM trading_accounts WHERE is_active = TRUE',
      bannedUsers: 'SELECT COUNT(*) as count FROM users WHERE is_banned = TRUE',
      totalReferrals: 'SELECT COUNT(*) as count FROM referrals',
      mamPammAccounts: 'SELECT COUNT(*) as count FROM mam_pamm_accounts WHERE is_active = TRUE'
    };
    
    const stats: any = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await executeQuery(query);
      stats[key] = result.success ? result.data[0] : { count: 0, volume: 0, amount: 0, total_balance: 0 };
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
      bannedUsers: { count: 0 },
      totalReferrals: { count: 0 },
      mamPammAccounts: { count: 0 }
    };
  }
}

// Admin CRUD Functions for User Management
export async function createUserByAdmin(userData: any) {
  const { email, password, firstName, lastName, userType = 'user', leverage = 500, balance = 0 } = userData;
  
  try {
    // Create user
    const userId = crypto.randomBytes(16).toString('hex');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const userResult = await executeQuery(
      'INSERT INTO users (id, email, password, first_name, last_name, user_type, leverage, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())',
      [userId, email, hashedPassword, firstName, lastName, userType, leverage]
    );
    
    if (!userResult.success) {
      return { success: false, message: 'Failed to create user' };
    }
    
    // Create trading account
    const accountId = crypto.randomBytes(16).toString('hex');
    const accountNumber = `ACC${Date.now()}`;
    
    const accountResult = await executeQuery(
      'INSERT INTO trading_accounts (id, user_id, account_number, balance, equity, leverage, currency, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())',
      [accountId, userId, accountNumber, balance, balance, leverage, 'USD']
    );
    
    if (!accountResult.success) {
      return { success: false, message: 'Failed to create trading account' };
    }
    
    return { success: true, userId, accountId };
  } catch (error) {
    console.error('Error creating user by admin:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function updateUserByAdmin(userId: string, updateData: any) {
  const { firstName, lastName, email, leverage, isActive, isBanned, banReason } = updateData;
  
  try {
    const fields = [];
    const values = [];
    
    if (firstName) { fields.push('first_name = ?'); values.push(firstName); }
    if (lastName) { fields.push('last_name = ?'); values.push(lastName); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (leverage) { fields.push('leverage = ?'); values.push(leverage); }
    if (typeof isActive === 'boolean') { fields.push('is_active = ?'); values.push(isActive); }
    if (typeof isBanned === 'boolean') { 
      fields.push('is_banned = ?'); 
      values.push(isBanned);
      fields.push('ban_reason = ?'); 
      values.push(banReason || null);
      fields.push('banned_at = ?'); 
      values.push(isBanned ? new Date() : null);
    }
    
    if (fields.length === 0) {
      return { success: false, message: 'No fields to update' };
    }
    
    fields.push('updated_at = NOW()');
    values.push(userId);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, values);
    
    return { success: result.success, message: result.success ? 'User updated successfully' : 'Failed to update user' };
  } catch (error) {
    console.error('Error updating user by admin:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function deleteUserByAdmin(userId: string) {
  try {
    // Soft delete - mark as inactive instead of hard delete
    const result = await executeQuery(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [userId]
    );
    
    return { success: result.success, message: result.success ? 'User deactivated successfully' : 'Failed to deactivate user' };
  } catch (error) {
    console.error('Error deleting user by admin:', error);
    return { success: false, message: 'Database error' };
  }
}

// Wallet Management Functions
export async function addFundsToUser(userId: string, amount: number, description: string = 'Admin fund addition') {
  try {
    // Get user's trading account
    const accountResult = await executeQuery(
      'SELECT id, balance FROM trading_accounts WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    
    if (!accountResult.success || accountResult.data.length === 0) {
      return { success: false, message: 'User trading account not found' };
    }
    
    const account = accountResult.data[0];
    const newBalance = account.balance + amount;
    
    // Update account balance
    const updateResult = await executeQuery(
      'UPDATE trading_accounts SET balance = ?, equity = ?, updated_at = NOW() WHERE id = ?',
      [newBalance, newBalance, account.id]
    );
    
    if (!updateResult.success) {
      return { success: false, message: 'Failed to update account balance' };
    }
    
    // Record transaction
    const transactionId = crypto.randomBytes(16).toString('hex');
    const transactionResult = await executeQuery(
      'INSERT INTO wallet_transactions (id, user_id, account_id, transaction_type, amount, balance_before, balance_after, currency, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [transactionId, userId, account.id, 'ADMIN_ADJUSTMENT', amount, account.balance, newBalance, 'USD', description]
    );
    
    return { success: transactionResult.success, message: transactionResult.success ? 'Funds added successfully' : 'Failed to record transaction' };
  } catch (error) {
    console.error('Error adding funds to user:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function deductFundsFromUser(userId: string, amount: number, description: string = 'Admin fund deduction') {
  try {
    // Get user's trading account
    const accountResult = await executeQuery(
      'SELECT id, balance FROM trading_accounts WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    
    if (!accountResult.success || accountResult.data.length === 0) {
      return { success: false, message: 'User trading account not found' };
    }
    
    const account = accountResult.data[0];
    
    if (account.balance < amount) {
      return { success: false, message: 'Insufficient balance' };
    }
    
    const newBalance = account.balance - amount;
    
    // Update account balance
    const updateResult = await executeQuery(
      'UPDATE trading_accounts SET balance = ?, equity = ?, updated_at = NOW() WHERE id = ?',
      [newBalance, newBalance, account.id]
    );
    
    if (!updateResult.success) {
      return { success: false, message: 'Failed to update account balance' };
    }
    
    // Record transaction
    const transactionId = require('crypto').randomBytes(16).toString('hex');
    const transactionResult = await executeQuery(
      'INSERT INTO wallet_transactions (id, user_id, account_id, transaction_type, amount, balance_before, balance_after, currency, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [transactionId, userId, account.id, 'ADMIN_ADJUSTMENT', -amount, account.balance, newBalance, 'USD', description]
    );
    
    return { success: transactionResult.success, message: transactionResult.success ? 'Funds deducted successfully' : 'Failed to record transaction' };
  } catch (error) {
    console.error('Error deducting funds from user:', error);
    return { success: false, message: 'Database error' };
  }
}

// Fund Request Management
export async function approveFundRequest(requestId: string, adminId: string) {
  try {
    // Get fund request details
    const requestResult = await executeQuery(
      'SELECT * FROM fund_requests WHERE id = ?',
      [requestId]
    );
    
    if (!requestResult.success || requestResult.data.length === 0) {
      return { success: false, message: 'Fund request not found' };
    }
    
    const request = requestResult.data[0];
    
    if (request.status !== 'PENDING') {
      return { success: false, message: 'Request already processed' };
    }
    
    // Update request status
    const updateResult = await executeQuery(
      'UPDATE fund_requests SET status = ?, processed_by = ?, processed_at = NOW() WHERE id = ?',
      ['APPROVED', adminId, requestId]
    );
    
    if (!updateResult.success) {
      return { success: false, message: 'Failed to update request status' };
    }
    
    // If it's a deposit, add funds to user account
    if (request.request_type === 'DEPOSIT') {
      const fundResult = await addFundsToUser(request.user_id, request.amount, `Deposit approved - Request ${requestId}`);
      if (!fundResult.success) {
        return { success: false, message: fundResult.message };
      }
    }
    
    return { success: true, message: 'Fund request approved successfully' };
  } catch (error) {
    console.error('Error approving fund request:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function rejectFundRequest(requestId: string, adminId: string, reason: string) {
  try {
    const result = await executeQuery(
      'UPDATE fund_requests SET status = ?, processed_by = ?, processed_at = NOW(), admin_notes = ? WHERE id = ?',
      ['REJECTED', adminId, reason, requestId]
    );
    
    return { success: result.success, message: result.success ? 'Fund request rejected successfully' : 'Failed to reject request' };
  } catch (error) {
    console.error('Error rejecting fund request:', error);
    return { success: false, message: 'Database error' };
  }
}

// Get user details with trading account info
export async function getUserDetailsWithAccount(userId: string) {
  try {
    const query = `
      SELECT u.*, ta.id as account_id, ta.account_number, ta.balance, ta.equity, ta.margin_used, ta.free_margin, ta.leverage, ta.currency
      FROM users u
      LEFT JOIN trading_accounts ta ON u.id = ta.user_id AND ta.is_active = TRUE
      WHERE u.id = ?
    `;
    
    const result = await executeQuery(query, [userId]);
    return result.success && result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
}

// Get user transaction history
export async function getUserTransactionHistory(userId: string, limit: number = 50, offset: number = 0) {
  try {
    const query = `
      SELECT * FROM wallet_transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const result = await executeQuery(query, [userId, limit, offset]);
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error getting user transaction history:', error);
    return [];
  }
}

export default pool;

