import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function GET() {
  try {
    // Get total users count
    const totalUsersResult = await executeQuery(
      "SELECT COUNT(*) as count FROM users WHERE user_type = 'user' AND is_active = 1"
    );
    const totalUsers = totalUsersResult.success && totalUsersResult.data.length > 0 
      ? parseInt(totalUsersResult.data[0].count) : 0;

    // Get total balance (sum of all trading account balances)
    const totalBalanceResult = await executeQuery(
      "SELECT COALESCE(SUM(balance), 0) as total_balance FROM trading_accounts WHERE is_active = 1"
    );
    const totalBalance = totalBalanceResult.success && totalBalanceResult.data.length > 0
      ? parseFloat(totalBalanceResult.data[0].total_balance) : 0;

    // Get pending deposits
    const pendingDepositsResult = await executeQuery(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount FROM fund_requests WHERE status = 'PENDING' AND request_type = 'DEPOSIT'"
    );
    const pendingDeposits = pendingDepositsResult.success && pendingDepositsResult.data.length > 0
      ? {
          count: parseInt(pendingDepositsResult.data[0].count),
          amount: parseFloat(pendingDepositsResult.data[0].amount)
        }
      : { count: 0, amount: 0 };

    // Get active positions count
    const activePositionsResult = await executeQuery(
      "SELECT COUNT(*) as count FROM positions WHERE status = 'OPEN'"
    );
    const activePositions = activePositionsResult.success && activePositionsResult.data.length > 0
      ? parseInt(activePositionsResult.data[0].count) : 0;

    // Get banned users count
    const bannedUsersResult = await executeQuery(
      "SELECT COUNT(*) as count FROM users WHERE is_banned = 1"
    );
    const bannedUsers = bannedUsersResult.success && bannedUsersResult.data.length > 0
      ? parseInt(bannedUsersResult.data[0].count) : 0;

    // Get total referrals
    const totalReferralsResult = await executeQuery(
      "SELECT COALESCE(SUM(total_referrals), 0) as count FROM users"
    );
    const totalReferrals = totalReferralsResult.success && totalReferralsResult.data.length > 0
      ? parseInt(totalReferralsResult.data[0].count) : 0;

    // Get MAM/PAMM accounts (currently 0, placeholder)
    const mamPammAccounts = 0;

    // Get trading volume (total value of open positions)
    const tradingVolumeResult = await executeQuery(
      "SELECT COALESCE(SUM(lot_size * entry_price * 100000), 0) as volume FROM positions WHERE status = 'OPEN'"
    );
    const tradingVolume = tradingVolumeResult.success && tradingVolumeResult.data.length > 0
      ? parseFloat(tradingVolumeResult.data[0].volume) : 0;

    // Get total brokerage/commission
    const totalBrokerageResult = await executeQuery(
      "SELECT COALESCE(SUM(commission), 0) as total FROM trading_history"
    );
    const totalBrokerage = totalBrokerageResult.success && totalBrokerageResult.data.length > 0
      ? parseFloat(totalBrokerageResult.data[0].total) : 0;

    // Get total swap charges
    const totalSwapResult = await executeQuery(
      "SELECT COALESCE(SUM(swap), 0) as total FROM trading_history"
    );
    const totalSwap = totalSwapResult.success && totalSwapResult.data.length > 0
      ? parseFloat(totalSwapResult.data[0].total) : 0;

    // Get total spread charges (calculate from positions)
    const totalSpreadResult = await executeQuery(
      `SELECT COALESCE(SUM(
        CASE 
          WHEN symbol IN ('EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'USDCAD') THEN lot_size * 0.00010 * 100000
          WHEN symbol LIKE '%JPY%' THEN lot_size * 0.01 * 100000
          WHEN symbol IN ('BTCUSD', 'ETHUSD') THEN lot_size * 10 * 100000
          WHEN symbol IN ('XAUUSD') THEN lot_size * 0.50 * 100000
          ELSE lot_size * 0.00010 * 100000
        END
      ), 0) as total FROM positions WHERE status = 'OPEN'`
    );
    const totalSpread = totalSpreadResult.success && totalSpreadResult.data.length > 0
      ? parseFloat(totalSpreadResult.data[0].total) : 0;

    const stats = {
      totalUsers: { count: totalUsers },
      totalBalance: { total_balance: totalBalance },
      pendingDeposits: pendingDeposits,
      totalPositions: { count: activePositions },
      bannedUsers: { count: bannedUsers },
      totalReferrals: { count: totalReferrals },
      mamPammAccounts: { count: mamPammAccounts },
      totalVolume: { volume: tradingVolume },
      totalBrokerage: { total: totalBrokerage },
      totalSwap: { total: totalSwap },
      totalSpread: { total: totalSpread }
    };

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

