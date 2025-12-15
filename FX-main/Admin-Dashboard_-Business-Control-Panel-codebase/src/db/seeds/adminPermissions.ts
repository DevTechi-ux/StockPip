import { db } from '@/db';
import { adminPermissions } from '@/db/schema';

async function main() {
    const samplePermissions = [
        {
            name: 'users.read',
            description: 'View user information',
            resource: 'users',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'users.write',
            description: 'Create and edit users',
            resource: 'users',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'users.delete',
            description: 'Delete users',
            resource: 'users',
            action: 'delete',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'transactions.read',
            description: 'View transactions',
            resource: 'transactions',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'transactions.write',
            description: 'Create and modify transactions',
            resource: 'transactions',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'wallets.read',
            description: 'View wallet information',
            resource: 'wallets',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'wallets.write',
            description: 'Manage wallets',
            resource: 'wallets',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'instruments.read',
            description: 'View trading instruments',
            resource: 'instruments',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'instruments.write',
            description: 'Manage trading instruments',
            resource: 'instruments',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'orders.read',
            description: 'View orders',
            resource: 'orders',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'orders.write',
            description: 'Create and manage orders',
            resource: 'orders',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'kyc.read',
            description: 'View KYC submissions',
            resource: 'kyc',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'kyc.approve',
            description: 'Approve or reject KYC',
            resource: 'kyc',
            action: 'approve',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'settings.read',
            description: 'View system settings',
            resource: 'settings',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'settings.write',
            description: 'Modify system settings',
            resource: 'settings',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'roles.read',
            description: 'View roles and permissions',
            resource: 'roles',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'roles.write',
            description: 'Manage roles and permissions',
            resource: 'roles',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'funds.read',
            description: 'View fund accounts',
            resource: 'funds',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'funds.write',
            description: 'Manage fund accounts and transactions',
            resource: 'funds',
            action: 'write',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'reports.read',
            description: 'View reports and analytics',
            resource: 'reports',
            action: 'read',
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'reports.export',
            description: 'Export reports',
            resource: 'reports',
            action: 'export',
            createdAt: new Date('2024-01-01').toISOString(),
        },
    ];

    await db.insert(adminPermissions).values(samplePermissions);
    
    console.log('✅ Admin permissions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});