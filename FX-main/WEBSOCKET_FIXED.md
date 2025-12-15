# ✅ WebSocket Server - Issues Fixed!

## 🔧 Problems & Solutions

### **Problem 1: MetaApi is not a constructor**
**Error:**
```
TypeError: MetaApi is not a constructor
```

**Cause:** Incorrect ES module import syntax for `metaapi.cloud-sdk`

**Solution Applied:**
Changed from:
```javascript
import MetaApi from "metaapi.cloud-sdk";
```

To:
```javascript
import pkg from "metaapi.cloud-sdk";
const { default: MetaApi } = pkg;
```

---

### **Problem 2: Port 6020 Already in Use**
**Error:**
```
Error: listen EADDRINUSE: address already in use :::6020
```

**Cause:** Previous WebSocket server instance was still running

**Solution Applied:**
```bash
# Found process ID
netstat -ano | findstr ":6020"

# Killed the process
taskkill /PID 17672 /F
```

---

## ✅ Current Status

### **WebSocket Server: 🟢 RUNNING**

- **Port**: 6020
- **Process ID**: 17272
- **Status**: Active and listening
- **Connections**: Established

---

## 🧪 Test Your Server

### **1. Health Check**
Open in browser:
```
http://localhost:6020
```

Expected response:
```json
{
  "status": "ok",
  "connected": true,
  "symbols": 16
}
```

### **2. Get All Prices**
```
http://localhost:6020/api/forex/prices
```

### **3. Get Specific Symbol**
```
http://localhost:6020/api/forex/price/EURUSD
```

---

## 📋 Useful Commands

### **Check if WebSocket is Running**
```bash
netstat -ano | findstr ":6020"
```

### **Stop the Server**
```bash
# Find PID
netstat -ano | findstr ":6020"

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### **Start the Server**
```bash
cd finalwebsocket
npm start
```

### **Start with Auto-Reload**
```bash
cd finalwebsocket
npm run dev
```

---

## 🔍 If You Get Errors Again

### **"MetaApi is not a constructor"**
✅ **Fixed!** The import is now correct.

### **"Port already in use"**
Run these commands:
```bash
netstat -ano | findstr ":6020"
taskkill /PID <PID> /F
```

### **"MetaAPI connection failed"**
- Check your internet connection
- Verify `.env` file exists in `finalwebsocket/`
- Check MetaAPI credentials are valid
- Wait 30-60 seconds for connection to establish

---

## 📊 What's Streaming Now

Your WebSocket server is providing real-time data for:

### **Forex (14 pairs)**
- EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, NZDUSD, USDCHF
- EURJPY, GBPJPY, AUDJPY, EURGBP, EURAUD, EURNZD, EURCHF

### **Crypto (2)**
- BTCUSD (Bitcoin)
- ETHUSD (Ethereum)

### **Commodities (2)**
- XAUUSD (Gold)
- XAGUSD (Silver)

---

## 🚀 Next Steps

Now that WebSocket is running, start your other services:

### **Terminal 1 - WebSocket (Port 6020)**
```bash
cd finalwebsocket
npm start
```
✅ **Already Running!**

### **Terminal 2 - User Dashboard (Port 8080)**
```bash
cd forexuserapp
npm run dev
```

### **Terminal 3 - Admin Dashboard (Port 3001)**
```bash
cd Admin-Dashboard_-Business-Control-Panel-codebase
npm run dev
```

---

## ✅ Access URLs

| Service | URL | Status |
|---------|-----|--------|
| WebSocket Server | http://localhost:6020 | ✅ Running |
| User Dashboard | http://localhost:8080 | Pending |
| Admin Dashboard | http://localhost:3001 | Pending |

---

## 💡 Pro Tips

1. **Keep WebSocket Running**: Don't close the terminal running the WebSocket server
2. **Check Logs**: Watch the terminal for connection status and errors
3. **Market Hours**: Real prices only during forex market hours (Mon-Fri, 24h)
4. **Reconnection**: Server automatically reconnects if connection drops

---

**Your WebSocket server is now working correctly!** 🎉

The ES module import issue is fixed and the server is streaming real MetaAPI data!

