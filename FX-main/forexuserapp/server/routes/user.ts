import { RequestHandler } from "express";
import { getUserTradingAccount, executeQuery } from "../database";

export const getUserBalance: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const account = await getUserTradingAccount(userId);

    if (account) {
      res.json({
        success: true,
        balance: account.balance || 0,
        equity: account.equity || 0,
        leverage: account.leverage || 500,
        currency: account.currency || "USD",
        user: {
          name: `${account.first_name} ${account.last_name}`,
          email: account.email,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "Trading account not found" });
    }
  } catch (error) {
    console.error("Error fetching user balance:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getBankAccounts: RequestHandler = async (req, res) => {
  try {
    // Fetch active bank accounts from admin's bank_accounts table
    const result = await executeQuery(
      "SELECT id, bank_name, account_name, account_number, bank_code, account_type, currency FROM bank_accounts WHERE is_active = 1 ORDER BY created_at DESC"
    );

    if (result.success) {
      // Format the data for user display
      const accounts = result.data.map((account: any) => ({
        id: account.id,
        bank_name: account.bank_name,
        account_holder_name: account.account_name,
        account_number: account.account_number,
        ifsc_code: account.bank_code,
        branch_name: account.bank_name, // Using bank_name as branch for now
        account_type: account.account_type,
        upi_id: null // Can be added later if needed
      }));

      res.json({
        success: true,
        accounts: accounts
      });
    } else {
      res.status(500).json({ success: false, message: "Failed to fetch bank accounts" });
    }
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createFundRequest: RequestHandler = async (req, res) => {
  try {
    const { userId, type, amount, bankId, transactionId, bankDetails, notes } = req.body;

    // Validate required fields based on request type
    if (!userId || !type || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: userId, type, amount" 
      });
    }

    // For deposits, transactionId is required (proof of payment)
    // For withdrawals, transactionId is optional (we can generate one)
    if (type.toLowerCase() === 'deposit' && !transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Transaction ID is required for deposit requests" 
      });
    }

    // Generate request ID
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate transaction ID for withdrawals if not provided
    const finalTransactionId = transactionId || `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('[createFundRequest] Creating fund request:', {
      requestId,
      userId,
      type,
      amount,
      transactionId: finalTransactionId,
      bankDetails,
      notes
    });

    // Verify trading account exists
    const accountCheck = await executeQuery(
      'SELECT id FROM trading_accounts WHERE user_id = ? AND is_active = TRUE LIMIT 1',
      [userId]
    );
    
    let accountId = `ta-${userId}`;
    if (accountCheck.success && accountCheck.data && accountCheck.data.length > 0) {
      accountId = accountCheck.data[0].id;
    } else {
      console.warn('[createFundRequest] Trading account not found for user:', userId, '- using default format');
    }

    // For withdrawals, check if user has sufficient balance
    if (type.toUpperCase() === 'WITHDRAWAL') {
      const balanceCheck = await executeQuery(
        'SELECT balance FROM trading_accounts WHERE user_id = ? AND is_active = TRUE LIMIT 1',
        [userId]
      );
      
      if (balanceCheck.success && balanceCheck.data && balanceCheck.data.length > 0) {
        const currentBalance = parseFloat(balanceCheck.data[0].balance) || 0;
        const withdrawAmount = parseFloat(amount);
        
        if (currentBalance < withdrawAmount) {
          return res.status(400).json({
            success: false,
            message: `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Requested: $${withdrawAmount.toFixed(2)}`
          });
        }
      }
    }

    // Parse bankDetails if it's a string (for withdrawals)
    let parsedBankDetails = null;
    if (bankDetails) {
      try {
        parsedBankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;
      } catch (e) {
        console.warn('[createFundRequest] Failed to parse bankDetails:', e);
      }
    }

    // Simple insert without complex queries
    // Store notes in admin_notes field (which should exist)
    const notesText = notes || (parsedBankDetails ? JSON.stringify(parsedBankDetails) : null);
    
    const result = await executeQuery(`
      INSERT INTO fund_requests (
        id, user_id, account_id, request_type, amount, currency, 
        payment_method, bank_account_id, transaction_id, status, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      requestId,
      userId,
      accountId,
      type.toUpperCase(),
      parseFloat(amount),
      'USD',
      'BANK_TRANSFER',
      bankId || null,
      finalTransactionId,
      'PENDING',
      notesText || null
    ]);

    console.log('[createFundRequest] Insert result:', {
      success: result.success,
      requestId
    });

    if (result.success) {
      // Verify it was saved
      const verify = await executeQuery(
        'SELECT * FROM fund_requests WHERE id = ?',
        [requestId]
      );
      console.log('[createFundRequest] Verification:', {
        found: verify.success && verify.data?.length > 0,
        status: verify.data?.[0]?.status
      });

      res.json({
        success: true,
        message: "Deposit request submitted successfully",
        requestId: requestId
      });
    } else {
      console.error("[createFundRequest] Database error:", result.error);
      res.status(500).json({ 
        success: false, 
        message: "Database error: " + (result.error?.message || "Unknown error")
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
};

export const getUserFundRequests: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await executeQuery(`
      SELECT 
        fr.id,
        fr.request_type as type,
        fr.amount,
        fr.currency,
        fr.status,
        fr.screenshot_url,
        fr.admin_notes,
        fr.created_at,
        ba.bank_name,
        ba.account_name as bank_account_name
      FROM fund_requests fr
      LEFT JOIN bank_accounts ba ON fr.bank_account_id = ba.id
      WHERE fr.user_id = ?
      ORDER BY fr.created_at DESC
      LIMIT 50
    `, [userId]);

    if (result.success) {
      res.json({
        success: true,
        requests: result.data
      });
    } else {
      res.status(500).json({ success: false, message: "Failed to fetch fund requests" });
    }
  } catch (error) {
    console.error("Error fetching fund requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};





