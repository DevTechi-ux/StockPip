import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Admin Roles table
export const adminRoles = sqliteTable('admin_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  level: integer('level').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Admin Permissions table
export const adminPermissions = sqliteTable('admin_permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  createdAt: text('created_at').notNull(),
});

// Role Permissions junction table
export const rolePermissions = sqliteTable('role_permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roleId: integer('role_id').notNull().references(() => adminRoles.id),
  permissionId: integer('permission_id').notNull().references(() => adminPermissions.id),
  createdAt: text('created_at').notNull(),
});

// Admin Users table
export const adminUsers = sqliteTable('admin_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  roleId: integer('role_id').notNull().references(() => adminRoles.id),
  status: text('status').notNull().default('active'),
  lastLogin: text('last_login'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Fund Accounts table
export const fundAccounts = sqliteTable('fund_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountName: text('account_name').notNull(),
  accountType: text('account_type').notNull(),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('active'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Fund Transactions table
export const fundTransactions = sqliteTable('fund_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').notNull().references(() => fundAccounts.id),
  transactionType: text('transaction_type').notNull(),
  amount: real('amount').notNull(),
  fromAccountId: integer('from_account_id'),
  toAccountId: integer('to_account_id'),
  description: text('description'),
  referenceId: text('reference_id'),
  adminId: integer('admin_id').references(() => adminUsers.id),
  status: text('status').notNull().default('completed'),
  createdAt: text('created_at').notNull(),
});