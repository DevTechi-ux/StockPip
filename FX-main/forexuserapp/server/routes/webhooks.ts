import { RequestHandler } from "express";
import { executeQuery } from "../database";
import crypto from "crypto";

// Get user's API key
export const getApiKey: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await executeQuery(
      `SELECT api_key FROM api_keys WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.success && result.data.length > 0) {
      res.json({ apiKey: result.data[0].api_key });
    } else {
      res.json({ apiKey: null });
    }
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Generate/Regenerate API key
export const generateApiKey: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const apiKey = crypto.randomBytes(32).toString('hex');
    const secretKey = crypto.randomBytes(32).toString('hex');

    // Deactivate old keys
    await executeQuery(
      `UPDATE api_keys SET is_active = FALSE WHERE user_id = ?`,
      [userId]
    );

    // Create new key
    const result = await executeQuery(
      `INSERT INTO api_keys (id, user_id, key_name, api_key, secret_key, permissions, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        crypto.randomUUID(),
        userId,
        'Default API Key',
        apiKey,
        secretKey,
        JSON.stringify({ read: true, trade: true })
      ]
    );

    if (result.success) {
      res.json({ success: true, apiKey });
    } else {
      res.status(500).json({ error: "Failed to generate API key" });
    }
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all webhooks for user
export const getWebhooks: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await executeQuery(
      `SELECT id, webhook_name, webhook_url, is_active, auto_execute, require_confirmation, 
              allowed_symbols, max_lot_size, last_received_signal, created_at 
       FROM webhooks WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    if (result.success) {
      const webhooks = result.data.map((w: any) => ({
        id: w.id,
        name: w.webhook_name,
        url: w.webhook_url,
        isActive: w.is_active,
        autoExecute: w.auto_execute,
        requireConfirmation: w.require_confirmation,
        allowedSymbols: w.allowed_symbols ? JSON.parse(w.allowed_symbols) : [],
        maxLotSize: w.max_lot_size,
        lastReceivedSignal: w.last_received_signal,
        createdAt: w.created_at
      }));
      res.json(webhooks);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new webhook
export const createWebhook: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, url, autoExecute, requireConfirmation, allowedSymbols, maxLotSize } = req.body;

    // Get user's API key
    const apiKeyResult = await executeQuery(
      `SELECT api_key FROM api_keys WHERE user_id = ? AND is_active = TRUE LIMIT 1`,
      [userId]
    );

    if (!apiKeyResult.success || apiKeyResult.data.length === 0) {
      return res.status(400).json({ error: "Please generate an API key first" });
    }

    const apiKey = apiKeyResult.data[0].api_key;

    const result = await executeQuery(
      `INSERT INTO webhooks (id, user_id, webhook_name, webhook_url, api_key, is_active, auto_execute, 
                            require_confirmation, allowed_symbols, max_lot_size) 
       VALUES (?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        userId,
        name || 'Webhook',
        url,
        apiKey,
        autoExecute || false,
        requireConfirmation !== false, // Default true
        allowedSymbols ? JSON.stringify(allowedSymbols) : null,
        maxLotSize || null
      ]
    );

    if (result.success) {
      res.status(201).json({ success: true, message: "Webhook created successfully" });
    } else {
      res.status(500).json({ error: "Failed to create webhook" });
    }
  } catch (error) {
    console.error("Error creating webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a webhook
export const updateWebhook: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { webhookId } = req.params;
    const { name, url, isActive, autoExecute, requireConfirmation, allowedSymbols, maxLotSize } = req.body;

    const result = await executeQuery(
      `UPDATE webhooks 
       SET webhook_name = ?, webhook_url = ?, is_active = ?, auto_execute = ?, require_confirmation = ?, 
           allowed_symbols = ?, max_lot_size = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        name,
        url,
        isActive !== undefined ? isActive : true,
        autoExecute,
        requireConfirmation !== undefined ? requireConfirmation : true,
        allowedSymbols ? JSON.stringify(allowedSymbols) : null,
        maxLotSize || null,
        webhookId,
        userId
      ]
    );

    if (result.success) {
      res.json({ success: true, message: "Webhook updated successfully" });
    } else {
      res.status(500).json({ error: "Failed to update webhook" });
    }
  } catch (error) {
    console.error("Error updating webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a webhook
export const deleteWebhook: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { webhookId } = req.params;

    const result = await executeQuery(
      `DELETE FROM webhooks WHERE id = ? AND user_id = ?`,
      [webhookId, userId]
    );

    if (result.success) {
      res.json({ success: true, message: "Webhook deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get trading signals for user
export const getSignals: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await executeQuery(
      `SELECT id, signal_name, symbol, signal_type, lot_size, price, stop_loss, take_profit, 
              confidence_level, status, created_at, executed_at
       FROM trading_signals WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [userId]
    );

    if (result.success) {
      res.json(result.data);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching signals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Receive a trading signal (public endpoint - requires API key authentication)
export const receiveSignal: RequestHandler = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.body.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    // Find the webhook with this API key
    const webhookResult = await executeQuery(
      `SELECT id, user_id, is_active, auto_execute, require_confirmation, allowed_symbols, max_lot_size 
       FROM webhooks WHERE api_key = ? LIMIT 1`,
      [apiKey]
    );

    if (!webhookResult.success || webhookResult.data.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const webhook = webhookResult.data[0];

    if (!webhook.is_active) {
      return res.status(403).json({ error: "Webhook is not active" });
    }

    const { symbol, action, lot_size, price, stop_loss, take_profit, confidence } = req.body;

    // Validate required fields
    if (!symbol || !action || !lot_size) {
      return res.status(400).json({ error: "Missing required fields: symbol, action, lot_size" });
    }

    // Validate action
    if (!['BUY', 'SELL', 'CLOSE'].includes(action.toUpperCase())) {
      return res.status(400).json({ error: "Invalid action. Must be BUY, SELL, or CLOSE" });
    }

    // Check allowed symbols
    if (webhook.allowed_symbols) {
      const allowed = JSON.parse(webhook.allowed_symbols);
      if (allowed.length > 0 && !allowed.includes(symbol)) {
        return res.status(403).json({ error: `Symbol ${symbol} is not allowed` });
      }
    }

    // Check max lot size
    if (webhook.max_lot_size && lot_size > webhook.max_lot_size) {
      return res.status(403).json({ error: `Lot size exceeds maximum allowed: ${webhook.max_lot_size}` });
    }

    // Create signal
    const signalResult = await executeQuery(
      `INSERT INTO trading_signals (id, user_id, webhook_id, signal_name, symbol, signal_type, lot_size, 
                                    price, stop_loss, take_profit, confidence_level, source, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        webhook.user_id,
        webhook.id,
        `${action} ${symbol}`,
        symbol,
        action.toUpperCase(),
        lot_size,
        price || null,
        stop_loss || null,
        take_profit || null,
        confidence || 50.00,
        'external_webhook',
        webhook.auto_execute ? 'ACCEPTED' : 'PENDING'
      ]
    );

    if (!signalResult.success) {
      return res.status(500).json({ error: "Failed to create signal" });
    }

    // Update webhook last received timestamp
    await executeQuery(
      `UPDATE webhooks SET last_received_signal = NOW() WHERE id = ?`,
      [webhook.id]
    );

    // If auto-execute is enabled, process the signal immediately
    if (webhook.auto_execute) {
      const signalId = signalResult.data.insertId || signalResult.insertId;
      // TODO: Execute the trade automatically
      // This would need to integrate with the trading system
    }

    res.status(201).json({ 
      success: true, 
      message: webhook.auto_execute ? "Signal received and executed" : "Signal received and pending confirmation",
      signalId: signalResult.insertId 
    });

  } catch (error) {
    console.error("Error receiving signal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept/Reject a pending signal
export const processSignal: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { signalId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Get signal
    const signalResult = await executeQuery(
      `SELECT * FROM trading_signals WHERE id = ? AND user_id = ? AND status = 'PENDING'`,
      [signalId, userId]
    );

    if (!signalResult.success || signalResult.data.length === 0) {
      return res.status(404).json({ error: "Signal not found" });
    }

    const signal = signalResult.data[0];

    if (action === 'REJECT') {
      await executeQuery(
        `UPDATE trading_signals SET status = 'REJECTED' WHERE id = ?`,
        [signalId]
      );
      res.json({ success: true, message: "Signal rejected" });
      return;
    }

    // Accept and execute
    // TODO: Implement actual trade execution
    await executeQuery(
      `UPDATE trading_signals SET status = 'ACCEPTED', executed_at = NOW() WHERE id = ?`,
      [signalId]
    );

    res.json({ success: true, message: "Signal accepted and executed" });

  } catch (error) {
    console.error("Error processing signal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};










