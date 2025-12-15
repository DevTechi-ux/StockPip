import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fundTransactions, fundAccounts, adminUsers } from '@/db/schema';
import { eq, like, or, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single transaction by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const transaction = await db.select({
        id: fundTransactions.id,
        accountId: fundTransactions.accountId,
        transactionType: fundTransactions.transactionType,
        amount: fundTransactions.amount,
        fromAccountId: fundTransactions.fromAccountId,
        toAccountId: fundTransactions.toAccountId,
        description: fundTransactions.description,
        referenceId: fundTransactions.referenceId,
        adminId: fundTransactions.adminId,
        status: fundTransactions.status,
        createdAt: fundTransactions.createdAt,
        account: {
          id: fundAccounts.id,
          accountName: fundAccounts.accountName,
        },
        admin: {
          id: adminUsers.id,
          name: adminUsers.name,
        },
      })
        .from(fundTransactions)
        .leftJoin(fundAccounts, eq(fundTransactions.accountId, fundAccounts.id))
        .leftJoin(adminUsers, eq(fundTransactions.adminId, adminUsers.id))
        .where(eq(fundTransactions.id, parseInt(id)))
        .limit(1);

      if (transaction.length === 0) {
        return NextResponse.json({ 
          error: 'Transaction not found',
          code: "TRANSACTION_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(transaction[0], { status: 200 });
    }

    // List transactions with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const transactionType = searchParams.get('transactionType');
    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status');
    const adminId = searchParams.get('adminId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = db.select({
      id: fundTransactions.id,
      accountId: fundTransactions.accountId,
      transactionType: fundTransactions.transactionType,
      amount: fundTransactions.amount,
      fromAccountId: fundTransactions.fromAccountId,
      toAccountId: fundTransactions.toAccountId,
      description: fundTransactions.description,
      referenceId: fundTransactions.referenceId,
      adminId: fundTransactions.adminId,
      status: fundTransactions.status,
      createdAt: fundTransactions.createdAt,
      account: {
        id: fundAccounts.id,
        accountName: fundAccounts.accountName,
      },
      admin: {
        id: adminUsers.id,
        name: adminUsers.name,
      },
    })
      .from(fundTransactions)
      .leftJoin(fundAccounts, eq(fundTransactions.accountId, fundAccounts.id))
      .leftJoin(adminUsers, eq(fundTransactions.adminId, adminUsers.id));

    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(fundTransactions.description, `%${search}%`),
          like(fundTransactions.referenceId, `%${search}%`)
        )
      );
    }

    // Transaction type filter
    if (transactionType) {
      conditions.push(eq(fundTransactions.transactionType, transactionType));
    }

    // Account ID filter
    if (accountId) {
      if (isNaN(parseInt(accountId))) {
        return NextResponse.json({ 
          error: "Valid account ID is required",
          code: "INVALID_ACCOUNT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(fundTransactions.accountId, parseInt(accountId)));
    }

    // Status filter
    if (status) {
      conditions.push(eq(fundTransactions.status, status));
    }

    // Admin ID filter
    if (adminId) {
      if (isNaN(parseInt(adminId))) {
        return NextResponse.json({ 
          error: "Valid admin ID is required",
          code: "INVALID_ADMIN_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(fundTransactions.adminId, parseInt(adminId)));
    }

    // Date range filters
    if (startDate) {
      conditions.push(gte(fundTransactions.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(fundTransactions.createdAt, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(sql`${fundTransactions.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, transactionType, amount, description, referenceId, adminId } = body;

    // Validate required fields
    if (!accountId) {
      return NextResponse.json({ 
        error: "Account ID is required",
        code: "MISSING_ACCOUNT_ID" 
      }, { status: 400 });
    }

    if (!transactionType) {
      return NextResponse.json({ 
        error: "Transaction type is required",
        code: "MISSING_TRANSACTION_TYPE" 
      }, { status: 400 });
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json({ 
        error: "Amount is required",
        code: "MISSING_AMOUNT" 
      }, { status: 400 });
    }

    // Validate ID is valid integer
    if (isNaN(parseInt(accountId))) {
      return NextResponse.json({ 
        error: "Valid account ID is required",
        code: "INVALID_ACCOUNT_ID" 
      }, { status: 400 });
    }

    // Validate transaction type
    const validTransactionTypes = ['deposit', 'withdrawal', 'fee_collection', 'commission'];
    if (!validTransactionTypes.includes(transactionType)) {
      return NextResponse.json({ 
        error: `Transaction type must be one of: ${validTransactionTypes.join(', ')}`,
        code: "INVALID_TRANSACTION_TYPE" 
      }, { status: 400 });
    }

    // Validate amount is positive
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ 
        error: "Amount must be a positive number",
        code: "INVALID_AMOUNT" 
      }, { status: 400 });
    }

    // Check if account exists
    const account = await db.select()
      .from(fundAccounts)
      .where(eq(fundAccounts.id, parseInt(accountId)))
      .limit(1);

    if (account.length === 0) {
      return NextResponse.json({ 
        error: 'Account not found',
        code: "ACCOUNT_NOT_FOUND" 
      }, { status: 404 });
    }

    // For withdrawals, check sufficient balance
    if (transactionType === 'withdrawal') {
      if (account[0].balance < parsedAmount) {
        return NextResponse.json({ 
          error: 'Insufficient balance in account',
          code: "INSUFFICIENT_BALANCE" 
        }, { status: 400 });
      }
    }

    // Create transaction
    const transactionData: any = {
      accountId: parseInt(accountId),
      transactionType,
      amount: parsedAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    if (description) transactionData.description = description.trim();
    if (referenceId) transactionData.referenceId = referenceId.trim();
    if (adminId) {
      if (isNaN(parseInt(adminId))) {
        return NextResponse.json({ 
          error: "Valid admin ID is required",
          code: "INVALID_ADMIN_ID" 
        }, { status: 400 });
      }
      transactionData.adminId = parseInt(adminId);
    }

    const newTransaction = await db.insert(fundTransactions)
      .values(transactionData)
      .returning();

    // Update account balance
    let newBalance: number;
    if (transactionType === 'deposit') {
      newBalance = account[0].balance + parsedAmount;
    } else if (transactionType === 'withdrawal') {
      newBalance = account[0].balance - parsedAmount;
    } else {
      newBalance = account[0].balance;
    }

    await db.update(fundAccounts)
      .set({
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(fundAccounts.id, parseInt(accountId)));

    // Fetch the created transaction with joined data
    const createdTransaction = await db.select({
      id: fundTransactions.id,
      accountId: fundTransactions.accountId,
      transactionType: fundTransactions.transactionType,
      amount: fundTransactions.amount,
      fromAccountId: fundTransactions.fromAccountId,
      toAccountId: fundTransactions.toAccountId,
      description: fundTransactions.description,
      referenceId: fundTransactions.referenceId,
      adminId: fundTransactions.adminId,
      status: fundTransactions.status,
      createdAt: fundTransactions.createdAt,
      account: {
        id: fundAccounts.id,
        accountName: fundAccounts.accountName,
      },
      admin: {
        id: adminUsers.id,
        name: adminUsers.name,
      },
    })
      .from(fundTransactions)
      .leftJoin(fundAccounts, eq(fundTransactions.accountId, fundAccounts.id))
      .leftJoin(adminUsers, eq(fundTransactions.adminId, adminUsers.id))
      .where(eq(fundTransactions.id, newTransaction[0].id))
      .limit(1);

    return NextResponse.json(createdTransaction[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}