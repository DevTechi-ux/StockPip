import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fundAccounts } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

const VALID_ACCOUNT_TYPES = ['operating', 'reserve', 'commission'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const account = await db
        .select()
        .from(fundAccounts)
        .where(eq(fundAccounts.id, parseInt(id)))
        .limit(1);

      if (account.length === 0) {
        return NextResponse.json(
          { error: 'Fund account not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(account[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const accountType = searchParams.get('accountType');
    const status = searchParams.get('status');

    let query = db.select().from(fundAccounts);

    const conditions = [];

    // Search condition
    if (search) {
      conditions.push(
        or(
          like(fundAccounts.accountName, `%${search}%`),
          like(fundAccounts.description, `%${search}%`)
        )
      );
    }

    // Filter by accountType
    if (accountType) {
      conditions.push(eq(fundAccounts.accountType, accountType));
    }

    // Filter by status
    if (status) {
      conditions.push(eq(fundAccounts.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountName, accountType, balance, currency, status, description } = body;

    // Validate required fields
    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required', code: 'MISSING_ACCOUNT_NAME' },
        { status: 400 }
      );
    }

    if (!accountType) {
      return NextResponse.json(
        { error: 'Account type is required', code: 'MISSING_ACCOUNT_TYPE' },
        { status: 400 }
      );
    }

    // Validate accountType value
    if (!VALID_ACCOUNT_TYPES.includes(accountType)) {
      return NextResponse.json(
        {
          error: `Account type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}`,
          code: 'INVALID_ACCOUNT_TYPE',
        },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults
    const timestamp = new Date().toISOString();
    const insertData = {
      accountName: accountName.trim(),
      accountType,
      balance: balance !== undefined ? balance : 0,
      currency: currency || 'USD',
      status: status || 'active',
      description: description?.trim() || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const newAccount = await db.insert(fundAccounts).values(insertData).returning();

    return NextResponse.json(newAccount[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(fundAccounts)
      .where(eq(fundAccounts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Fund account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { accountName, accountType, status, description } = body;

    // Validate accountType if provided
    if (accountType && !VALID_ACCOUNT_TYPES.includes(accountType)) {
      return NextResponse.json(
        {
          error: `Account type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}`,
          code: 'INVALID_ACCOUNT_TYPE',
        },
        { status: 400 }
      );
    }

    // Prepare update data (only allowed fields)
    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (accountName !== undefined) {
      updateData.accountName = accountName.trim();
    }

    if (accountType !== undefined) {
      updateData.accountType = accountType;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const updated = await db
      .update(fundAccounts)
      .set(updateData)
      .where(eq(fundAccounts.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(fundAccounts)
      .where(eq(fundAccounts.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Fund account not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if balance is zero
    if (existing[0].balance !== 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete account with non-zero balance',
          code: 'ACCOUNT_HAS_BALANCE',
        },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(fundAccounts)
      .where(eq(fundAccounts.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Fund account deleted successfully',
        account: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}