/**
 * Standardized Trading Calculations
 * This file ensures consistent P&L, margin, and contract size calculations
 * across client and server
 */

export interface SymbolInfo {
  code: string;
  name: string;
  sector: string;
  digits: number;
  contractSize: number;
  leverage: number;
}

// Standard symbol definitions (must match client priceFeed.ts)
export const SYMBOLS: SymbolInfo[] = [
  // Major Forex Pairs
  { code: "EURUSD", name: "Euro/US Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "GBPUSD", name: "British Pound/US Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "USDJPY", name: "US Dollar/Japanese Yen", sector: "FX", digits: 3, contractSize: 100000, leverage: 100 },
  { code: "USDCHF", name: "US Dollar/Swiss Franc", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "AUDUSD", name: "Australian Dollar/US Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "USDCAD", name: "US Dollar/Canadian Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "NZDUSD", name: "New Zealand Dollar/US Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  
  // Cross Pairs
  { code: "EURGBP", name: "Euro/British Pound", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "EURJPY", name: "Euro/Japanese Yen", sector: "FX", digits: 3, contractSize: 100000, leverage: 100 },
  { code: "EURCHF", name: "Euro/Swiss Franc", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "EURAUD", name: "Euro/Australian Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "EURCAD", name: "Euro/Canadian Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "EURNZD", name: "Euro/New Zealand Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "GBPJPY", name: "British Pound/Japanese Yen", sector: "FX", digits: 3, contractSize: 100000, leverage: 100 },
  { code: "GBPCHF", name: "British Pound/Swiss Franc", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "GBPAUD", name: "British Pound/Australian Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "GBPCAD", name: "British Pound/Canadian Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "AUDJPY", name: "Australian Dollar/Japanese Yen", sector: "FX", digits: 3, contractSize: 100000, leverage: 100 },
  { code: "AUDCHF", name: "Australian Dollar/Swiss Franc", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "AUDCAD", name: "Australian Dollar/Canadian Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "AUDNZD", name: "Australian Dollar/New Zealand Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 100 },
  { code: "CADJPY", name: "Canadian Dollar/Japanese Yen", sector: "FX", digits: 3, contractSize: 100000, leverage: 100 },
  { code: "CHFJPY", name: "Swiss Franc/Japanese Yen", sector: "FX", digits: 3, contractSize: 100000, leverage: 100 },
  { code: "NZDJPY", name: "New Zealand Dollar/Japanese Yen", sector: "FX", digits: 3, contractSize: 100000, leverage: 100 },
  
  // Exotic Pairs
  { code: "USDSGD", name: "US Dollar/Singapore Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 50 },
  { code: "USDHKD", name: "US Dollar/Hong Kong Dollar", sector: "FX", digits: 5, contractSize: 100000, leverage: 50 },
  { code: "USDMXN", name: "US Dollar/Mexican Peso", sector: "FX", digits: 5, contractSize: 100000, leverage: 50 },
  { code: "USDZAR", name: "US Dollar/South African Rand", sector: "FX", digits: 5, contractSize: 100000, leverage: 50 },
  { code: "USDTRY", name: "US Dollar/Turkish Lira", sector: "FX", digits: 5, contractSize: 100000, leverage: 20 },
  
  // Cryptocurrencies
  { code: "BTCUSD", name: "Bitcoin/US Dollar", sector: "CRYPTO", digits: 2, contractSize: 1, leverage: 10 },
  { code: "ETHUSD", name: "Ethereum/US Dollar", sector: "CRYPTO", digits: 2, contractSize: 1, leverage: 10 },
  { code: "LTCUSD", name: "Litecoin/US Dollar", sector: "CRYPTO", digits: 2, contractSize: 1, leverage: 10 },
  { code: "XRPUSD", name: "Ripple/US Dollar", sector: "CRYPTO", digits: 3, contractSize: 1000, leverage: 10 },
  { code: "ADAUSD", name: "Cardano/US Dollar", sector: "CRYPTO", digits: 3, contractSize: 1000, leverage: 10 },
  { code: "DOTUSD", name: "Polkadot/US Dollar", sector: "CRYPTO", digits: 2, contractSize: 100, leverage: 10 },
  { code: "LINKUSD", name: "Chainlink/US Dollar", sector: "CRYPTO", digits: 2, contractSize: 100, leverage: 10 },
  { code: "BNBUSD", name: "Binance Coin/US Dollar", sector: "CRYPTO", digits: 2, contractSize: 10, leverage: 10 },
  
  // Indices
  { code: "US30", name: "Dow Jones 30", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  { code: "SPX500", name: "S&P 500", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  { code: "NAS100", name: "NASDAQ 100", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  { code: "UK100", name: "FTSE 100", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  { code: "GER40", name: "DAX 40", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  { code: "FRA40", name: "CAC 40", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  { code: "JPN225", name: "Nikkei 225", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  { code: "AUS200", name: "ASX 200", sector: "INDEX", digits: 2, contractSize: 1, leverage: 50 },
  
  // Commodities
  { code: "XAUUSD", name: "Gold/US Dollar", sector: "METALS", digits: 2, contractSize: 100, leverage: 50 },
  { code: "XAGUSD", name: "Silver/US Dollar", sector: "METALS", digits: 3, contractSize: 5000, leverage: 50 },
  { code: "XPTUSD", name: "Platinum/US Dollar", sector: "METALS", digits: 2, contractSize: 100, leverage: 20 },
  { code: "XPDUSD", name: "Palladium/US Dollar", sector: "METALS", digits: 2, contractSize: 100, leverage: 20 },
  { code: "USOIL", name: "WTI Crude Oil", sector: "ENERGY", digits: 2, contractSize: 1000, leverage: 50 },
  { code: "UKOIL", name: "Brent Crude Oil", sector: "ENERGY", digits: 2, contractSize: 1000, leverage: 50 },
  { code: "NGAS", name: "Natural Gas", sector: "ENERGY", digits: 3, contractSize: 10000, leverage: 50 },
  { code: "WHEAT", name: "Wheat", sector: "AGRO", digits: 2, contractSize: 100, leverage: 20 },
  { code: "CORN", name: "Corn", sector: "AGRO", digits: 2, contractSize: 100, leverage: 20 },
  { code: "SOYBEAN", name: "Soybeans", sector: "AGRO", digits: 2, contractSize: 100, leverage: 20 },
  { code: "COFFEE", name: "Coffee", sector: "AGRO", digits: 2, contractSize: 100, leverage: 20 },
  { code: "SUGAR", name: "Sugar", sector: "AGRO", digits: 2, contractSize: 100, leverage: 20 },
  { code: "COTTON", name: "Cotton", sector: "AGRO", digits: 2, contractSize: 100, leverage: 20 },
  
  // Stocks
  { code: "AAPL", name: "Apple Inc", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "GOOGL", name: "Alphabet Inc", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "MSFT", name: "Microsoft Corp", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "AMZN", name: "Amazon.com Inc", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "TSLA", name: "Tesla Inc", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "META", name: "Meta Platforms", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "NVDA", name: "NVIDIA Corp", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "NFLX", name: "Netflix Inc", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "AMD", name: "Advanced Micro Devices", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
  { code: "INTC", name: "Intel Corp", sector: "CFD", digits: 2, contractSize: 100, leverage: 20 },
];

/**
 * Get symbol info by code
 */
export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
  return SYMBOLS.find(s => s.code.toUpperCase() === symbol.toUpperCase());
}

/**
 * Calculate contract size for a symbol
 * @param symbol - Trading symbol (e.g., "EURUSD", "XAUUSD")
 * @returns Contract size in units
 */
export function getContractSize(symbol: string): number {
  const info = getSymbolInfo(symbol);
  return info?.contractSize || 100000; // Default to 100k for forex
}

/**
 * Calculate required margin for a position
 * Formula: (lot × contractSize × entryPrice) / leverage
 * @param symbol - Trading symbol
 * @param lot - Lot size
 * @param entryPrice - Entry price
 * @param leverage - Leverage (defaults to symbol's default leverage)
 * @returns Required margin in account currency (USD)
 */
export function calculateMargin(
  symbol: string,
  lot: number,
  entryPrice: number,
  leverage?: number
): number {
  if (lot <= 0 || entryPrice <= 0) return 0;
  
  const contractSize = getContractSize(symbol);
  const symbolInfo = getSymbolInfo(symbol);
  const effectiveLeverage = leverage || symbolInfo?.leverage || 100;
  
  if (effectiveLeverage <= 0) return Infinity;
  
  const contractValue = lot * contractSize * entryPrice;
  const margin = contractValue / effectiveLeverage;
  
  return Math.max(0, margin);
}

/**
 * Calculate Profit & Loss for a position
 * Formula for BUY: (currentPrice - entryPrice) × lot × contractSize
 * Formula for SELL: (entryPrice - currentPrice) × lot × contractSize
 * 
 * Note: This formula works correctly for all pairs including JPY pairs
 * because the price already represents the exchange rate in the quote currency.
 * 
 * @param side - "BUY" or "SELL"
 * @param entryPrice - Entry price
 * @param currentPrice - Current market price (use bid for SELL, ask for BUY, or mid price)
 * @param lot - Lot size
 * @param symbol - Trading symbol (for contract size lookup)
 * @returns P&L in account currency (USD)
 */
export function calculatePNL(
  side: "BUY" | "SELL",
  entryPrice: number,
  currentPrice: number,
  lot: number,
  symbol: string
): number {
  if (lot <= 0 || entryPrice <= 0 || currentPrice <= 0) return 0;
  
  const contractSize = getContractSize(symbol);
  
  // For BUY: profit when price goes up
  // For SELL: profit when price goes down
  const priceDiff = side === "BUY" 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice;
  
  const pnl = priceDiff * lot * contractSize;
  
  return pnl;
}

/**
 * Check if SL/TP levels are valid
 * @param side - "BUY" or "SELL"
 * @param entryPrice - Entry price
 * @param sl - Stop loss price
 * @param tp - Take profit price
 * @returns Object with validation results
 */
export function validateSLTP(
  side: "BUY" | "SELL",
  entryPrice: number,
  sl?: number,
  tp?: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (sl !== undefined && sl !== null) {
    if (side === "BUY" && sl >= entryPrice) {
      errors.push("Stop loss for BUY must be below entry price");
    }
    if (side === "SELL" && sl <= entryPrice) {
      errors.push("Stop loss for SELL must be above entry price");
    }
    if (sl <= 0) {
      errors.push("Stop loss must be positive");
    }
  }
  
  if (tp !== undefined && tp !== null) {
    if (side === "BUY" && tp <= entryPrice) {
      errors.push("Take profit for BUY must be above entry price");
    }
    if (side === "SELL" && tp >= entryPrice) {
      errors.push("Take profit for SELL must be below entry price");
    }
    if (tp <= 0) {
      errors.push("Take profit must be positive");
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if price has hit stop loss or take profit
 * @param side - "BUY" or "SELL"
 * @param entryPrice - Entry price
 * @param currentPrice - Current market price
 * @param sl - Stop loss price
 * @param tp - Take profit price
 * @returns Object indicating which level was hit
 */
/**
 * Check if price has hit stop loss or take profit
 * SECURITY: This function must use correct price logic to prevent manipulation
 * 
 * @param side - "BUY" or "SELL"
 * @param entryPrice - Entry price
 * @param currentPrice - Current market price (bid for BUY, ask for SELL)
 * @param sl - Stop loss price
 * @param tp - Take profit price
 * @returns Object indicating which level was hit
 */
export function checkSLTP(
  side: "BUY" | "SELL",
  entryPrice: number,
  currentPrice: number,
  sl?: number,
  tp?: number
): { hitSL: boolean; hitTP: boolean; reason: string | null } {
  // Validate inputs
  if (!currentPrice || currentPrice <= 0 || !entryPrice || entryPrice <= 0) {
    return { hitSL: false, hitTP: false, reason: null };
  }
  
  if (side === "BUY") {
    // For BUY position:
    // - Entry: bought at ask price
    // - Exit: sell at bid price
    // - SL: below entry (if bid drops to SL, trigger)
    // - TP: above entry (if bid rises to TP, trigger)
    
    if (sl !== undefined && sl !== null && sl > 0) {
      // SL must be below entry for BUY
      if (sl >= entryPrice) {
        console.warn(`Invalid SL for BUY: ${sl} >= entry ${entryPrice}`);
        // Don't trigger invalid SL
      } else if (currentPrice <= sl) {
        return { hitSL: true, hitTP: false, reason: `Stop loss triggered at ${currentPrice.toFixed(5)} (SL: ${sl.toFixed(5)})` };
      }
    }
    
    if (tp !== undefined && tp !== null && tp > 0) {
      // TP must be above entry for BUY
      if (tp <= entryPrice) {
        console.warn(`Invalid TP for BUY: ${tp} <= entry ${entryPrice}`);
        // Don't trigger invalid TP
      } else if (currentPrice >= tp) {
        return { hitSL: false, hitTP: true, reason: `Take profit triggered at ${currentPrice.toFixed(5)} (TP: ${tp.toFixed(5)})` };
      }
    }
  } else {
    // For SELL position:
    // - Entry: sold at bid price
    // - Exit: buy back at ask price
    // - SL: above entry (if ask rises to SL, trigger)
    // - TP: below entry (if ask drops to TP, trigger)
    
    if (sl !== undefined && sl !== null && sl > 0) {
      // SL must be above entry for SELL
      if (sl <= entryPrice) {
        console.warn(`Invalid SL for SELL: ${sl} <= entry ${entryPrice}`);
        // Don't trigger invalid SL
      } else if (currentPrice >= sl) {
        return { hitSL: true, hitTP: false, reason: `Stop loss triggered at ${currentPrice.toFixed(5)} (SL: ${sl.toFixed(5)})` };
      }
    }
    
    if (tp !== undefined && tp !== null && tp > 0) {
      // TP must be below entry for SELL
      if (tp >= entryPrice) {
        console.warn(`Invalid TP for SELL: ${tp} >= entry ${entryPrice}`);
        // Don't trigger invalid TP
      } else if (currentPrice <= tp) {
        return { hitSL: false, hitTP: true, reason: `Take profit triggered at ${currentPrice.toFixed(5)} (TP: ${tp.toFixed(5)})` };
      }
    }
  }
  
  return { hitSL: false, hitTP: false, reason: null };
}

/**
 * Calculate equity correctly
 * Equity = Balance + Unrealized P&L
 * @param balance - Account balance
 * @param unrealizedPNL - Sum of all open positions' unrealized P&L
 * @returns Equity value
 */
export function calculateEquity(balance: number, unrealizedPNL: number): number {
  return balance + unrealizedPNL;
}

/**
 * Calculate free margin
 * Free Margin = Equity - Margin Used
 * @param equity - Account equity
 * @param marginUsed - Margin currently used by open positions
 * @returns Free margin value
 */
export function calculateFreeMargin(equity: number, marginUsed: number): number {
  return Math.max(0, equity - marginUsed);
}





