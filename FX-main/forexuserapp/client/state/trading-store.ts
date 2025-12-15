import { create } from "zustand";
import { SYMBOLS } from "@/lib/priceFeed";
import type { SymbolInfo } from "@shared/trading-calculations";
import { 
  calculatePNL, 
  calculateMargin as calcMargin, 
  calculateEquity, 
  calculateFreeMargin,
  getContractSize
} from "@shared/trading-calculations";

export type Side = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "STOP";

export type Position = {
  id: string;
  symbol: string;
  side: Side;
  lot: number;
  entry: number;
  leverage?: number;
  sl?: number;
  tp?: number;
  openTime: number;
  pnl: number;
};

export type Order = {
  id: string;
  symbol: string;
  side: Side;
  type: OrderType;
  lot: number;
  price?: number;
  sl?: number;
  tp?: number;
  status: "PENDING" | "FILLED" | "CANCELLED";
  createdAt: number;
};

export type Wallet = {
  balance: number;
  equity: number;
  marginUsed: number;
  freeMargin: number;
};

type HistoryItem = {
  id: string;
  symbol: string;
  side: Side;
  lot: number;
  entry: number;
  exit: number;
  pnl: number;
  commission: number;
  closeTime: number;
};

type State = {
  symbols: SymbolInfo[];
  positions: Position[];
  orders: Order[];
  history: HistoryItem[];
  wallet: Wallet;
  tradeCharge: number;
  setWallet: (wallet: Wallet) => void;
  loadTradeCharge: () => Promise<void>;
  loadPositions: () => Promise<void>;
  loadOrders: () => Promise<void>;
  calculateMargin: (symbol: string, lot: number, entryPrice: number, leverage?: number) => number;
  hasSufficientMargin: (requiredMargin: number) => boolean;
  updatePositionsPNL: (prices: Record<string, { bid: number; ask: number }>) => void;
  openMarketOrder: (p: {
    symbol: string;
    side: Side;
    lot: number;
    price: number;
    leverage?: number;
    sl?: number;
    tp?: number;
  }) => void;
  closePosition: (id: string, ltp: number) => void;
  closeAll: (filter: "all" | "profit" | "loss", prices: Record<string, number>) => void;
};

export const useTradingStore = create<State>((set, get) => ({
  symbols: SYMBOLS,
  positions: [],
  orders: [],
  history: [],
  wallet: { balance: 0, equity: 0, marginUsed: 0, freeMargin: 0 },
  tradeCharge: 2.00, // Default trade charge
  
  setWallet: (wallet) => set({ wallet }),
  
  // Load trade charge from database once
  loadTradeCharge: async () => {
    try {
      const response = await fetch('/api/admin/broker-charges');
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.charges) {
            const tradeFee = data.charges.find((c: any) => c.charge_type === 'TRADE_FEE' && c.is_active);
            if (tradeFee) {
              const charge = parseFloat(tradeFee.charge_value) || 2.00;
              set({ tradeCharge: charge });
              console.log('✅ Trade charge loaded:', charge);
            }
          }
        } else {
          // Not JSON, likely HTML error page - set default
          set({ tradeCharge: 2.00 });
        }
      } else {
        // Response not OK, set default
        set({ tradeCharge: 2.00 });
      }
    } catch (error) {
      console.error('Error loading trade charge:', error);
      // Set default on error
      set({ tradeCharge: 2.00 });
    }
  },
  
  // Load positions from database
  loadPositions: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch('/api/positions/open', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const dbPositions = await response.json();
        const positions: Position[] = dbPositions.map((p: any) => ({
          id: p.id,
          symbol: p.symbol,
          side: p.side as Side,
          lot: parseFloat(p.lot_size),
          entry: parseFloat(p.entry_price),
          leverage: p.leverage ? parseFloat(p.leverage) : undefined,
          sl: p.stop_loss ? parseFloat(p.stop_loss) : undefined,
          tp: p.take_profit ? parseFloat(p.take_profit) : undefined,
          openTime: new Date(p.open_time).getTime(),
          pnl: parseFloat(p.pnl) || 0
        }));
        set({ positions });
      }
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  },
  
  // Load pending orders from database
  loadOrders: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        set({ orders: [] });
        return;
      }
      
      const response = await fetch('/api/orders/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const dbOrders = await response.json();
          const orders: Order[] = (Array.isArray(dbOrders) ? dbOrders : []).map((o: any) => ({
            id: o.id,
            symbol: o.symbol,
            side: o.side as Side,
            type: (o.order_type || 'LIMIT') as OrderType,
            lot: parseFloat(o.lot_size || o.lot),
            price: o.price ? parseFloat(o.price) : undefined,
            sl: o.stop_loss ? parseFloat(o.stop_loss) : undefined,
            tp: o.take_profit ? parseFloat(o.take_profit) : undefined,
            status: (o.status || 'PENDING') as "PENDING" | "FILLED" | "CANCELLED",
            createdAt: o.created_at ? new Date(o.created_at).getTime() : Date.now()
          }));
          set({ orders });
        } else {
          // Not JSON, likely HTML error page - set empty array
          set({ orders: [] });
        }
      } else {
        // Response not OK, set empty array
        set({ orders: [] });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Set empty array on error to prevent issues
      set({ orders: [] });
    }
  },
  
  // Calculate margin required with leverage (using shared calculation)
  calculateMargin: (symbol, lot, entryPrice, leverage) => {
    // Use provided leverage, or symbol default, or 100 as fallback
    const symbolInfo = SYMBOLS.find(s => s.code === symbol);
    const effectiveLeverage = leverage || symbolInfo?.leverage || 100;
    return calcMargin(symbol, lot, entryPrice, effectiveLeverage);
  },
  
  hasSufficientMargin: (requiredMargin) => {
    const { wallet } = get();
    return (wallet?.freeMargin || 0) >= requiredMargin;
  },
  
  // Update PNL for all open positions in real-time
  updatePositionsPNL: async (prices) => {
    const state = get();
    let totalUnrealizedPNL = 0;
    let totalMarginUsed = 0;
    
    const updatedPositions = state.positions.map(p => {
      const price = prices[p.symbol];
      if (!price) {
        // If no price, keep existing PNL and margin
        totalMarginUsed += state.calculateMargin(p.symbol, p.lot, p.entry, p.leverage);
        return p;
      }
      
      // Calculate PNL - use bid for BUY (sell price), ask for SELL (buy back price)
      const currentPrice = p.side === "BUY" ? price.bid : price.ask;
      const pnl = calculatePNL(p.side, p.entry, currentPrice, p.lot, p.symbol);
      totalUnrealizedPNL += pnl;
      
      // Calculate margin used (use position's leverage if available)
      const marginUsed = state.calculateMargin(p.symbol, p.lot, p.entry, p.leverage);
      totalMarginUsed += marginUsed;
      
      return { ...p, pnl };
    });
    
    // Update equity and free margin correctly
    const balance = state.wallet.balance;
    const equity = calculateEquity(balance, totalUnrealizedPNL);
    const freeMargin = calculateFreeMargin(equity, totalMarginUsed);
    
    // Auto square-off check: Close all positions if equity <= 0 (margin call)
    const shouldAutoSquareOff = equity <= 0;
    
    // Also check if leverage is too high (margin used / equity > max leverage)
    // If equity is very low compared to margin used, it's a margin call
    const maxLeverage = 1000; // Maximum allowed leverage
    const effectiveLeverage = equity > 0 ? totalMarginUsed / equity : Infinity;
    const leverageTooHigh = effectiveLeverage > maxLeverage;
    
    if (shouldAutoSquareOff || leverageTooHigh) {
      console.warn(`⚠️ Auto square-off triggered: ${shouldAutoSquareOff ? 'Equity <= 0' : `Leverage too high (${effectiveLeverage.toFixed(2)}x > ${maxLeverage}x)`}`);
      
      // Close all positions immediately
      const pricesMap: Record<string, number> = {};
      Object.keys(prices).forEach(symbol => {
        const price = prices[symbol];
        if (price) {
          pricesMap[symbol] = (price.bid + price.ask) / 2;
        }
      });
      
      // Close all positions
      for (const p of updatedPositions) {
        const price = prices[p.symbol];
        if (price) {
          const currentPrice = p.side === "BUY" ? price.bid : price.ask;
          try {
            await state.closePosition(p.id, currentPrice);
          } catch (error) {
            console.error(`Error auto-closing position ${p.id}:`, error);
          }
        }
      }
      
      // Reload positions after auto-close
      await state.loadPositions();
      return;
    }
    
    set({ 
      positions: updatedPositions,
      wallet: {
        ...state.wallet,
        equity,
        marginUsed: totalMarginUsed,
        freeMargin
      }
    });
    
  },
  
  openMarketOrder: async ({ symbol, side, lot, price, leverage, sl, tp }) => {
    const state = get();
    const requiredMargin = state.calculateMargin(symbol, lot, price, leverage);
    
    // Use cached trade charge
    const tradeCharge = state.tradeCharge;
    
    const totalRequired = requiredMargin + tradeCharge;
    
    if (!state.hasSufficientMargin(totalRequired)) {
      const available = state.wallet?.freeMargin || 0;
      throw new Error(`Insufficient margin. Required: $${totalRequired.toFixed(2)} (Margin: $${requiredMargin.toFixed(2)} + Fee: $${tradeCharge.toFixed(2)}), Available: $${available.toFixed(2)}`);
    }
    
    const id = Math.random().toString(36).slice(2, 9);
    const pos: Position = {
      id,
      symbol,
      side,
      lot,
      entry: price,
      leverage,
      sl,
      tp,
      openTime: Date.now(),
      pnl: 0,
    };
    
    // Save to database
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/positions/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            positionId: id,
            symbol,
            side,
            lot,
            entryPrice: price,
            leverage,
            sl,
            tp
          })
        });
        
        // Deduct trade charge
        await fetch('/api/user/deduct-trade-charge', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: tradeCharge,
            description: `Trade charge for ${side} ${symbol}`
          })
        });
      }
    } catch (error) {
      console.error('Error saving position:', error);
    }
    
    // Update wallet: Lock margin and deduct trade charge
    set(s => ({
      positions: [pos, ...s.positions],
      wallet: {
        balance: s.wallet.balance - tradeCharge, // Deduct trade charge
        equity: s.wallet.equity - tradeCharge, // Equity reduced by charge
        marginUsed: s.wallet.marginUsed + requiredMargin, // Lock margin
        freeMargin: s.wallet.freeMargin - requiredMargin - tradeCharge // Reduce free margin
      }
    }));
  },
  closePosition: async (id, ltp) => {
    const state = get();
    const idx = state.positions.findIndex(p => p.id === id);
    if (idx === -1) return;
    
    const p = state.positions[idx];
    
    // Calculate PNL using shared function (use appropriate price: bid for SELL, ask for BUY)
    const pnl = calculatePNL(p.side, p.entry, ltp, p.lot, p.symbol);
    
    // Calculate margin to release (returns the margin we locked)
    const releasedMargin = state.calculateMargin(p.symbol, p.lot, p.entry, p.leverage);
    
    // Close position in database
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Mark position as closed
        await fetch('/api/positions/close', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ positionId: p.id })
        });
        
        // Save to trading history
        await fetch('/api/trades/close', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            positionId: p.id,
            symbol: p.symbol,
            side: p.side,
            lot: p.lot,
            entryPrice: p.entry,
            exitPrice: ltp,
            pnl: pnl,
            marginUsed: releasedMargin
          })
        });
      }
    } catch (error) {
      console.error('Error closing position:', error);
    }
    
    const historyItem: HistoryItem = {
      id: p.id,
      symbol: p.symbol,
      side: p.side,
      lot: p.lot,
      entry: p.entry,
      exit: ltp,
      pnl,
      commission: 0,
      closeTime: Date.now(),
    };
    
    const positions = [...state.positions];
    positions.splice(idx, 1);
    
    // Calculate new wallet values correctly
    const balance = state.wallet.balance + pnl; // Add realized PNL to balance
    const marginUsed = Math.max(0, state.wallet.marginUsed - releasedMargin); // Release margin
    
    // Recalculate unrealized PNL for remaining positions
    const remainingUnrealizedPNL = positions.reduce((sum, pos) => {
      // We'll update this properly when prices are available
      return sum + (pos.pnl || 0);
    }, 0);
    
    const equity = calculateEquity(balance, remainingUnrealizedPNL);
    const freeMargin = calculateFreeMargin(equity, marginUsed);
    
    const wallet = { balance, equity, marginUsed, freeMargin };
    set({ positions, history: [historyItem, ...state.history], wallet });
  },
  closeAll: (filter, prices) => {
    set(s => {
      const remain: Position[] = [];
      const done: HistoryItem[] = [];
      let pnlSum = 0;
      let releasedMarginSum = 0;
      
      for (const p of s.positions) {
        const priceData = prices[p.symbol];
        if (!priceData) {
          remain.push(p);
          continue;
        }
        
        // Handle both number and object types
        if (typeof priceData === 'number') {
          remain.push(p);
          continue;
        }
        
        // Type guard: priceData is an object with bid/ask
        const priceObj = priceData as { bid: number; ask: number };
        const ltp = (priceObj.bid + priceObj.ask) / 2;
        const currentPrice = p.side === "BUY" ? priceObj.bid : priceObj.ask;
        const pnl = calculatePNL(p.side, p.entry, currentPrice, p.lot, p.symbol);
        const releasedMargin = s.calculateMargin(p.symbol, p.lot, p.entry, p.leverage);
        
        const shouldClose =
          filter === "all" || (filter === "profit" ? pnl >= 0 : pnl < 0);
        if (shouldClose) {
          pnlSum += pnl;
          releasedMarginSum += releasedMargin;
          done.push({ id: p.id, symbol: p.symbol, side: p.side, lot: p.lot, entry: p.entry, exit: ltp, pnl, commission: 0, closeTime: Date.now() });
        } else {
          remain.push(p);
        }
      }
      
      // Calculate new wallet values correctly
      const balance = s.wallet.balance + pnlSum; // Add realized PNL
      const marginUsed = Math.max(0, s.wallet.marginUsed - releasedMarginSum); // Release margin
      
      // Recalculate unrealized PNL for remaining positions
      const remainingUnrealizedPNL = remain.reduce((sum, pos) => {
        const priceData = prices[pos.symbol];
        if (!priceData || typeof priceData === 'number') return sum + (pos.pnl || 0);
        const priceObj = priceData as { bid: number; ask: number };
        const currentPrice = pos.side === "BUY" ? priceObj.bid : priceObj.ask;
        return sum + calculatePNL(pos.side, pos.entry, currentPrice, pos.lot, pos.symbol);
      }, 0);
      
      const equity = calculateEquity(balance, remainingUnrealizedPNL);
      const freeMargin = calculateFreeMargin(equity, marginUsed);
      
      const wallet = { balance, equity, marginUsed, freeMargin };
      return { positions: remain, history: [...done, ...s.history], wallet };
    });
  },
}));
