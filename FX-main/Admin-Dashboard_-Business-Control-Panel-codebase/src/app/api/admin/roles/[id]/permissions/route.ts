import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rolePermissions, adminPermissions, adminRoles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = params.id;

    // Validate roleId is a valid integer
    if (!roleId || isNaN(parseInt(roleId))) {
      return NextResponse.json(
        { 
          error: "Valid role ID is required",
          code: "INVALID_ROLE_ID" 
        },
        { status: 400 }
      );
    }

    const roleIdInt = parseInt(roleId);

    // Check if role exists
    const role = await db.select()
      .from(adminRoles)
      .where(eq(adminRoles.id, roleIdInt))
      .limit(1);

    if (role.length === 0) {
      return NextResponse.json(
        { 
          error: "Role not found",
          code: "ROLE_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Get all permissions for this role with join
    const permissions = await db.select({
      id: adminPermissions.id,
      name: adminPermissions.name,
      description: adminPermissions.description,
      resource: adminPermissions.resource,
      action: adminPermissions.action,
      createdAt: adminPermissions.createdAt,
    })
      .from(rolePermissions)
      .innerJoin(adminPermissions, eq(rolePermissions.permissionId, adminPermissions.id))
      .where(eq(rolePermissions.roleId, roleIdInt));

    return NextResponse.json(permissions, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = params.id;

    // Validate roleId is a valid integer
    if (!roleId || isNaN(parseInt(roleId))) {
      return NextResponse.json(
        { 
          error: "Valid role ID is required",
          code: "INVALID_ROLE_ID" 
        },
        { status: 400 }
      );
    }

    const roleIdInt = parseInt(roleId);

    // Parse request body
    const body = await request.json();
    const { permissionIds } = body;

    // Validate permissionIds array is provided
    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      return NextResponse.json(
        { 
          error: "permissionIds array is required and must not be empty",
          code: "MISSING_PERMISSION_IDS" 
        },
        { status: 400 }
      );
    }

    // Validate all permissionIds are valid integers
    const invalidIds = permissionIds.filter(id => !Number.isInteger(id) || id <= 0);
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { 
          error: "All permission IDs must be valid positive integers",
          code: "INVALID_PERMISSION_IDS" 
        },
        { status: 400 }
      );
    }

    // Check if role exists
    const role = await db.select()
      .from(adminRoles)
      .where(eq(adminRoles.id, roleIdInt))
      .limit(1);

    if (role.length === 0) {
      return NextResponse.json(
        { 
          error: "Role not found",
          code: "ROLE_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Check if all permissions exist
    const existingPermissions = await db.select({ id: adminPermissions.id })
      .from(adminPermissions)
      .where(eq(adminPermissions.id, permissionIds[0]));

    for (const permissionId of permissionIds) {
      const permission = await db.select({ id: adminPermissions.id })
        .from(adminPermissions)
        .where(eq(adminPermissions.id, permissionId))
        .limit(1);

      if (permission.length === 0) {
        return NextResponse.json(
          { 
            error: `Permission with ID ${permissionId} not found`,
            code: "PERMISSION_NOT_FOUND" 
          },
          { status: 400 }
        );
      }
    }

    // Check for existing assignments to avoid duplicates
    const existingAssignments = await db.select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleIdInt));

    const existingPermissionIds = new Set(existingAssignments.map(a => a.permissionId));
    const newPermissionIds = permissionIds.filter(id => !existingPermissionIds.has(id));

    if (newPermissionIds.length === 0) {
      return NextResponse.json(
        { 
          error: "All permissions are already assigned to this role",
          code: "PERMISSIONS_ALREADY_ASSIGNED" 
        },
        { status: 400 }
      );
    }

    // Insert multiple rolePermissions records
    const createdAt = new Date().toISOString();
    const valuesToInsert = newPermissionIds.map(permissionId => ({
      roleId: roleIdInt,
      permissionId,
      createdAt,
    }));

    await db.insert(rolePermissions).values(valuesToInsert);

    return NextResponse.json(
      { 
        message: "Permissions assigned successfully",
        count: newPermissionIds.length,
        assignedPermissions: newPermissionIds
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleId = params.id;
    const { searchParams } = new URL(request.url);
    const permissionId = searchParams.get('permissionId');

    // Validate roleId is a valid integer
    if (!roleId || isNaN(parseInt(roleId))) {
      return NextResponse.json(
        { 
          error: "Valid role ID is required",
          code: "INVALID_ROLE_ID" 
        },
        { status: 400 }
      );
    }

    // Validate permissionId is provided and valid
    if (!permissionId || isNaN(parseInt(permissionId))) {
      return NextResponse.json(
        { 
          error: "Valid permission ID is required",
          code: "INVALID_PERMISSION_ID" 
        },
        { status: 400 }
      );
    }

    const roleIdInt = parseInt(roleId);
    const permissionIdInt = parseInt(permissionId);

    // Check if the rolePermission record exists
    const existingRecord = await db.select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleIdInt),
          eq(rolePermissions.permissionId, permissionIdInt)
        )
      )
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { 
          error: "Permission assignment not found for this role",
          code: "ASSIGNMENT_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Delete the rolePermissions record
    const deleted = await db.delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleIdInt),
          eq(rolePermissions.permissionId, permissionIdInt)
        )
      )
      .returning();

    return NextResponse.json(
      { 
        message: "Permission removed from role successfully",
        deletedRecord: deleted[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}