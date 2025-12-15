import { RequestHandler } from "express";
import { testConnection, executeQuery } from "../database";

export const testDbConnection: RequestHandler = async (req, res) => {
  try {
    // Test basic connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        connected: false,
        message: "Database connection failed",
        timestamp: new Date().toISOString()
      });
    }

    // Test a simple query
    const queryResult = await executeQuery("SELECT 1 as test, DATABASE() as db_name, USER() as db_user, NOW() as server_time");
    
    if (!queryResult.success) {
      return res.status(500).json({
        success: false,
        connected: true,
        queryTest: false,
        message: "Database connected but query failed",
        error: queryResult.error,
        timestamp: new Date().toISOString()
      });
    }

    // Test users table
    const usersResult = await executeQuery("SELECT COUNT(*) as count FROM users LIMIT 1");
    const usersCount = usersResult.success && usersResult.data?.[0]?.count || 0;

    // Test trading_accounts table
    const accountsResult = await executeQuery("SELECT COUNT(*) as count FROM trading_accounts LIMIT 1");
    const accountsCount = accountsResult.success && accountsResult.data?.[0]?.count || 0;

    // Get database info
    const dbInfo = await executeQuery(`
      SELECT 
        DATABASE() as database_name,
        USER() as current_user,
        VERSION() as mysql_version,
        NOW() as server_time
    `);

    res.json({
      success: true,
      connected: true,
      queryTest: true,
      timestamp: new Date().toISOString(),
      database: {
        name: dbInfo.success ? dbInfo.data[0]?.database_name : 'unknown',
        user: dbInfo.success ? dbInfo.data[0]?.current_user : 'unknown',
        version: dbInfo.success ? dbInfo.data[0]?.mysql_version : 'unknown',
        serverTime: dbInfo.success ? dbInfo.data[0]?.server_time : null
      },
      tables: {
        users: usersCount,
        trading_accounts: accountsCount
      },
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        database: process.env.DB_NAME || 'forex_final',
        user: process.env.DB_USER || 'root'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      connected: false,
      message: "Database connection error",
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};



