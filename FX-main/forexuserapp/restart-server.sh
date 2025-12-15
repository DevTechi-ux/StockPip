#!/bin/bash
# Quick server restart script
echo "🔄 Restarting Forex User App server..."
echo "Press Ctrl+C to stop current server, then run: pnpm dev"

# Check if server is running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Server is running on port 8080"
    echo "Please stop it manually (Ctrl+C) or run: pkill -f 'vite.*forexuserapp'"
else
    echo "✅ Port 8080 is free"
fi

echo ""
echo "To start server:"
echo "  cd forexuserapp"
echo "  pnpm dev"










