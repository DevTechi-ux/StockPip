import { db } from '@/db';
import { rolePermissions } from '@/db/schema';

async function main() {
    const sampleRolePermissions = [
        {
            roleId: 1,
            permissionId: 1,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 2,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 3,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 4,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 5,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 6,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 7,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 8,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 9,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 10,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 11,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 12,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 13,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 14,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 15,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 16,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 17,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 18,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 19,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 20,
            createdAt: new Date().toISOString(),
        },
        {
            roleId: 1,
            permissionId: 21,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(rolePermissions).values(sampleRolePermissions);
    
    console.log('✅ Role permissions seeder completed successfully - Assigned all 21 permissions to Super Admin role');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});