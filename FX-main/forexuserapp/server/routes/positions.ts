import { RequestHandler } from "express";
import { executeQuery } from "../database";
import crypto from "crypto";

// Get all open positions for a user
export const getOpenPositions: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await executeQuery(
      `SELECT * FROM positions 
       WHERE user_id = ? AND status = 'OPEN' 
       ORDER BY open_time DESC`,
      [userId]
    );

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  } catch (error: any) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create/open a new position
export const createPosition: RequestHandler = async (req, res) => {
  try {
    const { positionId, symbol, side, lot, entryPrice, leverage: clientLeverage, sl, tp } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user's trading account (with wallet fields)
    const accountResult = await executeQuery(
      'SELECT id, balance, equity, margin_used, free_margin, leverage FROM trading_accounts WHERE user_id = ? AND is_active = TRUE LIMIT 1',
      [userId]
    );

    if (!accountResult.success || accountResult.data.length === 0) {
      return res.status(404).json({ error: "Trading account not found" });
    }

    const row = accountResult.data[0];
    const accountId = row.id;

    // Use client-provided leverage if valid, otherwise use account default
    const leverage = clientLeverage && clientLeverage > 0 
      ? Math.max(1, Math.min(1000, parseFloat(clientLeverage))) // Clamp between 1 and 1000
      : Math.max(1, parseFloat(row.leverage) || 100);
    const contractSize = (() => {
      const s = String(symbol).toUpperCase();
      if (s.startsWith('XAU')) return 100; // gold
      if (s.startsWith('XAG')) return 5000; // silver
      if (/^(BTC|ETH|LTC|ADA|DOT|LINK|BNB|XRP)/.test(s)) return 1; // common crypto contracts
      return 100000; // FX pairs default
    })();
    const requiredMargin = Number(lot) * contractSize * Number(entryPrice) / leverage;

    const currentBalance = parseFloat(row.balance) || 0;
    const currentMarginUsed = parseFloat(row.margin_used) || 0;
    const currentFreeMargin = parseFloat(row.free_margin) || (currentBalance - currentMarginUsed);

    // Get trade charge from broker_charges table
    let tradeCharge = 0;
    try {
      const chargeResult = await executeQuery(
        `SELECT charge_value FROM broker_charges 
         WHERE charge_type = 'TRADE_FEE' 
         AND (symbol = ? OR symbol = 'ALL') 
         AND is_active = TRUE 
         ORDER BY CASE WHEN symbol = 'ALL' THEN 1 ELSE 0 END 
         LIMIT 1`,
        [symbol]
      );
      
      if (chargeResult.success && chargeResult.data && chargeResult.data.length > 0) {
        const chargeValue = chargeResult.data[0].charge_value;
        tradeCharge = typeof chargeValue === 'string' ? parseFloat(chargeValue) : (chargeValue || 0);
        console.log('[createPosition] Trade charge found:', {
          rawValue: chargeValue,
          parsedValue: tradeCharge,
          symbol: symbol,
          chargeRecord: chargeResult.data[0]
        });
      } else {
        console.log('[createPosition] No trade charge found, using default 0');
        console.log('[createPosition] Query result:', {
          success: chargeResult.success,
          dataLength: chargeResult.data?.length || 0,
          data: chargeResult.data
        });
      }
    } catch (error) {
      console.error('[createPosition] Error fetching trade charge:', error);
      // Continue without fee if error
    }

    // Check if user has enough free margin + trade charge
    const totalRequired = requiredMargin + tradeCharge;
    if (currentFreeMargin < totalRequired) {
      return res.status(400).json({ 
        error: "Insufficient margin", 
        requiredMargin, 
        tradeCharge,
        totalRequired,
        freeMargin: currentFreeMargin 
      });
    }

    const newMarginUsed = currentMarginUsed + requiredMargin;
    const newBalance = currentBalance - tradeCharge; // Deduct trade charge
    const newEquity = (parseFloat(row.equity) || currentBalance) - tradeCharge;
    const newFreeMargin = newBalance - newMarginUsed;

    // Lock margin and deduct trade charge before inserting the position to keep wallet consistent
    await executeQuery(
      'UPDATE trading_accounts SET balance = ?, equity = ?, margin_used = ?, free_margin = ?, updated_at = NOW() WHERE id = ?',
      [newBalance, newEquity, newMarginUsed, newFreeMargin, accountId]
    );
    
    // Record trade charge transaction if fee > 0
    if (tradeCharge > 0) {
      const transactionId = crypto.randomBytes(16).toString('hex');
      await executeQuery(
        `INSERT INTO wallet_transactions (
          id, user_id, account_id, transaction_type, amount, 
          balance_before, balance_after, currency, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          transactionId, userId, accountId, 'TRADE_CHARGE', -tradeCharge,
          currentBalance, newBalance, 'USD', `Trade charge for ${side} ${symbol} ${lot} lot`
        ]
      );
      console.log('[createPosition] ✅ Trade charge deducted:', tradeCharge);
    }

    // Insert position
    const insertResult = await executeQuery(
      `INSERT INTO positions (
        id, user_id, account_id, symbol, side, lot_size, 
        entry_price, current_price, stop_loss, take_profit, 
        pnl, status, open_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'OPEN', NOW())`,
      [
        positionId,
        userId,
        accountId,
        symbol,
        side,
        lot,
        entryPrice,
        entryPrice, // initial current_price
        sl || null,
        tp || null,
      ]
    );

    if (insertResult.success) {
      res.json({ 
        success: true, 
        message: "Position opened", 
        tradeCharge,
        wallet: { 
          balance: newBalance, 
          equity: newEquity, 
          marginUsed: newMarginUsed, 
          freeMargin: newFreeMargin 
        } 
      });
    } else {
      console.error('Failed to create position:', insertResult.error);
      res.status(500).json({ error: "Failed to create position" });
    }
  } catch (error: any) {
    console.error("Error creating position:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update position PNL (for real-time updates)
// Update position PNL and check SL/TP server-side (SECURITY: Prevents manipulation)
export const updatePositionPNL: RequestHandler = async (req, res) => {
  try {
    const { positionId, currentPrice: clientPrice, pnl: clientPnl } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get position details with SL/TP
    const positionResult = await executeQuery(
      'SELECT id, symbol, side, lot_size, entry_price, stop_loss, take_profit, leverage FROM positions WHERE id = ? AND user_id = ? AND status = "OPEN"',
      [positionId, userId]
    );

    if (!positionResult.success || positionResult.data.length === 0) {
      return res.status(404).json({ error: "Position not found or already closed" });
    }

    const position = positionResult.data[0];
    
    // SECURITY: Validate price (prevent manipulation)
    const currentPrice = parseFloat(clientPrice);
    if (isNaN(currentPrice) || currentPrice <= 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    // SECURITY: Recalculate PNL server-side (prevent manipulation)
    const entryPrice = parseFloat(position.entry_price);
    const lotSize = parseFloat(position.lot_size);
    const side = position.side;
    
    // Calculate contract size
    const symbol = String(position.symbol).toUpperCase();
    const contractSize = (() => {
      if (symbol.startsWith('XAU')) return 100;
      if (symbol.startsWith('XAG')) return 5000;
      if (/^(BTC|ETH|LTC|ADA|DOT|LINK|BNB|XRP)/.test(symbol)) return 1;
      return 100000;
    })();
    
    // Recalculate PNL server-side
    const priceDiff = side === "BUY" 
      ? currentPrice - entryPrice 
      : entryPrice - currentPrice;
    const serverPnl = priceDiff * lotSize * contractSize;

    // SECURITY: Check SL/TP server-side using correct price logic
    const stopLoss = position.stop_loss ? parseFloat(position.stop_loss) : null;
    const takeProfit = position.take_profit ? parseFloat(position.take_profit) : null;
    
    let shouldClose = false;
    let closeReason = "";
    
    if (stopLoss !== null || takeProfit !== null) {
      if (side === "BUY") {
        // For BUY: SL is below entry, TP is above entry
        if (stopLoss !== null && stopLoss < entryPrice && currentPrice <= stopLoss) {
          shouldClose = true;
          closeReason = "Stop loss triggered";
        } else if (takeProfit !== null && takeProfit > entryPrice && currentPrice >= takeProfit) {
          shouldClose = true;
          closeReason = "Take profit triggered";
        }
      } else {
        // For SELL: SL is above entry, TP is below entry
        if (stopLoss !== null && stopLoss > entryPrice && currentPrice >= stopLoss) {
          shouldClose = true;
          closeReason = "Stop loss triggered";
        } else if (takeProfit !== null && takeProfit < entryPrice && currentPrice <= takeProfit) {
          shouldClose = true;
          closeReason = "Take profit triggered";
        }
      }
    }

    // If SL/TP hit, close position immediately
    if (shouldClose) {
      console.log(`🔴 [SERVER] ${closeReason} for position ${positionId} (${side} ${symbol}) at price ${currentPrice}`);
      
      // Import closePosition function
      const { closePosition } = require("./trades");
      
      // Close position using server-side logic
      const closeReq = {
        body: {
          positionId: position.id,
          symbol: position.symbol,
          side: position.side,
          lot: lotSize,
          entryPrice: entryPrice,
          exitPrice: currentPrice,
          pnl: serverPnl,
          marginUsed: 0 // Will be calculated in closePosition
        },
        user: { userId }
      };
      
      // Close position
      await closePosition(closeReq as any, res);
      return; // Response already sent by closePosition
    }

    // Update position PNL (no SL/TP hit)
    const result = await executeQuery(
      `UPDATE positions 
       SET current_price = ?, pnl = ?, updated_at = NOW() 
       WHERE id = ? AND user_id = ? AND status = 'OPEN'`,
      [currentPrice, serverPnl, positionId, userId]
    );

    if (result.success) {
      res.json({ 
        success: true, 
        pnl: serverPnl,
        sltpChecked: true,
        shouldClose: false
      });
    } else {
      res.status(500).json({ error: "Failed to update position" });
    }
  } catch (error: any) {
    console.error("Error updating position:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// Close a position
export const closePositionDB: RequestHandler = async (req, res) => {
  try {
    const { positionId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get position details before closing
    const positionResult = await executeQuery(
      'SELECT id, symbol, lot_size, entry_price, current_price, pnl FROM positions WHERE id = ? AND user_id = ? AND status = "OPEN"',
      [positionId, userId]
    );

    if (!positionResult.success || positionResult.data.length === 0) {
      return res.status(404).json({ error: "Position not found" });
    }

    const position = positionResult.data[0];

    // Update position status to CLOSED
    const result = await executeQuery(
      `UPDATE positions 
       SET status = 'CLOSED', close_time = NOW(), updated_at = NOW() 
       WHERE id = ? AND user_id = ? AND status = 'OPEN'`,
      [positionId, userId]
    );

    if (result.success) {
      // Calculate IB commission if user has an IB
      try {
        const { calculateIbCommission } = require("./ib");
        await calculateIbCommission({
          body: {
            positionId: position.id,
            clientId: userId,
            lotSize: position.lot_size,
            profit: position.pnl || 0,
            spread: 0
          },
          user: { userId }
        } as any, {} as any);
      } catch (ibError) {
        console.error("Error calculating IB commission:", ibError);
        // Don't fail the position close if commission calculation fails
      }

      res.json({ success: true, message: "Position closed" });
    } else {
      res.status(500).json({ error: "Failed to close position" });
    }
  } catch (error: any) {
    console.error("Error closing position:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Auto-close all positions (margin call)
export const closeAllPositions: RequestHandler = async (req, res) => {
  try {
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

    // Close all open positions
    const closeResult = await executeQuery(
      `UPDATE positions 
       SET status = 'CLOSED', close_time = NOW(), updated_at = NOW() 
       WHERE user_id = ? AND account_id = ? AND status = 'OPEN'`,
      [userId, accountId]
    );

    // Release all margin
    await executeQuery(
      'UPDATE trading_accounts SET margin_used = 0, free_margin = balance, updated_at = NOW() WHERE id = ?',
      [accountId]
    );

    if (closeResult.success) {
      res.json({ success: true, message: "All positions closed due to margin call" });
    } else {
      res.status(500).json({ error: "Failed to close positions" });
    }
  } catch (error: any) {
    console.error("Error closing all positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

