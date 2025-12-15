import express from "express";
import http from "http";
import { Server } from "socket.io";
import pkg from "metaapi.cloud-sdk";
const { default: MetaApi } = pkg;
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.METAAPI_TOKEN;
const ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID;

if (!TOKEN || !ACCOUNT_ID) {
  console.error(
    "❌ METAAPI_TOKEN and METAAPI_ACCOUNT_ID environment variables are required."
  );
  process.exit(1);
}

const WATCHED_SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "USDCHF",
  "EURJPY",
  "GBPJPY",
  "AUDJPY",
  "EURGBP",
  "EURAUD",
  "EURNZD",
  "EURCHF",
  "XAUUSD",
  "XAGUSD",
  "BTCUSD",
  "ETHUSD",
];

const priceCache = new Map();
const lastBroadcast = new Map();
let streamingConnection = null;
let isStreamingReady = false;
let priceListenerRegistered = false;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    credentials: true,
  },
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    connected: isStreamingReady,
    symbols: priceCache.size,
    note: isStreamingReady
      ? "Streaming real MetaAPI data"
      : "MetaAPI connection not authorized yet",
  });
});

app.get("/api/forex/status", (_req, res) => {
  res.json({
    success: true,
    data: { connected: isStreamingReady, symbols: priceCache.size },
  });
});

app.get("/api/forex/prices", (_req, res) => {
  if (!isStreamingReady) {
    return res
      .status(503)
      .json({ success: false, message: "MetaAPI connection not ready" });
  }
  res.json({ success: true, data: Array.from(priceCache.values()) });
});

app.get("/api/forex/price/:symbol", (req, res) => {
  if (!isStreamingReady) {
    return res
      .status(503)
      .json({ success: false, message: "MetaAPI connection not ready" });
  }
  const symbol = req.params.symbol.toUpperCase();
  const price = priceCache.get(symbol);
  if (!price) {
    return res
      .status(404)
      .json({ success: false, message: `No price for ${symbol}` });
  }
  res.json({ success: true, data: price });
});

io.on("connection", (socket) => {
  console.log("🔌 WebSocket client connected", socket.id);

  if (priceCache.size > 0) {
    const snapshot = {};
    priceCache.forEach((value, key) => {
      snapshot[key] = value;
    });
    socket.emit("prices", snapshot);
  }

  socket.on("subscribe_market_data", (symbols) => {
    if (!Array.isArray(symbols)) return;
    const initial = {};
    symbols.forEach((symbol) => {
      const price = priceCache.get(symbol);
      if (price) {
        initial[symbol] = price;
      }
    });
    if (Object.keys(initial).length > 0) {
      socket.emit("prices", initial);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 WebSocket client disconnected", socket.id);
  });
});

function formatPrice(symbol, price) {
  return {
    symbol,
    bid: Number(price.bid),
    ask: Number(price.ask),
    spread: Number(price.ask) - Number(price.bid),
    high: Number(price.high || price.ask),
    low: Number(price.low || price.bid),
    timestamp: price.time
      ? new Date(price.time).toISOString()
      : new Date().toISOString(),
    brokerTime: price.brokerTime || null,
  };
}

async function subscribeToSymbols() {
  if (!streamingConnection) return;
  console.log(`📊 Subscribing to ${WATCHED_SYMBOLS.length} symbols`);
  for (const symbol of WATCHED_SYMBOLS) {
    try {
      await streamingConnection.subscribeToMarketData(symbol);
      const price = streamingConnection.terminalState.price(symbol);
      if (price && price.bid && price.ask) {
        priceCache.set(symbol, formatPrice(symbol, price));
      }
    } catch (err) {
      console.warn(`⚠️ Failed to subscribe ${symbol}: ${err.message}`);
    }
  }
}

function registerPriceListener() {
  if (!streamingConnection || priceListenerRegistered) return;
  priceListenerRegistered = true;
  const handlePrice = (arg1, arg2) => {
    const price = arg2 ?? arg1;
    if (
      !price ||
      !price.symbol ||
      price.bid === undefined ||
      price.ask === undefined
    )
      return;
    const formatted = formatPrice(price.symbol, price);
    priceCache.set(price.symbol, formatted);

    const previous = lastBroadcast.get(formatted.symbol);
    if (
      previous &&
      previous.bid === formatted.bid &&
      previous.ask === formatted.ask
    ) {
      return;
    }
    lastBroadcast.set(formatted.symbol, formatted);

    io.emit("price_update", formatted);
    io.emit("market_update", formatted);
  };
  streamingConnection.addSynchronizationListener({
    onSymbolPriceUpdated: handlePrice,
    onSymbolPricesUpdated: (instanceIndex, prices) => {
      const list = Array.isArray(prices)
        ? prices
        : Array.isArray(instanceIndex)
        ? instanceIndex
        : [];
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((p) => handlePrice(p));
      }
    },
    onSymbolSpecificationUpdated: () => {},
    onSymbolSpecificationsUpdated: () => {},
    onBrokerConnectionStatusChanged: () => {},
    onHealthStatus: () => {},
  });
}

async function initializeMetaApi() {
  try {
    console.log("🚀 Connecting to MetaAPI...");
    const metaApi = new MetaApi(TOKEN);
    const account = await metaApi.metatraderAccountApi.getAccount(ACCOUNT_ID);

    if (!["DEPLOYED", "DEPLOYING"].includes(account.state)) {
      console.log("📡 Deploying account");
      await account.deploy();
    }

    console.log("⏳ Waiting for account to connect to broker...");
    await account.waitConnected();

    streamingConnection = account.getStreamingConnection();
    await streamingConnection.connect();
    await streamingConnection.waitSynchronized();

    console.log("✅ MetaAPI streaming connection ready");
    isStreamingReady = true;
    await subscribeToSymbols();
    registerPriceListener();
  } catch (error) {
    console.error(
      "❌ Failed to initialize MetaAPI streaming connection:",
      error
    );
    isStreamingReady = false;
    setTimeout(initializeMetaApi, 10000);
  }
}

initializeMetaApi();

const PORT = process.env.PORT || 6020;
server.listen(PORT, () => {
  console.log(`🚀 MetaAPI WebSocket server listening on port ${PORT}`);
});
