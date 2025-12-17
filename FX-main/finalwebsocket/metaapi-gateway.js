import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import MetaApi from 'metaapi.cloud-sdk';

dotenv.config(); // Load .env file

const PORT = Number(process.env.PORT || 6020);
const METAAPI_TOKEN = process.env.METAAPI_TOKEN || '';
const METAAPI_ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID || '';
const SYMBOLS = [
  'EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','NZDUSD','USDCHF','EURJPY','GBPJPY','AUDJPY','EURGBP','EURAUD','EURNZD','EURCHF','GBPCHF','GBPAUD','GBPCAD','AUDCHF','AUDCAD','AUDNZD','CADJPY','CHFJPY','NZDJPY','USDSGD','USDHKD','USDMXN','USDZAR','USDTRY',
  'BTCUSD','ETHUSD','LTCUSD','XRPUSD','ADAUSD','DOTUSD','LINKUSD','BNBUSD',
  'XAUUSD','XAGUSD','XPTUSD','XPDUSD',
  'US30','SPX500','NAS100','UK100','GER40','FRA40','JPN225','AUS200',
  'USOIL','UKOIL','NGAS','WHEAT','CORN','SOYBEAN','COFFEE','SUGAR','COTTON',
  'AAPL','GOOGL','MSFT','AMZN','TSLA','META','NVDA','NFLX','AMD','INTC'
];

const parseOrigins = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const DEFAULT_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
  'http://localhost:3040',
  'http://StockPip.com',
  'https://StockPip.com',
  'https://www.StockPip.com',
  'https://user.StockPip.com',
  'http://user.StockPip.com',
  'https://dev.StockPip.com',
  'https://app.StockPip.com',
  'http://admin.StockPip.com',
  'https://admin.StockPip.com',
  'https://www.admin.StockPip.com',
  'https://user.admin.StockPip.com',
  'http://user.admin.StockPip.com',
  'https://dev.admin.StockPip.com',
  'https://app.admin.StockPip.com',
  'http://admin.StockPip.com',
  'https://admin.StockPip.com',
  'https://www.admin.StockPip.com',

];

const ALLOWED_ORIGINS = (() => {
  const envOrigins = parseOrigins(process.env.CORS_ORIGINS);
  if (!envOrigins.length) return DEFAULT_ORIGINS;
  return envOrigins;
})();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['websocket'],
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET','POST']
  },
  pingInterval: 25000,
  pingTimeout: 60000
});

// Dynamic CORS for REST
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// In-memory price store
const lastPrices = new Map();
let lastBroadcast = 0;
const BROADCAST_EVERY_MS = 300;

function inferDigits(symbol) {
  if (/JPY$/.test(symbol)) return 3;
  if (/^(US30|SPX500|NAS100|UK100|GER40|FRA40|JPN225|AUS200)$/.test(symbol)) return 2;
  if (/^XAU|XAG|XPT|XPD/.test(symbol)) return 2;
  if (/^BTC|ETH|LTC|ADA|DOT|LINK|BNB|XRP/.test(symbol)) return 2;
  if (/^[A-Z]{3}[A-Z]{3}$/.test(symbol)) return 5;
  return 2;
}

function broadcastIfDue() {
  const now = Date.now();
  if (now - lastBroadcast < BROADCAST_EVERY_MS) return;
  lastBroadcast = now;
  const payload = {};
  lastPrices.forEach((v, k) => { payload[k] = v; });
  io.emit('prices', payload);
}

// REST
app.get('/', (req, res) => res.send('MetaAPI Gateway running'));
app.get('/api/forex/prices', (req, res) => res.json({ success: true, data: Array.from(lastPrices.values()) }));
app.get('/api/forex/price/:symbol', (req, res) => {
  const s = String(req.params.symbol || '').toUpperCase();
  const p = lastPrices.get(s);
  if (!p) return res.status(404).json({ success: false, error: 'Symbol not found' });
  res.json({ success: true, data: p });
});

// Socket
io.on('connection', (socket) => {
  // Push snapshot immediately
  const snap = {};
  lastPrices.forEach((v, k) => { snap[k] = v; });
  if (Object.keys(snap).length) socket.emit('prices', snap);

  socket.on('subscribe_market_data', () => {}); // no-op: server already subscribes
});

// MetaAPI connection
let api, account, connection, syncing = false;
async function connectMetaApi() {
  if (syncing || !METAAPI_TOKEN) return;
  if (!MetaApi) {
    console.error('metaapi.cloud-sdk not installed');
    return;
  }
  try {
    syncing = true;
    api = new MetaApi(METAAPI_TOKEN);

    // Try account-access-token flow first
    try {
      account = await api.metatraderAccountApi.getAccountByToken();
    } catch (byTokenErr) {
      // If that fails, use API-token flows
      if (METAAPI_ACCOUNT_ID) {
        try {
          account = await api.metatraderAccountApi.getAccount(METAAPI_ACCOUNT_ID);
        } catch (err) {
          throw new Error(`Failed to get account ${METAAPI_ACCOUNT_ID}: ${err?.message || err}`);
        }
      } else {
        const accounts = await api.metatraderAccountApi.getAccounts();
        if (!accounts || !accounts.length) throw new Error('No MetaAPI accounts for token');
        const primary = accounts.find(a => a.state === 'DEPLOYED') || accounts[0];
        account = await api.metatraderAccountApi.getAccount(primary.id);
      }
    }
    // Ensure deployed
    if (account.state !== 'DEPLOYED') {
      await account.deploy();
      await account.waitConnected();
    }
    // Streaming connection
    connection = account.getStreamingConnection();
    await connection.connect();
    await connection.waitSynchronized();
    for (const s of SYMBOLS) { try { await connection.subscribeToMarketData(s); } catch {} }

    // Poll terminal state for latest quotes; this avoids SDK event version mismatches
    setInterval(() => {
      try {
        for (const s of SYMBOLS) {
          const q = connection.terminalState.price(s);
          if (!q || (!q.bid && !q.ask)) continue;
          const bid = q.bid ?? q.ask;
          const ask = q.ask ?? (bid ? bid + 0.0003 : null);
          if (bid == null || ask == null) continue;
          lastPrices.set(s, {
            symbol: s,
            bid, ask,
            high: q.high ?? ask,
            low: q.low ?? bid,
            spread: Math.max(0, ask - bid),
            change: 0,
            changePercent: 0,
            digits: q.digits ?? inferDigits(s),
            volume: q.volume ?? 0,
            timestamp: new Date().toISOString()
          });
        }
        broadcastIfDue();
      } catch {}
    }, 300);

    console.log('✅ MetaAPI connected & polling.');
  } catch (e) {
    console.error('❌ MetaAPI connect error:', e?.message || e);
    setTimeout(connectMetaApi, 3000);
  } finally {
    syncing = false;
  }
}

// Mock price generator as fallback
function generateMockPrices() {
  const basePrices = {
    EURUSD: { bid: 1.16650, ask: 1.16660 },
    GBPUSD: { bid: 1.25090, ask: 1.25100 },
    USDJPY: { bid: 149.090, ask: 149.100 },
    AUDUSD: { bid: 0.65090, ask: 0.65100 },
    USDCAD: { bid: 1.35090, ask: 1.35100 },
    BTCUSD: { bid: 95000, ask: 95050 },
    XAUUSD: { bid: 2650.00, ask: 2650.50 }
  };
  
  setInterval(() => {
    for (const symbol of SYMBOLS) {
      if (!lastPrices.has(symbol)) {
        const base = basePrices[symbol] || { bid: 1.00000, ask: 1.00010 };
        const change = (Math.random() - 0.5) * 0.0001;
        lastPrices.set(symbol, {
          symbol,
          bid: base.bid + change,
          ask: base.ask + change,
          high: base.ask + change + 0.0005,
          low: base.bid + change - 0.0005,
          spread: 0.0001,
          change: change,
          changePercent: (change / base.bid) * 100,
          digits: inferDigits(symbol),
          volume: Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString()
        });
      } else {
        const existing = lastPrices.get(symbol);
        const change = (Math.random() - 0.5) * 0.0001;
        lastPrices.set(symbol, {
          ...existing,
          bid: existing.bid + change,
          ask: existing.ask + change,
          change: existing.change + change,
          changePercent: ((existing.change + change) / existing.bid) * 100,
          timestamp: new Date().toISOString()
        });
      }
    }
    broadcastIfDue();
  }, 300);
}

server.listen(PORT, async () => {
  console.log(`🚀 MetaAPI Gateway listening on :${PORT}`);
  if (!METAAPI_TOKEN) {
    console.error('❌ METAAPI_TOKEN not set. Real market data will NOT stream.');
    console.error('   Set METAAPI_TOKEN and restart this service.');
    // Intentionally DO NOT generate mock prices in production
    return;
  }
  await connectMetaApi();
});


