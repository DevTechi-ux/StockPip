# Minimal MetaAPI WebSocket Server

This folder contains a minimal Socket.IO + Express server that streams market prices from MetaApi (or fallback simulated data if credentials are not provided).

## Quick start

1) Install deps

```bash
npm install
```

2) Configure env

Copy `.env.example` to `.env` and set your values:

```
PORT=6020
METAAPI_TOKEN=your_metaapi_token
METAAPI_ACCOUNT_ID=your_account_id
CORS_ORIGINS=http://localhost:3000,http://localhost:3040
```

3) Run server

```bash
PORT=6020 node standalone-websocket-metaapi.js
```

- WebSocket: `wss:// StockPip.com:6020`
- Prices: `GET https:// StockPip.com:6020/api/forex/prices`
- Status: `GET https:// StockPip.com:6020/api/forex/status`
- Demo page: `https:// StockPip.com:6020`

If METAAPI env vars are not set, the server still runs and streams fallback prices.

## Client usage

Connect with Socket.IO from browser:

```js
import { io } from 'socket.io-client';
const socket = io('https:// StockPip.com:6020');
socket.on('price_update', data => console.log('price', data));
socket.on('market_update', data => console.log('market', data));
```
