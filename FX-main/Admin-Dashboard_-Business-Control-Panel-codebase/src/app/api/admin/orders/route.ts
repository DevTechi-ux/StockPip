import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT
        th.id,
        th.user_id,
        th.account_id,
        th.symbol,
        th.side,
        th.lot_size,
        th.entry_price,
        th.exit_price,
        th.pnl,
        th.swap,
        th.commission,
        th.open_time,
        th.close_time,
        u.first_name,
        u.last_name,
        u.email,
        ta.account_number
      FROM trading_history th
      LEFT JOIN users u ON th.user_id = u.id
      LEFT JOIN trading_accounts ta ON th.account_id = ta.id
      ORDER BY th.close_time DESC
      LIMIT 100
    `);

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

