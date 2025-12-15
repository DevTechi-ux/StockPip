# 🚀 Complete Project Overview & Deployment Guide
##  StockPip Forex Trading Platform

---

## 📋 PROJECT OVERVIEW

### **Project Structure:**
```
Forexfinal/
├── forexuserapp/              # User Dashboard + Backend API (Main App)
├── Admin-Dashboard/           # Admin Panel (Next.js)
├── websiteapp/                # Marketing Website (Next.js)
├── finalwebsocket/            # Standalone WebSocket Server
└── mysql_schema.sql           # Database Schema
```

---

## 🎯 APPLICATION COMPONENTS

### **1. User Dashboard + Backend API** (`forexuserapp/`)
- **Technology:** React (Vite) + Express.js
- **Port:** 8080
- **URL:** http://localhost:8080
- **Features:**
  - Trading interface with TradingView charts
  - Real-time price updates via WebSocket
  - Position management
  - Order execution (Buy/Sell)
  - Wallet management (Deposit/Withdrawal)
  - Portfolio & history
  - Support tickets
  - API integration
  - Mobile responsive design

### **2. Admin Panel** (`Admin-Dashboard_-Business-Control-Panel-codebase/`)
- **Technology:** Next.js 15
- **Port:** 3001
- **URL:** http://localhost:3001
- **Features:**
  - User management (CRUD)
  - Dashboard with statistics
  - Fund request approval/rejection
  - Position & order management
  - Transaction history
  - Fees/charges management
  - Bank account management
  - Wallet management (Add/Deduct funds)

### **3. Website App** (`websiteapp/`)
- **Technology:** Next.js 15
- **Port:** 3000
- **URL:** http://localhost:3000
- **Features:**
  - Marketing/landing pages
  - Public website content

### **4. WebSocket Server** (`finalwebsocket/`)
- **Technology:** Node.js + Socket.IO + MetaAPI SDK
- **Port:** 6020
- **URL:** ws://localhost:6020
- **Features:**
  - Real-time price feeds
  - MetaAPI integration
  - Live trading data streaming

### **5. Database** (MySQL)
- **Port:** 3306 (Production) / 3309 (XAMPP Local)
- **Database Name:** forex_trading
- **Schema File:** mysql_schema.sql

---

## 🔌 LOCAL PORT CONFIGURATION

### **Development Ports (Local Machine):**

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **User Dashboard** | **8080** | http://localhost:8080 | ✅ Main App |
| **Admin Panel** | **3001** | http://localhost:3001 | ✅ Admin Interface |
| **Website** | **3000** | http://localhost:3000 | ✅ Marketing Site |
| **WebSocket Server** | **6020** | ws://localhost:6020 | ✅ Price Feed |
| **MySQL Database** | **3306/3309** | localhost:3306 | ✅ Database |

### **How to Start Locally:**

```bash
# Terminal 1: User Dashboard (includes Backend API)
cd forexuserapp
npm install
npm run dev
# Runs on http://localhost:8080

# Terminal 2: Admin Panel
cd Admin-Dashboard_-Business-Control-Panel-codebase
npm install
npm run dev
# Runs on http://localhost:3001

# Terminal 3: Website App (Optional)
cd websiteapp
npm install
npm run dev
# Runs on http://localhost:3000

# Terminal 4: WebSocket Server
cd finalwebsocket
npm install
node standalone-websocket-metaapi.js
# Runs on ws://localhost:6020
```

---

## 🌐 PRODUCTION DEPLOYMENT PORTS (VPS)

### **VPS Port Allocation:**

| Service | Port | Domain/URL | Purpose |
|---------|------|------------|---------|
| **User Dashboard** | **8080** |  StockPip.com | Main Trading Platform |
| **Admin Panel** | **3001** | admin. StockPip.com | Admin Interface |
| **Website** | **3000** | www. StockPip.com (optional) | Marketing Site |
| **WebSocket Server** | **6020** | ws:// StockPip.com:6020 | Real-time Prices |
| **Nginx (Reverse Proxy)** | **80/443** |  StockPip.com | SSL + Routing |
| **MySQL Database** | **3306** | localhost:3306 | Database |

---

## 🗄️ DATABASE INFORMATION

### **Database Details:**
- **Host:** localhost
- **Port:** 3306
- **Database Name:** forex_trading
- **Username:** forex_user
- **Password:**  StockPip2024!Secure
- **Schema File:** mysql_schema.sql

### **Main Tables:**
- `users` - User accounts
- `trading_accounts` - User wallets/balances
- `positions` - Open trading positions
- `trading_history` - Closed trades
- `orders` - Pending orders
- `fund_requests` - Deposit/withdrawal requests
- `wallet_transactions` - All money movements
- `bank_accounts` - Bank account details
- `broker_charges` - Fees configuration
- `support_tickets` - Support system

---

## 📦 DEPLOYMENT PROCESS (STEP BY STEP)

### **PHASE 1: Database Setup** ✅

**Step 1.1: Upload SQL Schema**
```bash
# On LOCAL machine:
scp mysql_schema.sql root@31.97.207.252:/root/
```

**Step 1.2: Import Database (on VPS)**
```bash
ssh root@31.97.207.252

# Update database name in schema
sed -i 's/USE forex_final;/USE forex_trading;/g' /root/mysql_schema.sql

# Import schema
mysql -u forex_user -p StockPip2024!Secure forex_trading < /root/mysql_schema.sql

# Verify tables created
mysql -u forex_user -p StockPip2024!Secure forex_trading -e "SHOW TABLES;"
```

---

### **PHASE 2: Upload Application Files**

**Step 2.1: Create Zip File (on LOCAL machine)**
```bash
cd /Users/shivamsingh/Desktop/Forexfinal

# Create zip excluding node_modules and dist
zip -r  StockPip-platform.zip \
  forexuserapp \
  Admin-Dashboard_-Business-Control-Panel-codebase \
  websiteapp \
  finalwebsocket \
  -x "*/node_modules/*" "*/dist/*" "*.git/*" "*/build/*" "*.next/*"
```

**Step 2.2: Upload to VPS**
```bash
scp  StockPip-platform.zip root@31.97.207.252:/root/
```

**Step 2.3: Extract on VPS**
```bash
ssh root@31.97.207.252

cd /var/www
mkdir -p  StockPip
cd  StockPip
unzip /root/ StockPip-platform.zip
```

---

### **PHASE 3: Install Dependencies**

**Step 3.1: Install PM2 (if not installed)**
```bash
npm install -g pm2
```

**Step 3.2: Install Dependencies for Each App**
```bash
cd /var/www/ StockPip

# User Dashboard
cd forexuserapp
npm install
cd ..

# Admin Panel
cd Admin-Dashboard_-Business-Control-Panel-codebase
npm install
cd ..

# Website App (Optional)
cd websiteapp
npm install
cd ..

# WebSocket Server
cd finalwebsocket
npm install
cd ..
```

---

### **PHASE 4: Configure Environment Variables**

**Step 4.1: User Dashboard `.env`**
```bash
cd /var/www/ StockPip/forexuserapp
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=forex_user
DB_PASSWORD= StockPip2024!Secure
DB_NAME=forex_trading
PORT=8080
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
WS_PORT=6020
VITE_WEBSOCKET_URL=ws:// StockPip.com:6020
METAAPI_TOKEN=your-metaapi-token-here
METAAPI_ACCOUNT_ID=your-metaapi-account-id-here
EOF
```

**Step 4.2: Admin Panel `.env.local`**
```bash
cd /var/www/ StockPip/Admin-Dashboard_-Business-Control-Panel-codebase
cat > .env.local << 'EOF'
DATABASE_URL=mysql://forex_user: StockPip2024!Secure@localhost:3306/forex_trading
NEXTAUTH_SECRET=your-nextauth-secret-change-this-2024
NEXTAUTH_URL=https://admin. StockPip.com
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
```

**Step 4.3: Website App `.env.local` (Optional)**
```bash
cd /var/www/ StockPip/websiteapp
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
```

**Step 4.4: WebSocket Server `.env`**
```bash
cd /var/www/ StockPip/finalwebsocket
cat > .env << 'EOF'
METAAPI_TOKEN=your-metaapi-token-here
METAAPI_ACCOUNT_ID=your-metaapi-account-id-here
PORT=6020
EOF
```

---

### **PHASE 5: Build Applications**

**Step 5.1: Build User Dashboard**
```bash
cd /var/www/ StockPip/forexuserapp
npm run build
```

**Step 5.2: Build Admin Panel**
```bash
cd /var/www/ StockPip/Admin-Dashboard_-Business-Control-Panel-codebase
npm run build
```

**Step 5.3: Build Website App (Optional)**
```bash
cd /var/www/ StockPip/websiteapp
npm run build
```

---

### **PHASE 6: Start Services with PM2**

**Step 6.1: Start User Dashboard Backend API**
```bash
cd /var/www/ StockPip/forexuserapp

# Option A: Using compiled server
pm2 start dist/server/node-build.mjs --name "forex-api" --interpreter node

# Option B: Using tsx (development)
pm2 start npm --name "forex-api" -- run dev

# Option C: Using server/index.ts directly
pm2 start server/index.ts --name "forex-api" --interpreter tsx
```

**Step 6.2: Start WebSocket Server**
```bash
cd /var/www/ StockPip/finalwebsocket
pm2 start standalone-websocket-metaapi.js --name "websocket-server" --interpreter node
```

**Step 6.3: Start Admin Panel**
```bash
cd /var/www/ StockPip/Admin-Dashboard_-Business-Control-Panel-codebase
pm2 start npm --name "admin-panel" -- start
```

**Step 6.4: Start Website App (Optional)**
```bash
cd /var/www/ StockPip/websiteapp
pm2 start npm --name "website-app" -- start
```

**Step 6.5: Save PM2 Configuration**
```bash
pm2 save
pm2 startup
# Follow the instructions to enable PM2 on system startup
```

**Step 6.6: Check PM2 Status**
```bash
pm2 status
pm2 logs
```

---

### **PHASE 7: Configure Nginx Reverse Proxy**

**Step 7.1: Create Nginx Config for Main Domain**
```bash
cat > /etc/nginx/sites-available/ StockPip.com << 'EOF'
server {
    listen 80;
    server_name  StockPip.com www. StockPip.com;

    # User Dashboard
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for WebSocket
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:6020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
EOF
```

**Step 7.2: Create Nginx Config for Admin Subdomain**
```bash
cat > /etc/nginx/sites-available/admin. StockPip.com << 'EOF'
server {
    listen 80;
    server_name admin. StockPip.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

**Step 7.3: Enable Sites**
```bash
ln -s /etc/nginx/sites-available/ StockPip.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/admin. StockPip.com /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

### **PHASE 8: Configure DNS**

**In your domain registrar (where you bought  StockPip.com):**

Add these DNS A records:

```
Type: A
Name: @
Value: 31.97.207.252
TTL: 3600

Type: A
Name: www
Value: 31.97.207.252
TTL: 3600

Type: A
Name: admin
Value: 31.97.207.252
TTL: 3600
```

**Wait for DNS propagation (5-30 minutes)**

---

### **PHASE 9: Install SSL Certificates**

**Step 9.1: Install Certbot**
```bash
apt install -y certbot python3-certbot-nginx
```

**Step 9.2: Get SSL Certificates**
```bash
# For main domain
certbot --nginx -d  StockPip.com -d www. StockPip.com

# For admin subdomain
certbot --nginx -d admin. StockPip.com
```

**Step 9.3: Auto-renewal (automatically configured)**
```bash
# Test renewal
certbot renew --dry-run
```

---

### **PHASE 10: Final Verification**

**Step 10.1: Check All Services**
```bash
# Check PM2
pm2 status
pm2 logs

# Check Nginx
systemctl status nginx
nginx -t

# Check MySQL
systemctl status mysql
mysql -u forex_user -p StockPip2024!Secure forex_trading -e "SHOW TABLES;"

# Check Ports
netstat -tlnp | grep -E ':(8080|3001|6020|80|443)'
```

**Step 10.2: Test URLs**
- ✅ http:// StockPip.com (User Dashboard)
- ✅ https:// StockPip.com (User Dashboard with SSL)
- ✅ https://admin. StockPip.com (Admin Panel)
- ✅ ws:// StockPip.com:6020 (WebSocket)

---

## 🔍 VERIFICATION CHECKLIST

### **Local Development:**
- [ ] User Dashboard running on http://localhost:8080
- [ ] Admin Panel running on http://localhost:3001
- [ ] Website running on http://localhost:3000 (optional)
- [ ] WebSocket server running on ws://localhost:6020
- [ ] Database connected and working
- [ ] All API endpoints responding

### **Production (VPS):**
- [ ] Database imported successfully
- [ ] All applications built
- [ ] PM2 running all services
- [ ] Nginx configured and running
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] All URLs accessible
- [ ] WebSocket connection working
- [ ] Database connections working

---

## 🛠️ TROUBLESHOOTING

### **Common Issues:**

**1. Port Already in Use**
```bash
# Find process using port
lsof -i :8080
lsof -i :3001
lsof -i :6020

# Kill process
kill -9 <PID>
```

**2. PM2 Service Not Starting**
```bash
pm2 logs <service-name>
pm2 restart <service-name>
pm2 delete <service-name>
pm2 start <script> --name <name>
```

**3. Database Connection Failed**
```bash
# Check MySQL status
systemctl status mysql

# Test connection
mysql -u forex_user -p StockPip2024!Secure forex_trading -e "SELECT 1;"

# Check firewall
ufw status
```

**4. Nginx 502 Bad Gateway**
```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test backend directly
curl http://localhost:8080/api/ping
```

---

## 📞 SUPPORT & MAINTENANCE

### **Useful Commands:**

```bash
# View all logs
pm2 logs

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Monitor resources
pm2 monit

# Check Nginx status
systemctl status nginx
nginx -t

# Check MySQL status
systemctl status mysql

# View database
mysql -u forex_user -p StockPip2024!Secure forex_trading
```

---

## 🎯 QUICK DEPLOYMENT SUMMARY

1. ✅ **Database:** Import mysql_schema.sql
2. ✅ **Upload Files:** Zip and upload all apps
3. ✅ **Install Dependencies:** npm install in each app
4. ✅ **Configure .env:** Set database and API URLs
5. ✅ **Build Apps:** npm run build
6. ✅ **Start PM2:** Start all services with PM2
7. ✅ **Configure Nginx:** Set up reverse proxy
8. ✅ **Configure DNS:** Add A records
9. ✅ **Install SSL:** Certbot certificates
10. ✅ **Verify:** Test all URLs and services

---

**🚀 Your platform will be live at:**
- **User Dashboard:** https:// StockPip.com
- **Admin Panel:** https://admin. StockPip.com
- **WebSocket:** ws:// StockPip.com:6020





