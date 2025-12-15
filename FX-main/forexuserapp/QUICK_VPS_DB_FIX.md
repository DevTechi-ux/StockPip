# Quick VPS Database Connection Fix

## 🚀 Quick Fix (Run on VPS)

### Step 1: SSH into your VPS
```bash
ssh user@your-vps-ip
```

### Step 2: Run the fix script
```bash
cd /path/to/your/project
sudo bash fix-vps-db-connection.sh
```

### Step 3: Test connection
```bash
bash test-vps-db-connection.sh
```

## 📋 Manual Steps

### 1. Check MySQL Status
```bash
sudo systemctl status mysql
# If not running:
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Check MySQL Port
```bash
sudo netstat -tlnp | grep 3306
# Should show: tcp 0.0.0.0:3306 or 127.0.0.1:3306
```

### 3. Update .env File
```bash
cd /path/to/Admin-Dashboard_-Business-Control-Panel-codebase
nano .env.local
```

Add:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=forex_final
```

### 4. Test Connection
```bash
mysql -u root -p -h 127.0.0.1 forex_final
```

### 5. If Database Doesn't Exist
```sql
CREATE DATABASE forex_final;
USE forex_final;
SOURCE /path/to/mysql_schema.sql;
```

## 🔍 Common Issues

### Issue: "Access denied"
**Fix:**
```bash
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Issue: "Can't connect"
**Fix:**
```bash
# Check MySQL is running
sudo systemctl restart mysql

# Check config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Make sure: bind-address = 127.0.0.1
```

### Issue: "Unknown database"
**Fix:**
```sql
CREATE DATABASE forex_final;
```

## 📝 Files Created

1. `test-vps-db-connection.sh` - Test database connection
2. `fix-vps-db-connection.sh` - Quick fix script
3. `VPS_DATABASE_CONNECTION_FIX.md` - Detailed guide

## ✅ Verification

After fixing, verify:
- [ ] MySQL service is running
- [ ] Can connect via command line
- [ ] .env file has correct credentials
- [ ] Application can connect
- [ ] Admin login works
