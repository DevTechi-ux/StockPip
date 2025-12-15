import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { is_active } = await request.json();

    const result = await executeQuery(
      "UPDATE bank_accounts SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [is_active ? 1 : 0, id]
    );

    if (result.success) {
      return NextResponse.json({ success: true, message: "Bank account status updated successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Failed to update bank account status" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating bank account status:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}





