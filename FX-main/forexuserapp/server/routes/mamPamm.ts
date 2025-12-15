import { RequestHandler } from "express";
import { executeQuery } from "../database";
import crypto from "crypto";

// ===== ADMIN ROUTES =====

// Get all MAM/PAMM accounts for admin
export const getAllMamAccounts: RequestHandler = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        ma.*,
        u.first_name, u.last_name, u.email,
        COUNT(DISTINCT mi.id) as investors_count,
        COUNT(DISTINCT mt.id) as total_trades,
        SUM(CASE WHEN mt.status = 'CLOSED' THEN mt.net_profit_loss ELSE 0 END) as total_net_profit
      FROM mam_pamm_accounts ma
      LEFT JOIN users u ON ma.master_user_id = u.id
      LEFT JOIN mam_pamm_investors mi ON ma.id = mi.account_id AND mi.is_active = TRUE
      LEFT JOIN mam_pamm_trades mt ON ma.id = mt.mam_account_id
      GROUP BY ma.id
      ORDER BY ma.created_at DESC
    `);

    res.json({ success: true, accounts: result.success ? result.data : [] });
  } catch (error) {
    console.error("Error fetching MAM accounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin approve/suspend MAM account
export const updateMamAccountStatus: RequestHandler = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { is_admin_approved, is_active, admin_notes, action } = req.body;

    let updateQuery = '';
    let params = [];

    if (action === 'approve') {
      updateQuery = `UPDATE mam_pamm_accounts 
                     SET is_admin_approved = TRUE, 
                         admin_approved_at = NOW(),
                         admin_approved_by = ?,
                         admin_notes = ?
                     WHERE id = ?`;
      params = [req.user?.userId, admin_notes || null, accountId];
    } else if (action === 'suspend') {
      updateQuery = `UPDATE mam_pamm_accounts 
                     SET is_active = FALSE,
                         admin_notes = ?
                     WHERE id = ?`;
      params = [admin_notes || null, accountId];
    } else if (action === 'activate') {
      updateQuery = `UPDATE mam_pamm_accounts 
                     SET is_active = TRUE,
                         admin_notes = ?
                     WHERE id = ?`;
      params = [admin_notes || null, accountId];
    }

    const result = await executeQuery(updateQuery, params);

    if (result.success && result.data.affectedRows > 0) {
      res.json({ success: true, message: `Account ${action}d successfully` });
    } else {
      res.status(404).json({ error: "Account not found" });
    }
  } catch (error) {
    console.error("Error updating MAM account status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin update MAM/PAMM account settings (commission, min/max investment)
export const updateMamAccountSettings: RequestHandler = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { min_investment, max_investment, master_profit_share, admin_notes } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (min_investment !== undefined) {
      updates.push('min_investment = ?');
      params.push(parseFloat(min_investment));
    }

    if (max_investment !== undefined) {
      updates.push('max_investment = ?');
      params.push(parseFloat(max_investment));
    }

    if (master_profit_share !== undefined) {
      const share = parseFloat(master_profit_share);
      if (share < 0 || share > 100) {
        return res.status(400).json({ error: "Profit share must be between 0 and 100" });
      }
      updates.push('master_profit_share = ?');
      updates.push('investor_profit_share = ?');
      params.push(share, 100 - share);
    }

    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push('updated_at = NOW()');
    params.push(accountId);

    const updateQuery = `UPDATE mam_pamm_accounts SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeQuery(updateQuery, params);

    if (result.success && result.data.affectedRows > 0) {
      res.json({ success: true, message: "Account settings updated successfully" });
    } else {
      res.status(404).json({ error: "Account not found or no changes made" });
    }
  } catch (error) {
    console.error("Error updating MAM account settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===== MANAGER ROUTES =====

// Create MAM/PAMM account (Manager)
export const createMamAccount: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { account_name, account_type, strategy_description, risk_level, min_investment, max_investment, master_profit_share, max_investors } = req.body;

    if (!account_name || !account_type || !['MAM', 'PAMM'].includes(account_type)) {
      return res.status(400).json({ error: "Invalid parameters: account_name and account_type (MAM or PAMM) are required" });
    }

    // Validate and parse numeric values
    const minInvest = parseFloat(min_investment) || 100.00;
    const maxInvest = parseFloat(max_investment) || 100000.00;
    const profitShare = parseFloat(master_profit_share) || 20.00;
    const maxInvestorsCount = parseInt(max_investors) || 100;
    const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
    const riskLevel = validRiskLevels.includes(risk_level) ? risk_level : 'MEDIUM';
    const investorProfitShare = 100 - profitShare;

    if (minInvest < 0 || maxInvest < minInvest) {
      return res.status(400).json({ error: "Invalid investment range: min_investment must be less than max_investment" });
    }

    if (profitShare < 0 || profitShare > 100) {
      return res.status(400).json({ error: "Invalid profit share: must be between 0 and 100" });
    }

    const accountId = crypto.randomUUID();
    const accountNumber = `${account_type}-${Date.now()}`;

    console.log('Creating MAM/PAMM account:', {
      accountId,
      userId,
      account_name,
      account_type,
      accountNumber,
      profitShare,
      investorProfitShare,
      minInvest,
      maxInvest,
      maxInvestorsCount,
      riskLevel
    });

    const result = await executeQuery(`
      INSERT INTO mam_pamm_accounts (
        id, master_user_id, account_name, account_type, account_number,
        master_profit_share, investor_profit_share, min_investment, max_investment,
        max_investors, strategy_description, risk_level, is_active, is_public, is_admin_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE, FALSE)
    `, [
      accountId, userId, account_name, account_type, accountNumber,
      profitShare, investorProfitShare,
      minInvest, maxInvest,
      maxInvestorsCount, strategy_description || null, riskLevel
    ]);

    if (result.success) {
      console.log('✅ MAM/PAMM account created successfully:', accountId);
      res.status(201).json({ 
        success: true, 
        accountId, 
        accountNumber,
        message: "MAM/PAMM account created successfully. Pending admin approval." 
      });
    } else {
      console.error('❌ Failed to create MAM/PAMM account:', {
        error: result.error,
        errorMessage: result.errorMessage,
        errorCode: result.errorCode,
        accountData: {
          accountId,
          userId,
          account_name,
          account_type,
          accountNumber,
          profitShare,
          investorProfitShare,
          minInvest,
          maxInvest,
          maxInvestorsCount,
          riskLevel
        }
      });
      const errorMessage = result.errorMessage || (result.error instanceof Error ? result.error.message : String(result.error));
      res.status(500).json({ 
        success: false,
        error: "Failed to create account", 
        details: errorMessage,
        errorCode: result.errorCode
      });
    }
  } catch (error) {
    console.error("Error creating MAM account:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: errorMessage 
    });
  }
};

// Get manager's MAM accounts
export const getMyMamAccounts: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await executeQuery(`
      SELECT 
        ma.*,
        COUNT(DISTINCT mi.id) as investors_count,
        SUM(CASE WHEN mi.is_active = TRUE THEN mi.investment_amount ELSE 0 END) as total_investments,
        SUM(CASE WHEN mt.status = 'CLOSED' THEN mt.net_profit_loss ELSE 0 END) as total_net_profit
      FROM mam_pamm_accounts ma
      LEFT JOIN mam_pamm_investors mi ON ma.id = mi.account_id
      LEFT JOIN mam_pamm_trades mt ON ma.id = mt.mam_account_id
      WHERE ma.master_user_id = ?
      GROUP BY ma.id
      ORDER BY ma.created_at DESC
    `, [userId]);

    res.json(result.success ? result.data : []);
  } catch (error) {
    console.error("Error fetching manager MAM accounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get investors for a MAM account
export const getMamInvestors: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { accountId } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Verify manager owns this account
    const verifyResult = await executeQuery(
      'SELECT master_user_id FROM mam_pamm_accounts WHERE id = ?',
      [accountId]
    );

    if (!verifyResult.success || verifyResult.data.length === 0 || verifyResult.data[0].master_user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const result = await executeQuery(`
      SELECT 
        mi.*,
        u.first_name, u.last_name, u.email,
        COALESCE(SUM(CASE WHEN mt.status = 'CLOSED' THEN mt.net_profit_loss ELSE 0 END), 0) as total_profit_loss
      FROM mam_pamm_investors mi
      LEFT JOIN users u ON mi.investor_user_id = u.id
      LEFT JOIN mam_pamm_trades mt ON mi.id = mt.investor_id AND mt.investor_user_id = mi.investor_user_id
      WHERE mi.account_id = ?
      GROUP BY mi.id
      ORDER BY mi.joined_at DESC
    `, [accountId]);

    res.json(result.success ? result.data : []);
  } catch (error) {
    console.error("Error fetching investors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===== INVESTOR ROUTES =====

// Get public available MAM/PAMM accounts
export const getPublicMamAccounts: RequestHandler = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        ma.*,
        CONCAT(u.first_name, ' ', u.last_name) as manager_name,
        COUNT(DISTINCT mi.id) as investors_count,
        COUNT(DISTINCT mt.id) as total_trades,
        SUM(CASE WHEN mt.status = 'CLOSED' THEN mt.net_profit_loss ELSE 0 END) as total_net_profit,
        SUM(CASE WHEN mt.status = 'CLOSED' AND mt.net_profit_loss > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN mt.status = 'CLOSED' AND mt.net_profit_loss < 0 THEN 1 ELSE 0 END) as losing_trades
      FROM mam_pamm_accounts ma
      LEFT JOIN users u ON ma.master_user_id = u.id
      LEFT JOIN mam_pamm_investors mi ON ma.id = mi.account_id AND mi.is_active = TRUE
      LEFT JOIN mam_pamm_trades mt ON ma.id = mt.mam_account_id
      WHERE ma.is_public = TRUE AND ma.is_active = TRUE AND ma.is_admin_approved = TRUE
      GROUP BY ma.id
      ORDER BY ma.created_at DESC
    `);

    res.json(result.success ? result.data : []);
  } catch (error) {
    console.error("Error fetching public MAM accounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Trade Master page - All approved accounts with performance and trades
export const getTradeMasterAccounts: RequestHandler = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        ma.id, ma.account_name, ma.account_type, ma.account_number,
        ma.master_profit_share, ma.min_investment, ma.max_investment,
        ma.risk_level, ma.strategy_description, ma.total_balance,
        ma.investor_balance, ma.is_active, ma.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as manager_name,
        u.email as manager_email,
        COUNT(DISTINCT mi.id) as investors_count,
        COUNT(DISTINCT CASE WHEN mt.status = 'CLOSED' THEN mt.id END) as closed_trades_count,
        COUNT(DISTINCT CASE WHEN mt.status = 'OPEN' THEN mt.id END) as open_trades_count,
        SUM(CASE WHEN mt.status = 'CLOSED' AND mt.net_profit_loss > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN mt.status = 'CLOSED' AND mt.net_profit_loss < 0 THEN 1 ELSE 0 END) as losing_trades,
        COALESCE(SUM(CASE WHEN mt.status = 'CLOSED' THEN mt.net_profit_loss ELSE 0 END), 0) as total_profit_loss,
        ma.manager_total_fees
      FROM mam_pamm_accounts ma
      LEFT JOIN users u ON ma.master_user_id = u.id
      LEFT JOIN mam_pamm_investors mi ON ma.id = mi.account_id AND mi.is_active = TRUE
      LEFT JOIN mam_pamm_trades mt ON ma.id = mt.mam_account_id
      WHERE ma.is_admin_approved = TRUE AND ma.is_active = TRUE
      GROUP BY ma.id
      ORDER BY ma.created_at DESC
    `);

    res.json({ success: true, accounts: result.success ? result.data : [] });
  } catch (error) {
    console.error("Error fetching Trade Master accounts:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get trades for a specific MAM/PAMM account
export const getMamAccountTrades: RequestHandler = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const result = await executeQuery(`
      SELECT 
        mt.*,
        ma.account_name, ma.account_type
      FROM mam_pamm_trades mt
      JOIN mam_pamm_accounts ma ON mt.mam_account_id = ma.id
      WHERE mt.mam_account_id = ?
      ORDER BY mt.open_time DESC, mt.created_at DESC
      LIMIT 100
    `, [accountId]);

    res.json({ success: true, trades: result.success ? result.data : [] });
  } catch (error) {
    console.error("Error fetching account trades:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Join MAM/PAMM account (Follow as Investor)
export const joinMamAccount: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { accountId, investment_amount, risk_multiplier } = req.body;

    if (!accountId || !investment_amount) {
      return res.status(400).json({ error: "Account ID and investment amount are required" });
    }

    // Get user's trading account
    const { getUserTradingAccount, ensureTradingAccount } = require("../database");
    const tradingAccount = await ensureTradingAccount(userId);
    if (!tradingAccount) {
      return res.status(404).json({ error: "Trading account not found" });
    }

    // Validate investment
    const accountResult = await executeQuery(`
      SELECT id, min_investment, max_investment, account_type, is_active, is_admin_approved,
             master_profit_share, total_balance, investor_balance
      FROM mam_pamm_accounts
      WHERE id = ?
    `, [accountId]);

    if (!accountResult.success || accountResult.data.length === 0) {
      return res.status(404).json({ error: "MAM/PAMM account not found" });
    }

    const account = accountResult.data[0];

    if (!account.is_active || !account.is_admin_approved) {
      return res.status(400).json({ error: "Account is not available for investment" });
    }

    const investAmount = parseFloat(investment_amount);
    if (investAmount < account.min_investment || investAmount > account.max_investment) {
      return res.status(400).json({ error: `Investment must be between $${account.min_investment} and $${account.max_investment}` });
    }

    // Check user has sufficient balance
    if (tradingAccount.balance < investAmount) {
      return res.status(400).json({ error: `Insufficient balance. You have $${tradingAccount.balance.toFixed(2)}` });
    }

    // Check if already investor
    const existingResult = await executeQuery(
      'SELECT id FROM mam_pamm_investors WHERE account_id = ? AND investor_user_id = ? AND is_active = TRUE',
      [accountId, userId]
    );

    if (existingResult.success && existingResult.data.length > 0) {
      return res.status(400).json({ error: "You are already following this account" });
    }

    // Start transaction: Deduct from user balance and add to MAM/PAMM account
    const investorId = crypto.randomUUID();
    const newUserBalance = tradingAccount.balance - investAmount;
    const newEquity = tradingAccount.equity - investAmount;
    const newInvestorBalance = parseFloat(account.investor_balance || 0) + investAmount;
    const newTotalBalance = parseFloat(account.total_balance || 0) + investAmount;

    // Update user's trading account balance
    await executeQuery(`
      UPDATE trading_accounts 
      SET balance = ?, equity = ?, free_margin = balance - margin_used, updated_at = NOW()
      WHERE user_id = ? AND is_active = TRUE
    `, [newUserBalance, newEquity, userId]);

    // Create wallet transaction record
    const transactionId = crypto.randomUUID();
    await executeQuery(`
      INSERT INTO wallet_transactions (id, user_id, account_id, transaction_type, amount, balance_before, balance_after, currency, description, reference_id)
      VALUES (?, ?, ?, 'WITHDRAWAL', ?, ?, ?, 'USD', ?, ?)
    `, [
      transactionId,
      userId,
      tradingAccount.id,
      investAmount,
      tradingAccount.balance,
      newUserBalance,
      `Investment in MAM/PAMM account: ${account.account_name || accountId}`,
      accountId
    ]);

    // Add investor record
    const insertResult = await executeQuery(`
      INSERT INTO mam_pamm_investors (id, account_id, investor_user_id, investment_amount, current_balance)
      VALUES (?, ?, ?, ?, ?)
    `, [investorId, accountId, userId, investAmount, investAmount]);

    if (!insertResult.success) {
      // Rollback: restore user balance
      await executeQuery(`
        UPDATE trading_accounts 
        SET balance = ?, equity = ?, free_margin = balance - margin_used
        WHERE user_id = ? AND is_active = TRUE
      `, [tradingAccount.balance, tradingAccount.equity, userId]);
      return res.status(500).json({ error: "Failed to create investor record" });
    }

    // Update MAM/PAMM account balances
    await executeQuery(`
      UPDATE mam_pamm_accounts 
      SET investor_balance = ?, total_balance = ?, updated_at = NOW()
      WHERE id = ?
    `, [newInvestorBalance, newTotalBalance, accountId]);

    // Update copy_multiplier if MAM type (already inserted, so update it)
    if (account.account_type === 'MAM' && risk_multiplier) {
      const multiplier = parseFloat(risk_multiplier) || 1.00;
      await executeQuery(`
        UPDATE mam_pamm_investors 
        SET copy_multiplier = ?
        WHERE id = ?
      `, [multiplier, investorId]);
    }

    res.status(201).json({ 
      success: true, 
      investorId, 
      message: "Successfully followed MAM/PAMM account",
      newBalance: newUserBalance
    });
  } catch (error) {
    console.error("Error joining MAM account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get investor's joined MAM accounts
export const getMyInvestments: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await executeQuery(`
      SELECT 
        mi.*,
        ma.account_name, ma.account_type, ma.master_profit_share, ma.risk_level,
        CONCAT(u.first_name, ' ', u.last_name) as manager_name,
        COALESCE(SUM(CASE WHEN mt.status = 'CLOSED' THEN mt.net_profit_loss ELSE 0 END), 0) as total_profit_loss
      FROM mam_pamm_investors mi
      LEFT JOIN mam_pamm_accounts ma ON mi.account_id = ma.id
      LEFT JOIN users u ON ma.master_user_id = u.id
      LEFT JOIN mam_pamm_trades mt ON mi.id = mt.investor_id AND mt.investor_user_id = mi.investor_user_id
      WHERE mi.investor_user_id = ? AND mi.is_active = TRUE
      GROUP BY mi.id
      ORDER BY mi.joined_at DESC
    `, [userId]);

    res.json(result.success ? result.data : []);
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unfollow (Leave) MAM/PAMM account - Returns current balance to user wallet
export const unfollowMamAccount: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { investorId } = req.body;
    if (!investorId) {
      return res.status(400).json({ error: "Investor ID is required" });
    }

    // Get investor record
    const investorResult = await executeQuery(`
      SELECT mi.*, ma.account_name, ma.id as account_id, ma.investor_balance, ma.total_balance
      FROM mam_pamm_investors mi
      JOIN mam_pamm_accounts ma ON mi.account_id = ma.id
      WHERE mi.id = ? AND mi.investor_user_id = ? AND mi.is_active = TRUE
    `, [investorId, userId]);

    if (!investorResult.success || investorResult.data.length === 0) {
      return res.status(404).json({ error: "Investment not found or already unfollowed" });
    }

    const investor = investorResult.data[0];
    const returnAmount = parseFloat(investor.current_balance || 0);

    // Get user's trading account
    const { getUserTradingAccount, ensureTradingAccount } = require("../database");
    const tradingAccount = await ensureTradingAccount(userId);
    if (!tradingAccount) {
      return res.status(404).json({ error: "Trading account not found" });
    }

    // Return balance to user's trading account
    const newUserBalance = tradingAccount.balance + returnAmount;
    const newEquity = tradingAccount.equity + returnAmount;

    // Update user's trading account
    await executeQuery(`
      UPDATE trading_accounts 
      SET balance = ?, equity = ?, free_margin = balance - margin_used, updated_at = NOW()
      WHERE user_id = ? AND is_active = TRUE
    `, [newUserBalance, newEquity, userId]);

    // Create wallet transaction record
    const transactionId = crypto.randomUUID();
    await executeQuery(`
      INSERT INTO wallet_transactions (id, user_id, account_id, transaction_type, amount, balance_before, balance_after, currency, description, reference_id)
      VALUES (?, ?, ?, 'DEPOSIT', ?, ?, ?, 'USD', ?, ?)
    `, [
      transactionId,
      userId,
      tradingAccount.id,
      returnAmount,
      tradingAccount.balance,
      newUserBalance,
      `Unfollowed MAM/PAMM account: ${investor.account_name || investor.account_id}. Returned balance: $${returnAmount.toFixed(2)}`,
      investor.account_id
    ]);

    // Update MAM/PAMM account balances
    const newInvestorBalance = parseFloat(investor.investor_balance || 0) - returnAmount;
    const newTotalBalance = parseFloat(investor.total_balance || 0) - returnAmount;
    
    await executeQuery(`
      UPDATE mam_pamm_accounts 
      SET investor_balance = ?, total_balance = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      newInvestorBalance > 0 ? newInvestorBalance : 0,
      newTotalBalance > 0 ? newTotalBalance : 0,
      investor.account_id
    ]);

    // Deactivate investor record
    await executeQuery(`
      UPDATE mam_pamm_investors 
      SET is_active = FALSE, left_at = NOW()
      WHERE id = ?
    `, [investorId]);

    res.json({ 
      success: true, 
      message: `Successfully unfollowed. Returned $${returnAmount.toFixed(2)} to your wallet`,
      returnedAmount: returnAmount,
      newBalance: newUserBalance
    });
  } catch (error) {
    console.error("Error unfollowing MAM account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===== TRADE MIRRORING & PROFIT DISTRIBUTION =====

// This is called when a manager executes a trade - mirrors to all investors
export const mirrorTrade: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { mamAccountId, symbol, side, lot_size, entry_price, stop_loss, take_profit, leverage } = req.body;

    if (!userId || !mamAccountId) return res.status(401).json({ error: "Unauthorized" });

    // Verify manager owns this account
    const accountResult = await executeQuery(
      'SELECT account_type, master_profit_share FROM mam_pamm_accounts WHERE id = ? AND master_user_id = ? AND is_active = TRUE',
      [mamAccountId, userId]
    );

    if (!accountResult.success || accountResult.data.length === 0) {
      return res.status(403).json({ error: "Unauthorized or inactive account" });
    }

    const account = accountResult.data[0];
    const masterTradeId = crypto.randomUUID();

    // Get all active investors
    const investorsResult = await executeQuery(
      'SELECT id, investor_user_id, investment_amount, current_balance FROM mam_pamm_investors WHERE account_id = ? AND is_active = TRUE',
      [mamAccountId]
    );

    if (!investorsResult.success || investorsResult.data.length === 0) {
      return res.status(400).json({ error: "No active investors found" });
    }

    const investors = investorsResult.data;

    // Calculate total pool for PAMM
    const totalPool = account.account_type === 'PAMM' 
      ? investors.reduce((sum, inv) => sum + parseFloat(inv.current_balance), 0)
      : 0;

    // Mirror trade to each investor
    for (const investor of investors) {
      let investorLot = lot_size;

      // PAMM: Proportional allocation
      if (account.account_type === 'PAMM') {
        const investorShare = parseFloat(investor.current_balance) / totalPool;
        investorLot = lot_size * investorShare;
      }
      // MAM: Apply risk multiplier
      else if (account.account_type === 'MAM') {
        const ruleResult = await executeQuery(
          'SELECT risk_multiplier FROM mam_pamm_mirroring_rules WHERE mam_account_id = ? AND investor_id = ?',
          [mamAccountId, investor.id]
        );

        const multiplier = ruleResult.success && ruleResult.data.length > 0 
          ? parseFloat(ruleResult.data[0].risk_multiplier) 
          : 1.00;
        
        investorLot = lot_size * multiplier;
      }

      // Create mirrored trade record
      const tradeId = crypto.randomUUID();
      await executeQuery(`
        INSERT INTO mam_pamm_trades (
          id, mam_account_id, master_trade_id, investor_id, investor_user_id,
          symbol, trade_type, side, lot_size, entry_price, stop_loss, take_profit,
          leverage, status, master_fee_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?, ?, ?, 'OPEN', ?)
      `, [
        tradeId, mamAccountId, masterTradeId, investor.id, investor.investor_user_id,
        symbol, side, investorLot, entry_price, stop_loss, take_profit,
        leverage || 500, account.master_profit_share
      ]);
    }

    res.json({ success: true, masterTradeId, message: `Trade mirrored to ${investors.length} investors` });
  } catch (error) {
    console.error("Error mirroring trade:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// This is called when a manager closes a trade - distributes profits
export const closeTradeAndDistribute: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { masterTradeId, exit_price } = req.body;

    if (!userId || !masterTradeId) return res.status(401).json({ error: "Unauthorized" });

    // Get all open trades for this master trade
    const tradesResult = await executeQuery(
      'SELECT * FROM mam_pamm_trades WHERE master_trade_id = ? AND status = "OPEN"',
      [masterTradeId]
    );

    if (!tradesResult.success || tradesResult.data.length === 0) {
      return res.status(404).json({ error: "No open trades found" });
    }

    const trades = tradesResult.data;

    // Get account info once for fee calculation
    const accountResult = await executeQuery(
      'SELECT id, master_profit_share FROM mam_pamm_accounts WHERE id = (SELECT mam_account_id FROM mam_pamm_trades WHERE master_trade_id = ? LIMIT 1)',
      [masterTradeId]
    );
    const account = accountResult.success && accountResult.data.length > 0 ? accountResult.data[0] : null;
    const masterFeePercentage = account ? parseFloat(account.master_profit_share) : 20.00;

    let totalNetProfit = 0;
    let totalMasterFee = 0;
    const mamAccountId = trades[0]?.mam_account_id;

    // Calculate profit/loss for each trade and distribute
    for (const trade of trades) {
      const lotSize = parseFloat(trade.lot_size);
      const entryPrice = parseFloat(trade.entry_price);
      const exitPriceVal = exit_price || parseFloat(trade.exit_price || entryPrice);

      // Simplified PNL calculation (pip value * lot size * pip multiplier)
      // For forex: 1 pip = 0.0001 for most pairs, 0.01 for JPY pairs
      // Standard lot = 100,000 units
      const pipMultiplier = lotSize * 100000;
      const pipValue = trade.side === 'BUY' ? exitPriceVal - entryPrice : entryPrice - exitPriceVal;
      const grossProfit = pipValue * pipMultiplier;

      const masterFee = grossProfit * (masterFeePercentage / 100);
      const netProfit = grossProfit - masterFee;
      totalNetProfit += netProfit;
      totalMasterFee += masterFee;

      // Update trade record
      await executeQuery(`
        UPDATE mam_pamm_trades 
        SET status = 'CLOSED', exit_price = ?, profit_loss = ?, commission = ?, net_profit_loss = ?,
            close_time = NOW()
        WHERE id = ?
      `, [exitPriceVal, grossProfit, masterFee, netProfit, trade.id]);

      // Update investor balance
      const investorUpdateResult = await executeQuery(`
        UPDATE mam_pamm_investors 
        SET current_balance = current_balance + ?, 
            total_profit = CASE WHEN ? > 0 THEN total_profit + ? ELSE total_profit END,
            total_loss = CASE WHEN ? < 0 THEN total_loss + ABS(?) ELSE total_loss END
        WHERE id = ?
      `, [
        netProfit,
        netProfit, netProfit,
        netProfit, netProfit,
        trade.investor_id
      ]);

      if (!investorUpdateResult.success) {
        console.error(`Failed to update investor balance for trade ${trade.id}`);
      }
    }

    // Update MAM/PAMM account balances (investor balance and manager fees)
    if (mamAccountId) {
      await executeQuery(`
        UPDATE mam_pamm_accounts 
        SET investor_balance = investor_balance + ?,
            manager_total_fees = COALESCE(manager_total_fees, 0) + ?,
            total_balance = total_balance + ?,
            updated_at = NOW()
        WHERE id = ?
      `, [totalNetProfit, totalMasterFee, totalNetProfit + totalMasterFee, mamAccountId]);
    }

    res.json({ success: true, message: `Profits distributed for ${trades.length} trades`, totalNetProfit, totalMasterFee });
  } catch (error) {
    console.error("Error distributing profits:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

