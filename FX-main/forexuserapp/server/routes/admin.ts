import { RequestHandler } from "express";
import { 
  getAllUsers, 
  getPlatformStats, 
  executeQuery,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  addFundsToUser,
  deductFundsFromUser,
  approveFundRequest,
  rejectFundRequest,
  getUserDetailsWithAccount,
  getUserTransactionHistory
} from "../database";

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const users = await getAllUsers(Number(limit), Number(offset));
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getStats: RequestHandler = async (req, res) => {
  try {
    const stats = await getPlatformStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// Get fund requests (deposits/withdrawals)
export const getFundRequests: RequestHandler = async (req, res) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT fr.*, u.first_name, u.last_name, u.email, ba.account_name, ba.bank_name
      FROM fund_requests fr
      JOIN users u ON fr.user_id = u.id
      LEFT JOIN bank_accounts ba ON fr.bank_account_id = ba.id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status) {
      conditions.push('fr.status = ?');
      params.push(status);
    }
    
    if (type) {
      conditions.push('fr.request_type = ?');
      params.push(type);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY fr.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    
    const result = await executeQuery(query, params);
    res.json({ success: true, requests: result.success ? result.data : [] });
  } catch (error) {
    console.error("Error fetching fund requests:", error);
    res.status(500).json({ success: false, message: "Failed to fetch fund requests" });
  }
};

// Update fund request status
export const updateFundRequest: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    
    const query = `
      UPDATE fund_requests 
      SET status = ?, admin_notes = ?, processed_at = NOW()
      WHERE id = ?
    `;
    
    const result = await executeQuery(query, [status, adminNotes, requestId]);
    
    if (result.success) {
      res.json({ success: true, message: "Fund request updated successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to update fund request" });
    }
  } catch (error) {
    console.error("Error updating fund request:", error);
    res.status(500).json({ success: false, message: "Failed to update fund request" });
  }
};

// Ban/Unban user
export const banUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ban, reason } = req.body;
    
    const query = `
      UPDATE users 
      SET is_banned = ?, ban_reason = ?, banned_at = ?
      WHERE id = ?
    `;
    
    const bannedAt = ban ? new Date() : null;
    const result = await executeQuery(query, [ban, reason, bannedAt, userId]);
    
    if (result.success) {
      res.json({ success: true, message: `User ${ban ? 'banned' : 'unbanned'} successfully` });
    } else {
      res.status(500).json({ success: false, message: "Failed to update user status" });
    }
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ success: false, message: "Failed to ban user" });
  }
};

// Get MAM/PAMM accounts
export const getMamPammAccounts: RequestHandler = async (req, res) => {
  try {
    const query = `
      SELECT mpa.*, u.first_name, u.last_name, u.email,
             COUNT(mpi.id) as investor_count,
             SUM(mpi.investment_amount) as total_investment
      FROM mam_pamm_accounts mpa
      JOIN users u ON mpa.master_user_id = u.id
      LEFT JOIN mam_pamm_investors mpi ON mpa.id = mpi.account_id AND mpi.is_active = TRUE
      GROUP BY mpa.id
      ORDER BY mpa.created_at DESC
    `;
    
    const result = await executeQuery(query);
    res.json({ success: true, accounts: result.success ? result.data : [] });
  } catch (error) {
    console.error("Error fetching MAM/PAMM accounts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch MAM/PAMM accounts" });
  }
};

// Get trading positions
export const getTradingPositions: RequestHandler = async (req, res) => {
  try {
    const { status = 'OPEN', limit = 100, offset = 0 } = req.query;
    
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.email
      FROM positions p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = ?
      ORDER BY p.open_time DESC
      LIMIT ? OFFSET ?
    `;
    
    const result = await executeQuery(query, [status, Number(limit), Number(offset)]);
    res.json({ success: true, positions: result.success ? result.data : [] });
  } catch (error) {
    console.error("Error fetching trading positions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trading positions" });
  }
};

// Admin close position (reuses existing closePosition logic)
export const adminClosePosition: RequestHandler = async (req, res) => {
  try {
    const { positionId } = req.body;
    
    if (!positionId) {
      return res.status(400).json({ success: false, message: "Position ID is required" });
    }

    // Get position details
    const positionResult = await executeQuery(
      `SELECT p.*, ta.id as account_id, ta.user_id 
       FROM positions p
       LEFT JOIN trading_accounts ta ON p.account_id = ta.id
       WHERE p.id = ? AND p.status = 'OPEN'`,
      [positionId]
    );

    if (!positionResult.success || !positionResult.data || positionResult.data.length === 0) {
      return res.status(404).json({ success: false, message: "Position not found or already closed" });
    }

    const position = positionResult.data[0];
    const currentPrice = parseFloat(position.current_price || position.entry_price || '0');
    
    // Reuse existing closePosition function by calling it with position data
    const { closePosition } = require("./trades");
    
    // Calculate PNL
    const symbol = String(position.symbol).toUpperCase();
    const contractSize = symbol.startsWith('XAU') ? 100 : symbol.startsWith('XAG') ? 5000 : /^(BTC|ETH|LTC|ADA|DOT|LINK|BNB|XRP)/.test(symbol) ? 1 : 100000;
    const entryPrice = parseFloat(position.entry_price || '0');
    const lotSize = parseFloat(position.lot_size || '0');
    const priceDiff = position.side === "BUY" ? currentPrice - entryPrice : entryPrice - currentPrice;
    const pnl = priceDiff * lotSize * contractSize;
    
    // Calculate margin used
    const leverage = parseFloat(position.leverage || '100');
    const marginUsed = lotSize * contractSize * entryPrice / leverage;
    
    // Call existing closePosition with admin context
    const mockReq = {
      body: {
        positionId: position.id,
        symbol: position.symbol,
        side: position.side,
        lot: lotSize,
        entryPrice: entryPrice,
        exitPrice: currentPrice,
        pnl: pnl,
        marginUsed: marginUsed
      },
      user: { userId: position.user_id } // Use position's user_id
    };
    
    await closePosition(mockReq as any, res);
  } catch (error: any) {
    console.error("Error closing position (admin):", error);
    res.status(500).json({ success: false, message: error.message || "Failed to close position" });
  }
};

// Create new user (Admin)
export const createUser: RequestHandler = async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType, leverage, balance } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }
    
    const result = await createUserByAdmin({
      email, password, firstName, lastName, userType, leverage, balance
    });
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

// Update user (Admin)
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const result = await updateUserByAdmin(userId, updateData);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// Delete user (Admin)
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await deleteUserByAdmin(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// Get user details with account info
export const getUserDetails: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userDetails = await getUserDetailsWithAccount(userId);
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, user: userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
};

// Add funds to user account
export const addFunds: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    
    const result = await addFundsToUser(userId, amount, description);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error adding funds:", error);
    res.status(500).json({ success: false, message: "Failed to add funds" });
  }
};

// Deduct funds from user account
export const deductFunds: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    
    const result = await deductFundsFromUser(userId, amount, description);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error deducting funds:", error);
    res.status(500).json({ success: false, message: "Failed to deduct funds" });
  }
};

// Approve fund request
export const approveFundRequest: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.body.adminId || 'admin-001'; // In real app, get from JWT token
    
    const result = await approveFundRequest(requestId, adminId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error approving fund request:", error);
    res.status(500).json({ success: false, message: "Failed to approve fund request" });
  }
};

// Reject fund request
export const rejectFundRequest: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.body.adminId || 'admin-001'; // In real app, get from JWT token
    
    const result = await rejectFundRequest(requestId, adminId, reason);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error rejecting fund request:", error);
    res.status(500).json({ success: false, message: "Failed to reject fund request" });
  }
};

// Get user transaction history
export const getUserTransactions: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await getUserTransactionHistory(userId, Number(limit), Number(offset));
    res.json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};