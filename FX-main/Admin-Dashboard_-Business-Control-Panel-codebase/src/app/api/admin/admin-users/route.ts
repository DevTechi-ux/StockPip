import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminUsers, adminRoles } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GET method - List admin users or get single admin user by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Get single admin user by ID with role details
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const adminUser = await db.select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        roleId: adminUsers.roleId,
        status: adminUsers.status,
        lastLogin: adminUsers.lastLogin,
        createdAt: adminUsers.createdAt,
        updatedAt: adminUsers.updatedAt,
        role: {
          id: adminRoles.id,
          name: adminRoles.name,
          level: adminRoles.level,
        }
      })
        .from(adminUsers)
        .leftJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
        .where(eq(adminUsers.id, parseInt(id)))
        .limit(1);

      if (adminUser.length === 0) {
        return NextResponse.json({ 
          error: 'Admin user not found',
          code: 'USER_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(adminUser[0]);
    }

    // List all admin users with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const roleId = searchParams.get('roleId');

    let query = db.select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      roleId: adminUsers.roleId,
      status: adminUsers.status,
      lastLogin: adminUsers.lastLogin,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
      role: {
        id: adminRoles.id,
        name: adminRoles.name,
        level: adminRoles.level,
      }
    })
      .from(adminUsers)
      .leftJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id));

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(adminUsers.name, `%${search}%`),
          like(adminUsers.email, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(adminUsers.status, status));
    }

    if (roleId) {
      if (isNaN(parseInt(roleId))) {
        return NextResponse.json({ 
          error: "Valid roleId is required",
          code: "INVALID_ROLE_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(adminUsers.roleId, parseInt(roleId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(adminUsers.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

// POST method - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, roleId, status } = body;

    // Validate required fields
    if (!name || !email || !roleId) {
      return NextResponse.json({ 
        error: "Name, email, and roleId are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Validate roleId is a valid integer
    if (isNaN(parseInt(roleId))) {
      return NextResponse.json({ 
        error: "Valid roleId is required",
        code: "INVALID_ROLE_ID" 
      }, { status: 400 });
    }

    // Check if role exists
    const roleExists = await db.select()
      .from(adminRoles)
      .where(eq(adminRoles.id, parseInt(roleId)))
      .limit(1);

    if (roleExists.length === 0) {
      return NextResponse.json({ 
        error: "Role not found",
        code: "ROLE_NOT_FOUND" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const timestamp = new Date().toISOString();

    // Create new admin user
    const newAdminUser = await db.insert(adminUsers)
      .values({
        name: sanitizedName,
        email: sanitizedEmail,
        roleId: parseInt(roleId),
        status: status || 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    return NextResponse.json(newAdminUser[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation for email
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

// PUT method - Update admin user by ID
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if admin user exists
    const existingUser = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'Admin user not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, roleId, status, lastLogin } = body;

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (email !== undefined) {
      // Validate email format
      if (!isValidEmail(email)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (roleId !== undefined) {
      // Validate roleId is a valid integer
      if (isNaN(parseInt(roleId))) {
        return NextResponse.json({ 
          error: "Valid roleId is required",
          code: "INVALID_ROLE_ID" 
        }, { status: 400 });
      }

      // Check if role exists
      const roleExists = await db.select()
        .from(adminRoles)
        .where(eq(adminRoles.id, parseInt(roleId)))
        .limit(1);

      if (roleExists.length === 0) {
        return NextResponse.json({ 
          error: "Role not found",
          code: "ROLE_NOT_FOUND" 
        }, { status: 400 });
      }

      updates.roleId = parseInt(roleId);
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (lastLogin !== undefined) {
      updates.lastLogin = lastLogin;
    }

    // Update admin user
    const updated = await db.update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);

    // Handle unique constraint violation for email
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

// DELETE method - Delete admin user by ID
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if admin user exists
    const existingUser = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'Admin user not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete admin user
    const deleted = await db.delete(adminUsers)
      .where(eq(adminUsers.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Admin user deleted successfully',
      deletedUser: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}