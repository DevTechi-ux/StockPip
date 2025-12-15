import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TradingViewWidget from "@/components/trading/TradingViewWidget";
import OrderTicket from "@/components/trading/OrderTicket";
import { usePriceStore } from "@/lib/priceFeed";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useTradingStore } from "@/state/trading-store";
import { useWalletSync } from "@/hooks/useWalletSync";

export default function MobileTrade() {
  const location = useLocation();
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState(() => {
    return (location.state?.symbol as string) || "EURUSD";
  });
  const [showOrderTicket, setShowOrderTicket] = useState(false);
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [theme, setTheme] = useState<"dark" | "light">(() => 
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const { subscribe } = usePriceStore();
  const { openMarketOrder } = useTradingStore();

  // Sync wallet balance from API
  useWalletSync();

  useEffect(() => {
    subscribe(symbol);
  }, [symbol, subscribe]);

  useEffect(() => {
    const listener = () => setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
    const id = setInterval(listener, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background pb-16 safe-area-bottom">
      {/* Header with symbol selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background safe-area-top">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/mobile/watchlist')}
          className="text-sm font-medium"
        >
          {symbol} ▼
        </Button>
        <div className="text-xs text-muted-foreground font-bold">REAL</div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative min-h-0">
        <TradingViewWidget symbol={symbol} theme={theme} />
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-3 p-4 border-t bg-background">
        <Button
          size="lg"
          className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg"
          onClick={() => {
            setOrderSide("BUY");
            setShowOrderTicket(true);
          }}
        >
          BUY
        </Button>
        <Button
          size="lg"
          className="h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-lg"
          onClick={() => {
            setOrderSide("SELL");
            setShowOrderTicket(true);
          }}
        >
          SELL
        </Button>
      </div>

      {/* Order Ticket Drawer */}
      <Drawer open={showOrderTicket} onOpenChange={setShowOrderTicket}>
        <DrawerContent className="max-h-[90vh]">
          <div className="p-4 overflow-auto">
            <OrderTicket symbol={symbol} defaultSide={orderSide} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}



