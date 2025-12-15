import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fundAccounts, fundTransactions } from '@/db/schema';
import { eq, sql, gte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate total balance and balance by type for active accounts
    const balanceByTypeResult = await db
      .select({
        accountType: fundAccounts.accountType,
        totalBalance: sql<number>`COALESCE(SUM(${fundAccounts.balance}), 0)`,
      })
      .from(fundAccounts)
      .where(eq(fundAccounts.status, 'active'))
      .groupBy(fundAccounts.accountType);

    const balanceByType = {
      operating: 0,
      reserve: 0,
      commission: 0,
    };

    let totalBalance = 0;

    for (const row of balanceByTypeResult) {
      const amount = Number(row.totalBalance);
      totalBalance += amount;
      if (row.accountType === 'operating' || row.accountType === 'reserve' || row.accountType === 'commission') {
        balanceByType[row.accountType] = amount;
      }
    }

    // Count accounts by status
    const accountCountResult = await db
      .select({
        status: fundAccounts.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(fundAccounts)
      .groupBy(fundAccounts.status);

    const accountStats = {
      totalAccounts: 0,
      activeAccounts: 0,
      frozenAccounts: 0,
    };

    for (const row of accountCountResult) {
      const count = Number(row.count);
      accountStats.totalAccounts += count;
      if (row.status === 'active') {
        accountStats.activeAccounts = count;
      } else if (row.status === 'frozen') {
        accountStats.frozenAccounts = count;
      }
    }

    // Get total transaction count
    const totalTransactionsResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(fundTransactions);

    const totalTransactions = Number(totalTransactionsResult[0]?.count || 0);

    // Count and sum transactions by type
    const transactionsByTypeResult = await db
      .select({
        transactionType: fundTransactions.transactionType,
        count: sql<number>`COUNT(*)`,
        total: sql<number>`COALESCE(SUM(${fundTransactions.amount}), 0)`,
      })
      .from(fundTransactions)
      .groupBy(fundTransactions.transactionType);

    const byType = {
      deposit: { count: 0, total: 0 },
      withdrawal: { count: 0, total: 0 },
      transfer: { count: 0, total: 0 },
      fee_collection: { count: 0, total: 0 },
      commission: { count: 0, total: 0 },
    };

    for (const row of transactionsByTypeResult) {
      const type = row.transactionType;
      if (type === 'deposit' || type === 'withdrawal' || type === 'transfer' || type === 'fee_collection' || type === 'commission') {
        byType[type] = {
          count: Number(row.count),
          total: Number(row.total),
        };
      }
    }

    // Calculate recent transaction counts
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const recent24HoursResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(fundTransactions)
      .where(gte(fundTransactions.createdAt, last24Hours));

    const recent7DaysResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(fundTransactions)
      .where(gte(fundTransactions.createdAt, last7Days));

    const recent30DaysResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(fundTransactions)
      .where(gte(fundTransactions.createdAt, last30Days));

    const recent = {
      last24Hours: Number(recent24HoursResult[0]?.count || 0),
      last7Days: Number(recent7DaysResult[0]?.count || 0),
      last30Days: Number(recent30DaysResult[0]?.count || 0),
    };

    const stats = {
      totalBalance,
      balanceByType,
      accountStats,
      transactionStats: {
        totalTransactions,
        byType,
        recent,
      },
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}