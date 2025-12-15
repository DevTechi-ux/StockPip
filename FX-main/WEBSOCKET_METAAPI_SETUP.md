# 🔧 WebSocket Server - MetaAPI Setup Guide

## ✅ Quick Solution: Copy MetaAPI Credentials

Your MetaAPI credentials are in `forexuserapp/.env` (or `env.example`). You need to **copy them** to the `finalwebsocket` folder.

---

## 📝 **Step-by-Step Instructions**

### **Step 1: Check if you have `.env` in forexuserapp**

Look for either:
- `forexuserapp/.env` (actual environment file)
- `forexuserapp/env.example` (template file)

### **Step 2: Create `.env` file in finalwebsocket folder**

1. Go to `finalwebsocket/` folder
2. Create a new file named `.env` (no extension)
3. Add this content:

```env
# MetaAPI Configuration
METAAPI_TOKEN=your-metaapi-token-here
METAAPI_ACCOUNT_ID=your-metaapi-account-id-here

# Server Configuration
PORT=6020
```

### **Step 3: Copy your actual MetaAPI credentials**

**From `forexuserapp/.env` or `forexuserapp/env.example`:**
```env
METAAPI_TOKEN=your-metaapi-token-here
METAAPI_ACCOUNT_ID=your-metaapi-account-id-here
```

**Replace the values** in `finalwebsocket/.env` with your actual credentials.

---

## 🎯 **Option 1: Use Real MetaAPI (Recommended)**

### **If you have MetaAPI credentials:**

**finalwebsocket/.env:**
```env
METAAPI_TOKEN=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9...  # Your actual token
METAAPI_ACCOUNT_ID=abc123def456-ghi789-jkl012  # Your actual account ID
PORT=6020
```

### **Then run:**
```bash
cd finalwebsocket
npm start
```

**You'll see:**
```
🚀 Connecting to MetaAPI...
✅ MetaAPI streaming connection ready
📊 Subscribing to 16 symbols
🚀 MetaAPI WebSocket server listening on port 6020
```

---

## 🎯 **Option 2: Use Mock Data (For Testing Without MetaAPI)**

### **If you don't have MetaAPI or want to test quickly:**

```bash
cd finalwebsocket
npm run mock
```

**You'll see:**
```
🚀 Mock WebSocket server listening on port 6020
📊 Serving 18 symbols with MOCK data
⚠️  NOTE: Using simulated data - not real market prices
💡 To use real data, add MetaAPI credentials to .env
```

---

## 📋 **Available Commands**

### **In finalwebsocket folder:**

| Command | Description |
|---------|-------------|
| `npm start` | Start with MetaAPI (needs credentials) |
| `npm run mock` | Start with mock/simulated data |
| `npm run dev` | Start with MetaAPI (auto-reload) |
| `npm run dev:mock` | Start with mock data (auto-reload) |

### **From root folder:**

You can also update root `package.json` to add:
```json
"dev:websocket": "cd finalwebsocket && npm start",
"dev:websocket:mock": "cd finalwebsocket && npm run mock"
```

---

## 🔍 **How to Get MetaAPI Credentials**

### **Option A: If you already have MetaAPI account**

1. Go to https://app.metaapi.cloud/
2. Login to your account
3. Click on **"API" or "Tokens"**
4. Copy your **API Token**
5. Go to **"Accounts"**
6. Copy your **Account ID**

### **Option B: Create new MetaAPI account**

1. Go to https://metaapi.cloud/
2. Click **"Sign Up"** (Free tier available)
3. Verify your email
4. Connect a demo MT4/MT5 account (or real if you have one)
5. Get your credentials from the dashboard

### **Free Tier Details:**
- ✅ 1 MetaTrader account
- ✅ Real-time quotes
- ✅ Suitable for development/testing
- ✅ No credit card required

---

## 🧪 **Testing the WebSocket Server**

### **1. Check if it's running:**
```bash
# Open in browser
http://localhost:6020
```

**Should show:**
```json
{
  "status": "ok",
  "connected": true,
  "symbols": 16,
  "note": "Streaming real MetaAPI data"
}
```

### **2. Test price endpoint:**
```bash
# In browser or using curl
http://localhost:6020/api/forex/prices
```

### **3. Check WebSocket connection:**
```javascript
// In browser console
const socket = io('http://localhost:6020');
socket.on('price_update', (data) => console.log('Price:', data));
```

---

## 🔧 **Troubleshooting**

### **Error: METAAPI_TOKEN and METAAPI_ACCOUNT_ID required**

**Solution:**
1. ✅ Make sure `.env` file exists in `finalwebsocket/` folder
2. ✅ Check the file is named `.env` exactly (not `.env.txt`)
3. ✅ Make sure credentials are on separate lines
4. ✅ No spaces around the `=` sign

**Example:**
```env
METAAPI_TOKEN=abc123
METAAPI_ACCOUNT_ID=def456
```

### **Error: Failed to initialize MetaAPI**

**Possible causes:**
1. ❌ Invalid credentials
2. ❌ MetaAPI account not active
3. ❌ No internet connection
4. ❌ MetaAPI service down

**Solution:**
- Verify credentials are correct
- Check MetaAPI dashboard status
- Try using mock mode: `npm run mock`

### **Error: Port 6020 already in use**

**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr ":6020"
taskkill /PID <process_id> /F

# Or change port in .env
PORT=6021
```

---

## 🎯 **Recommended Setup**

### **For Development:**
Use **mock mode** for quick testing:
```bash
cd finalwebsocket
npm run mock
```

### **For Production:**
Use **real MetaAPI** with proper credentials:
```bash
cd finalwebsocket
npm start
```

---

## 📊 **What You'll Get**

### **Real-time data for:**
- 🌍 **14 Forex pairs**: EURUSD, GBPUSD, USDJPY, etc.
- 💰 **Crypto**: BTCUSD, ETHUSD
- 🥇 **Commodities**: XAUUSD (Gold), XAGUSD (Silver)

### **Data includes:**
- Bid/Ask prices
- Spread
- High/Low
- Timestamp
- Real-time updates (every second)

---

## ✅ **Final Checklist**

- [ ] Created `.env` file in `finalwebsocket/` folder
- [ ] Added MetaAPI credentials (or decided to use mock mode)
- [ ] Ran `npm start` or `npm run mock`
- [ ] Checked `http://localhost:6020` shows status OK
- [ ] Server is running without errors

---

**Choose your path:**
- 🚀 **Have MetaAPI?** → Use real data with credentials
- 🧪 **Testing only?** → Use mock mode: `npm run mock`

Both work perfectly for development! 🎉

