CREATE TABLE `admin_permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_permissions_name_unique` ON `admin_permissions` (`name`);--> statement-breakpoint
CREATE TABLE `admin_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`level` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_roles_name_unique` ON `admin_roles` (`name`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role_id` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`last_login` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `admin_roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `fund_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_name` text NOT NULL,
	`account_type` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fund_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`transaction_type` text NOT NULL,
	`amount` real NOT NULL,
	`from_account_id` integer,
	`to_account_id` integer,
	`description` text,
	`reference_id` text,
	`admin_id` integer,
	`status` text DEFAULT 'completed' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `fund_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer NOT NULL,
	`permission_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `admin_roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_id`) REFERENCES `admin_permissions`(`id`) ON UPDATE no action ON DELETE no action
);
