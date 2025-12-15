import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { reason, adminId } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Check if request exists and is pending
    const requestResult = await executeQuery(
      `SELECT * FROM fund_requests WHERE id = ? AND status = 'PENDING'`,
      [requestId]
    );

    if (!requestResult.success || !Array.isArray(requestResult.data) || requestResult.data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Fund request not found or already processed' },
        { status: 404 }
      );
    }

    // Update fund request status to REJECTED
    const updateResult = await executeQuery(
      `UPDATE fund_requests 
       SET status = 'REJECTED',
           admin_notes = ?,
           processed_by = ?,
           processed_at = NOW()
       WHERE id = ?`,
      [reason || 'Request rejected by admin', adminId || 'admin-001', requestId]
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to reject fund request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fund request rejected successfully'
    });
  } catch (error: any) {
    console.error('Error rejecting fund request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reject fund request' },
      { status: 500 }
    );
  }
}

