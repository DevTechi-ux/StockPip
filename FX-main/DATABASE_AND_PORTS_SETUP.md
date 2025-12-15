# 📊 Database & Ports Configuration - SIMPLIFIED

## ✅ Single Database Setup

**ALL applications now use ONE database: `forex_final`**

### Database Configuration
- **Database Name:** `forex_final` (single database for everything)
- **Host:** `127.0.0.1` (localhost)
- **Port:** `3306` (Standard MySQL/MariaDB port)
- **User:** `root`
- **Password:** (empty for default setup)

---

## 🔌 Port Configuration

### Ports in Use:
1. **User Dashboard + Backend API:** `8080`
   - Frontend: React/Vite
   - Backend: Express.js API
   - Location: `forexuserapp/`

2. **Admin Panel:** `3001`
   - Next.js application
   - Location: `Admin-Dashboard_-Business-Control-Panel-codebase/`

3. **WebSocket Server:** `6020`
   - Real-time price updates
   - Location: `finalwebsocket/`

### ❌ Ports NOT Used:
- **3002:** Not used (backend is on 8080, not 3002)
- **3000:** Not used (admin is on 3001)

---

## 🚀 How to Start

### Start User Dashboard + Backend (Port 8080):
```bash
cd forexuserapp
npm run dev
```

### Start Admin Panel (Port 3001):
```bash
cd Admin-Dashboard_-Business-Control-Panel-codebase
npm run dev
```

### Start WebSocket Server (Port 6020):
```bash
cd finalwebsocket
node standalone-websocket-metaapi.js
```

---

## ✅ Summary

- ✅ **ONE database:** `forex_final`
- ✅ **User Dashboard:** Port `8080`
- ✅ **Admin Panel:** Port `3001`
- ✅ **WebSocket:** Port `6020`
- ✅ **No confusion:** Everything standardized

