import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminRoles, rolePermissions } from '@/db/schema';
import { eq, like, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single role by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const role = await db
        .select()
        .from(adminRoles)
        .where(eq(adminRoles.id, parseInt(id)))
        .limit(1);

      if (role.length === 0) {
        return NextResponse.json(
          { error: 'Role not found', code: 'ROLE_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(role[0], { status: 200 });
    }

    // List all roles with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    // Build query with permissions count
    let query = db
      .select({
        id: adminRoles.id,
        name: adminRoles.name,
        description: adminRoles.description,
        level: adminRoles.level,
        createdAt: adminRoles.createdAt,
        updatedAt: adminRoles.updatedAt,
        permissionsCount: sql<number>`COALESCE(COUNT(DISTINCT ${rolePermissions.id}), 0)`,
      })
      .from(adminRoles)
      .leftJoin(rolePermissions, eq(adminRoles.id, rolePermissions.roleId))
      .groupBy(adminRoles.id);

    // Apply search filter if provided
    if (search) {
      const roles = await db
        .select({
          id: adminRoles.id,
          name: adminRoles.name,
          description: adminRoles.description,
          level: adminRoles.level,
          createdAt: adminRoles.createdAt,
          updatedAt: adminRoles.updatedAt,
          permissionsCount: sql<number>`COALESCE(COUNT(DISTINCT ${rolePermissions.id}), 0)`,
        })
        .from(adminRoles)
        .leftJoin(rolePermissions, eq(adminRoles.id, rolePermissions.roleId))
        .where(
          or(
            like(adminRoles.name, `%${search}%`),
            like(adminRoles.description, `%${search}%`)
          )
        )
        .groupBy(adminRoles.id)
        .limit(limit)
        .offset(offset);

      return NextResponse.json(roles, { status: 200 });
    }

    const roles = await query.limit(limit).offset(offset);

    return NextResponse.json(roles, { status: 200 });
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
    const { name, description, level } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (level === undefined || level === null) {
      return NextResponse.json(
        { error: 'Level is required', code: 'MISSING_LEVEL' },
        { status: 400 }
      );
    }

    if (typeof level !== 'number' || isNaN(level)) {
      return NextResponse.json(
        { error: 'Level must be a valid number', code: 'INVALID_LEVEL' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();

    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Name cannot be empty', code: 'EMPTY_NAME' },
        { status: 400 }
      );
    }

    // Create role with auto-generated timestamps
    const newRole = await db
      .insert(adminRoles)
      .values({
        name: sanitizedName,
        description: description?.trim() || null,
        level: level,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newRole[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Role name already exists', code: 'DUPLICATE_NAME' },
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await db
      .select()
      .from(adminRoles)
      .where(eq(adminRoles.id, parseInt(id)))
      .limit(1);

    if (existingRole.length === 0) {
      return NextResponse.json(
        { error: 'Role not found', code: 'ROLE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, level } = body;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      const sanitizedName = name.trim();
      if (!sanitizedName) {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'EMPTY_NAME' },
          { status: 400 }
        );
      }
      updates.name = sanitizedName;
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (level !== undefined) {
      if (typeof level !== 'number' || isNaN(level)) {
        return NextResponse.json(
          { error: 'Level must be a valid number', code: 'INVALID_LEVEL' },
          { status: 400 }
        );
      }
      updates.level = level;
    }

    // Update role
    const updatedRole = await db
      .update(adminRoles)
      .set(updates)
      .where(eq(adminRoles.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedRole[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);

    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Role name already exists', code: 'DUPLICATE_NAME' },
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await db
      .select()
      .from(adminRoles)
      .where(eq(adminRoles.id, parseInt(id)))
      .limit(1);

    if (existingRole.length === 0) {
      return NextResponse.json(
        { error: 'Role not found', code: 'ROLE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete role
    const deletedRole = await db
      .delete(adminRoles)
      .where(eq(adminRoles.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Role deleted successfully',
        role: deletedRole[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);

    // Handle foreign key constraint violation
    if ((error as Error).message.includes('FOREIGN KEY constraint failed')) {
      return NextResponse.json(
        {
          error: 'Cannot delete role with associated records',
          code: 'FOREIGN_KEY_CONSTRAINT',
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