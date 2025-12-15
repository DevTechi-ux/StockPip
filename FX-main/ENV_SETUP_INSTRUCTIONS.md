# Environment Setup Instructions

## ✅ Database Connection Fixed!

Your MySQL database is now properly configured and connected on port **3306**.

## 📝 Creating Environment Files

Since `.env` files cannot be automatically created, you need to manually create them:

### For User Dashboard (forexuserapp)

Create a file named `.env` in the `forexuserapp/` directory with this content:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=forex_final

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MetaAPI Configuration (if using)
METAAPI_TOKEN=your-metaapi-token-here
METAAPI_ACCOUNT_ID=your-metaapi-account-id-here

# WebSocket Configuration
WS_PORT=6020
VITE_WEBSOCKET_URL=ws://localhost:6020

# Admin Configuration
ADMIN_EMAIL=admin@ventablack.com
ADMIN_PASSWORD=admin123

# OxaPay Configuration
OXAPAY_API_KEY=your-oxapay-api-key-here
OXAPAY_MERCHANT_ID=your-oxapay-merchant-id-here
OXAPAY_CALLBACK_URL=http://localhost:8080/api/oxapay/callback
OXAPAY_RETURN_URL=http://localhost:8080/wallet
```

### For Admin Dashboard

Create a file named `.env` in the `Admin-Dashboard_-Business-Control-Panel-codebase/` directory with this content:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=forex_final

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (should match main app)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js specific
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## ✅ What Was Fixed

1. **Port Changed**: From `3309` → `3306` (standard MySQL port)
2. **Connection Config Updated** in:
   - `forexuserapp/server/database.ts`
   - `Admin-Dashboard_-Business-Control-Panel-codebase/src/lib/mysql.ts`
   - `forexuserapp/test-db-connection.js`
   - `forexuserapp/setup-database.js`

## ✅ Database Status

- ✅ **Connection**: Working
- ✅ **Database**: `forex_final`
- ✅ **Tables**: 26 tables found
- ✅ **MySQL Version**: 10.4.32-MariaDB

## 🚀 Next Steps

1. **Create the `.env` files** as shown above (optional but recommended)
2. **Start your applications**:

```bash
# User Dashboard + Backend API (Port 8080)
cd forexuserapp
npm run dev

# Admin Panel (Port 3001)
cd Admin-Dashboard_-Business-Control-Panel-codebase
npm run dev

# WebSocket Server (Port 6020)
cd finalwebsocket
node standalone-websocket-metaapi.js
```

## 🔧 If You Change Database Settings

If you need to change the database host, port, user, or password:

1. **Option 1 (Recommended)**: Create/update `.env` files with your settings
2. **Option 2**: The code will use these defaults if no `.env` exists:
   - Host: `127.0.0.1`
   - Port: `3306`
   - User: `root`
   - Password: (empty)
   - Database: `forex_final`

## ℹ️ Note

The `.env` files are ignored by git for security reasons, so they won't appear in version control. This is intentional to keep sensitive data (like passwords and API keys) secure.

