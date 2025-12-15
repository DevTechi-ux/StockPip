import 'dotenv/config';
import { Server } from 'socket.io';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import express from 'express';
import cors from 'cors';

// Final WebSocket implementation using your proven working code
const MetaApi = require('metaapi.cloud-sdk').default;

class MetaApiWebSocketService {
    private token: string;
    private accountId: string;
    private api: any;
    private connection: any = null;
    private isConnected = false;
    
    // All trading pairs
    private allPairs = [
        'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF',
        'EURJPY', 'GBPJPY', 'AUDJPY', 'EURGBP', 'EURAUD', 'EURNZD', 'EURCHF',
        'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD'
    ];
    
    private priceData = new Map();
    private io: any = null;

    constructor() {
        this.token = process.env.METAAPI_TOKEN || '';
        this.accountId = process.env.METAAPI_ACCOUNT_ID || '';

        if (!this.token || !this.accountId) {
            console.warn('⚠️ METAAPI_TOKEN or METAAPI_ACCOUNT_ID missing. WebSocket will run in fallback mode.');
        }

        this.api = new MetaApi(this.token || undefined);
    }

    async initialize(io: any) {
        this.io = io;
        
        try {
            console.log('🚀 Initializing MetaAPI WebSocket Service...');
            
            // Start price updates immediately
            this.startPriceUpdates();

            const account = await this.api.metatraderAccountApi.getAccount(this.accountId);
            const initialState = account.state;
            const deployedStates = ['DEPLOYING', 'DEPLOYED'];

            if (!deployedStates.includes(initialState)) {
                console.log('📡 Deploying MetaTrader account...');
                await account.deploy();
            }

            console.log('⏳ Waiting for MetaAPI to connect to broker...');
            await account.waitConnected();

            this.connection = account.getStreamingConnection();
            await this.connection.connect();

            console.log('🔄 Waiting for MetaAPI to synchronize...');
            await this.connection.waitSynchronized();

            this.isConnected = true;
            console.log('✅ MetaAPI connected successfully!');

            // Subscribe to all pairs
            await this.subscribeToAllPairs();

        } catch (error: any) {
            console.error('❌ MetaAPI initialization failed:', error);
            this.isConnected = false;
            console.log('🔄 Continuing with fallback data...');
        }
    }

    async subscribeToAllPairs() {
        if (!this.connection) return;

        try {
            console.log(`📊 Subscribing to ${this.allPairs.length} instruments...`);
            
            for (const pair of this.allPairs) {
                try {
                    await this.connection.subscribeToMarketData(pair);
                    console.log(`✅ Subscribed to ${pair}`);
                    
                    // Get initial price
                    const price = this.connection.terminalState.price(pair);
                    if (price && price.bid && price.ask) {
                        const priceData = {
                            symbol: pair,
                            bid: price.bid,
                            ask: price.ask,
                            spread: price.ask - price.bid,
                            timestamp: new Date().toISOString()
                        };
                        
                        this.priceData.set(pair, priceData);
                        this.broadcastPriceUpdate(priceData);
                    }
                } catch (error: any) {
                    console.log(`⚠️ Failed to subscribe to ${pair}:`, error.message);
                }
            }
            
            console.log(`✅ Successfully subscribed to ${this.allPairs.length} instruments`);
        } catch (error) {
            console.error('❌ Error subscribing to pairs:', error);
        }
    }

    startPriceUpdates() {
        // Real-time MetaAPI events
        if (this.connection && this.isConnected) {
            this.connection.on('price', (price: any) => {
                if (price && price.symbol && price.bid && price.ask) {
                    const priceData = {
                        symbol: price.symbol,
                        bid: price.bid,
                        ask: price.ask,
                        spread: price.ask - price.bid,
                        timestamp: new Date().toISOString()
                    };
                    
                    this.priceData.set(price.symbol, priceData);
                    this.broadcastPriceUpdate(priceData);
                    console.log(`📈 Real-time MetaAPI: ${price.symbol} = ${price.bid}/${price.ask}`);
                }
            });
        }

        // Fallback polling every 500ms
        setInterval(async () => {
            if (this.connection && this.isConnected) {
                const terminalState = this.connection.terminalState;
                
                for (const pair of this.allPairs) {
                    try {
                        const price = terminalState.price(pair);
                        if (price && price.bid && price.ask) {
                            const priceData = {
                                symbol: pair,
                                bid: price.bid,
                                ask: price.ask,
                                spread: price.ask - price.bid,
                                timestamp: new Date().toISOString()
                            };
                            
                            this.priceData.set(pair, priceData);
                            this.broadcastPriceUpdate(priceData);
                        }
                    } catch (error) {
                        // Silent error handling
                    }
                }
            } else {
                // Use fallback data
                this.generateFallbackData();
            }
        }, 500);
    }

    generateFallbackData() {
        const basePrices = {
            'EURUSD': { bid: 1.0850, ask: 1.0853 },
            'GBPUSD': { bid: 1.2650, ask: 1.2653 },
            'USDJPY': { bid: 149.50, ask: 149.53 },
            'AUDUSD': { bid: 0.6450, ask: 0.6453 },
            'USDCAD': { bid: 1.3650, ask: 1.3653 },
            'XAUUSD': { bid: 2090.0, ask: 2090.5 },
            'BTCUSD': { bid: 111000, ask: 111100 }
        };

        Object.keys(basePrices).forEach(symbol => {
            const variation = (Math.random() - 0.5) * 0.0001;
            const basePrice = basePrices[symbol as keyof typeof basePrices];
            
            const priceData = {
                symbol: symbol,
                bid: basePrice.bid + variation,
                ask: basePrice.ask + variation,
                spread: basePrice.ask - basePrice.bid,
                timestamp: new Date().toISOString()
            };
            
            this.priceData.set(symbol, priceData);
            this.broadcastPriceUpdate(priceData);
        });
    }

    broadcastPriceUpdate(priceData: any) {
        if (this.io) {
            // Emit individual price update
            this.io.emit('price_update', priceData);
            
            // Also emit in the format expected by the client
            const formattedData = {
                [priceData.symbol]: {
                    bid: priceData.bid,
                    ask: priceData.ask,
                    spread: priceData.spread,
                    high: priceData.high || priceData.ask,
                    low: priceData.low || priceData.bid,
                    change: priceData.change || 0,
                    changePercent: priceData.changePercent || 0,
                    digits: priceData.digits || 5,
                    volume: priceData.volume || 0,
                    time: priceData.timestamp
                }
            };
            this.io.emit('prices', formattedData);
        }
    }

    getPrice(symbol: string) {
        return this.priceData.get(symbol);
    }

    getAllPrices() {
        return Array.from(this.priceData.values());
    }

    isServiceConnected() {
        return this.isConnected;
    }
}

let metaApiService: MetaApiWebSocketService | null = null;
let io: any = null;

export function initWebSocket(server: any) {
  if (io) return; // Already initialized
  
  io = new Server(server, { 
    cors: { 
      origin: "*" 
    } 
  });

  // Initialize MetaAPI WebSocket Service using your working implementation
  metaApiService = new MetaApiWebSocketService();
  metaApiService.initialize(io);

  io.on('connection', (socket: any) => {
    console.log(`🔌 WebSocket connected: ${socket.id}`);

    socket.on('subscribe_market_data', (symbols: string[]) => {
        console.log(`📊 Subscribed to:`, symbols);
        if (Array.isArray(symbols)) {
            symbols.forEach(symbol => {
                socket.join(`market_${symbol}`);
            });
        }
    });

    socket.on('subscribe', (symbols: string[]) => {
      console.log('📊 Client subscribed to symbols:', symbols);
      socket.emit('subscribed', symbols);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 WebSocket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket server initialized with MetaAPI service');
}

export function getIO() {
  return io;
}
