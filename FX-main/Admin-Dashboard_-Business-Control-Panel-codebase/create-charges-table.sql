-- Broker charges configuration table
CREATE TABLE IF NOT EXISTS broker_charges (
    id VARCHAR(36) PRIMARY KEY,
    charge_type ENUM('SPREAD', 'SWAP_LONG', 'SWAP_SHORT', 'COMMISSION', 'TRADE_FEE') NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    charge_value DECIMAL(20,8) NOT NULL,
    charge_type_value ENUM('PER_LOT', 'PERCENTAGE', 'FIXED') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_symbol (symbol),
    INDEX idx_charge_type (charge_type),
    INDEX idx_is_active (is_active)
);

-- Insert default charges
INSERT INTO broker_charges (id, charge_type, symbol, charge_value, charge_type_value, is_active) VALUES
('charge-001', 'SPREAD', 'EURUSD', 0.00010, 'PER_LOT', TRUE),
('charge-002', 'SPREAD', 'GBPUSD', 0.00010, 'PER_LOT', TRUE),
('charge-003', 'SPREAD', 'USDJPY', 0.01, 'PER_LOT', TRUE),
('charge-004', 'SPREAD', 'AUDUSD', 0.00010, 'PER_LOT', TRUE),
('charge-005', 'SPREAD', 'USDCAD', 0.00010, 'PER_LOT', TRUE),
('charge-006', 'SPREAD', 'BTCUSD', 10, 'PER_LOT', TRUE),
('charge-007', 'SPREAD', 'XAUUSD', 0.50, 'PER_LOT', TRUE),
('charge-008', 'SWAP_LONG', 'EURUSD', 0.01, 'PER_LOT', TRUE),
('charge-009', 'SWAP_SHORT', 'EURUSD', -0.01, 'PER_LOT', TRUE),
('charge-010', 'COMMISSION', 'ALL', 0.001, 'PERCENTAGE', TRUE);

