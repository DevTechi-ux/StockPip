export type BinanceSymbol = string;

export function toBinancePair(symbol: string): BinanceSymbol | null {
  const map: Record<string, string> = {
    BTCUSD: "btcusdt",
    ETHUSD: "ethusdt",
    XRPUSD: "xrpusdt",
    BNBUSD: "bnbusdt",
    SOLUSD: "solusdt",
    BTCUSDT: "btcusdt",
    ETHUSDT: "ethusdt",
  };
  const key = symbol.replace(/[^A-Z]/gi, '').toUpperCase();
  return map[key] || null;
}

export function connectBookTicker(pair: BinanceSymbol, onTick: (b: number, a: number, ts: number) => void) {
  const url = `wss://stream.binance.com:9443/ws/${pair}@bookTicker`;
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      const d = JSON.parse(ev.data as string);
      const bid = Number(d.b), ask = Number(d.a), ts = Number(d.T || Date.now());
      if (Number.isFinite(bid) && Number.isFinite(ask)) onTick(bid, ask, ts);
    } catch {}
  };
  return ws;
}

export async function fetchKlines(pair: BinanceSymbol, interval: "1m"|"5m"|"15m"|"1h"|"1d", limit = 200) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${pair.toUpperCase()}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data || []).map((d: any[]) => ({
    time: Math.floor(d[0] / 1000),
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
  }));
}

export function connectKline(pair: BinanceSymbol, interval: "1m"|"5m"|"15m"|"1h"|"1d", onBar: (bar: {time:number,open:number,high:number,low:number,close:number}) => void) {
  const url = `wss://stream.binance.com:9443/ws/${pair}@kline_${interval}`;
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data as string);
      const k = msg.k;
      if (!k) return;
      onBar({
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      });
    } catch {}
  };
  return ws;
}
