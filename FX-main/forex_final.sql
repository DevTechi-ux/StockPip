-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 17, 2025 at 07:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `forex_final`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `user_id` varchar(36) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `last_admin_action` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`user_id`, `role`, `permissions`, `last_admin_action`) VALUES
('admin-001', 'super_admin', '{\"all\": true, \"users\": true, \"trading\": true, \"settings\": true}', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `key_name` varchar(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `secret_key` varchar(255) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_active` tinyint(1) DEFAULT 1,
  `last_used` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` varchar(36) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` varchar(100) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `bank_code` varchar(50) DEFAULT NULL,
  `swift_code` varchar(20) DEFAULT NULL,
  `routing_number` varchar(50) DEFAULT NULL,
  `account_type` enum('SAVINGS','CHECKING','BUSINESS') DEFAULT 'SAVINGS',
  `currency` varchar(10) DEFAULT 'USD',
  `country` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `account_name`, `account_number`, `bank_name`, `bank_code`, `swift_code`, `routing_number`, `account_type`, `currency`, `country`, `is_active`, `created_at`, `updated_at`) VALUES
('bank-001', 'VentaBlack Trading Account', '1234567890', 'Chase Bank', NULL, NULL, NULL, 'BUSINESS', 'USD', 'United States', 1, '2025-12-15 07:06:43', '2025-12-15 07:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `copy_trading_followers`
--

CREATE TABLE `copy_trading_followers` (
  `id` varchar(36) NOT NULL,
  `master_user_id` varchar(36) NOT NULL,
  `follower_user_id` varchar(36) NOT NULL,
  `copy_multiplier` decimal(5,2) DEFAULT 1.00,
  `max_lot_size` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `copy_trading_signals`
--

CREATE TABLE `copy_trading_signals` (
  `id` varchar(36) NOT NULL,
  `master_user_id` varchar(36) NOT NULL,
  `signal_type` enum('BUY','SELL','CLOSE') NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `lot_size` decimal(10,2) NOT NULL,
  `price` decimal(20,5) DEFAULT NULL,
  `stop_loss` decimal(20,5) DEFAULT NULL,
  `take_profit` decimal(20,5) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fund_requests`
--

CREATE TABLE `fund_requests` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `request_type` enum('DEPOSIT','WITHDRAWAL') NOT NULL,
  `amount` decimal(20,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `payment_method` enum('BANK_TRANSFER','CREDIT_CARD','CRYPTO','OTHER') DEFAULT 'BANK_TRANSFER',
  `bank_account_id` varchar(36) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `screenshot_url` varchar(500) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','PROCESSING') DEFAULT 'PENDING',
  `admin_notes` text DEFAULT NULL,
  `processed_by` varchar(36) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ib_accounts`
--

CREATE TABLE `ib_accounts` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `referral_code` varchar(50) NOT NULL,
  `ib_name` varchar(255) NOT NULL,
  `ib_level` int(11) DEFAULT 1,
  `parent_ib_id` varchar(36) DEFAULT NULL,
  `commission_type` enum('per_lot','spread_share','profit_share') DEFAULT 'per_lot',
  `commission_rate` decimal(5,2) DEFAULT 5.00,
  `status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
  `is_active` tinyint(1) DEFAULT 1,
  `total_earnings` decimal(20,2) DEFAULT 0.00,
  `pending_earnings` decimal(20,2) DEFAULT 0.00,
  `total_clients` int(11) DEFAULT 0,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(36) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ib_accounts`
--

INSERT INTO `ib_accounts` (`id`, `user_id`, `referral_code`, `ib_name`, `ib_level`, `parent_ib_id`, `commission_type`, `commission_rate`, `status`, `is_active`, `total_earnings`, `pending_earnings`, `total_clients`, `approved_at`, `approved_by`, `admin_notes`, `created_at`, `updated_at`) VALUES
('5aae3eda-baf3-49fa-9be8-5b0465e5fd93', 'e12858abacddf4e05598519ab560e8db', 'IB17659147034228Z7E1', 'techi', 1, NULL, 'per_lot', 5.00, 'approved', 1, 0.00, 0.00, 1, '2025-12-16 20:12:30', 'e12858abacddf4e05598519ab560e8db', NULL, '2025-12-16 19:51:43', '2025-12-16 20:28:42'),
('63e8ee49-8584-4fc0-a106-4c68a24293fa', '4037fe86a12d79a05734605791a21879', 'IB1765913902348D0JOI', 'broker', 1, NULL, 'per_lot', 5.00, 'approved', 1, 0.00, 0.00, 0, '2025-12-16 20:44:19', 'e12858abacddf4e05598519ab560e8db', NULL, '2025-12-16 19:38:22', '2025-12-16 20:44:19');

-- --------------------------------------------------------

--
-- Table structure for table `ib_commissions`
--

CREATE TABLE `ib_commissions` (
  `id` varchar(36) NOT NULL,
  `ib_id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `trade_id` varchar(36) DEFAULT NULL,
  `position_id` varchar(36) DEFAULT NULL,
  `commission_type` enum('per_lot','spread_share','profit_share') NOT NULL,
  `lot_size` decimal(10,2) NOT NULL,
  `spread_value` decimal(20,8) DEFAULT NULL,
  `profit_amount` decimal(20,2) DEFAULT NULL,
  `commission_rate` decimal(5,2) NOT NULL,
  `commission_amount` decimal(20,2) NOT NULL,
  `level` int(11) DEFAULT 1,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ib_referrals`
--

CREATE TABLE `ib_referrals` (
  `id` varchar(36) NOT NULL,
  `ib_id` varchar(36) NOT NULL,
  `referred_user_id` varchar(36) NOT NULL,
  `referral_code` varchar(50) NOT NULL,
  `total_trades` int(11) DEFAULT 0,
  `total_lots` decimal(10,2) DEFAULT 0.00,
  `total_commission` decimal(20,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ib_referrals`
--

INSERT INTO `ib_referrals` (`id`, `ib_id`, `referred_user_id`, `referral_code`, `total_trades`, `total_lots`, `total_commission`, `created_at`) VALUES
('a48b8a58cf2a4ca5dcfb88eed6e4eca0', '5aae3eda-baf3-49fa-9be8-5b0465e5fd93', '4467ea0822d8b6d5df012f2b6d9bbf5b', 'IB17659147034228Z7E1', 0, 0.00, 0.00, '2025-12-16 20:26:09');

-- --------------------------------------------------------

--
-- Table structure for table `ib_settings`
--

CREATE TABLE `ib_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ib_settings`
--

INSERT INTO `ib_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES
(1, 'default_commission_rate', '5.00', 'Default commission rate for new IBs', '2025-12-15 07:06:43', '2025-12-15 07:06:43'),
(2, 'max_ib_levels', '2', 'Maximum IB levels allowed', '2025-12-15 07:06:43', '2025-12-15 07:06:43'),
(3, 'min_withdrawal_amount', '50.00', 'Minimum withdrawal amount for IBs', '2025-12-15 07:06:43', '2025-12-15 07:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `ib_withdrawals`
--

CREATE TABLE `ib_withdrawals` (
  `id` varchar(36) NOT NULL,
  `ib_id` varchar(36) NOT NULL,
  `amount` decimal(20,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `withdrawal_method` enum('BANK_TRANSFER','CRYPTO','OTHER') DEFAULT 'BANK_TRANSFER',
  `bank_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bank_details`)),
  `status` enum('pending','approved','rejected','paid') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mam_pamm_accounts`
--

CREATE TABLE `mam_pamm_accounts` (
  `id` varchar(36) NOT NULL,
  `master_user_id` varchar(36) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_type` enum('MAM','PAMM') NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `total_balance` decimal(20,2) DEFAULT 0.00,
  `master_balance` decimal(20,2) DEFAULT 0.00,
  `investor_balance` decimal(20,2) DEFAULT 0.00,
  `master_profit_share` decimal(5,2) DEFAULT 20.00,
  `investor_profit_share` decimal(5,2) DEFAULT 80.00,
  `max_investors` int(11) DEFAULT 100,
  `min_investment` decimal(20,2) DEFAULT 100.00,
  `max_investment` decimal(20,2) DEFAULT 100000.00,
  `is_active` tinyint(1) DEFAULT 1,
  `is_public` tinyint(1) DEFAULT 1,
  `is_admin_approved` tinyint(1) DEFAULT 0,
  `admin_approved_at` timestamp NULL DEFAULT NULL,
  `admin_approved_by` varchar(36) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `risk_level` enum('LOW','MEDIUM','HIGH','VERY_HIGH') DEFAULT 'MEDIUM',
  `strategy_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mam_pamm_investors`
--

CREATE TABLE `mam_pamm_investors` (
  `id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `investor_user_id` varchar(36) NOT NULL,
  `investment_amount` decimal(20,2) NOT NULL,
  `current_balance` decimal(20,2) DEFAULT 0.00,
  `total_profit` decimal(20,2) DEFAULT 0.00,
  `total_loss` decimal(20,2) DEFAULT 0.00,
  `copy_multiplier` decimal(5,2) DEFAULT 1.00,
  `is_active` tinyint(1) DEFAULT 1,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `left_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mam_pamm_trades`
--

CREATE TABLE `mam_pamm_trades` (
  `id` varchar(36) NOT NULL,
  `mam_account_id` varchar(36) NOT NULL,
  `master_user_id` varchar(36) NOT NULL,
  `master_trade_id` varchar(36) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `side` enum('BUY','SELL') NOT NULL,
  `lot_size` decimal(10,2) NOT NULL,
  `entry_price` decimal(20,8) NOT NULL,
  `exit_price` decimal(20,8) DEFAULT NULL,
  `stop_loss` decimal(20,8) DEFAULT NULL,
  `take_profit` decimal(20,8) DEFAULT NULL,
  `leverage` int(11) DEFAULT 500,
  `profit_loss` decimal(20,2) DEFAULT 0.00,
  `commission` decimal(20,2) DEFAULT 0.00,
  `net_profit_loss` decimal(20,2) DEFAULT 0.00,
  `trade_type` enum('OPEN','CLOSE') NOT NULL,
  `status` enum('OPEN','CLOSED','PARTIALLY_CLOSED') DEFAULT 'OPEN',
  `opened_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` enum('trade','deposit','withdrawal','system','price_alert','order_update') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `is_sent` tinyint(1) DEFAULT 0,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `is_sent`, `priority`, `created_at`, `read_at`) VALUES
(1, 'e12858abacddf4e05598519ab560e8db', 'system', 'Welcome to VentaBlack Trading!', 'Welcome Demo Admin! Your trading account ACC-E12858AB has been created successfully. You can now start trading with us.', '{\"account_number\":\"ACC-E12858AB\",\"account_id\":\"ta-e12858abacddf4e05598519ab560e8db\",\"initial_balance\":0,\"leverage\":500,\"currency\":\"USD\"}', 0, 0, 'high', '2025-12-15 07:18:28', NULL),
(2, '4037fe86a12d79a05734605791a21879', 'system', 'Welcome to VentaBlack Trading!', 'Welcome john demo! Your trading account ACC-4037FE86 has been created successfully. You can now start trading with us.', '{\"account_number\":\"ACC-4037FE86\",\"account_id\":\"ta-4037fe86a12d79a05734605791a21879\",\"initial_balance\":0,\"leverage\":500,\"currency\":\"USD\"}', 0, 0, 'high', '2025-12-15 10:27:53', NULL),
(3, '4037fe86a12d79a05734605791a21879', 'deposit', 'Funds Added to Your Account', '$100.00 has been added to your trading account. Your new balance is $100.00.', '{\"transaction_id\":\"30a56487e03a7f4970807207ce7d8ac6\",\"amount\":100,\"balance_before\":0,\"balance_after\":100,\"type\":\"admin_deposit\"}', 0, 0, 'medium', '2025-12-16 18:58:14', NULL),
(8, '4467ea0822d8b6d5df012f2b6d9bbf5b', 'system', 'Welcome to VentaBlack Trading!', 'Welcome IB demo! Your trading account ACC-4467EA08 has been created successfully. You can now start trading with us.', '{\"account_number\":\"ACC-4467EA08\",\"account_id\":\"ta-4467ea0822d8b6d5df012f2b6d9bbf5b\",\"initial_balance\":0,\"leverage\":500,\"currency\":\"USD\"}', 0, 0, 'high', '2025-12-16 20:26:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `order_type` enum('MARKET','LIMIT','STOP','STOP_LIMIT') NOT NULL,
  `side` enum('BUY','SELL') NOT NULL,
  `lot_size` decimal(10,2) NOT NULL,
  `price` decimal(20,8) DEFAULT NULL,
  `stop_price` decimal(20,8) DEFAULT NULL,
  `stop_loss` decimal(20,8) DEFAULT NULL,
  `take_profit` decimal(20,8) DEFAULT NULL,
  `status` enum('PENDING','FILLED','CANCELLED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `side` enum('BUY','SELL') NOT NULL,
  `lot_size` decimal(10,2) NOT NULL,
  `entry_price` decimal(20,8) NOT NULL,
  `current_price` decimal(20,8) DEFAULT NULL,
  `stop_loss` decimal(20,8) DEFAULT NULL,
  `take_profit` decimal(20,8) DEFAULT NULL,
  `pnl` decimal(20,2) DEFAULT 0.00,
  `swap` decimal(20,2) DEFAULT 0.00,
  `commission` decimal(20,2) DEFAULT 0.00,
  `status` enum('OPEN','CLOSED','PENDING') DEFAULT 'OPEN',
  `open_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `close_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `mam_account_id` varchar(36) DEFAULT NULL,
  `master_trade_id` varchar(36) DEFAULT NULL,
  `leverage` int(11) DEFAULT 500
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `price_alerts`
--

CREATE TABLE `price_alerts` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `condition_type` enum('above','below') NOT NULL,
  `target_price` decimal(20,8) NOT NULL,
  `current_price` decimal(20,8) NOT NULL,
  `is_triggered` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `triggered_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trading_accounts`
--

CREATE TABLE `trading_accounts` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `balance` decimal(20,2) DEFAULT 0.00,
  `equity` decimal(20,2) DEFAULT 0.00,
  `margin_used` decimal(20,2) DEFAULT 0.00,
  `free_margin` decimal(20,2) DEFAULT 0.00,
  `leverage` int(11) DEFAULT 500,
  `currency` varchar(10) DEFAULT 'USD',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trading_accounts`
--

INSERT INTO `trading_accounts` (`id`, `user_id`, `account_number`, `balance`, `equity`, `margin_used`, `free_margin`, `leverage`, `currency`, `is_active`, `created_at`, `updated_at`) VALUES
('ta-4037fe86a12d79a05734605791a21879', '4037fe86a12d79a05734605791a21879', 'ACC-4037FE86', 100.00, 100.00, 0.00, 0.00, 500, 'USD', 1, '2025-12-15 10:27:53', '2025-12-16 18:58:14'),
('ta-4467ea0822d8b6d5df012f2b6d9bbf5b', '4467ea0822d8b6d5df012f2b6d9bbf5b', 'ACC-4467EA08', 0.00, 0.00, 0.00, 0.00, 500, 'USD', 1, '2025-12-16 20:26:09', '2025-12-16 20:26:09'),
('ta-e12858abacddf4e05598519ab560e8db', 'e12858abacddf4e05598519ab560e8db', 'ACC-E12858AB', 0.00, 0.00, 0.00, 0.00, 500, 'USD', 1, '2025-12-15 07:18:28', '2025-12-15 07:18:28');

-- --------------------------------------------------------

--
-- Table structure for table `trading_history`
--

CREATE TABLE `trading_history` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `side` enum('BUY','SELL') NOT NULL,
  `lot_size` decimal(10,2) NOT NULL,
  `entry_price` decimal(20,8) NOT NULL,
  `exit_price` decimal(20,8) NOT NULL,
  `pnl` decimal(20,2) NOT NULL,
  `swap` decimal(20,2) DEFAULT 0.00,
  `commission` decimal(20,2) DEFAULT 0.00,
  `open_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `close_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trading_signals`
--

CREATE TABLE `trading_signals` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `webhook_id` varchar(36) DEFAULT NULL,
  `signal_name` varchar(255) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `signal_type` enum('BUY','SELL','CLOSE') NOT NULL,
  `lot_size` decimal(10,2) NOT NULL,
  `price` decimal(20,5) DEFAULT NULL,
  `stop_loss` decimal(20,5) DEFAULT NULL,
  `take_profit` decimal(20,5) DEFAULT NULL,
  `confidence_level` decimal(5,2) DEFAULT 50.00,
  `source` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','EXECUTED','FAILED') DEFAULT 'PENDING',
  `executed_position_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `executed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `user_type` enum('admin','user') DEFAULT 'user',
  `account_type` varchar(50) DEFAULT 'standard',
  `leverage` int(11) DEFAULT 500,
  `base_currency` varchar(10) DEFAULT 'USD',
  `country` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_banned` tinyint(1) DEFAULT 0,
  `ban_reason` text DEFAULT NULL,
  `banned_at` timestamp NULL DEFAULT NULL,
  `referral_code` varchar(20) DEFAULT NULL,
  `referred_by` varchar(36) DEFAULT NULL,
  `total_referrals` int(11) DEFAULT 0,
  `referral_earnings` decimal(20,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `ib_id` varchar(36) DEFAULT NULL,
  `ib_referral_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `user_type`, `account_type`, `leverage`, `base_currency`, `country`, `phone`, `is_active`, `is_verified`, `is_banned`, `ban_reason`, `banned_at`, `referral_code`, `referred_by`, `total_referrals`, `referral_earnings`, `created_at`, `updated_at`, `last_login`, `ib_id`, `ib_referral_code`) VALUES
('4037fe86a12d79a05734605791a21879', 'john@example.com', '$2b$10$B5Sn3XK4KFLXTFPakHAWO.riwjiB9iHPlxRhReOjRu0X69Kk5Hz4G', 'john', 'demo', 'user', 'standard', 500, 'USD', NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NULL, 0, 0.00, '2025-12-15 10:27:53', '2025-12-16 19:26:59', '2025-12-16 19:26:59', NULL, NULL),
('4467ea0822d8b6d5df012f2b6d9bbf5b', 'ib@demo.com', '$2b$10$8IthYzTnlViv4VzcBEYspOPS8YgqRukG9r7ICitZSbYsmUgyHUkyq', 'IB', 'demo', 'user', 'standard', 500, 'USD', NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NULL, 0, 0.00, '2025-12-16 20:26:09', '2025-12-16 20:26:09', NULL, '5aae3eda-baf3-49fa-9be8-5b0465e5fd93', 'IB17659147034228Z7E1'),
('admin-001', 'admin@ventablack.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', 'standard', 500, 'USD', NULL, NULL, 1, 1, 0, NULL, NULL, NULL, NULL, 0, 0.00, '2025-12-15 07:06:42', '2025-12-15 07:06:42', NULL, NULL, NULL),
('e12858abacddf4e05598519ab560e8db', 'techi.today700@gmail.com', '$2b$10$ViF/.saGB.h/Hevi62CVz.AFXgginG.UMFa2Ccj/ZJHKOtdNiQRau', 'Demo', 'Admin', 'admin', 'standard', 500, 'USD', NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NULL, 0, 0.00, '2025-12-15 07:18:28', '2025-12-16 20:27:43', '2025-12-16 20:27:43', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `account_id` varchar(36) NOT NULL,
  `transaction_type` enum('DEPOSIT','WITHDRAWAL','TRADE_PROFIT','TRADE_LOSS','COMMISSION','SWAP','BONUS','REFERRAL','ADMIN_ADJUSTMENT') NOT NULL,
  `amount` decimal(20,2) NOT NULL,
  `balance_before` decimal(20,2) NOT NULL,
  `balance_after` decimal(20,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `description` text DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `user_id`, `account_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `currency`, `description`, `reference_id`, `created_at`) VALUES
('30a56487e03a7f4970807207ce7d8ac6', '4037fe86a12d79a05734605791a21879', 'ta-4037fe86a12d79a05734605791a21879', 'ADMIN_ADJUSTMENT', 100.00, 0.00, 100.00, 'USD', 'deposite\n', NULL, '2025-12-16 18:58:14');

-- --------------------------------------------------------

--
-- Table structure for table `webhooks`
--

CREATE TABLE `webhooks` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `webhook_name` varchar(255) NOT NULL,
  `webhook_url` varchar(500) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `auto_execute` tinyint(1) DEFAULT 0,
  `require_confirmation` tinyint(1) DEFAULT 1,
  `allowed_symbols` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_symbols`)),
  `max_lot_size` decimal(10,2) DEFAULT NULL,
  `last_received_signal` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `websocket_connections`
--

CREATE TABLE `websocket_connections` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `connection_id` varchar(255) NOT NULL,
  `socket_id` varchar(255) NOT NULL,
  `user_type` enum('admin','user') DEFAULT 'user',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `connected_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_activity` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('connected','disconnected') DEFAULT 'connected'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `websocket_events`
--

CREATE TABLE `websocket_events` (
  `id` int(11) NOT NULL,
  `connection_id` varchar(255) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_api_key` (`api_key`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `copy_trading_followers`
--
ALTER TABLE `copy_trading_followers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_follower_master` (`master_user_id`,`follower_user_id`),
  ADD KEY `idx_master_user_id` (`master_user_id`),
  ADD KEY `idx_follower_user_id` (`follower_user_id`);

--
-- Indexes for table `copy_trading_signals`
--
ALTER TABLE `copy_trading_signals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_master_user_id` (`master_user_id`),
  ADD KEY `idx_signal_type` (`signal_type`),
  ADD KEY `idx_symbol` (`symbol`);

--
-- Indexes for table `fund_requests`
--
ALTER TABLE `fund_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `bank_account_id` (`bank_account_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_request_type` (`request_type`);

--
-- Indexes for table `ib_accounts`
--
ALTER TABLE `ib_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `referral_code` (`referral_code`),
  ADD KEY `parent_ib_id` (`parent_ib_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_referral_code` (`referral_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `ib_commissions`
--
ALTER TABLE `ib_commissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trade_id` (`trade_id`),
  ADD KEY `position_id` (`position_id`),
  ADD KEY `idx_ib_id` (`ib_id`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `ib_referrals`
--
ALTER TABLE `ib_referrals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ib_user` (`ib_id`,`referred_user_id`),
  ADD KEY `idx_ib_id` (`ib_id`),
  ADD KEY `idx_referred_user_id` (`referred_user_id`);

--
-- Indexes for table `ib_settings`
--
ALTER TABLE `ib_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `ib_withdrawals`
--
ALTER TABLE `ib_withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_ib_id` (`ib_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `mam_pamm_accounts`
--
ALTER TABLE `mam_pamm_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_number` (`account_number`),
  ADD KEY `admin_approved_by` (`admin_approved_by`),
  ADD KEY `idx_master_user_id` (`master_user_id`),
  ADD KEY `idx_account_type` (`account_type`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_is_admin_approved` (`is_admin_approved`);

--
-- Indexes for table `mam_pamm_investors`
--
ALTER TABLE `mam_pamm_investors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_investor_account` (`account_id`,`investor_user_id`),
  ADD KEY `idx_account_id` (`account_id`),
  ADD KEY `idx_investor_user_id` (`investor_user_id`);

--
-- Indexes for table `mam_pamm_trades`
--
ALTER TABLE `mam_pamm_trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mam_account_id` (`mam_account_id`),
  ADD KEY `idx_master_trade_id` (`master_trade_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_symbol` (`symbol`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_symbol` (`symbol`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_open_time` (`open_time`);

--
-- Indexes for table `price_alerts`
--
ALTER TABLE `price_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_symbol` (`symbol`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `trading_accounts`
--
ALTER TABLE `trading_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_number` (`account_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_account_number` (`account_number`);

--
-- Indexes for table `trading_history`
--
ALTER TABLE `trading_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_symbol` (`symbol`),
  ADD KEY `idx_close_time` (`close_time`);

--
-- Indexes for table `trading_signals`
--
ALTER TABLE `trading_signals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `webhook_id` (`webhook_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_symbol` (`symbol`),
  ADD KEY `idx_signal_type` (`signal_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `referral_code` (`referral_code`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_reference_id` (`reference_id`);

--
-- Indexes for table `webhooks`
--
ALTER TABLE `webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `websocket_connections`
--
ALTER TABLE `websocket_connections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `connection_id` (`connection_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_connection_id` (`connection_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `websocket_events`
--
ALTER TABLE `websocket_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_connection_id` (`connection_id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ib_settings`
--
ALTER TABLE `ib_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `price_alerts`
--
ALTER TABLE `price_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `websocket_connections`
--
ALTER TABLE `websocket_connections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `websocket_events`
--
ALTER TABLE `websocket_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `copy_trading_followers`
--
ALTER TABLE `copy_trading_followers`
  ADD CONSTRAINT `copy_trading_followers_ibfk_1` FOREIGN KEY (`master_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `copy_trading_followers_ibfk_2` FOREIGN KEY (`follower_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `copy_trading_signals`
--
ALTER TABLE `copy_trading_signals`
  ADD CONSTRAINT `copy_trading_signals_ibfk_1` FOREIGN KEY (`master_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fund_requests`
--
ALTER TABLE `fund_requests`
  ADD CONSTRAINT `fund_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fund_requests_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fund_requests_ibfk_3` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fund_requests_ibfk_4` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ib_accounts`
--
ALTER TABLE `ib_accounts`
  ADD CONSTRAINT `ib_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ib_accounts_ibfk_2` FOREIGN KEY (`parent_ib_id`) REFERENCES `ib_accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ib_accounts_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ib_commissions`
--
ALTER TABLE `ib_commissions`
  ADD CONSTRAINT `ib_commissions_ibfk_1` FOREIGN KEY (`ib_id`) REFERENCES `ib_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ib_commissions_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ib_commissions_ibfk_3` FOREIGN KEY (`trade_id`) REFERENCES `trading_history` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ib_commissions_ibfk_4` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ib_referrals`
--
ALTER TABLE `ib_referrals`
  ADD CONSTRAINT `ib_referrals_ibfk_1` FOREIGN KEY (`ib_id`) REFERENCES `ib_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ib_referrals_ibfk_2` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ib_withdrawals`
--
ALTER TABLE `ib_withdrawals`
  ADD CONSTRAINT `ib_withdrawals_ibfk_1` FOREIGN KEY (`ib_id`) REFERENCES `ib_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ib_withdrawals_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `mam_pamm_accounts`
--
ALTER TABLE `mam_pamm_accounts`
  ADD CONSTRAINT `mam_pamm_accounts_ibfk_1` FOREIGN KEY (`master_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mam_pamm_accounts_ibfk_2` FOREIGN KEY (`admin_approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `mam_pamm_investors`
--
ALTER TABLE `mam_pamm_investors`
  ADD CONSTRAINT `mam_pamm_investors_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `mam_pamm_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mam_pamm_investors_ibfk_2` FOREIGN KEY (`investor_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mam_pamm_trades`
--
ALTER TABLE `mam_pamm_trades`
  ADD CONSTRAINT `mam_pamm_trades_ibfk_1` FOREIGN KEY (`mam_account_id`) REFERENCES `mam_pamm_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `positions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `positions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `price_alerts`
--
ALTER TABLE `price_alerts`
  ADD CONSTRAINT `price_alerts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trading_accounts`
--
ALTER TABLE `trading_accounts`
  ADD CONSTRAINT `trading_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trading_history`
--
ALTER TABLE `trading_history`
  ADD CONSTRAINT `trading_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trading_history_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trading_signals`
--
ALTER TABLE `trading_signals`
  ADD CONSTRAINT `trading_signals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trading_signals_ibfk_2` FOREIGN KEY (`webhook_id`) REFERENCES `webhooks` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wallet_transactions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `webhooks`
--
ALTER TABLE `webhooks`
  ADD CONSTRAINT `webhooks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `websocket_connections`
--
ALTER TABLE `websocket_connections`
  ADD CONSTRAINT `websocket_connections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
