import { create } from "zustand";
import { io, Socket } from "socket.io-client";

export interface Tick {
  bid: number;
  ask: number;
  ts: number;
  // Additional data for MT5-style display
  high?: number;
  low?: number;
  change?: number;
  changePercent?: number;
  digits?: number;
  volume?: number;
  spread?: number;
}

export const SYMBOLS = [
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

export type PriceMap = Record<string, Tick>;

// Persist connection state across Vite HMR by storing on window
declare global {
  interface Window {
    __PRICE_SOCKET__?: Socket | null;
    __PRICE_RECONNECT__?: NodeJS.Timeout | null;
    __PRICE_PING__?: NodeJS.Timeout | null;
    __PRICE_API__?: NodeJS.Timeout | null;
    __PRICE_INIT__?: boolean;
  }
}

const getWin = () => (typeof window !== "undefined" ? window : ({} as any));

// Global connection state (HMR-safe)
let globalSocket: Socket | null = getWin().__PRICE_SOCKET__ ?? null;
let reconnectTimer: NodeJS.Timeout | null = getWin().__PRICE_RECONNECT__ ?? null;
let pingInterval: NodeJS.Timeout | null = getWin().__PRICE_PING__ ?? null;
let apiInterval: NodeJS.Timeout | null = getWin().__PRICE_API__ ?? null;
let connectionInitialized = getWin().__PRICE_INIT__ ?? false;

// Connection configuration
const resolveDefaultWebsocketUrl = () => {
  if (typeof window !== "undefined" && window.location) {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname;
    return `${protocol}://${host}:6020`;
  }
  return "https:// StockPip.com:6020";
};

const RAW_WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL || resolveDefaultWebsocketUrl();

const WEBSOCKET_URL = RAW_WEBSOCKET_URL.replace(/\/$/, "");

const API_BASE_URL = (() => {
  try {
    const url = new URL(WEBSOCKET_URL);
    if (url.protocol === "ws:") url.protocol = "http:";
    if (url.protocol === "wss:") url.protocol = "https:";
    return url.toString().replace(/\/$/, "");
  } catch {
    return WEBSOCKET_URL.replace(/^ws/, "http");
  }
})();
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;
const PING_INTERVAL = 20000; // Send ping every 20 seconds
const API_POLL_INTERVAL = 5000;

export const usePriceStore = create<{
  prices: PriceMap;
  isConnected: boolean;
  subscribe: (symbol: string) => void;
  cleanup: () => void;
}>((set, get) => {

  const connectWebSocket = () => {
    // Clear any existing reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
      getWin().__PRICE_RECONNECT__ = null;
    }
    
    // Don't create new connection if already connected
    if (globalSocket?.connected) {
      console.log('⚡ WebSocket already connected');
      return;
    }
    
    // Clean up existing connection if any
    if (globalSocket) {
      // If a socket exists but is not connected, try reconnecting instead of replacing
      try { globalSocket.removeAllListeners(); } catch {}
      try { if (globalSocket.connected) return; } catch {}
      try { globalSocket.disconnect(); } catch {}
      globalSocket = null;
      getWin().__PRICE_SOCKET__ = null;
    }
    
    console.log('🔄 Connecting to WebSocket at', WEBSOCKET_URL);
    
    try {
      globalSocket = io(WEBSOCKET_URL, {
        reconnection: false, // We handle reconnection manually
        transports: ['websocket'],
        timeout: 10000
      });
      getWin().__PRICE_SOCKET__ = globalSocket;

      globalSocket.on('connect', () => {
        console.log('✅ WebSocket connected to real data feed');
        set({ isConnected: true });
        
        // Clear reconnect timer on successful connection
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
          getWin().__PRICE_RECONNECT__ = null;
        }
        
        // Subscribe to all symbols
        const symbolCodes = SYMBOLS.map(s => s.code);
        globalSocket!.emit('subscribe_market_data', symbolCodes);
        console.log('📊 Subscribed to', symbolCodes.length, 'symbols');
        
        // Setup heartbeat interval
        if (pingInterval) clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          if (globalSocket?.connected) {
            globalSocket.emit('heartbeat');
          }
        }, PING_INTERVAL);
        getWin().__PRICE_PING__ = pingInterval;
      });

      // Handle heartbeat request from server
      globalSocket.on('heartbeat', () => {
        if (globalSocket?.connected) {
          globalSocket.emit('heartbeat');
        }
      });

      globalSocket.on('prices', (pricesData: any) => {
        try {
          const formattedPrices: PriceMap = {};
          Object.keys(pricesData).forEach(symbol => {
            const price = pricesData[symbol];
            if (price && price.bid && price.ask) {
              formattedPrices[symbol] = {
                bid: price.bid,
                ask: price.ask,
                ts: new Date(price.time || price.timestamp || Date.now()).getTime(),
                high: price.high || price.ask,
                low: price.low || price.bid,
                change: price.change || 0,
                changePercent: price.changePercent || 0,
                digits: price.digits || 5,
                volume: price.volume || 0,
                spread: price.spread || (price.ask - price.bid)
              };
            }
          });
          
          if (Object.keys(formattedPrices).length > 0) {
          set({ prices: formattedPrices, isConnected: true });
          }
        } catch (error) {
          console.error('Error parsing WebSocket prices:', error);
        }
      });

      globalSocket.on('price_update', (priceData: any) => {
        try {
          if (priceData && priceData.symbol && priceData.bid && priceData.ask) {
            const formattedPrice = {
              bid: priceData.bid,
              ask: priceData.ask,
              ts: new Date(priceData.timestamp || Date.now()).getTime(),
              high: priceData.high || priceData.ask,
              low: priceData.low || priceData.bid,
              change: priceData.change || 0,
              changePercent: priceData.changePercent || 0,
              digits: priceData.digits || 5,
              volume: priceData.volume || 0,
              spread: priceData.spread || (priceData.ask - priceData.bid)
            };
            
            set(state => ({
              prices: { ...state.prices, [priceData.symbol]: formattedPrice },
              isConnected: true
            }));
          }
        } catch (error) {
          console.error('Error parsing price update:', error);
        }
      });

      globalSocket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
        set({ isConnected: false });
        
        // Clear ping interval
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        
        // Schedule reconnection
        scheduleReconnect();
      });

      globalSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        set({ isConnected: false });
        
        // Schedule reconnection
        scheduleReconnect();
      });
      
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      set({ isConnected: false });
      scheduleReconnect();
    }
  };
  
  const scheduleReconnect = () => {
    if (reconnectTimer) return; // Already scheduled
    
    const delay = Math.min(RECONNECT_DELAY * Math.pow(2, Math.floor(Math.random() * 3)), MAX_RECONNECT_DELAY);
    console.log(`🔄 Reconnecting in ${delay}ms...`);
    
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      getWin().__PRICE_RECONNECT__ = null;
      connectWebSocket();
    }, delay);
    getWin().__PRICE_RECONNECT__ = reconnectTimer;
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/forex/prices`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
        const formattedPrices: PriceMap = {};
        
          result.data.forEach((price: any) => {
            if (price && price.symbol && price.bid && price.ask) {
              formattedPrices[price.symbol] = {
            bid: price.bid,
            ask: price.ask,
                ts: new Date(price.timestamp || Date.now()).getTime(),
                high: price.high || price.ask,
                low: price.low || price.bid,
                change: price.change || 0,
                changePercent: price.changePercent || 0,
                digits: price.digits || 5,
                volume: price.volume || 0,
                spread: price.spread || (price.ask - price.bid)
              };
            }
          });
          
          if (Object.keys(formattedPrices).length > 0) {
            console.log('💾 API fallback: received', Object.keys(formattedPrices).length, 'prices');
        set({ prices: formattedPrices, isConnected: true });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching prices from API:', error);
    }
  };

  const subscribe = (symbol: string) => {
    // Initialize connection only once globally
    if (!connectionInitialized) {
      connectionInitialized = true;
      getWin().__PRICE_INIT__ = true;
      console.log('🚀 Initializing price feed connection');
      
      // Connect WebSocket
      connectWebSocket();
    
      // Start API polling as fallback
      fetchPrices(); // Initial fetch
      if (apiInterval) clearInterval(apiInterval);
      apiInterval = setInterval(fetchPrices, API_POLL_INTERVAL);
      getWin().__PRICE_API__ = apiInterval;
    }
  };

  // Cleanup function
  const cleanup = () => {
    console.log('🧹 Cleaning up price feed connections');
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
      getWin().__PRICE_RECONNECT__ = null;
    }
    
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
      getWin().__PRICE_PING__ = null;
    }
    
    if (apiInterval) {
      clearInterval(apiInterval);
      apiInterval = null;
      getWin().__PRICE_API__ = null;
    }
    
    if (globalSocket) {
      globalSocket.removeAllListeners();
      globalSocket.disconnect();
      globalSocket = null;
      getWin().__PRICE_SOCKET__ = null;
    }
    
    connectionInitialized = false;
    getWin().__PRICE_INIT__ = false;
  };

  // Set up cleanup on window unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
  }

  // Do not tear down socket on HMR - keep singleton alive
  try {
    // @ts-ignore
    if (import.meta && (import.meta as any).hot) {
      // @ts-ignore
      (import.meta as any).hot.dispose(() => {
        // keep socket/timers on window
      });
    }
  } catch {}

  return {
    prices: {},
    isConnected: false,
    subscribe,
    cleanup
  };
});

export function formatPrice(x: number | undefined, digits = 5) {
  if (x === undefined || x === null || isNaN(x)) {
    return "--";
  }
  return x.toFixed(digits);
}