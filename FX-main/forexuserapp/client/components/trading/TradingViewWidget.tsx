import { useEffect, useId, useRef, useState } from "react";
import { toBinancePair } from "@/lib/providers/binance";

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
  
  // For forex pairs, try multiple sources for better reliability
  const forexSymbols: Record<string, string[]> = {
    'EURUSD': ['OANDA:EURUSD', 'FX_IDC:EURUSD', 'FX:EURUSD'],
    'GBPUSD': ['OANDA:GBPUSD', 'FX_IDC:GBPUSD', 'FX:GBPUSD'],
    'USDJPY': ['OANDA:USDJPY', 'FX_IDC:USDJPY', 'FX:USDJPY'],
    'USDCHF': ['OANDA:USDCHF', 'FX_IDC:USDCHF', 'FX:USDCHF'],
    'AUDUSD': ['OANDA:AUDUSD', 'FX_IDC:AUDUSD', 'FX:AUDUSD'],
    'USDCAD': ['OANDA:USDCAD', 'FX_IDC:USDCAD', 'FX:USDCAD'],
    'NZDUSD': ['OANDA:NZDUSD', 'FX_IDC:NZDUSD', 'FX:NZDUSD'],
    'EURGBP': ['OANDA:EURGBP', 'FX_IDC:EURGBP', 'FX:EURGBP'],
    'EURJPY': ['OANDA:EURJPY', 'FX_IDC:EURJPY', 'FX:EURJPY'],
    'GBPJPY': ['OANDA:GBPJPY', 'FX_IDC:GBPJPY', 'FX:GBPJPY'],
    'AUDJPY': ['OANDA:AUDJPY', 'FX_IDC:AUDJPY', 'FX:AUDJPY'],
    'AUDCAD': ['OANDA:AUDCAD', 'FX_IDC:AUDCAD', 'FX:AUDCAD'],
    'CHFJPY': ['OANDA:CHFJPY', 'FX_IDC:CHFJPY', 'FX:CHFJPY'],
    'CADJPY': ['OANDA:CADJPY', 'FX_IDC:CADJPY', 'FX:CADJPY'],
    'EURAUD': ['OANDA:EURAUD', 'FX_IDC:EURAUD', 'FX:EURAUD'],
    'EURCHF': ['OANDA:EURCHF', 'FX_IDC:EURCHF', 'FX:EURCHF'],
    'GBPCHF': ['OANDA:GBPCHF', 'FX_IDC:GBPCHF', 'FX:GBPCHF'],
    'GBPAUD': ['OANDA:GBPAUD', 'FX_IDC:GBPAUD', 'FX:GBPAUD'],
    'XAUUSD': ['FOREXCOM:XAUUSD', 'OANDA:XAUUSD', 'FX_IDC:XAUUSD'],
    'XAGUSD': ['FOREXCOM:XAGUSD', 'OANDA:XAGUSD', 'FX_IDC:XAGUSD'],
  };
  
  const upperSymbol = symbol.replace(/[^A-Z]/gi, "").toUpperCase();
  const symbolOptions = forexSymbols[upperSymbol];
  
  // Return first option (most reliable source)
  if (symbolOptions && symbolOptions.length > 0) {
    return symbolOptions[0];
  }
  
  // Fallback: try OANDA first, then FX_IDC
  return `OANDA:${upperSymbol}` || `FX_IDC:${upperSymbol}` || 'OANDA:EURUSD';
}

// Helper function to get fallback symbol
function getFallbackSymbol(symbol: string): string | null {
  const upperSymbol = symbol.replace(/[^A-Z]/gi, "").toUpperCase();
  const fallbackMap: Record<string, string[]> = {
    'EURUSD': ['OANDA:EURUSD', 'FX_IDC:EURUSD', 'FX:EURUSD'],
    'GBPUSD': ['OANDA:GBPUSD', 'FX_IDC:GBPUSD'],
    'USDJPY': ['OANDA:USDJPY', 'FX_IDC:USDJPY'],
    'XAUUSD': ['FOREXCOM:XAUUSD', 'OANDA:XAUUSD'],
    'XAGUSD': ['FOREXCOM:XAGUSD', 'OANDA:XAGUSD'],
  };
  
  const options = fallbackMap[upperSymbol];
  if (options && options.length > 1) {
    return options[1]; // Return second option as fallback
  }
  
  // Generic fallback
  if (upperSymbol.startsWith('XAU') || upperSymbol.startsWith('XAG')) {
    return `FOREXCOM:${upperSymbol}`;
  }
  return `OANDA:${upperSymbol}`;
}

interface TradingViewWidgetProps {
  symbol: string;
  theme?: "dark" | "light";
  timeframe?: string;
}

export default function TradingViewWidget({ 
  symbol, 
  theme = "dark",
  timeframe = "1"
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const id = useId().replace(/:/g, "");
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    const mount = async (retrySymbol?: string) => {
      try {
        setIsLoading(true);
        setHasError(false);
        await loadTradingViewScript();
        if (cancelled) return;
        
        const container = containerRef.current;
        if (!container || !window.TradingView) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => mount(retrySymbol), 1000 * retryCount);
            return;
          }
          setHasError(true);
          setIsLoading(false);
          return;
        }
        
        container.innerHTML = "";
        const tvSymbol = retrySymbol || toTVSymbol(symbol);
        
        const config = {
          symbol: tvSymbol,
          interval: timeframe,
          timezone: "Etc/UTC",
          theme: theme === "dark" ? "dark" : "light",
          style: 1,
          locale: "en",
          toolbar_bg: "transparent",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          withdateranges: true,
          save_image: false,
          container_id: id,
          autosize: true,
          studies: [],
          show_popup_button: false,
          // Add error handling
          overrides: {},
          enabled_features: [],
          disabled_features: [],
        } as const;

        try {
          const widget = new window.TradingView.widget(config);
          widgetRef.current = widget;
          
          // Set timeout for chart ready
          const readyTimeout = setTimeout(() => {
            if (!cancelled) {
              setIsLoading(false);
            }
          }, 5000);
          
          try { 
            widget.onChartReady(() => {
              clearTimeout(readyTimeout);
              if (!cancelled) {
                setIsLoading(false);
              }
            }); 
          } catch (e) { 
            clearTimeout(readyTimeout);
            // Try fallback symbol if first attempt fails
            if (retryCount < maxRetries && !retrySymbol) {
              const fallbackSymbol = getFallbackSymbol(symbol);
              if (fallbackSymbol && fallbackSymbol !== tvSymbol) {
                retryCount++;
                setTimeout(() => mount(fallbackSymbol), 1000);
                return;
              }
            }
            setTimeout(() => {
              if (!cancelled) setIsLoading(false);
            }, 2000); 
          }
        } catch (widgetError) {
          console.error("TradingView widget creation error:", widgetError);
          // Try fallback symbol
          if (retryCount < maxRetries && !retrySymbol) {
            const fallbackSymbol = getFallbackSymbol(symbol);
            if (fallbackSymbol && fallbackSymbol !== tvSymbol) {
              retryCount++;
              setTimeout(() => mount(fallbackSymbol), 1000);
              return;
            }
          }
          throw widgetError;
        }
        
      } catch (error) {
        console.error("Failed to load TradingView widget:", error);
        if (retryCount < maxRetries && !retrySymbol) {
          retryCount++;
          const fallbackSymbol = getFallbackSymbol(symbol);
          if (fallbackSymbol) {
            setTimeout(() => mount(fallbackSymbol), 1000 * retryCount);
            return;
          }
        }
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

  return (
    <div className="h-full w-full min-h-[400px] relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background gap-2 p-4">
          <div className="text-destructive text-sm font-semibold">Chart temporarily unavailable</div>
          <div className="text-muted-foreground text-xs text-center max-w-md">
            TradingView widget is experiencing issues. The chart will automatically retry or you can refresh the page.
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              // Force remount by clearing container
              if (containerRef.current) {
                containerRef.current.innerHTML = "";
              }
              // Trigger useEffect by updating a dependency
              window.location.reload();
            }}
            className="mt-2 px-4 py-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
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

