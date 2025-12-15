
// Use the existing MySQL configuration from lib/mysql.ts
import { executeQuery, getAllUsers, getPlatformStats } from '@/lib/mysql';

// Mock database for development when MySQL is not available
const mockData = {
  users: [
    { id: '1', email: 'john@example.com', first_name: 'John', last_name: 'Doe', user_type: 'user', is_active: true, is_banned: false, created_at: new Date(), balance: 10000, equity: 10500 },
    { id: '2', email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith', user_type: 'user', is_active: true, is_banned: false, created_at: new Date(), balance: 25000, equity: 24800 },
    { id: '3', email: 'admin@example.com', first_name: 'Admin', last_name: 'User', user_type: 'admin', is_active: true, is_banned: false, created_at: new Date(), balance: 0, equity: 0 },
  ],
  stats: {
    totalUsers: { count: 2 },
    totalAdmins: { count: 1 },
    totalPositions: { count: 5 },
    totalVolume: { volume: 150000 },
    pendingDeposits: { count: 3, amount: 5000 },
    totalBalance: { total_balance: 35000 },
    bannedUsers: { count: 0 }
  }
};

// Wrapper functions that use MySQL or fallback to mock data
export async function getUsers() {
  try {
    // Join with trading_accounts to get balance and equity
    const result = await executeQuery(`
      SELECT 
        u.*,
        ta.balance,
        ta.equity,
        ta.leverage as account_leverage,
        ta.currency as account_currency
      FROM users u 
      LEFT JOIN trading_accounts ta ON u.id = ta.user_id AND ta.is_active = 1
      ORDER BY u.created_at DESC 
      LIMIT 100
    `);
    console.log('Direct query result:', result);
    
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      console.log('Found', result.data.length, 'users from direct query');
      return result.data;
    }
    
    console.log('No users found in database, using mock data');
    return mockData.users;
  } catch (error) {
    console.log('Error getting users, using mock data:', error);
    return mockData.users;
  }
}

export async function getStats() {
  try {
    const stats = await getPlatformStats();
    console.log('Database stats:', stats);
    // Check if we got valid stats from database
    if (stats && stats.totalUsers && typeof stats.totalUsers.count !== 'undefined') {
      return stats;
    }
    console.log('Using mock stats data - no valid database stats');
    return mockData.stats;
  } catch (error) {
    console.log('Error getting stats, using mock data:', error);
    return mockData.stats;
  }
}

export const db = {
  query: executeQuery,
  getUsers,
  getStats
};

export type Database = typeof db;

export type Database = typeof db;