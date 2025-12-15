import { RequestHandler } from "express";
import { executeQuery, getUserTradingAccount } from "../database";
import crypto from "crypto";

const OXAPAY_API_KEY = process.env.OXAPAY_API_KEY || "";
const OXAPAY_MERCHANT_ID = process.env.OXAPAY_MERCHANT_ID || "";
const OXAPAY_CALLBACK_URL = process.env.OXAPAY_CALLBACK_URL || "http://localhost:8080/api/oxapay/callback";
const OXAPAY_RETURN_URL = process.env.OXAPAY_RETURN_URL || "http://localhost:8080/wallet";

// Create payment request
export const createOxaPayPayment: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Generate unique invoice number
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare OxaPay API request
    const oxapayParams = {
      merchant: OXAPAY_MERCHANT_ID,
      amount: amount,
      payCurrency: "USD",
      webhook: OXAPAY_CALLBACK_URL,
      callbackUrl: OXAPAY_RETURN_URL,
      orderId: invoiceId,
      underPaidCover: 0,
      merchantUserId: userId
    };

    // Store pending payment in database
    await executeQuery(
      `INSERT INTO fund_requests (id, user_id, request_type, amount, currency, payment_method, status, transaction_id, created_at)
       VALUES (?, ?, 'DEPOSIT', ?, 'USD', 'OXAPAY', 'PENDING', ?, NOW())`,
      [invoiceId, userId, amount, invoiceId]
    );

    // For now, return the OxaPay API details for frontend to call
    res.json({
      success: true,
      paymentUrl: `https://www.oxapay.com/api/requestpayment?merchant=${OXAPAY_MERCHANT_ID}&amount=${amount}&payCurrency=USD&webhook=${encodeURIComponent(OXAPAY_CALLBACK_URL)}&callbackUrl=${encodeURIComponent(OXAPAY_RETURN_URL)}&orderId=${invoiceId}`,
      invoiceId: invoiceId
    });

  } catch (error) {
    console.error("Error creating OxaPay payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle OxaPay webhook callback
export const oxaPayCallback: RequestHandler = async (req, res) => {
  try {
    const { orderId, amount, status, merchant } = req.body;

    console.log("OxaPay callback received:", { orderId, amount, status, merchant });

    // Verify merchant
    if (merchant !== OXAPAY_MERCHANT_ID) {
      return res.status(400).json({ error: "Invalid merchant" });
    }

    // Find the fund request
    const result = await executeQuery(
      `SELECT * FROM fund_requests WHERE transaction_id = ? AND payment_method = 'OXAPAY'`,
      [orderId]
    );

    if (!result.success || result.data.length === 0) {
      console.error("Fund request not found for orderId:", orderId);
      return res.status(404).json({ error: "Transaction not found" });
    }

    const fundRequest = result.data[0];

    // Only process if status is "paid" (webhooks may fire multiple times)
    if (status === "paid" && fundRequest.status === "PENDING") {
      // Update fund request status
      await executeQuery(
        `UPDATE fund_requests SET status = 'APPROVED', updated_at = NOW() WHERE id = ?`,
        [fundRequest.id]
      );

      // Get or create trading account
      const account = await getUserTradingAccount(fundRequest.user_id);

      if (account) {
        // Update balance
        await executeQuery(
          `UPDATE trading_accounts 
           SET balance = balance + ?, 
               equity = equity + ?, 
               free_margin = free_margin + ?, 
               updated_at = NOW() 
           WHERE id = ?`,
          [amount, amount, amount, account.id]
        );
      }

      console.log("OxaPay payment processed successfully for orderId:", orderId);
    }

    // Always return "ok" to acknowledge receipt
    res.status(200).send("ok");

  } catch (error) {
    console.error("Error processing OxaPay callback:", error);
    res.status(500).send("error");
  }
};

// Get payment status
export const getPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { invoiceId } = req.params;

    const result = await executeQuery(
      `SELECT status, amount, created_at FROM fund_requests 
       WHERE transaction_id = ? AND user_id = ? AND payment_method = 'OXAPAY'`,
      [invoiceId, userId]
    );

    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        status: result.data[0].status,
        amount: result.data[0].amount,
        createdAt: result.data[0].created_at
      });
    } else {
      res.status(404).json({ error: "Payment not found" });
    }

  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};










