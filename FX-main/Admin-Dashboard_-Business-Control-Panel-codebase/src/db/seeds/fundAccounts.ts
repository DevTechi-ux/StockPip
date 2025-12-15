import { db } from '@/db';
import { fundAccounts } from '@/db/schema';

async function main() {
    const sampleFundAccounts = [
        {
            accountName: 'Operating Account',
            accountType: 'operating',
            balance: 500000,
            currency: 'USD',
            status: 'active',
            description: 'Primary operating account for daily transactions',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            accountName: 'Reserve Account',
            accountType: 'reserve',
            balance: 1000000,
            currency: 'USD',
            status: 'active',
            description: 'Reserve fund for business continuity',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            accountName: 'Commission Account',
            accountType: 'commission',
            balance: 50000,
            currency: 'USD',
            status: 'active',
            description: 'Trading commissions and fees collection',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        }
    ];

    await db.insert(fundAccounts).values(sampleFundAccounts);
    
    console.log('✅ Fund accounts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});