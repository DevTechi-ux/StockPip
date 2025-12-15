import { RequestHandler } from "express";
import { executeQuery } from "../database";
import crypto from "crypto";

// ===== ADMIN ROUTES =====

// Get all IB accounts
export const getAllIbAccounts: RequestHandler = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        ib.*,
        u.first_name, u.last_name, u.email,
        COUNT(DISTINCT ir.referred_user_id) as total_clients,
        COUNT(DISTINCT ic.id) as total_commissions,
        COALESCE(SUM(CASE WHEN ic.status = 'paid' THEN ic.commission_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN ic.status = 'pending' THEN ic.commission_amount ELSE 0 END), 0) as pending_commissions
      FROM ib_accounts ib
      LEFT JOIN users u ON ib.user_id = u.id
      LEFT JOIN ib_referrals ir ON ib.id = ir.ib_id
      LEFT JOIN ib_commissions ic ON ib.id = ic.ib_id
      GROUP BY ib.id
      ORDER BY ib.created_at DESC
    `);

    res.json(result.success ? result.data : []);
  } catch (error) {
    console.error("Error fetching IB accounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin approve/reject IB
export const updateIbAccountStatus: RequestHandler = async (req, res) => {
  try {
    const { ibId } = req.params;
    const { status, admin_notes, commission_rate, commission_type } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateQuery = status === 'approved'
      ? `UPDATE ib_accounts 
         SET status = 'approved', 
             approved_at = NOW(),
             approved_by = ?,
             admin_notes = ?,
             commission_rate = ?,
             commission_type = ?
         WHERE id = ?`
      : `UPDATE ib_accounts 
         SET status = ?,
             admin_notes = ?
         WHERE id = ?`;

    const params = status === 'approved'
      ? [req.user?.userId, admin_notes || null, commission_rate || 5.00, commission_type || 'per_lot', ibId]
      : [status, admin_notes || null, ibId];

    const result = await executeQuery(updateQuery, params);

    if (result.success && result.data.affectedRows > 0) {
      res.json({ success: true, message: `IB account ${status} successfully` });
    } else {
      res.status(404).json({ error: "IB account not found" });
    }
  } catch (error) {
    console.error("Error updating IB status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get IB withdrawal requests
export const getIbWithdrawals: RequestHandler = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        iw.*,
        u.first_name, u.last_name, u.email,
        ib.ib_name
      FROM ib_withdrawals iw
      LEFT JOIN ib_accounts ib ON iw.ib_id = ib.id
      LEFT JOIN users u ON ib.user_id = u.id
      ORDER BY iw.created_at DESC
    `);

    res.json(result.success ? result.data : []);
  } catch (error) {
    console.error("Error fetching IB withdrawals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin process IB withdrawal
export const processIbWithdrawal: RequestHandler = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await executeQuery(`
      UPDATE ib_withdrawals 
      SET status = ?, admin_notes = ?, processed_at = NOW(), processed_by = ?
      WHERE id = ?
    `, [status, admin_notes || null, req.user?.userId, withdrawalId]);

    if (result.success && result.data.affectedRows > 0) {
      // If approved, deduct from pending earnings
      if (status === 'approved') {
        const withdrawalResult = await executeQuery(
          'SELECT ib_id, amount FROM ib_withdrawals WHERE id = ?',
          [withdrawalId]
        );

        if (withdrawalResult.success && withdrawalResult.data.length > 0) {
          const { ib_id, amount } = withdrawalResult.data[0];
          await executeQuery(
            'UPDATE ib_accounts SET pending_earnings = pending_earnings - ? WHERE id = ? AND pending_earnings >= ?',
            [amount, ib_id, amount]
          );
        }
      }

      res.json({ success: true, message: `Withdrawal ${status} successfully` });
    } else {
      res.status(404).json({ error: "Withdrawal not found" });
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===== IB ROUTES =====

// Apply to become IB
export const applyToBeIb: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { ib_name, parent_referral_code } = req.body;

    if (!ib_name) {
      return res.status(400).json({ error: "IB name is required" });
    }

    // Check if already IB
    const existingResult = await executeQuery(
      'SELECT id FROM ib_accounts WHERE user_id = ?',
      [userId]
    );

    if (existingResult.success && existingResult.data.length > 0) {
      return res.status(400).json({ error: "You are already an IB" });
    }

    // Generate unique referral code
    const referralCode = `IB${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const ibId = crypto.randomUUID();

    let parentIbId = null;
    if (parent_referral_code) {
      const parentResult = await executeQuery(
        'SELECT id, ib_level FROM ib_accounts WHERE referral_code = ? AND status = "approved"',
        [parent_referral_code]
      );
      
      if (parentResult.success && parentResult.data.length > 0) {
        parentIbId = parentResult.data[0].id;
      }
    }

    // Get settings
    const settingsResult = await executeQuery(
      'SELECT setting_value FROM ib_settings WHERE setting_key IN ("default_commission_rate", "max_ib_levels")'
    );

    const settings: any = {};
    if (settingsResult.success && settingsResult.data.length > 0) {
      settingsResult.data.forEach((row: any) => {
        const key = row.setting_key;
        settings[key] = parseFloat(row.setting_value) || 5.00;
      });
    }

    const defaultCommissionRate = settings.default_commission_rate || 5.00;
    const maxLevels = parseInt(settings.max_ib_levels) || 2;

    const ibLevel = parentIbId && maxLevels > 1 ? 2 : 1;

    const insertResult = await executeQuery(`
      INSERT INTO ib_accounts (
        id, user_id, referral_code, ib_name, ib_level, parent_ib_id,
        commission_type, commission_rate, status, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, 'per_lot', ?, 'pending', TRUE)
    `, [ibId, userId, referralCode, ib_name, ibLevel, parentIbId, defaultCommissionRate]);

    if (insertResult.success) {
      res.status(201).json({ success: true, ibId, referralCode, message: "IB application submitted successfully" });
    } else {
      res.status(500).json({ error: "Failed to create IB account" });
    }
  } catch (error) {
    console.error("Error applying for IB:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get IB dashboard data
export const getIbDashboard: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const ibResult = await executeQuery(
      'SELECT * FROM ib_accounts WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    if (!ibResult.success || ibResult.data.length === 0) {
      return res.status(404).json({ error: "IB account not found" });
    }

    const ib = ibResult.data[0];

    // Get stats
    const statsResult = await executeQuery(`
      SELECT 
        COUNT(DISTINCT ir.referred_user_id) as total_clients,
        COUNT(DISTINCT ic.id) as total_commissions,
        COALESCE(SUM(CASE WHEN ic.status = 'pending' THEN ic.commission_amount ELSE 0 END), 0) as pending_earnings,
        COALESCE(SUM(CASE WHEN ic.status = 'paid' THEN ic.commission_amount ELSE 0 END), 0) as total_paid,
        COUNT(DISTINCT ir2.id) as total_sub_ibs
      FROM ib_accounts
      LEFT JOIN ib_referrals ir ON ib_accounts.id = ir.ib_id
      LEFT JOIN ib_commissions ic ON ib_accounts.id = ic.ib_id
      LEFT JOIN ib_accounts ib_sub ON ib_sub.parent_ib_id = ib_accounts.id
      LEFT JOIN ib_referrals ir2 ON ib_sub.id = ir2.ib_id
      WHERE ib_accounts.id = ?
    `, [ib.id]);

    const stats = statsResult.success && statsResult.data.length > 0 
      ? statsResult.data[0] 
      : { total_clients: 0, total_commissions: 0, pending_earnings: 0, total_paid: 0, total_sub_ibs: 0 };

    // Get recent commissions
    const commissionsResult = await executeQuery(`
      SELECT ic.*, u.first_name, u.last_name, u.email
      FROM ib_commissions ic
      LEFT JOIN users u ON ic.client_id = u.id
      WHERE ic.ib_id = ?
      ORDER BY ic.created_at DESC
      LIMIT 50
    `, [ib.id]);

    // Get recent referrals
    const referralsResult = await executeQuery(`
      SELECT ir.*, u.first_name, u.last_name, u.email
      FROM ib_referrals ir
      LEFT JOIN users u ON ir.referred_user_id = u.id
      WHERE ir.ib_id = ?
      ORDER BY ir.registered_at DESC
      LIMIT 20
    `, [ib.id]);

    res.json({
      ib,
      stats,
      recent_commissions: commissionsResult.success ? commissionsResult.data : [],
      recent_referrals: referralsResult.success ? referralsResult.data : []
    });
  } catch (error) {
    console.error("Error fetching IB dashboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// IB request withdrawal
export const requestIbWithdrawal: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { amount, withdrawal_method, bank_details } = req.body;

    // Get IB account
    const ibResult = await executeQuery(
      'SELECT id, pending_earnings FROM ib_accounts WHERE user_id = ? AND status = "approved" AND is_active = TRUE',
      [userId]
    );

    if (!ibResult.success || ibResult.data.length === 0) {
      return res.status(404).json({ error: "IB account not found or not approved" });
    }

    const ib = ibResult.data[0];

    // Check minimum withdrawal
    const settingsResult = await executeQuery(
      'SELECT setting_value FROM ib_settings WHERE setting_key = "min_withdrawal"'
    );
    const minWithdrawal = settingsResult.success && settingsResult.data.length > 0
      ? parseFloat(settingsResult.data[0].setting_value)
      : 50.00;

    if (amount < minWithdrawal) {
      return res.status(400).json({ error: `Minimum withdrawal is $${minWithdrawal}` });
    }

    if (amount > ib.pending_earnings) {
      return res.status(400).json({ error: "Insufficient pending earnings" });
    }

    const withdrawalId = crypto.randomUUID();

    const insertResult = await executeQuery(`
      INSERT INTO ib_withdrawals (id, ib_id, amount, withdrawal_method, bank_details, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [withdrawalId, ib.id, amount, withdrawal_method, JSON.stringify(bank_details)]);

    if (insertResult.success) {
      res.status(201).json({ success: true, withdrawalId, message: "Withdrawal request submitted" });
    } else {
      res.status(500).json({ error: "Failed to create withdrawal request" });
    }
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get commission history
export const getIbCommissions: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.query;

    const ibResult = await executeQuery(
      'SELECT id FROM ib_accounts WHERE user_id = ?',
      [userId]
    );

    if (!ibResult.success || ibResult.data.length === 0) {
      return res.status(404).json({ error: "IB account not found" });
    }

    const ibId = ibResult.data[0].id;
    let query = 'SELECT ic.*, u.first_name, u.last_name, u.email FROM ib_commissions ic LEFT JOIN users u ON ic.client_id = u.id WHERE ic.ib_id = ?';
    const params = [ibId];

    if (status) {
      query += ' AND ic.status = ?';
      params.push(status as string);
    }

    query += ' ORDER BY ic.created_at DESC LIMIT 100';

    const result = await executeQuery(query, params);
    res.json(result.success ? result.data : []);
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===== COMMISSION CALCULATION =====

// This is called when a position closes - calculate and distribute commissions
export const calculateIbCommission: RequestHandler = async (req, res) => {
  try {
    const { positionId, clientId, lotSize, profit, spread } = req.body;

    // Get client's IB info
    const clientResult = await executeQuery(
      'SELECT ib_id, ib_referral_code FROM users WHERE id = ?',
      [clientId]
    );

    if (!clientResult.success || clientResult.data.length === 0 || !clientResult.data[0].ib_id) {
      // No IB assigned
      return res.json({ success: true, message: "No IB assigned to this client" });
    }

    const ibId = clientResult.data[0].ib_id;

    // Get IB account details
    const ibResult = await executeQuery(
      'SELECT id, commission_type, commission_rate, ib_level, parent_ib_id FROM ib_accounts WHERE id = ? AND status = "approved" AND is_active = TRUE',
      [ibId]
    );

    if (!ibResult.success || ibResult.data.length === 0) {
      return res.json({ success: true, message: "IB not found or inactive" });
    }

    const ib = ibResult.data[0];

    // Calculate commission
    let commissionAmount = 0;

    if (ib.commission_type === 'per_lot') {
      commissionAmount = parseFloat(lotSize) * parseFloat(ib.commission_rate);
    } else if (ib.commission_type === 'spread_share') {
      commissionAmount = (parseFloat(spread) * parseFloat(ib.commission_rate)) / 100;
    } else if (ib.commission_type === 'profit_share') {
      commissionAmount = (profit * parseFloat(ib.commission_rate)) / 100;
    }

    if (commissionAmount > 0) {
      const commissionId = crypto.randomUUID();

      // Create commission record
      await executeQuery(`
        INSERT INTO ib_commissions (
          id, ib_id, client_id, position_id, commission_type, lot_size,
          profit_value, commission_rate, commission_amount, ib_level, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        commissionId, ib.id, clientId, positionId, ib.commission_type,
        lotSize, profit, ib.commission_rate, commissionAmount, ib.ib_level
      ]);

      // Update IB pending earnings
      await executeQuery(
        'UPDATE ib_accounts SET pending_earnings = pending_earnings + ? WHERE id = ?',
        [commissionAmount, ib.id]
      );

      // Handle multi-level commission
      if (ib.parent_ib_id) {
        const parentResult = await executeQuery(
          'SELECT commission_rate FROM ib_accounts WHERE id = ?',
          [ib.parent_ib_id]
        );

        if (parentResult.success && parentResult.data.length > 0) {
          const parentCommissionRate = parseFloat(parentResult.data[0].commission_rate) || ib.commission_rate;
          const parentCommission = commissionAmount * 0.4; // 40% to parent

          const parentCommissionId = crypto.randomUUID();
          await executeQuery(`
            INSERT INTO ib_commissions (
              id, ib_id, client_id, position_id, commission_type, lot_size,
              profit_value, commission_rate, commission_amount, ib_level, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
          `, [
            parentCommissionId, ib.parent_ib_id, clientId, positionId, ib.commission_type,
            lotSize, profit, parentCommissionRate, parentCommission
          ]);

          await executeQuery(
            'UPDATE ib_accounts SET pending_earnings = pending_earnings + ? WHERE id = ?',
            [parentCommission, ib.parent_ib_id]
          );
        }
      }
    }

    res.json({ success: true, commission: commissionAmount });
  } catch (error) {
    console.error("Error calculating commission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};










