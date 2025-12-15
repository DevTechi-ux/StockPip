import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch fund requests from database with user details
    const result = await executeQuery(`
      SELECT 
        fr.id,
        fr.user_id,
        fr.account_id,
        fr.request_type,
        fr.amount,
        fr.currency,
        fr.payment_method,
        fr.bank_account_id,
        fr.transaction_id,
        fr.screenshot_url,
        fr.status,
        fr.admin_notes,
        fr.processed_by,
        fr.processed_at,
        fr.created_at,
        u.first_name,
        u.last_name,
        u.email,
        ba.bank_name
      FROM fund_requests fr
      LEFT JOIN users u ON fr.user_id = u.id
      LEFT JOIN bank_accounts ba ON fr.bank_account_id = ba.id
      ORDER BY fr.created_at DESC
      LIMIT 100
    `);

    if (result.success) {
      return NextResponse.json({
        success: true,
        requests: result.data
      });
    } else {
      console.error('Database error:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching fund requests:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fund requests'
    }, { status: 500 });
  }
}

