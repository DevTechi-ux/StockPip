import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { firstName, lastName, email, leverage, isActive, isBanned, banReason } = body;

    const fields = [];
    const values = [];

    if (firstName) { fields.push('first_name = ?'); values.push(firstName); }
    if (lastName) { fields.push('last_name = ?'); values.push(lastName); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (leverage) { fields.push('leverage = ?'); values.push(leverage); }
    if (typeof isActive === 'boolean') { fields.push('is_active = ?'); values.push(isActive ? 1 : 0); }
    if (typeof isBanned === 'boolean') { 
      fields.push('is_banned = ?'); 
      values.push(isBanned ? 1 : 0);
      fields.push('ban_reason = ?'); 
      values.push(banReason || null);
      fields.push('banned_at = ?'); 
      values.push(isBanned ? new Date() : null);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    fields.push('updated_at = NOW()');
    values.push(userId);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, values);

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'User updated successfully' : 'Failed to update user'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Delete (deactivate) user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const result = await executeQuery(
      'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'User deactivated successfully' : 'Failed to deactivate user'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}





