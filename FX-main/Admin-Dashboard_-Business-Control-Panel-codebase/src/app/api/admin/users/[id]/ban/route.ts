import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { ban, reason } = await request.json();

    const result = await executeQuery(
      'UPDATE users SET is_banned = ?, ban_reason = ?, banned_at = ?, updated_at = NOW() WHERE id = ?',
      [ban ? 1 : 0, reason || null, ban ? new Date() : null, userId]
    );

    return NextResponse.json({
      success: result.success,
      message: result.success ? `User ${ban ? 'banned' : 'unbanned'} successfully` : 'Failed to update user status'
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}





