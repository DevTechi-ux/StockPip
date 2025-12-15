--  StockPip Forex Trading Platform - Complete Trading Platform Schema
-- This schema supports complete trading platform with all features
-- Database name: forex_final (SINGLE database for all applications)

USE forex_final;

-- Users table (for both admin and regular users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('admin', 'user') DEFAULT 'user',
    account_type VARCHAR(50) DEFAULT 'standard',
    leverage INT DEFAULT 500,
    base_currency VARCHAR(10) DEFAULT 'USD',
    country VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    banned_at TIMESTAMP NULL,
    referral_code VARCHAR(20) UNIQUE,
    referred_by VARCHAR(36),
    total_referrals INT DEFAULT 0,
    referral_earnings DECIMAL(20,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_is_active (is_active)
);

-- Admin users table (extended admin info)
CREATE TABLE IF NOT EXISTS admin_users (
    user_id VARCHAR(36) PRIMARY KEY,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSON,
    last_admin_action TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trading accounts (user wallet/balance info)
CREATE TABLE IF NOT EXISTS trading_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(20,2) DEFAULT 0.00,
    equity DECIMAL(20,2) DEFAULT 0.00,
    margin_used DECIMAL(20,2) DEFAULT 0.00,
    free_margin DECIMAL(20,2) DEFAULT 0.00,
    leverage INT DEFAULT 500,
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_account_number (account_number)
);

-- Trading positions
CREATE TABLE IF NOT EXISTS positions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side ENUM('BUY', 'SELL') NOT NULL,
    lot_size DECIMAL(10,2) NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    stop_loss DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    pnl DECIMAL(20,2) DEFAULT 0.00,
    swap DECIMAL(20,2) DEFAULT 0.00,
    commission DECIMAL(20,2) DEFAULT 0.00,
    status ENUM('OPEN', 'CLOSED', 'PENDING') DEFAULT 'OPEN',
    open_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    close_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol),
    INDEX idx_status (status),
    INDEX idx_open_time (open_time)
);

-- Trading history (closed positions)
CREATE TABLE IF NOT EXISTS trading_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side ENUM('BUY', 'SELL') NOT NULL,
    lot_size DECIMAL(10,2) NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL,
    exit_price DECIMAL(20,8) NOT NULL,
    pnl DECIMAL(20,2) NOT NULL,
    swap DECIMAL(20,2) DEFAULT 0.00,
    commission DECIMAL(20,2) DEFAULT 0.00,
    open_time TIMESTAMP NOT NULL,
    close_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol),
    INDEX idx_close_time (close_time)
);

-- Orders (pending orders)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    order_type ENUM('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT') NOT NULL,
    side ENUM('BUY', 'SELL') NOT NULL,
    lot_size DECIMAL(10,2) NOT NULL,
    price DECIMAL(20,8),
    stop_price DECIMAL(20,8),
    stop_loss DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    status ENUM('PENDING', 'FILLED', 'CANCELLED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol),
    INDEX idx_status (status)
);

-- WebSocket connections tracking
CREATE TABLE IF NOT EXISTS websocket_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    connection_id VARCHAR(255) UNIQUE NOT NULL,
    socket_id VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'user') DEFAULT 'user',
    ip_address VARCHAR(45),
    user_agent TEXT,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('connected', 'disconnected') DEFAULT 'connected',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_connection_id (connection_id),
    INDEX idx_status (status)
);

-- Real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('trade', 'deposit', 'withdrawal', 'system', 'price_alert', 'order_update') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Price alerts
CREATE TABLE IF NOT EXISTS price_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    condition_type ENUM('above', 'below') NOT NULL,
    target_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8) NOT NULL,
    is_triggered BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol),
    INDEX idx_is_active (is_active)
);

-- WebSocket events log
CREATE TABLE IF NOT EXISTS websocket_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    connection_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_connection_id (connection_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user
INSERT IGNORE INTO users (id, email, password, first_name, last_name, user_type, is_active, is_verified) 
VALUES (
    'admin-001', 
    'admin@ventablack.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'Admin', 
    'User', 
    'admin', 
    TRUE, 
    TRUE
);

-- Insert admin user details
INSERT IGNORE INTO admin_users (user_id, role, permissions) 
VALUES (
    'admin-001', 
    'super_admin', 
    '{"all": true, "users": true, "trading": true, "settings": true}'
);

-- Bank accounts (for deposits/withdrawals)
CREATE TABLE IF NOT EXISTS bank_accounts (
    id VARCHAR(36) PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(50),
    swift_code VARCHAR(20),
    routing_number VARCHAR(50),
    account_type ENUM('SAVINGS', 'CHECKING', 'BUSINESS') DEFAULT 'SAVINGS',
    currency VARCHAR(10) DEFAULT 'USD',
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fund requests (deposit/withdrawal requests)
CREATE TABLE IF NOT EXISTS fund_requests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    request_type ENUM('DEPOSIT', 'WITHDRAWAL') NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method ENUM('BANK_TRANSFER', 'CREDIT_CARD', 'CRYPTO', 'OTHER') DEFAULT 'BANK_TRANSFER',
    bank_account_id VARCHAR(36),
    transaction_id VARCHAR(255),
    screenshot_url VARCHAR(500),
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING') DEFAULT 'PENDING',
    admin_notes TEXT,
    processed_by VARCHAR(36),
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_request_type (request_type)
);

-- Wallet transactions (all money movements)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    transaction_type ENUM('DEPOSIT', 'WITHDRAWAL', 'TRADE_PROFIT', 'TRADE_LOSS', 'COMMISSION', 'SWAP', 'BONUS', 'REFERRAL', 'ADMIN_ADJUSTMENT') NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    balance_before DECIMAL(20,2) NOT NULL,
    balance_after DECIMAL(20,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    description TEXT,
    reference_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_reference_id (reference_id)
);

-- MAM/PAMM accounts
CREATE TABLE IF NOT EXISTS mam_pamm_accounts (
    id VARCHAR(36) PRIMARY KEY,
    master_user_id VARCHAR(36) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type ENUM('MAM', 'PAMM') NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    total_balance DECIMAL(20,2) DEFAULT 0.00,
    master_balance DECIMAL(20,2) DEFAULT 0.00,
    investor_balance DECIMAL(20,2) DEFAULT 0.00,
    master_profit_share DECIMAL(5,2) DEFAULT 20.00,
    investor_profit_share DECIMAL(5,2) DEFAULT 80.00,
    max_investors INT DEFAULT 100,
    min_investment DECIMAL(20,2) DEFAULT 100.00,
    max_investment DECIMAL(20,2) DEFAULT 100000.00,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    is_admin_approved BOOLEAN DEFAULT FALSE,
    admin_approved_at TIMESTAMP NULL,
    admin_approved_by VARCHAR(36),
    admin_notes TEXT,
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH') DEFAULT 'MEDIUM',
    strategy_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (master_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_master_user_id (master_user_id),
    INDEX idx_account_type (account_type),
    INDEX idx_is_active (is_active),
    INDEX idx_is_admin_approved (is_admin_approved)
);

-- MAM/PAMM investors
CREATE TABLE IF NOT EXISTS mam_pamm_investors (
    id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    investor_user_id VARCHAR(36) NOT NULL,
    investment_amount DECIMAL(20,2) NOT NULL,
    current_balance DECIMAL(20,2) DEFAULT 0.00,
    total_profit DECIMAL(20,2) DEFAULT 0.00,
    total_loss DECIMAL(20,2) DEFAULT 0.00,
    copy_multiplier DECIMAL(5,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    FOREIGN KEY (account_id) REFERENCES mam_pamm_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (investor_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_investor_account (account_id, investor_user_id),
    INDEX idx_account_id (account_id),
    INDEX idx_investor_user_id (investor_user_id)
);

-- MAM/PAMM trades
CREATE TABLE IF NOT EXISTS mam_pamm_trades (
    id VARCHAR(36) PRIMARY KEY,
    mam_account_id VARCHAR(36) NOT NULL,
    master_user_id VARCHAR(36) NOT NULL,
    master_trade_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side ENUM('BUY', 'SELL') NOT NULL,
    lot_size DECIMAL(10,2) NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL,
    exit_price DECIMAL(20,8),
    stop_loss DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    leverage INT DEFAULT 500,
    profit_loss DECIMAL(20,2) DEFAULT 0.00,
    commission DECIMAL(20,2) DEFAULT 0.00,
    net_profit_loss DECIMAL(20,2) DEFAULT 0.00,
    trade_type ENUM('OPEN', 'CLOSE') NOT NULL,
    status ENUM('OPEN', 'CLOSED', 'PARTIALLY_CLOSED') DEFAULT 'OPEN',
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mam_account_id) REFERENCES mam_pamm_accounts(id) ON DELETE CASCADE,
    INDEX idx_mam_account_id (mam_account_id),
    INDEX idx_master_trade_id (master_trade_id),
    INDEX idx_status (status)
);

-- Copy trading signals
CREATE TABLE IF NOT EXISTS copy_trading_signals (
    id VARCHAR(36) PRIMARY KEY,
    master_user_id VARCHAR(36) NOT NULL,
    signal_type ENUM('BUY', 'SELL', 'CLOSE') NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    lot_size DECIMAL(10,2) NOT NULL,
    price DECIMAL(20,5),
    stop_loss DECIMAL(20,5),
    take_profit DECIMAL(20,5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (master_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_master_user_id (master_user_id),
    INDEX idx_signal_type (signal_type),
    INDEX idx_symbol (symbol)
);

-- Copy trading followers
CREATE TABLE IF NOT EXISTS copy_trading_followers (
    id VARCHAR(36) PRIMARY KEY,
    master_user_id VARCHAR(36) NOT NULL,
    follower_user_id VARCHAR(36) NOT NULL,
    copy_multiplier DECIMAL(5,2) DEFAULT 1.00,
    max_lot_size DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (master_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follower_master (master_user_id, follower_user_id),
    INDEX idx_master_user_id (master_user_id),
    INDEX idx_follower_user_id (follower_user_id)
);

-- API keys for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_api_key (api_key)
);

-- User webhooks for external signal sources
CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    webhook_name VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_execute BOOLEAN DEFAULT FALSE,
    require_confirmation BOOLEAN DEFAULT TRUE,
    allowed_symbols JSON,
    max_lot_size DECIMAL(10,2),
    last_received_signal TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- Trading signals (for automation)
CREATE TABLE IF NOT EXISTS trading_signals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    webhook_id VARCHAR(36),
    signal_name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    signal_type ENUM('BUY', 'SELL', 'CLOSE') NOT NULL,
    lot_size DECIMAL(10,2) NOT NULL,
    price DECIMAL(20,5),
    stop_loss DECIMAL(20,5),
    take_profit DECIMAL(20,5),
    confidence_level DECIMAL(5,2) DEFAULT 50.00,
    source VARCHAR(255),
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXECUTED', 'FAILED') DEFAULT 'PENDING',
    executed_position_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_symbol (symbol),
    INDEX idx_signal_type (signal_type),
    INDEX idx_status (status)
);

-- IB accounts
CREATE TABLE IF NOT EXISTS ib_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    ib_name VARCHAR(255) NOT NULL,
    ib_level INT DEFAULT 1,
    parent_ib_id VARCHAR(36),
    commission_type ENUM('per_lot', 'spread_share', 'profit_share') DEFAULT 'per_lot',
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    total_earnings DECIMAL(20,2) DEFAULT 0.00,
    pending_earnings DECIMAL(20,2) DEFAULT 0.00,
    total_clients INT DEFAULT 0,
    approved_at TIMESTAMP NULL,
    approved_by VARCHAR(36),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_ib_id) REFERENCES ib_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_referral_code (referral_code),
    INDEX idx_status (status),
    INDEX idx_is_active (is_active)
);

-- IB referrals tracking
CREATE TABLE IF NOT EXISTS ib_referrals (
    id VARCHAR(36) PRIMARY KEY,
    ib_id VARCHAR(36) NOT NULL,
    referred_user_id VARCHAR(36) NOT NULL,
    referral_code VARCHAR(50) NOT NULL,
    total_trades INT DEFAULT 0,
    total_lots DECIMAL(10,2) DEFAULT 0.00,
    total_commission DECIMAL(20,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ib_id) REFERENCES ib_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ib_user (ib_id, referred_user_id),
    INDEX idx_ib_id (ib_id),
    INDEX idx_referred_user_id (referred_user_id)
);

-- IB commissions
CREATE TABLE IF NOT EXISTS ib_commissions (
    id VARCHAR(36) PRIMARY KEY,
    ib_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    trade_id VARCHAR(36),
    position_id VARCHAR(36),
    commission_type ENUM('per_lot', 'spread_share', 'profit_share') NOT NULL,
    lot_size DECIMAL(10,2) NOT NULL,
    spread_value DECIMAL(20,8),
    profit_amount DECIMAL(20,2),
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(20,2) NOT NULL,
    level INT DEFAULT 1,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ib_id) REFERENCES ib_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trade_id) REFERENCES trading_history(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    INDEX idx_ib_id (ib_id),
    INDEX idx_client_id (client_id),
    INDEX idx_status (status)
);

-- IB withdrawals
CREATE TABLE IF NOT EXISTS ib_withdrawals (
    id VARCHAR(36) PRIMARY KEY,
    ib_id VARCHAR(36) NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    withdrawal_method ENUM('BANK_TRANSFER', 'CRYPTO', 'OTHER') DEFAULT 'BANK_TRANSFER',
    bank_details JSON,
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMP NULL,
    processed_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ib_id) REFERENCES ib_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ib_id (ib_id),
    INDEX idx_status (status)
);

-- IB settings
CREATE TABLE IF NOT EXISTS ib_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO ib_settings (setting_key, setting_value, description) VALUES
    ('default_commission_rate', '5.00', 'Default commission rate for new IBs'),
    ('max_ib_levels', '2', 'Maximum IB levels allowed'),
    ('min_withdrawal_amount', '50.00', 'Minimum withdrawal amount for IBs');

-- Positions for MAM/PAMM
ALTER TABLE positions ADD COLUMN mam_account_id VARCHAR(36) NULL;
ALTER TABLE positions ADD COLUMN master_trade_id VARCHAR(36) NULL;
ALTER TABLE positions ADD COLUMN leverage INT DEFAULT 500;

-- Users IB fields  
ALTER TABLE users ADD COLUMN ib_id VARCHAR(36) NULL;
ALTER TABLE users ADD COLUMN ib_referral_code VARCHAR(50) NULL;

-- Insert default bank account
INSERT IGNORE INTO bank_accounts (id, account_name, account_number, bank_name, account_type, currency, country) 
VALUES ('bank-001', 'VentaBlack Trading Account', '1234567890', 'Chase Bank', 'BUSINESS', 'USD', 'United States');
