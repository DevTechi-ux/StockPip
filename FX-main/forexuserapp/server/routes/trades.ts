import { RequestHandler } from "express";
import { executeQuery } from "../database";
import crypto from "crypto";

// Close a position and save to database
export const closePosition: RequestHandler = async (req, res) => {
  try {
    const { positionId, symbol, side, lot, entryPrice, exitPrice, pnl, marginUsed } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user's trading account
    const accountResult = await executeQuery(
      'SELECT id FROM trading_accounts WHERE user_id = ? AND is_active = TRUE LIMIT 1',
      [userId]
    );

    if (!accountResult.success || accountResult.data.length === 0) {
      return res.status(404).json({ error: "Trading account not found" });
    }

    const accountId = accountResult.data[0].id;

    // Get broker charge (trade fee)
    let brokerCharge = 2.5; // Default
    const chargeResult = await executeQuery(
      "SELECT charge_value FROM broker_charges WHERE charge_type = 'TRADE_FEE' AND symbol = 'ALL' AND is_active = TRUE LIMIT 1"
    );
    if (chargeResult.success && chargeResult.data.length > 0) {
      brokerCharge = parseFloat(chargeResult.data[0].charge_value) || 2.5;
    }
    
    // Save to trading_history table with broker charge
    const historyId = crypto.randomBytes(16).toString('hex');
    const insertHistory = await executeQuery(
      `INSERT INTO trading_history (
        id, user_id, account_id, symbol, side, lot_size, 
        entry_price, exit_price, pnl, commission, swap, 
        open_time, close_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        historyId,
        userId,
        accountId,
        symbol,
        side,
        lot,
        entryPrice,
        exitPrice,
        pnl,
        brokerCharge, // commission = broker charge
        0, // swap
      ]
    );

    if (!insertHistory.success) {
      console.error('Failed to save trading history:', insertHistory.error);
      return res.status(500).json({ error: "Failed to save trading history" });
    }

    // Update wallet balance with PNL (only add PNL, margin gets released automatically)
    const accountData = await executeQuery(
      'SELECT balance, margin_used FROM trading_accounts WHERE id = ?',
      [accountId]
    );

    if (accountData.success && accountData.data.length > 0) {
      const currentBalance = parseFloat(accountData.data[0].balance) || 0;
      const currentMarginUsed = parseFloat(accountData.data[0].margin_used) || 0;
      
      // Add PNL and deduct broker charge
      const newBalance = currentBalance + pnl - brokerCharge;
      // Release margin
      const newMarginUsed = Math.max(0, currentMarginUsed - marginUsed);
      // Equity = balance + remaining locked margin
      const newEquity = newBalance + (currentMarginUsed - newMarginUsed);
      // Free margin = balance - margin used
      const newFreeMargin = newBalance - newMarginUsed;

      await executeQuery(
        'UPDATE trading_accounts SET balance = ?, equity = ?, margin_used = ?, free_margin = ?, updated_at = NOW() WHERE id = ?',
        [newBalance, newEquity, newMarginUsed, newFreeMargin, accountId]
      );

      // Record transaction with broker charge
      const transactionId = crypto.randomBytes(16).toString('hex');
      await executeQuery(
        `INSERT INTO wallet_transactions (
          id, user_id, account_id, transaction_type, amount, 
          balance_before, balance_after, currency, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          transactionId,
          userId,
          accountId,
          'TRADE_CLOSE',
          pnl - brokerCharge, // Record net amount (PNL - broker charge)
          currentBalance,
          newBalance,
          'USD',
          `Position closed: ${symbol} ${side} - PNL: $${pnl.toFixed(2)} - Broker Fee: $${brokerCharge.toFixed(2)}`
        ]
      );
    }

    res.json({ success: true, message: "Position closed and saved" });
  } catch (error: any) {
    console.error("Error closing position:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

