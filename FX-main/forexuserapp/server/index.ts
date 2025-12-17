import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { handleDemo } from "./routes/demo";
import { createTicket, getUserTickets } from "./routes/support";
import { register, login, verifyToken } from "./routes/auth";
import { getUserBalance, getBankAccounts, createFundRequest, getUserFundRequests } from "./routes/user";
import { closePosition } from "./routes/trades";
import { getOpenPositions, createPosition, updatePositionPNL, closePositionDB } from "./routes/positions";
import { getTradingHistory } from "./routes/history";
import { deductTradeCharge } from "./routes/trade-charge";
import { 
  getUsers, 
  getStats, 
  getFundRequests, 
  updateFundRequest, 
  banUser, 
  getMamPammAccounts, 
  getTradingPositions,
  createUser,
  updateUser,
  deleteUser,
  getUserDetails,
  addFunds,
  deductFunds,
  approveFundRequest,
  rejectFundRequest,
  getUserTransactions
} from "./routes/admin";
import { getUserTradingAccount, getUserPositions } from "./database";
import {
  getAllIbAccounts,
  updateIbAccountStatus,
  getIbWithdrawals,
  processIbWithdrawal,
  applyToBeIb,
  getIbDashboard,
  requestIbWithdrawal,
  getIbCommissions
} from "./routes/ib";
import { getIbSettings } from "./routes/ib";

export function createServer() {
  const app = express();
  const server = createHttpServer(app);
  
  // WebSocket is now running externally on port 6020
  // Comment out internal WebSocket to avoid conflicts
  /*
  (async () => {
    try {
      const { initWebSocket } = await import('./websocket-server');
      initWebSocket(server);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  })();
  */

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/support", createTicket);
  app.get("/api/support/:userId", getUserTickets);
  
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  
  // Trading routes
  app.post("/api/trades/close", verifyToken, closePosition);
  
  // Position management routes
  app.get("/api/positions/open", verifyToken, getOpenPositions);
  app.post("/api/positions/create", verifyToken, createPosition);
  app.post("/api/positions/update-pnl", verifyToken, updatePositionPNL);
  app.post("/api/positions/close", verifyToken, closePositionDB);
  
  // Trading history routes
  app.get("/api/history", verifyToken, getTradingHistory);

  // User balance API
  app.get("/api/user/balance/:userId", getUserBalance);
  
  // User bank accounts API
  app.get("/api/user/bank-accounts", getBankAccounts);
  
  // User fund request APIs
  app.post("/api/user/fund-request", createFundRequest);
  app.get("/api/user/fund-requests/:userId", getUserFundRequests);
  
  // Trade charge API
  app.post("/api/user/deduct-trade-charge", verifyToken, deductTradeCharge);

  // Trading API endpoints with authentication
  app.get("/api/prices", async (_req, res) => {
    try {
      // Try to get real MetaAPI data
      const { getIO } = await import('./websocket-server');
      const io = getIO();
      
      // Return mock data as fallback
      res.json({
        EURUSD: { bid: 1.33090, ask: 1.33099, spread: 0.00009, time: new Date() },
        GBPUSD: { bid: 1.25090, ask: 1.25099, spread: 0.00009, time: new Date() },
        USDJPY: { bid: 149.090, ask: 149.099, spread: 0.009, time: new Date() },
        USDCHF: { bid: 0.88090, ask: 0.88099, spread: 0.00009, time: new Date() },
        AUDUSD: { bid: 0.65090, ask: 0.65099, spread: 0.00009, time: new Date() },
        USDCAD: { bid: 1.38090, ask: 1.38099, spread: 0.00009, time: new Date() }
      });
    } catch (error) {
      res.json({
        EURUSD: { bid: 1.33090, ask: 1.33099, spread: 0.00009, time: new Date() },
        GBPUSD: { bid: 1.25090, ask: 1.25099, spread: 0.00009, time: new Date() },
        USDJPY: { bid: 149.090, ask: 149.099, spread: 0.009, time: new Date() },
        USDCHF: { bid: 0.88090, ask: 0.88099, spread: 0.00009, time: new Date() },
        AUDUSD: { bid: 0.65090, ask: 0.65099, spread: 0.00009, time: new Date() },
        USDCAD: { bid: 1.38090, ask: 1.38099, spread: 0.00009, time: new Date() }
      });
    }
  });

  app.get("/api/account", verifyToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const account = await getUserTradingAccount(userId);
      
      if (account) {
        res.json({
          balance: account.balance || 0,
          equity: account.equity || 0,
          margin: account.margin_used || 0,
          freeMargin: account.free_margin || 0,
          marginLevel: account.margin_level || 0,
          currency: account.currency || "USD",
          leverage: account.leverage || 500
        });
      } else {
        res.json({
          balance: 0,
          equity: 0,
          margin: 0,
          freeMargin: 0,
          marginLevel: 0,
          currency: "USD",
          leverage: 500
        });
      }
    } catch (error) {
      console.error("Error fetching account:", error);
      res.status(500).json({ error: "Failed to fetch account data" });
    }
  });

  app.get("/api/positions", verifyToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const positions = await getUserPositions(userId);
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

// Admin routes
app.get("/api/admin/users", getUsers);
app.get("/api/admin/stats", getStats);
app.get("/api/admin/fund-requests", getFundRequests);
app.put("/api/admin/fund-requests/:requestId", updateFundRequest);
app.put("/api/admin/users/:userId/ban", banUser);
app.get("/api/admin/mam-pamm-accounts", getMamPammAccounts);
app.get("/api/admin/trading-positions", getTradingPositions);

// IB admin management
app.get("/api/admin/ib-accounts", verifyToken, getAllIbAccounts);
app.put("/api/admin/ib-accounts/:ibId/status", verifyToken, updateIbAccountStatus);
app.get("/api/admin/ib-withdrawals", verifyToken, getIbWithdrawals);
app.put("/api/admin/ib-withdrawals/:withdrawalId", verifyToken, processIbWithdrawal);

// IB user routes
app.post('/api/ib/apply', verifyToken, applyToBeIb);
app.get('/api/ib/dashboard', verifyToken, getIbDashboard);
app.post('/api/ib/withdraw', verifyToken, requestIbWithdrawal);
app.get('/api/ib/commissions', verifyToken, getIbCommissions);
app.get('/api/ib/settings', getIbSettings);

// Admin CRUD operations
app.post("/api/admin/users", createUser);
app.get("/api/admin/users/:userId", getUserDetails);
app.put("/api/admin/users/:userId", updateUser);
app.delete("/api/admin/users/:userId", deleteUser);

// Admin wallet management
app.post("/api/admin/users/:userId/add-funds", addFunds);
app.post("/api/admin/users/:userId/deduct-funds", deductFunds);
app.get("/api/admin/users/:userId/transactions", getUserTransactions);

// Admin fund request management
app.post("/api/admin/fund-requests/:requestId/approve", approveFundRequest);
app.post("/api/admin/fund-requests/:requestId/reject", rejectFundRequest);

  return { app, server };
}

