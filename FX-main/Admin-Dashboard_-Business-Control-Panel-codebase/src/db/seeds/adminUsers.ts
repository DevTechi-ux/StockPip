import { db } from '@/db';
import { adminUsers } from '@/db/schema';

async function main() {
    const sampleAdminUsers = [
        {
            name: 'John Admin',
            email: 'john.admin@example.com',
            roleId: 1,
            status: 'active',
            lastLogin: new Date('2024-01-20T14:30:00').toISOString(),
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Sarah Manager',
            email: 'sarah.manager@example.com',
            roleId: 2,
            status: 'active',
            lastLogin: new Date('2024-01-19T09:15:00').toISOString(),
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-19').toISOString(),
        },
        {
            name: 'Mike Support',
            email: 'mike.support@example.com',
            roleId: 3,
            status: 'active',
            lastLogin: null,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
    ];

    await db.insert(adminUsers).values(sampleAdminUsers);
    
    console.log('✅ Admin users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});