#  StockPip - Complete Forex Trading Platform

A comprehensive forex trading platform with admin dashboard, user trading app, and marketing website.

## 🚀 Quick Deployment

### Prerequisites
- Ubuntu 20.04+ VPS
- MySQL 8.0+
- Node.js 18+
- Apache/Nginx
- PM2

### 1. Clone Repository
```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/ StockPip-forex.git forexfinal
cd forexfinal
```

### 2. Database Setup
```bash
# Import schema
mysql -u fx -p forex_final < mysql_schema.sql
```

### 3. Environment Configuration
```bash
# User App
cat > forexuserapp/.env << 'EOF'
PORT=8080
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=fx
DB_PASSWORD=your_password
DB_NAME=forex_final
WEBSOCKET_URL=ws://127.0.0.1:6020
EOF

# Admin Dashboard
cat > Admin-Dashboard_-Business-Control-Panel-codebase/.env << 'EOF'
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=fx
DB_PASSWORD=your_password
DB_NAME=forex_final
EOF

# Website
cat > websiteapp/.env << 'EOF'
NODE_ENV=production
EOF
```

### 4. Install & Build
```bash
# Website App
cd websiteapp
npm install --legacy-peer-deps
npm run build
cd ..

# Admin Dashboard
cd Admin-Dashboard_-Business-Control-Panel-codebase
npm install --legacy-peer-deps
npm run build
cd ..

# User App
cd forexuserapp
npm install --legacy-peer-deps
npm run build
cd ..
```

### 5. Start Services with PM2
```bash
# Website (Port 3001)
cd websiteapp
PORT=3001 pm2 start "npm run start" --name website

# Admin Dashboard (Port 3000)
cd ../Admin-Dashboard_-Business-Control-Panel-codebase
PORT=3000 pm2 start "npm run start" --name admin

# User App (Port 8080)
cd ../forexuserapp
PORT=8080 pm2 start "npm run start" --name userapp

# WebSocket Server (Port 6020)
cd ../websocket-pack
PORT=6020 pm2 start app.js --name websocket

pm2 save
pm2 startup
```

### 6. Apache Reverse Proxy
```bash
# Enable required modules
a2enmod proxy proxy_http proxy_wstunnel rewrite ssl

# Create virtual host
cat > /etc/apache2/sites-available/ StockPip.conf << 'EOF'
<VirtualHost *:80>
    ServerName your-domain.com
    
    # Website (Default)
    ProxyPreserveHost On
    ProxyPass /api/ !
    ProxyPass / http://127.0.0.1:3001/
    ProxyPassReverse / http://127.0.0.1:3001/
    
    # Admin Dashboard
    ProxyPass /admin/ http://127.0.0.1:3000/
    ProxyPassReverse /admin/ http://127.0.0.1:3000/
    
    # User Trading App
    ProxyPass /app/ http://127.0.0.1:8080/
    ProxyPassReverse /app/ http://127.0.0.1:8080/
    
    # WebSocket
    ProxyPass /ws/ ws://127.0.0.1:6020/
    ProxyPassReverse /ws/ ws://127.0.0.1:6020/
</VirtualHost>
EOF

a2ensite  StockPip
systemctl reload apache2
```

## 📁 Project Structure

```
├── Admin-Dashboard_-Business-Control-Panel-codebase/  # Next.js Admin Dashboard
├── forexuserapp/                                      # React Trading App + Express API
├── websiteapp/                                        # Next.js Marketing Website
├── websocket-pack/                                    # WebSocket Server for Real-time Data
├── mysql_schema.sql                                   # Database Schema
└── shared/                                            # Shared Database Types
```

## 🔧 Services & Ports

- **Website**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3000
- **User Trading App**: http://localhost:8080
- **WebSocket Server**: ws://localhost:6020
- **MySQL**: localhost:3306
- **phpMyAdmin**: http://your-server/phpmyadmin

## 🗄️ Database

- **Database**: `forex_final`
- **User**: `fx`
- **Tables**: users, trading_accounts, positions, trading_history, wallet_transactions, fund_requests, bank_accounts, support_tickets, notifications, broker_charges

## 🔐 Default Admin Credentials

- **Email**: admin@ StockPip.com
- **Password**: admin123

## 🛠️ Development

```bash
# Start all services in development
npm run dev:all

# Individual services
cd forexuserapp && npm run dev
cd Admin-Dashboard_-Business-Control-Panel-codebase && npm run dev
cd websiteapp && npm run dev
cd websocket-pack && node app.js
```

## 📝 Features

### Admin Dashboard
- User management (add/edit/ban users)
- Fund management (deposits/withdrawals)
- Trading positions monitoring
- Support ticket management
- Bank account management
- Broker charges configuration
- Real-time statistics

### User Trading App
- Real-time forex trading
- Portfolio management
- Deposit/withdrawal requests
- Support tickets
- Trading history
- Real-time P&L calculation

### Marketing Website
- Landing page
- Features showcase
- Contact forms
- Responsive design

## 🚀 Production Deployment

1. Set up SSL certificates with Let's Encrypt
2. Configure firewall (UFW)
3. Set up monitoring (PM2 monitoring)
4. Configure backups
5. Set up domain and DNS

## 📞 Support

For deployment assistance: [WhatsApp +919238822465](https://wa.me/919238822465)
