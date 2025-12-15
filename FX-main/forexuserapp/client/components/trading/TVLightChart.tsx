import { useEffect, useId, useRef, useState } from "react";
import { toBinancePair } from "@/lib/providers/binance";
import { usePriceStore } from "@/lib/priceFeed";
import TradingChart from "./TradingChart";

declare global {
  interface Window {
    TradingView?: any;
  }
}

// Load official TradingView widget script (tv.js)
let tvScriptPromise: Promise<void> | null = null;
function loadTradingViewScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.TradingView) return Promise.resolve();
  if (tvScriptPromise) return tvScriptPromise;

  tvScriptPromise = new Promise<void>((resolve, reject) => {
    const id = "tradingview-widget-script";
    if (document.getElementById(id)) {
      const check = () => (window.TradingView ? resolve() : setTimeout(check, 50));
      check();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load TradingView script"));
    document.head.appendChild(script);
  });
  return tvScriptPromise;
}

function toTVSymbol(symbol: string) {
  // Map cryptocurrency symbols to Binance
  const pair = toBinancePair(symbol);
  if (pair) return `BINANCE:${pair.toUpperCase()}`;
  
  // For forex pairs, use FX_IDC
  const forexSymbols: Record<string, string> = {
    // Use FX_IDC dataset for forex pairs
    'EURUSD': 'FX_IDC:EURUSD',
    'GBPUSD': 'FX_IDC:GBPUSD',
    'USDJPY': 'FX_IDC:USDJPY',
    'USDCHF': 'FX_IDC:USDCHF',
    'AUDUSD': 'FX_IDC:AUDUSD',
    'USDCAD': 'FX_IDC:USDCAD',
    'NZDUSD': 'FX_IDC:NZDUSD',
    'EURGBP': 'FX_IDC:EURGBP',
    'EURJPY': 'FX_IDC:EURJPY',
    'GBPJPY': 'FX_IDC:GBPJPY',
    'AUDJPY': 'FX_IDC:AUDJPY',
    'AUDCAD': 'FX_IDC:AUDCAD',
    'CHFJPY': 'FX_IDC:CHFJPY',
    'CADJPY': 'FX_IDC:CADJPY',
    'EURAUD': 'FX_IDC:EURAUD',
    'EURCHF': 'FX_IDC:EURCHF',
    'GBPCHF': 'FX_IDC:GBPCHF',
    'GBPAUD': 'FX_IDC:GBPAUD',
    // Metals should use FOREXCOM feed (publicly available)
    'XAUUSD': 'FOREXCOM:XAUUSD',
    'XAGUSD': 'FOREXCOM:XAGUSD',
  };
  
  const upperSymbol = symbol.replace(/[^A-Z]/gi, "").toUpperCase();
  return forexSymbols[upperSymbol] || upperSymbol || 'FX:EURUSD';
}

export default function TVLightChart({ 
  symbol, 
  theme, 
  timeframe = "1"
}: { 
  symbol: string; 
  theme: "dark" | "light";
  timeframe?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const id = useId().replace(/:/g, "");
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { prices } = usePriceStore();

  useEffect(() => {
    let cancelled = false;
    const mount = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        await loadTradingViewScript();
        if (cancelled) return;
        
        const container = containerRef.current;
        if (!container || !window.TradingView) {
          setHasError(true);
          setIsLoading(false);
          return;
        }
        container.innerHTML = "";
        const tvSymbol = toTVSymbol(symbol);
        
        const config = {
          symbol: tvSymbol,
          interval: timeframe,
          timezone: "Etc/UTC",
          theme: theme === "dark" ? "dark" : "light",
          style: 1,
          locale: "en",
          toolbar_bg: "transparent",
          enable_publishing: false,
          hide_top_toolbar: true,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          withdateranges: false,
          save_image: false,
          container_id: id,
          autosize: true,
          studies: [],
          show_popup_button: false,
        } as const;

        const widget = new window.TradingView.widget(config);
        widgetRef.current = widget;
        try { widget.onChartReady(() => setIsLoading(false)); } catch { setTimeout(() => setIsLoading(false), 1200); }
        
      } catch (error) {
        console.error("Failed to load TradingView Lightweight Charts:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    mount();
    return () => {
      cancelled = true;
      widgetRef.current = null;
      const container = containerRef.current;
      if (container) container.innerHTML = "";
    };
  }, [symbol, theme, timeframe, id]);

  // No manual updates needed for TradingView widget; it renders its own data source

  // Overlay loader if needed, but always render the container (no fallback)

  return (
    <div className="h-full w-full min-h-[400px] relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
      <div 
        ref={containerRef} 
        id={id} 
        className="h-full w-full" 
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
