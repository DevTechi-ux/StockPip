import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { amount, description } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    }

    // Get user's trading account
    const accountResult = await executeQuery(
      'SELECT id, balance FROM trading_accounts WHERE user_id = ? AND is_active = 1',
      [userId]
    );

    if (!accountResult.success || accountResult.data.length === 0) {
      return NextResponse.json({ success: false, message: 'User trading account not found' }, { status: 404 });
    }

    const account = accountResult.data[0];
    const currentBalance = parseFloat(account.balance) || 0;
    const deductAmount = parseFloat(amount);
    
    if (currentBalance < deductAmount) {
      return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
    }
    
    const newBalance = currentBalance - deductAmount;

    // Update account balance
    const updateResult = await executeQuery(
      'UPDATE trading_accounts SET balance = ?, equity = ?, updated_at = NOW() WHERE id = ?',
      [newBalance, newBalance, account.id]
    );

    if (!updateResult.success) {
      return NextResponse.json({ success: false, message: 'Failed to update account balance' }, { status: 500 });
    }

    // Record transaction
    const transactionId = require('crypto').randomBytes(16).toString('hex');
    const transactionResult = await executeQuery(
      'INSERT INTO wallet_transactions (id, user_id, account_id, transaction_type, amount, balance_before, balance_after, currency, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [transactionId, userId, account.id, 'ADMIN_ADJUSTMENT', -deductAmount, currentBalance, newBalance, 'USD', description || 'Admin fund deduction']
    );

    // Create notification for user
    if (transactionResult.success) {
      await executeQuery(
        'INSERT INTO notifications (user_id, type, title, message, data, priority, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          userId, 
          'withdrawal', 
          'Funds Deducted from Your Account', 
          `$${deductAmount.toFixed(2)} has been deducted from your trading account. Your new balance is $${newBalance.toFixed(2)}.`,
          JSON.stringify({
            transaction_id: transactionId,
            amount: deductAmount,
            balance_before: currentBalance,
            balance_after: newBalance,
            type: 'admin_withdrawal'
          }),
          'medium'
        ]
      );
    }

    return NextResponse.json({
      success: transactionResult.success,
      message: transactionResult.success ? 'Funds deducted successfully' : 'Failed to record transaction'
    });
  } catch (error) {
    console.error('Error deducting funds:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}





