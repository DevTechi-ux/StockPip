import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/db';
import { executeQuery } from '@/lib/mysql';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const users = await getUsers();
    
    return NextResponse.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

