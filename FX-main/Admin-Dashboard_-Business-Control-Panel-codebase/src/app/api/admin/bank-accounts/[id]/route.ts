import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { account_name, account_number, bank_name, bank_code, account_type, currency } = body;

    const result = await executeQuery(
      `UPDATE bank_accounts SET 
       account_name = ?, account_number = ?, bank_name = ?, bank_code = ?, 
       account_type = ?, currency = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [account_name, account_number, bank_name, bank_code, account_type, currency, id]
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: "Bank account updated successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Failed to update bank account" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating bank account:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await executeQuery(
      "DELETE FROM bank_accounts WHERE id = ?",
      [id]
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: "Bank account deleted successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Failed to delete bank account" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}





