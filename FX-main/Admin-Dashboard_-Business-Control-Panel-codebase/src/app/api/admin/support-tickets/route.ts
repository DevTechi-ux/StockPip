import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        st.*,
        u.first_name,
        u.last_name,
        u.email
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
      LIMIT 100
    `);

    if (result.success) {
      return NextResponse.json({
        success: true,
        tickets: result.data || []
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to fetch tickets" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, adminResponse, status, adminId } = body;

    if (!ticketId || !adminResponse) {
      return NextResponse.json(
        { success: false, error: "ticketId and adminResponse are required" },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE support_tickets 
      SET admin_response = ?, status = ?, admin_id = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await executeQuery(updateQuery, [
      adminResponse,
      status || 'resolved',
      adminId || 'admin-001',
      ticketId
    ]);

    if (result.success) {
      // Create notification for user
      const ticketResult = await executeQuery(
        'SELECT user_id FROM support_tickets WHERE id = ?',
        [ticketId]
      );

      if (ticketResult.success && ticketResult.data?.[0]) {
        await executeQuery(
          'INSERT INTO notifications (user_id, type, title, message, data, priority, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [
            ticketResult.data[0].user_id,
            'support',
            'Support Ticket Response',
            `Your support ticket has been ${status || 'resolved'}`,
            JSON.stringify({
              ticket_id: ticketId,
              status: status || 'resolved'
            }),
            'medium'
          ]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Ticket updated successfully"
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to update ticket" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error updating support ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

