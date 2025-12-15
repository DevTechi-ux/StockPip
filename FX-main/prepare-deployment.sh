#!/bin/bash

#  StockPip Forex Platform - Deployment Preparation Script
# This script prepares the project for clean deployment

echo "🚀 Preparing  StockPip Platform for Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create deployment directory
DEPLOY_DIR="deployment-package"
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy core applications
echo -e "${GREEN}✅ Copying User Dashboard...${NC}"
cp -r forexuserapp $DEPLOY_DIR/
rm -rf $DEPLOY_DIR/forexuserapp/node_modules
rm -rf $DEPLOY_DIR/forexuserapp/dist
rm -rf $DEPLOY_DIR/forexuserapp/.next

echo -e "${GREEN}✅ Copying Admin Panel...${NC}"
cp -r Admin-Dashboard_-Business-Control-Panel-codebase $DEPLOY_DIR/
rm -rf $DEPLOY_DIR/Admin-Dashboard_-Business-Control-Panel-codebase/node_modules
rm -rf $DEPLOY_DIR/Admin-Dashboard_-Business-Control-Panel-codebase/.next
rm -rf $DEPLOY_DIR/Admin-Dashboard_-Business-Control-Panel-codebase/dist

echo -e "${GREEN}✅ Copying Website App...${NC}"
cp -r websiteapp $DEPLOY_DIR/
rm -rf $DEPLOY_DIR/websiteapp/node_modules
rm -rf $DEPLOY_DIR/websiteapp/.next
rm -rf $DEPLOY_DIR/websiteapp/dist

echo -e "${GREEN}✅ Copying WebSocket Server...${NC}"
cp -r finalwebsocket $DEPLOY_DIR/
rm -rf $DEPLOY_DIR/finalwebsocket/node_modules

# Copy essential files
echo -e "${GREEN}✅ Copying database schema...${NC}"
cp mysql_schema.sql $DEPLOY_DIR/

# Copy configuration files
echo -e "${GREEN}✅ Copying Nginx configs...${NC}"
mkdir -p $DEPLOY_DIR/nginx-configs
cp -r nginx-configs/* $DEPLOY_DIR/nginx-configs/ 2>/dev/null || true

# Create .env.example files if they don't exist
echo -e "${GREEN}✅ Creating .env.example files...${NC}"

# Admin Panel .env.example
if [ ! -f "$DEPLOY_DIR/Admin-Dashboard_-Business-Control-Panel-codebase/.env.example" ]; then
cat > $DEPLOY_DIR/Admin-Dashboard_-Business-Control-Panel-codebase/.env.example << 'EOF'
#  StockPip Admin Panel - Environment Configuration
# Copy this file to .env.local in your project root

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=forex_user
DB_PASSWORD=your-secure-password-here
DB_NAME=forex_trading

# Next.js Configuration
DATABASE_URL=mysql://forex_user:your-secure-password-here@localhost:3306/forex_trading
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=http://localhost:3001

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
fi

# WebSocket .env.example
if [ ! -f "$DEPLOY_DIR/finalwebsocket/.env.example" ]; then
cat > $DEPLOY_DIR/finalwebsocket/.env.example << 'EOF'
#  StockPip WebSocket Server - Environment Configuration
# Copy this file to .env in your project root

# Server Configuration
PORT=6020
NODE_ENV=production

# MetaAPI Configuration
METAAPI_TOKEN=your-metaapi-token-here
METAAPI_ACCOUNT_ID=your-metaapi-account-id-here
EOF
fi

# Create deployment README
cat > $DEPLOY_DIR/README.md << 'EOF'
#  StockPip Forex Platform - Deployment Package

## 📦 Contents

- `forexuserapp/` - User Dashboard + Backend API
- `Admin-Dashboard_-Business-Control-Panel-codebase/` - Admin Panel
- `websiteapp/` - Marketing Website (Optional)
- `finalwebsocket/` - WebSocket Server
- `mysql_schema.sql` - Database Schema
- `nginx-configs/` - Nginx Configuration Files

## 🚀 Quick Deployment

1. Upload this entire folder to VPS: `/var/www/ StockPip/`
2. Install dependencies: `npm install` in each app folder
3. Configure `.env` files from `.env.example`
4. Import database: `mysql -u forex_user -p forex_trading < mysql_schema.sql`
5. Build applications: `npm run build`
6. Start with PM2: `pm2 start ...`
7. Configure Nginx (see nginx-configs/)
8. Set up DNS and SSL

See `COMPLETE_PROJECT_OVERVIEW_AND_DEPLOYMENT.md` for detailed instructions.
EOF

# Create zip file
echo -e "${YELLOW}📦 Creating deployment zip...${NC}"
cd $DEPLOY_DIR
zip -r ../ StockPip-deployment.zip . -x "*.git/*" "*.DS_Store"
cd ..

echo ""
echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo ""
echo "📁 Location: $DEPLOY_DIR/"
echo "📦 Zip file:  StockPip-deployment.zip"
echo ""
echo "🚀 Next steps:"
echo "   1. Review the deployment package"
echo "   2. Upload to VPS: scp -r $DEPLOY_DIR/* root@31.97.207.252:/var/www/ StockPip/"
echo "   3. Or upload zip: scp  StockPip-deployment.zip root@31.97.207.252:/root/"
echo ""





