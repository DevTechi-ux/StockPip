import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status field is required
    if (!status) {
      return NextResponse.json(
        {
          error: 'Status field is required',
          code: 'MISSING_REQUIRED_FIELD',
        },
        { status: 400 }
      );
    }

    // Validate status value is either "active" or "inactive"
    if (status !== 'active' && status !== 'inactive') {
      return NextResponse.json(
        {
          error: 'Status must be either "active" or "inactive"',
          code: 'INVALID_STATUS_VALUE',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        {
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = await db
      .update(adminUsers)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(adminUsers.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update user',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}