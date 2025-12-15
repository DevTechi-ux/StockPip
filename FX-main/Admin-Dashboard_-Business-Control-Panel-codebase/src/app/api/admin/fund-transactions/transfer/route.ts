import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fundTransactions, fundAccounts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromAccountId, toAccountId, amount, description, referenceId, adminId } = body;

    // Validation: Required fields
    if (!fromAccountId) {
      return NextResponse.json(
        { error: 'Source account ID is required', code: 'MISSING_FROM_ACCOUNT' },
        { status: 400 }
      );
    }

    if (!toAccountId) {
      return NextResponse.json(
        { error: 'Destination account ID is required', code: 'MISSING_TO_ACCOUNT' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    // Validation: Valid integers for account IDs
    const fromAccountIdInt = parseInt(fromAccountId);
    const toAccountIdInt = parseInt(toAccountId);

    if (isNaN(fromAccountIdInt)) {
      return NextResponse.json(
        { error: 'Valid source account ID is required', code: 'INVALID_FROM_ACCOUNT_ID' },
        { status: 400 }
      );
    }

    if (isNaN(toAccountIdInt)) {
      return NextResponse.json(
        { error: 'Valid destination account ID is required', code: 'INVALID_TO_ACCOUNT_ID' },
        { status: 400 }
      );
    }

    // Validation: Amount is positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validation: Different accounts
    if (fromAccountIdInt === toAccountIdInt) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same account', code: 'SAME_ACCOUNT_TRANSFER' },
        { status: 400 }
      );
    }

    // Check if both accounts exist
    const [fromAccount] = await db
      .select()
      .from(fundAccounts)
      .where(eq(fundAccounts.id, fromAccountIdInt))
      .limit(1);

    if (!fromAccount) {
      return NextResponse.json(
        { error: 'Source account not found', code: 'FROM_ACCOUNT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const [toAccount] = await db
      .select()
      .from(fundAccounts)
      .where(eq(fundAccounts.id, toAccountIdInt))
      .limit(1);

    if (!toAccount) {
      return NextResponse.json(
        { error: 'Destination account not found', code: 'TO_ACCOUNT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if both accounts are active
    if (fromAccount.status !== 'active') {
      return NextResponse.json(
        { error: 'Source account is not active', code: 'FROM_ACCOUNT_FROZEN' },
        { status: 400 }
      );
    }

    if (toAccount.status !== 'active') {
      return NextResponse.json(
        { error: 'Destination account is not active', code: 'TO_ACCOUNT_FROZEN' },
        { status: 400 }
      );
    }

    // Check if source account has sufficient balance
    if (fromAccount.balance < amountNum) {
      return NextResponse.json(
        { error: 'Insufficient balance in source account', code: 'INSUFFICIENT_BALANCE' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Create withdrawal transaction (negative amount)
    const [withdrawalTransaction] = await db
      .insert(fundTransactions)
      .values({
        accountId: fromAccountIdInt,
        transactionType: 'transfer',
        amount: -amountNum,
        toAccountId: toAccountIdInt,
        fromAccountId: null,
        description: description || null,
        referenceId: referenceId || null,
        adminId: adminId ? parseInt(adminId) : null,
        status: 'completed',
        createdAt: timestamp,
      })
      .returning();

    // Create deposit transaction (positive amount)
    const [depositTransaction] = await db
      .insert(fundTransactions)
      .values({
        accountId: toAccountIdInt,
        transactionType: 'transfer',
        amount: amountNum,
        fromAccountId: fromAccountIdInt,
        toAccountId: null,
        description: description || null,
        referenceId: referenceId || null,
        adminId: adminId ? parseInt(adminId) : null,
        status: 'completed',
        createdAt: timestamp,
      })
      .returning();

    // Update source account balance (subtract amount)
    const [updatedFromAccount] = await db
      .update(fundAccounts)
      .set({
        balance: sql`${fundAccounts.balance} - ${amountNum}`,
        updatedAt: timestamp,
      })
      .where(eq(fundAccounts.id, fromAccountIdInt))
      .returning();

    // Update destination account balance (add amount)
    const [updatedToAccount] = await db
      .update(fundAccounts)
      .set({
        balance: sql`${fundAccounts.balance} + ${amountNum}`,
        updatedAt: timestamp,
      })
      .where(eq(fundAccounts.id, toAccountIdInt))
      .returning();

    return NextResponse.json(
      {
        success: true,
        transactions: [withdrawalTransaction, depositTransaction],
        fromAccount: {
          id: updatedFromAccount.id,
          accountName: updatedFromAccount.accountName,
          balance: updatedFromAccount.balance,
        },
        toAccount: {
          id: updatedToAccount.id,
          accountName: updatedToAccount.accountName,
          balance: updatedToAccount.balance,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}