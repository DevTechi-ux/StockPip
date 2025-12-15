import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

function validateId(id: string | string[] | undefined) {
  if (typeof id !== "string" || id.trim() === "") {
    return null;
  }
  return id.trim();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = validateId(params?.id);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Valid position ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { current_price, status } = body ?? {};

    const updates: string[] = [];
    const values: any[] = [];

    if (current_price !== undefined && current_price !== null && current_price !== "") {
      const parsedPrice = parseFloat(current_price);
      if (Number.isNaN(parsedPrice)) {
        return NextResponse.json(
          { success: false, message: "current_price must be a number" },
          { status: 400 }
        );
      }
      updates.push("current_price = ?");
      values.push(parsedPrice);
    }

    if (status !== undefined && status !== null && status !== "") {
      updates.push("status = ?");
      values.push(String(status).toUpperCase());

      if (String(status).toUpperCase() === "CLOSED") {
        updates.push("close_time = NOW()");
      } else {
        updates.push("close_time = NULL");
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields provided for update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE positions
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    values.push(id);

    const result = await executeQuery(query, values);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.errorMessage || "Failed to update position",
        },
        { status: 500 }
      );
    }

    const affectedRows = (result.data as any)?.affectedRows ?? 0;

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Position not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Position updated successfully",
    });
  } catch (error) {
    console.error("Error updating position:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected error updating position" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = validateId(params?.id);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Valid position ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await executeQuery(
      "DELETE FROM positions WHERE id = ?",
      [id]
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.errorMessage || "Failed to delete position",
        },
        { status: 500 }
      );
    }

    const affectedRows = (result.data as any)?.affectedRows ?? 0;

    if (affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Position not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Position deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting position:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected error deleting position" },
      { status: 500 }
    );
  }
}


