import { testConnection, executeQuery, getUserByEmail, getUserById, createUser, getUserTradingAccount, createTradingAccount, getUserPositions, getUserTradingHistory, updateUserLastLogin } from "./database";

// Test database connection on startup
testConnection();

export { testConnection, executeQuery, getUserByEmail, getUserById, createUser, getUserTradingAccount, createTradingAccount, getUserPositions, getUserTradingHistory, updateUserLastLogin };
