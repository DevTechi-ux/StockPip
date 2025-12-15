import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function GET() {
  try {
    const result = await executeQuery(
      "SELECT * FROM bank_accounts WHERE is_active = 1 ORDER BY created_at DESC"
    );

    if (result.success) {
      return NextResponse.json({ success: true, accounts: result.data });
    } else {
      return NextResponse.json({ success: false, message: "Failed to fetch bank accounts" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { account_name, account_number, bank_name, bank_code, account_type, currency } = await request.json();

    if (!account_name || !account_number || !bank_name) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const id = `bank-${Date.now()}`;
    const result = await executeQuery(
      `INSERT INTO bank_accounts (id, account_name, account_number, bank_name, bank_code, account_type, currency, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, account_name, account_number, bank_name, bank_code || '', account_type || 'BUSINESS', currency || 'USD']
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: "Bank account created successfully", id });
    } else {
      return NextResponse.json({ success: false, message: "Failed to create bank account" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating bank account:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}





