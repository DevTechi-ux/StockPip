# 🚀 Complete Deployment Guide - GoDaddy + DigitalOcean

## 📋 What You Have

- ✅ **GoDaddy Account** - Domain management (DNS)
- ✅ **DigitalOcean Server** - VPS/Droplet hosting
- ✅ **FileZilla** - FTP/SFTP file transfer
- ✅ **Project Files** - Your forex trading platform

---

## 🎯 Deployment Overview

```
Your Computer → FileZilla → DigitalOcean Server → Internet
                               ↓
GoDaddy Domain (DNS) → Points to → DigitalOcean Server IP
```

---

## 📝 **STEP 1: Set Up DigitalOcean Server**

### **1.1 - Access Your DigitalOcean Droplet**

1. **Login to DigitalOcean**: https://cloud.digitalocean.com/
2. **Find your Droplet** (VPS server)
3. **Note down**:
   - ✅ IP Address (e.g., `167.71.45.123`)
   - ✅ Username (usually `root`)
   - ✅ Password or SSH Key

### **1.2 - Connect via SSH (First Time)**

**Using PuTTY (Windows):**
1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Enter your Droplet IP address
4. Click "Open"
5. Login with username `root` and your password

**Or using PowerShell:**
```bash
ssh root@YOUR_DROPLET_IP
```

---

## 🔧 **STEP 2: Prepare the Server**

### **2.1 - Update Server**
```bash
apt update && apt upgrade -y
```

### **2.2 - Install Node.js**
```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node -v
npm -v
```

### **2.3 - Install MySQL/MariaDB**
```bash
# Install MariaDB
apt install -y mariadb-server

# Secure MySQL installation
mysql_secure_installation

# Create database
mysql -u root -p
```

In MySQL prompt:
```sql
CREATE DATABASE forex_final;
CREATE USER 'forex_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON forex_final.* TO 'forex_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **2.4 - Install Nginx (Web Server)**
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### **2.5 - Install PM2 (Process Manager)**
```bash
npm install -g pm2
```

---

## 📁 **STEP 3: Upload Files Using FileZilla**

### **3.1 - Connect FileZilla to DigitalOcean**

1. **Open FileZilla**
2. Click **File → Site Manager**
3. Click **New Site** (name it "DigitalOcean")
4. **Configure:**
   - **Protocol**: SFTP - SSH File Transfer Protocol
   - **Host**: Your Droplet IP (e.g., `167.71.45.123`)
   - **Port**: 22
   - **Logon Type**: Normal
   - **User**: root
   - **Password**: Your server password
5. Click **Connect**

### **3.2 - Create Project Directory on Server**

In SSH terminal:
```bash
mkdir -p /var/www/StockPip
cd /var/www/StockPip
```

### **3.3 - Upload Project Files**

In FileZilla:
1. **Left panel** (Local): Navigate to `D:\kolkataClient\FX-main`
2. **Right panel** (Remote): Navigate to `/var/www/StockPip`
3. **Select these folders** and drag to right panel:
   - `forexuserapp/`
   - `Admin-Dashboard_-Business-Control-Panel-codebase/`
   - `websiteapp/`
   - `finalwebsocket/`
   - `mysql_schema.sql`

⏰ **This will take time** (10-30 minutes depending on file size)

---

## 🔐 **STEP 4: Configure Environment Variables**

### **4.1 - Create .env Files on Server**

SSH into server and create `.env` files:

**For forexuserapp:**
```bash
cd /var/www/StockPip/forexuserapp
nano .env
```

Add:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=forex_user
DB_PASSWORD=your_secure_password
DB_NAME=forex_final

PORT=8080
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this

METAAPI_TOKEN=your-token
METAAPI_ACCOUNT_ID=your-account-id

WS_PORT=6020
VITE_WEBSOCKET_URL=wss://yourdomain.com:6020
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

**Repeat for Admin Dashboard:**
```bash
cd /var/www/StockPip/Admin-Dashboard_-Business-Control-Panel-codebase
nano .env
```

**Repeat for finalwebsocket:**
```bash
cd /var/www/StockPip/finalwebsocket
nano .env
```

---

## 📊 **STEP 5: Import Database**

### **5.1 - Upload Database Schema**

If you uploaded `mysql_schema.sql`:
```bash
cd /var/www/StockPip
mysql -u forex_user -p forex_final < mysql_schema.sql
```

### **5.2 - Verify Database**
```bash
mysql -u forex_user -p
USE forex_final;
SHOW TABLES;
EXIT;
```

---

## 📦 **STEP 6: Build and Start Applications**

### **6.1 - User Dashboard (forexuserapp)**
```bash
cd /var/www/StockPip/forexuserapp
npm install --production
npm run build

# Start with PM2
pm2 start npm --name "user-app" -- start
```

### **6.2 - Admin Dashboard**
```bash
cd /var/www/StockPip/Admin-Dashboard_-Business-Control-Panel-codebase
npm install --production
npm run build

# Start with PM2
pm2 start npm --name "admin-app" -- start
```

### **6.3 - Website**
```bash
cd /var/www/StockPip/websiteapp
npm install --production
npm run build

# Start with PM2
pm2 start npm --name "website" -- start
```

### **6.4 - WebSocket Server**
```bash
cd /var/www/StockPip/finalwebsocket
npm install --production

# Start with PM2
pm2 start npm --name "websocket" -- start
```

### **6.5 - Save PM2 Configuration**
```bash
pm2 save
pm2 startup
```

---

## 🌐 **STEP 7: Configure Nginx**

### **7.1 - Create Nginx Configuration**

```bash
nano /etc/nginx/sites-available/StockPip
```

Add this configuration:
```nginx
# User Dashboard
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Dashboard
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# WebSocket Server
server {
    listen 6020;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:6020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **7.2 - Enable Configuration**
```bash
ln -s /etc/nginx/sites-available/StockPip /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🔗 **STEP 8: Configure GoDaddy DNS**

### **8.1 - Login to GoDaddy**
1. Go to: https://sso.godaddy.com/
2. Login with the credentials client gave you
3. Go to **My Products** → **Domains**
4. Click on your domain

### **8.2 - Update DNS Records**

Click **DNS** → **Manage DNS** → **Add Record**

**Add these A Records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_DROPLET_IP | 600 |
| A | www | YOUR_DROPLET_IP | 600 |
| A | admin | YOUR_DROPLET_IP | 600 |

**Example:**
- Type: `A`
- Name: `@`
- Value: `167.71.45.123` (your actual IP)
- TTL: `600 seconds`

Click **Save**

⏰ **DNS propagation takes 1-24 hours** (usually 1-2 hours)

---

## 🔒 **STEP 9: Install SSL Certificate (HTTPS)**

### **9.1 - Install Certbot**
```bash
apt install -y certbot python3-certbot-nginx
```

### **9.2 - Get SSL Certificate**
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com
```

Follow prompts:
1. Enter email address
2. Agree to terms
3. Choose redirect (Yes)

### **9.3 - Auto-Renewal**
```bash
certbot renew --dry-run
```

---

## ✅ **STEP 10: Verify Deployment**

### **10.1 - Check PM2 Status**
```bash
pm2 list
pm2 logs
```

### **10.2 - Check Nginx**
```bash
systemctl status nginx
nginx -t
```

### **10.3 - Test URLs**

After DNS propagation:
- ✅ User Dashboard: `https://yourdomain.com`
- ✅ Admin Dashboard: `https://admin.yourdomain.com`
- ✅ WebSocket: `wss://yourdomain.com:6020`

---

## 🔧 **Common Commands**

### **Restart Applications**
```bash
pm2 restart all
```

### **View Logs**
```bash
pm2 logs user-app
pm2 logs admin-app
pm2 logs websocket
```

### **Update Files**
```bash
# Upload new files via FileZilla
cd /var/www/StockPip/forexuserapp
npm run build
pm2 restart user-app
```

### **Check Server Resources**
```bash
pm2 monit
htop
df -h
```

---

## 🛠️ **Troubleshooting**

### **Issue: Application won't start**
```bash
pm2 logs app-name
# Check the error logs
```

### **Issue: Database connection failed**
```bash
# Test MySQL connection
mysql -u forex_user -p forex_final

# Check if MySQL is running
systemctl status mariadb
```

### **Issue: Can't access via domain**
1. Check DNS propagation: https://dnschecker.org/
2. Check Nginx: `systemctl status nginx`
3. Check firewall: `ufw status`

### **Issue: Port blocked**
```bash
# Open ports
ufw allow 80
ufw allow 443
ufw allow 6020
ufw allow 22
ufw enable
```

---

## 📋 **Deployment Checklist**

- [ ] DigitalOcean Droplet created and accessible
- [ ] Node.js installed
- [ ] MySQL/MariaDB installed and configured
- [ ] Database created and imported
- [ ] Nginx installed
- [ ] PM2 installed
- [ ] Files uploaded via FileZilla
- [ ] .env files configured
- [ ] Applications built and started
- [ ] Nginx configured
- [ ] GoDaddy DNS configured
- [ ] SSL certificate installed
- [ ] All applications running
- [ ] URLs accessible

---

## 🎯 **Quick Reference**

### **Your Setup:**
```
Domain (GoDaddy) → DNS → DigitalOcean IP
                          ↓
                    Nginx (Reverse Proxy)
                          ↓
            ┌─────────────┼─────────────┐
            ↓             ↓             ↓
       Port 8080     Port 3001     Port 6020
    (User Dashboard) (Admin Panel) (WebSocket)
            ↓             ↓             ↓
          MySQL      MySQL/Files    MetaAPI
```

### **Important Paths:**
- Project: `/var/www/StockPip`
- Nginx Config: `/etc/nginx/sites-available/StockPip`
- Logs: `pm2 logs`

---

## 📞 **Need Help?**

Common issues and solutions are in the Troubleshooting section above.

**Good luck with your deployment!** 🚀

