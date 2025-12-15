# 🌐 WebSocket Server Guide

## 🚀 How to Start the WebSocket Server

### **Method 1: Using npm (Recommended)**
```bash
cd finalwebsocket
npm start
```

### **Method 2: Using node directly**
```bash
cd finalwebsocket
node standalone-websocket-metaapi.js
```

### **Method 3: From root directory**
```bash
npm run dev:websocket
```

---

## ✅ Server Details

- **Port**: `6020`
- **URL**: `http://localhost:6020`
- **WebSocket URL**: `ws://localhost:6020`

---

## 📊 What It Does

The WebSocket server provides **real-time forex trading data** from MetaAPI:

### **Supported Symbols:**
- **Forex Pairs**: EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, NZDUSD, USDCHF, EURJPY, GBPJPY, AUDJPY, EURGBP, EURAUD, EURNZD, EURCHF
- **Crypto**: BTCUSD, ETHUSD
- **Commodities**: XAUUSD (Gold), XAGUSD (Silver)

### **Features:**
- Real-time price updates
- Bid/Ask prices
- Spread calculation
- High/Low tracking
- WebSocket streaming

---

## 🔌 API Endpoints

### **1. Health Check**
```bash
GET http://localhost:6020/
```
**Response:**
```json
{
  "status": "ok",
  "connected": true,
  "symbols": 16,
  "note": "Streaming real MetaAPI data"
}
```

### **2. Status Check**
```bash
GET http://localhost:6020/api/forex/status
```

### **3. Get All Prices**
```bash
GET http://localhost:6020/api/forex/prices
```

### **4. Get Specific Price**
```bash
GET http://localhost:6020/api/forex/price/EURUSD
```

---

## 🔗 WebSocket Events

### **Connect to WebSocket:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:6020');

// Listen for price updates
socket.on('price_update', (data) => {
  console.log('Price:', data);
  // { symbol: 'EURUSD', bid: 1.0850, ask: 1.0852, spread: 0.0002, ... }
});

// Subscribe to specific symbols
socket.emit('subscribe_market_data', ['EURUSD', 'GBPUSD', 'BTCUSD']);
```

### **Events:**
- `prices` - Initial snapshot of all prices
- `price_update` - Real-time price update for a single symbol
- `market_update` - Market data update

---

## ⚙️ Configuration

### **Environment Variables**
Create a `.env` file in `finalwebsocket/` directory:

```env
# MetaAPI Configuration (Required for live data)
METAAPI_TOKEN=your-metaapi-token-here
METAAPI_ACCOUNT_ID=your-account-id-here

# Server Port (Optional, defaults to 6020)
PORT=6020
```

### **Without MetaAPI:**
If you don't have MetaAPI credentials yet, the server will still run but won't have live data. You'll see a message like:
```
⚠️ MetaAPI connection not ready
```

---

## 🔍 How to Check if It's Running

### **Method 1: Check the port**
```bash
netstat -an | findstr "6020"
```

You should see:
```
TCP    0.0.0.0:6020           0.0.0.0:0              LISTENING
```

### **Method 2: Test the API**
Open in browser:
```
http://localhost:6020
```

You should see:
```json
{
  "status": "ok",
  "connected": true/false,
  "symbols": 0-16
}
```

### **Method 3: Check logs**
The terminal should show:
```
🚀 MetaAPI WebSocket server listening on port 6020
```

---

## 🛠️ Troubleshooting

### **Issue: Port 6020 already in use**
**Solution:**
```bash
# Kill the process using port 6020
netstat -ano | findstr ":6020"
taskkill /PID <process_id> /F
```

Or change the port in `.env`:
```env
PORT=6021
```

### **Issue: MetaAPI connection failing**
**Symptoms:**
```
❌ Failed to initialize MetaAPI streaming connection
```

**Solutions:**
1. Check your MetaAPI credentials in `.env`
2. Verify your MetaAPI account is active
3. Check your internet connection
4. The server will retry every 10 seconds automatically

### **Issue: No price updates**
**Check:**
1. Is MetaAPI connected? (check `connected: true` in status)
2. Are symbols subscribed?
3. Is the market open? (Forex trades 24/5, closed on weekends)

---

## 📱 Integration with User Dashboard

The user dashboard (`forexuserapp`) connects to this WebSocket server to get real-time prices.

**Connection in code:**
```typescript
// In forexuserapp
const WEBSOCKET_URL = process.env.VITE_WEBSOCKET_URL || 'http://localhost:6020';
const socket = io(WEBSOCKET_URL);
```

---

## 🔐 Security

### **CORS Configuration**
The server allows connections from:
- `http://localhost:8080` (User Dashboard)
- `http://localhost:3001` (Admin Dashboard)
- `http://localhost:3000` (Development)

### **To Add More Origins:**
Edit `finalwebsocket/standalone-websocket-metaapi.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:3001",
      "https://yourdomain.com",  // Add your domain
    ],
    credentials: true,
  },
});
```

---

## 📊 Performance

- **Connection Pool**: Efficiently manages WebSocket connections
- **Price Caching**: Reduces redundant updates
- **Debouncing**: Only broadcasts when prices actually change
- **Automatic Reconnection**: Retries MetaAPI connection if it fails

---

## 🎯 Next Steps

1. ✅ Start the WebSocket server
2. ✅ Verify it's running on port 6020
3. ✅ Start the user dashboard (`npm run dev` in forexuserapp)
4. ✅ See real-time prices in the trading interface

---

**Status**: 🟢 **Running in background** - WebSocket server is active on port 6020!

Check the terminal output for connection status and price updates.

