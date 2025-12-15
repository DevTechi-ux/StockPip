import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminPermissions } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

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

      const permission = await db
        .select()
        .from(adminPermissions)
        .where(eq(adminPermissions.id, parseInt(id)))
        .limit(1);

      if (permission.length === 0) {
        return NextResponse.json(
          { error: 'Permission not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(permission[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const resource = searchParams.get('resource');
    const action = searchParams.get('action');

    let query = db.select().from(adminPermissions);

    // Build conditions array
    const conditions = [];

    // Search across name, description, and resource
    if (search) {
      conditions.push(
        or(
          like(adminPermissions.name, `%${search}%`),
          like(adminPermissions.description, `%${search}%`),
          like(adminPermissions.resource, `%${search}%`)
        )
      );
    }

    // Filter by resource
    if (resource) {
      conditions.push(eq(adminPermissions.resource, resource));
    }

    // Filter by action
    if (action) {
      conditions.push(eq(adminPermissions.action, action));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, resource, action } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!resource || typeof resource !== 'string' || resource.trim() === '') {
      return NextResponse.json(
        { error: 'Resource is required', code: 'MISSING_RESOURCE' },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string' || action.trim() === '') {
      return NextResponse.json(
        { error: 'Action is required', code: 'MISSING_ACTION' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      resource: resource.trim(),
      action: action.trim(),
      createdAt: new Date().toISOString(),
    };

    const newPermission = await db
      .insert(adminPermissions)
      .values(insertData)
      .returning();

    return NextResponse.json(newPermission[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Permission with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, resource, action } = body;

    // Check if permission exists
    const existingPermission = await db
      .select()
      .from(adminPermissions)
      .where(eq(adminPermissions.id, parseInt(id)))
      .limit(1);

    if (existingPermission.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }

    if (resource !== undefined) {
      if (typeof resource !== 'string' || resource.trim() === '') {
        return NextResponse.json(
          { error: 'Resource must be a non-empty string', code: 'INVALID_RESOURCE' },
          { status: 400 }
        );
      }
      updateData.resource = resource.trim();
    }

    if (action !== undefined) {
      if (typeof action !== 'string' || action.trim() === '') {
        return NextResponse.json(
          { error: 'Action must be a non-empty string', code: 'INVALID_ACTION' },
          { status: 400 }
        );
      }
      updateData.action = action.trim();
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(adminPermissions)
      .set(updateData)
      .where(eq(adminPermissions.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);

    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Permission with this name already exists', code: 'DUPLICATE_NAME' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if permission exists
    const existingPermission = await db
      .select()
      .from(adminPermissions)
      .where(eq(adminPermissions.id, parseInt(id)))
      .limit(1);

    if (existingPermission.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(adminPermissions)
      .where(eq(adminPermissions.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Permission deleted successfully',
        permission: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);

    // Handle foreign key constraint violation
    if ((error as Error).message.includes('FOREIGN KEY constraint failed')) {
      return NextResponse.json(
        { 
          error: 'Cannot delete permission: it is assigned to one or more roles', 
          code: 'FOREIGN_KEY_VIOLATION' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}