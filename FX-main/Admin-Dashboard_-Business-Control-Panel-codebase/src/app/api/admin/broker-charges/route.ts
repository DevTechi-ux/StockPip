import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function GET() {
  try {
    const result = await executeQuery(
      "SELECT * FROM broker_charges ORDER BY charge_type, symbol"
    );
    
    if (result.success) {
      return NextResponse.json({ success: true, charges: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error fetching broker charges:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { charge_type, symbol, charge_value, charge_type_value, is_active } = body;
    
    const id = `charge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await executeQuery(
      `INSERT INTO broker_charges (id, charge_type, symbol, charge_value, charge_type_value, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, charge_type, symbol, charge_value, charge_type_value, is_active || true]
    );
    
    if (result.success) {
      return NextResponse.json({ success: true, message: "Charge created successfully" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error creating broker charge:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, charge_type, symbol, charge_value, charge_type_value, is_active } = body;
    
    const result = await executeQuery(
      `UPDATE broker_charges 
       SET charge_type = ?, symbol = ?, charge_value = ?, charge_type_value = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [charge_type, symbol, charge_value, charge_type_value, is_active, id]
    );
    
    if (result.success) {
      return NextResponse.json({ success: true, message: "Charge updated successfully" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error updating broker charge:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }
    
    const result = await executeQuery(
      "DELETE FROM broker_charges WHERE id = ?",
      [id]
    );
    
    if (result.success) {
      return NextResponse.json({ success: true, message: "Charge deleted successfully" });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error deleting broker charge:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

