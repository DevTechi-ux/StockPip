import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { reason, adminId } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get the fund request details
    const requestResult = await executeQuery(
      `SELECT fr.*, u.id as user_id, ta.id as account_id 
       FROM fund_requests fr
       LEFT JOIN users u ON fr.user_id = u.id
       LEFT JOIN trading_accounts ta ON fr.account_id = ta.id
       WHERE fr.id = ? AND fr.status = 'PENDING'`,
      [requestId]
    );

    if (!requestResult.success || !Array.isArray(requestResult.data) || requestResult.data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Fund request not found or already processed' },
        { status: 404 }
      );
    }

    const fundRequest = requestResult.data[0];

    // Start transaction: Update request status and update user balance
    if (fundRequest.request_type === 'DEPOSIT') {
      // For deposit: Add funds to user account
      const addFundsResult = await executeQuery(
        `UPDATE trading_accounts 
         SET balance = balance + ?, 
             equity = equity + ?,
             updated_at = NOW()
         WHERE id = ?`,
        [fundRequest.amount, fundRequest.amount, fundRequest.account_id]
      );

      if (!addFundsResult.success) {
        return NextResponse.json(
          { success: false, message: 'Failed to add funds to user account' },
          { status: 500 }
        );
      }

      // Get updated balance for transaction record
      const balanceResult = await executeQuery(
        `SELECT balance FROM trading_accounts WHERE id = ?`,
        [fundRequest.account_id]
      );
      const newBalance = balanceResult.success && balanceResult.data.length > 0 
        ? balanceResult.data[0].balance 
        : fundRequest.amount;
      const balanceBefore = newBalance - parseFloat(fundRequest.amount);

      // Record transaction
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await executeQuery(
        `INSERT INTO wallet_transactions 
         (id, user_id, account_id, transaction_type, amount, balance_before, balance_after, currency, description, created_at)
         VALUES (?, ?, ?, 'DEPOSIT', ?, ?, ?, 'USD', ?, NOW())`,
        [transactionId, fundRequest.user_id, fundRequest.account_id, fundRequest.amount, balanceBefore, newBalance, reason || 'Deposit approved by admin']
      );
    } else if (fundRequest.request_type === 'WITHDRAWAL') {
      // For withdrawal: Deduct funds from user account
      // Check if user has sufficient balance
      const accountResult = await executeQuery(
        `SELECT balance FROM trading_accounts WHERE id = ?`,
        [fundRequest.account_id]
      );

      if (!accountResult.success || accountResult.data.length === 0) {
        return NextResponse.json(
          { success: false, message: 'User account not found' },
          { status: 404 }
        );
      }

      const currentBalance = accountResult.data[0].balance;
      if (currentBalance < fundRequest.amount) {
        return NextResponse.json(
          { success: false, message: 'Insufficient balance for withdrawal' },
          { status: 400 }
        );
      }

      const deductFundsResult = await executeQuery(
        `UPDATE trading_accounts 
         SET balance = balance - ?, 
             equity = equity - ?,
             updated_at = NOW()
         WHERE id = ?`,
        [fundRequest.amount, fundRequest.amount, fundRequest.account_id]
      );

      if (!deductFundsResult.success) {
        return NextResponse.json(
          { success: false, message: 'Failed to deduct funds from user account' },
          { status: 500 }
        );
      }

      // Record transaction
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newBalance = currentBalance - parseFloat(fundRequest.amount);
      await executeQuery(
        `INSERT INTO wallet_transactions 
         (id, user_id, account_id, transaction_type, amount, balance_before, balance_after, currency, description, created_at)
         VALUES (?, ?, ?, 'WITHDRAWAL', -?, ?, ?, 'USD', ?, NOW())`,
        [transactionId, fundRequest.user_id, fundRequest.account_id, fundRequest.amount, currentBalance, newBalance, reason || 'Withdrawal approved by admin']
      );
    }

    // Update fund request status
    const updateResult = await executeQuery(
      `UPDATE fund_requests 
       SET status = 'APPROVED',
           admin_notes = ?,
           processed_by = ?,
           processed_at = NOW()
       WHERE id = ?`,
      [reason || '', adminId || 'admin-001', requestId]
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to update fund request status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fund request approved successfully'
    });
  } catch (error: any) {
    console.error('Error approving fund request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to approve fund request' },
      { status: 500 }
    );
  }
}

