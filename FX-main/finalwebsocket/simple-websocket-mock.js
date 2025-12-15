import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 6020;

const SYMBOLS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD", "USDCHF",
  "EURJPY", "GBPJPY", "AUDJPY", "EURGBP", "EURAUD", "EURNZD", "EURCHF",
  "XAUUSD", "XAGUSD", "BTCUSD", "ETHUSD"
];

// Mock price data
const basePrices = {
  EURUSD: 1.0850,
  GBPUSD: 1.2650,
  USDJPY: 149.50,
  AUDUSD: 0.6580,
  USDCAD: 1.3620,
  NZDUSD: 0.6020,
  USDCHF: 0.8850,
  EURJPY: 162.15,
  GBPJPY: 189.05,
  AUDJPY: 98.35,
  EURGBP: 0.8580,
  EURAUD: 1.6490,
  EURNZD: 1.8020,
  EURCHF: 0.9610,
  XAUUSD: 2045.50,
  XAGUSD: 24.35,
  BTCUSD: 43500.00,
  ETHUSD: 2280.00
};

const priceCache = new Map();

// Initialize prices
SYMBOLS.forEach(symbol => {
  const basePrice = basePrices[symbol] || 1.0000;
  priceCache.set(symbol, {
    symbol,
    bid: basePrice,
    ask: basePrice + (basePrice * 0.0002),
    spread: basePrice * 0.0002,
    high: basePrice * 1.001,
    low: basePrice * 0.999,
    timestamp: new Date().toISOString()
  });
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    credentials: true,
  },
});

app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    connected: true,
    symbols: priceCache.size,
    note: "Using MOCK data (no MetaAPI)"
  });
});

// Status endpoint
app.get("/api/forex/status", (_req, res) => {
  res.json({
    success: true,
    data: { connected: true, symbols: priceCache.size, mode: "MOCK" }
  });
});

// Get all prices
app.get("/api/forex/prices", (_req, res) => {
  res.json({ 
    success: true, 
    data: Array.from(priceCache.values()),
    note: "MOCK DATA"
  });
});

// Get specific price
app.get("/api/forex/price/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const price = priceCache.get(symbol);
  if (!price) {
    return res.status(404).json({ 
      success: false, 
      message: `No price for ${symbol}` 
    });
  }
  res.json({ success: true, data: price, note: "MOCK DATA" });
});

// WebSocket connections
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Send initial prices
  const snapshot = {};
  priceCache.forEach((value, key) => {
    snapshot[key] = value;
  });
  socket.emit("prices", snapshot);

  socket.on("subscribe_market_data", (symbols) => {
    if (!Array.isArray(symbols)) return;
    const initial = {};
    symbols.forEach((symbol) => {
      const price = priceCache.get(symbol);
      if (price) initial[symbol] = price;
    });
    if (Object.keys(initial).length > 0) {
      socket.emit("prices", initial);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Simulate price updates every 2 seconds
function updatePrices() {
  SYMBOLS.forEach(symbol => {
    const current = priceCache.get(symbol);
    if (!current) return;

    // Random price movement (-0.1% to +0.1%)
    const change = (Math.random() - 0.5) * 0.002;
    const newBid = current.bid * (1 + change);
    const spread = newBid * 0.0002;
    const newAsk = newBid + spread;

    const updated = {
      symbol,
      bid: parseFloat(newBid.toFixed(5)),
      ask: parseFloat(newAsk.toFixed(5)),
      spread: parseFloat(spread.toFixed(5)),
      high: Math.max(current.high, newAsk),
      low: Math.min(current.low, newBid),
      timestamp: new Date().toISOString()
    };

    priceCache.set(symbol, updated);

    // Broadcast to all connected clients
    io.emit("price_update", updated);
    io.emit("market_update", updated);
  });
}

// Start price updates
setInterval(updatePrices, 2000);

server.listen(PORT, () => {
  console.log(`🚀 Mock WebSocket server listening on port ${PORT}`);
  console.log(`📊 Serving ${SYMBOLS.length} symbols with MOCK data`);
  console.log(`⚠️  NOTE: Using simulated data - not real market prices`);
  console.log(`💡 To use real data, add MetaAPI credentials to .env`);
});

