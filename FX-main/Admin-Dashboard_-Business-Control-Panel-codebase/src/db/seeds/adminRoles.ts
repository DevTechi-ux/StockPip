import { db } from '@/db';
import { adminRoles } from '@/db/schema';

async function main() {
    const sampleRoles = [
        {
            name: 'Super Admin',
            level: 1,
            description: 'Full system access with all permissions',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Manager',
            level: 2,
            description: 'Manage operations and user activities',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Support',
            level: 3,
            description: 'Customer support and basic operations',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Viewer',
            level: 4,
            description: 'Read-only access to system information',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        }
    ];

    await db.insert(adminRoles).values(sampleRoles);
    
    console.log('✅ Admin roles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});