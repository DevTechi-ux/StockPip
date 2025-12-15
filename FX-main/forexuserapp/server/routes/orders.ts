import { RequestHandler } from "express";
import { executeQuery } from "../database";

// Get all pending orders for a user
export const getPendingOrders: RequestHandler = async (req, res) => {
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

    // Get all pending orders
    const ordersResult = await executeQuery(
      `SELECT * FROM pending_orders WHERE user_id = ? AND account_id = ? AND status = 'PENDING' ORDER BY created_at DESC`,
      [userId, accountId]
    );

    if (ordersResult.success) {
      res.json(ordersResult.data);
    } else {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new pending order (LIMIT or STOP)
export const createOrder: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { orderId, symbol, orderType, side, lot, price, sl, tp } = req.body;

    if (!userId || !symbol || !orderType || !side || !lot || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get user's trading account
    const accountResult = await executeQuery(
      'SELECT id, balance, free_margin, leverage FROM trading_accounts WHERE user_id = ? AND is_active = TRUE LIMIT 1',
      [userId]
    );

    if (!accountResult.success || accountResult.data.length === 0) {
      return res.status(404).json({ error: "Trading account not found" });
    }

    const account = accountResult.data[0];

    // Calculate required margin
    const contractSize = 100000; // For forex
    const leverage = account.leverage || 100;
    const requiredMargin = (lot * contractSize * price) / leverage;

    if (requiredMargin > account.free_margin) {
      return res.status(400).json({ 
        error: `Insufficient margin. Required: $${requiredMargin.toFixed(2)}, Available: $${account.free_margin.toFixed(2)}` 
      });
    }

    // Insert order into pending_orders table
    const insertResult = await executeQuery(
      `INSERT INTO pending_orders 
       (id, user_id, account_id, symbol, order_type, side, lot_size, price, stop_loss, take_profit, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())`,
      [orderId, userId, account.id, symbol, orderType, side, lot, price, sl || null, tp || null]
    );

    if (!insertResult.success) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    // Lock margin
    await executeQuery(
      'UPDATE trading_accounts SET margin_used = margin_used + ?, free_margin = free_margin - ?, updated_at = NOW() WHERE id = ?',
      [requiredMargin, requiredMargin, account.id]
    );

    res.json({ success: true, message: "Order created successfully", orderId });
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cancel a pending order
export const cancelOrder: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.body;

    if (!userId || !orderId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get the order details
    const orderResult = await executeQuery(
      'SELECT * FROM pending_orders WHERE id = ? AND user_id = ? AND status = "PENDING"',
      [orderId, userId]
    );

    if (!orderResult.success || orderResult.data.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.data[0];

    // Cancel the order
    const cancelResult = await executeQuery(
      'UPDATE pending_orders SET status = "CANCELLED", updated_at = NOW() WHERE id = ?',
      [orderId]
    );

    if (!cancelResult.success) {
      return res.status(500).json({ error: "Failed to cancel order" });
    }

    // Release margin
    const contractSize = 100000;
    const leverage = order.leverage || 100;
    const releasedMargin = (order.lot_size * contractSize * order.price) / leverage;

    await executeQuery(
      'UPDATE trading_accounts SET margin_used = margin_used - ?, free_margin = free_margin + ?, updated_at = NOW() WHERE id = ?',
      [releasedMargin, releasedMargin, order.account_id]
    );

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};










