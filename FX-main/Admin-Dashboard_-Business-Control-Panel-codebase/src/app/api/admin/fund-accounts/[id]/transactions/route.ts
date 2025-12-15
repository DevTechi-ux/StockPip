import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fundTransactions, fundAccounts, adminUsers } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id;

    // Validate accountId is a valid integer
    if (!accountId || isNaN(parseInt(accountId))) {
      return NextResponse.json(
        { 
          error: 'Valid account ID is required',
          code: 'INVALID_ACCOUNT_ID'
        },
        { status: 400 }
      );
    }

    const parsedAccountId = parseInt(accountId);

    // Check if account exists
    const accountExists = await db.select()
      .from(fundAccounts)
      .where(eq(fundAccounts.id, parsedAccountId))
      .limit(1);

    if (accountExists.length === 0) {
      return NextResponse.json(
        { 
          error: 'Fund account not found',
          code: 'ACCOUNT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Filtering parameters
    const transactionType = searchParams.get('transactionType');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build WHERE conditions
    const conditions = [eq(fundTransactions.accountId, parsedAccountId)];

    if (transactionType) {
      conditions.push(eq(fundTransactions.transactionType, transactionType));
    }

    if (status) {
      conditions.push(eq(fundTransactions.status, status));
    }

    if (startDate) {
      conditions.push(gte(fundTransactions.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(fundTransactions.createdAt, endDate));
    }

    // Query with join to adminUsers
    const transactions = await db.select({
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
      admin: {
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
      }
    })
      .from(fundTransactions)
      .leftJoin(adminUsers, eq(fundTransactions.adminId, adminUsers.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(fundTransactions.createdAt);

    // Transform the results to handle null admin (leftJoin can return null)
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      accountId: transaction.accountId,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      description: transaction.description,
      referenceId: transaction.referenceId,
      adminId: transaction.adminId,
      status: transaction.status,
      createdAt: transaction.createdAt,
      admin: transaction.admin.id ? transaction.admin : null
    }));

    return NextResponse.json(formattedTransactions, { status: 200 });

  } catch (error) {
    console.error('GET transactions error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}