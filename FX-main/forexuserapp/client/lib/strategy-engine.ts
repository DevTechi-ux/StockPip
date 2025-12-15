import { useEffect, useRef } from "react";
import { usePriceStore } from "@/lib/priceFeed";
import { useStrategyStore } from "@/state/strategy-store";
import { useTradingStore } from "@/state/trading-store";

function sma(arr: number[], n: number) {
  if (arr.length < n) return null as number | null;
  const s = arr.slice(-n).reduce((a, b) => a + b, 0);
  return s / n;
}

// Very lightweight demo engine: momentum via SMA crossover, risk per trade 0.5% of 10k notional per lot multiplier
export function useStrategyEngine(activeSymbol: string) {
  const { prices, subscribe } = usePriceStore();
  const { subs } = useStrategyStore();
  const { openMarketOrder, positions } = useTradingStore();
  const bufRef = useRef<Record<string, number[]>>({});

  useEffect(() => { subscribe(activeSymbol); }, [activeSymbol, subscribe]);

  useEffect(() => {
    const t = prices[activeSymbol];
    if (!t) return;
    const mid = (t.bid + t.ask) / 2;
    const key = activeSymbol;
    const buf = bufRef.current[key] || (bufRef.current[key] = []);
    buf.push(mid);
    if (buf.length > 500) buf.shift();

    const long = sma(buf, 30);
    const short = sma(buf, 7);
    if (long == null || short == null) return;

    const on = Object.values(subs).some(Boolean);
    if (!on) return;

    const hasOpen = positions.some(p => p.symbol === activeSymbol);
    if (!hasOpen && short > long * 1.0002) {
      const lot = 0.01;
      openMarketOrder({ symbol: activeSymbol, side: "BUY", lot, price: mid, sl: mid * 0.98, tp: mid * 1.02 });
    } else if (!hasOpen && short < long * 0.9998) {
      const lot = 0.01;
      openMarketOrder({ symbol: activeSymbol, side: "SELL", lot, price: mid, sl: mid * 1.02, tp: mid * 0.98 });
    }
  }, [prices, activeSymbol, subs, openMarketOrder, positions]);
}
