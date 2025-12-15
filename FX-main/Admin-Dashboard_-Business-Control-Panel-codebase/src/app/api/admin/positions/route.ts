import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function GET() {
  try {
    // First check if positions table exists
    const tableCheck = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'positions'
    `);

    const tableRows = Array.isArray(tableCheck.data)
      ? (tableCheck.data as Array<{ count: number }>)
      : [];

    if (!tableCheck.success || tableRows.length === 0 || tableRows[0].count === 0) {
      console.warn("Positions table does not exist, returning empty array");
      return NextResponse.json({ success: true, data: [] });
    }

    const result = await executeQuery(`
      SELECT
        p.id,
        p.user_id,
        p.account_id,
        p.symbol,
        p.side,
        p.lot_size,
        p.entry_price,
        COALESCE(p.current_price, p.entry_price) as current_price,
        p.stop_loss,
        p.take_profit,
        COALESCE(p.pnl, 0) as pnl,
        COALESCE(p.swap, 0) as swap,
        COALESCE(p.commission, 0) as commission,
        p.status,
        p.open_time,
        p.close_time,
        u.first_name,
        u.last_name,
        u.email,
        ta.account_number
      FROM positions p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN trading_accounts ta ON p.account_id = ta.id
      WHERE p.status = 'OPEN'
      ORDER BY p.open_time DESC
      LIMIT 100
    `);

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data || [] });
    } else {
      const errorResult = result as unknown as {
        error?: unknown;
        errorMessage?: string;
        code?: string;
      };

      const errorMessage =
        errorResult.error instanceof Error
          ? errorResult.error.message
          : typeof errorResult.error === "string"
          ? errorResult.error
          : errorResult.errorMessage || "Unknown database error";
      
      console.error("Database query failed:", {
        error: errorResult.error,
        errorMessage,
        code: errorResult.code
      });
      
      // Return empty array instead of error if table doesn't exist or query fails
      // This prevents the page from crashing
      if (errorMessage.includes("doesn't exist") || errorMessage.includes("Unknown table")) {
        console.warn("Table or column doesn't exist, returning empty array");
        return NextResponse.json({ success: true, data: [] });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage,
        message: "Failed to fetch positions from database"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error fetching positions:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
      ? error 
      : 'Unknown error occurred';
    
    // Return empty array on error to prevent page crash
    console.warn("Exception caught, returning empty array to prevent crash");
    return NextResponse.json({ 
      success: true, 
      data: [],
      warning: errorMessage
    });
  }
}

