import { RequestHandler } from "express";
import { executeQuery } from "../database";
import crypto from "crypto";

export const deductTradeCharge: RequestHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    // Get user's trading account
    const accountResult = await executeQuery(
      'SELECT id, balance, equity, margin_used, free_margin FROM trading_accounts WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );
    
    if (!accountResult.success || accountResult.data.length === 0) {
      return res.status(404).json({ error: "Trading account not found" });
    }
    
    const accountId = accountResult.data[0].id;
    const currentBalance = parseFloat(accountResult.data[0].balance) || 0;
    const currentEquity = parseFloat(accountResult.data[0].equity) || 0;
    const currentMarginUsed = parseFloat(accountResult.data[0].margin_used) || 0;
    
    const newBalance = currentBalance - amount;
    const newEquity = currentEquity - amount;
    const newFreeMargin = newBalance - currentMarginUsed;
    
    // Update balance
    await executeQuery(
      'UPDATE trading_accounts SET balance = ?, equity = ?, free_margin = ?, updated_at = NOW() WHERE id = ?',
      [newBalance, newEquity, newFreeMargin, accountId]
    );
    
    // Record transaction
    const transactionId = crypto.randomBytes(16).toString('hex');
    await executeQuery(
      `INSERT INTO wallet_transactions (
        id, user_id, account_id, transaction_type, amount, 
        balance_before, balance_after, currency, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        transactionId, userId, accountId, 'TRADE_CHARGE', -amount,
        currentBalance, newBalance, 'USD', description || 'Trade charge'
      ]
    );
    
    res.json({ success: true, balance: newBalance, equity: newEquity });
  } catch (error: any) {
    console.error('Error deducting trade charge:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

