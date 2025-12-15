import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePriceStore, formatPrice, SYMBOLS } from "@/lib/priceFeed";
import { useTradingStore } from "@/state/trading-store";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Target, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrderTicket({ symbol, defaultSide }: { symbol: string; defaultSide?: "BUY" | "SELL" }) {
  const { prices, isConnected } = usePriceStore();
  const { openMarketOrder, wallet, calculateMargin } = useTradingStore();
  const [lot, setLot] = useState(0.01);
  const [sl, setSl] = useState<string>("");
  const [tp, setTp] = useState<string>("");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP HFT">("MARKET");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [stopPrice, setStopPrice] = useState<string>("");
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">(defaultSide || "BUY");
  const [selectedLeverage, setSelectedLeverage] = useState<number>(500);
  
  // Available leverage options
  const leverageOptions = [50, 100, 200, 500, 1000];
  
  // Update orderSide when defaultSide changes
  useEffect(() => {
    if (defaultSide) {
      setOrderSide(defaultSide);
    }
  }, [defaultSide]);

  const tick = prices[symbol];
  const symbolInfo = SYMBOLS.find(s => s.code === symbol);
  const ltp = useMemo(() => (tick ? (tick.bid + tick.ask) / 2 : undefined), [tick]);
  const digits = tick?.digits || symbolInfo?.digits || 5;
  
  // Load user leverage from localStorage as default
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.leverage) {
          setSelectedLeverage(user.leverage);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);
  
  // Calculate required margin for current order with selected leverage
  const entryPrice = orderType === "MARKET" 
    ? (orderSide === "BUY" ? tick?.ask : tick?.bid) || ltp || 0
    : orderType === "LIMIT" 
    ? Number(limitPrice) || 0
    : Number(stopPrice) || 0;
    
  // Use selected leverage for margin calculation
  const requiredMargin = entryPrice > 0 ? calculateMargin(symbol, lot, entryPrice, selectedLeverage) : 0;

  async function place(side: "BUY" | "SELL") {
    if (!tick && orderType !== "LIMIT" && orderType !== "STOP HFT") {
      toast.error("Price data not available");
      return;
    }
    
    try {
      if (orderType === "MARKET") {
        // Market order - execute immediately
        if (!tick) {
          toast.error("Price data not available");
          return;
        }
        const executionPrice = side === "BUY" ? tick.ask : tick.bid;
        await openMarketOrder({ symbol, side, lot, price: executionPrice, leverage: selectedLeverage, sl: sl ? Number(sl) : undefined, tp: tp ? Number(tp) : undefined });
        toast.success(`Market ${side} order placed!`, {
          description: `${symbol} @ ${formatPrice(executionPrice, digits)} x ${lot} lot`,
        });
      } else if (orderType === "LIMIT") {
        // Limit order - execute when price reaches limit
        if (!limitPrice) {
          toast.error("Please enter limit price");
          return;
        }
        const executionPrice = Number(limitPrice);
        // TODO: Implement limit order functionality
        toast.info(`Limit orders coming soon! Use Market order for now.`);
      } else if (orderType === "STOP HFT") {
        // Stop order - execute when price reaches stop
        if (!stopPrice) {
          toast.error("Please enter stop price");
          return;
        }
        const executionPrice = Number(stopPrice);
        // TODO: Implement stop order functionality
        toast.info(`Stop orders coming soon! Use Market order for now.`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    }
  }
  
  const adjustLot = (increment: boolean) => {
    setLot(prev => {
      const step = 0.01;
      const newValue = increment ? prev + step : prev - step;
      return Math.max(0.01, Math.round(newValue * 100) / 100);
    });
  };

  const adjustPrice = (setter: (value: string) => void, currentValue: string, increment: boolean) => {
    const current = Number(currentValue) || 0;
    const step = Math.pow(10, -digits);
    const newValue = increment ? current + step : current - step;
    setter(newValue.toFixed(digits));
  };

  return (
    <div className="p-2 md:p-3 space-y-2 md:space-y-3">
      {/* 1. Symbol & Price */}
      <div className="border-b border-border pb-1.5 md:pb-2">
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-sm md:text-base font-bold text-foreground">{symbol}</span>
          {tick && (
            <span className="text-sm md:text-lg font-bold text-foreground">
              {formatPrice(tick.bid, digits)}
            </span>
          )}
        </div>
      </div>

      {/* 2. BUY/SELL Buttons */}
      <div className="flex gap-1.5 md:gap-2">
        <button 
          onClick={() => setOrderSide("BUY")}
          className={cn(
            "flex-1 py-2 md:py-3 rounded border text-xs md:text-sm font-bold transition-colors",
            orderSide === "BUY" 
              ? "bg-blue-500 text-white border-blue-500" 
              : "text-foreground border-border hover:border-blue-500"
          )}
        >
          BUY
        </button>
        <button 
          onClick={() => setOrderSide("SELL")}
          className={cn(
            "flex-1 py-2 md:py-3 rounded border text-xs md:text-sm font-bold transition-colors",
            orderSide === "SELL" 
              ? "bg-red-500 text-white border-red-500" 
              : "text-foreground border-border hover:border-red-500"
          )}
        >
          SELL
        </button>
      </div>

      {/* 3. Order Type Tabs */}
      <div className="flex gap-0.5 md:gap-1 border-b border-border pb-1.5 md:pb-2">
        <button
          onClick={() => setOrderType("MARKET")}
          className={cn(
            "flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded border transition-colors",
            orderType === "MARKET" 
              ? "border-foreground text-foreground" 
              : "border-border text-foreground/60 hover:text-foreground"
          )}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType("LIMIT")}
          className={cn(
            "flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded border transition-colors",
            orderType === "LIMIT" 
              ? "border-foreground text-foreground" 
              : "border-border text-foreground/60 hover:text-foreground"
          )}
        >
          Limit
        </button>
        <button
          onClick={() => setOrderType("STOP HFT")}
          className={cn(
            "flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded border transition-colors",
            orderType === "STOP HFT" 
              ? "border-foreground text-foreground" 
              : "border-border text-foreground/60 hover:text-foreground"
          )}
        >
          Stop HFT
        </button>
      </div>

      {/* 4. Lot Size */}
      <div className="border-b border-border pb-1.5 md:pb-2">
        <label className="text-[10px] md:text-xs text-foreground/60 font-semibold mb-0.5 md:mb-1 block">Lot size</label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={lot}
            onChange={(e) => setLot(Number(e.target.value))}
            className="w-full bg-background border border-border rounded px-1.5 md:px-2 py-1 md:py-1.5 text-xs md:text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
          />
          <div className="absolute right-0.5 md:right-1 top-1/2 -translate-y-1/2 flex flex-col">
            <button onClick={() => adjustLot(true)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▲</button>
            <button onClick={() => adjustLot(false)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▼</button>
          </div>
        </div>
      </div>

      {/* 5. Conditional Price Input for Limit/Stop */}
      {orderType === "LIMIT" && (
        <div className="border-b border-border pb-1.5 md:pb-2">
          <label className="text-[10px] md:text-xs text-foreground/60 font-semibold mb-0.5 md:mb-1 block">Limit Price</label>
          <div className="relative">
            <input
              type="number"
              step={Math.pow(10, -digits).toString()}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={ltp?.toFixed(digits)}
              className="w-full bg-background border border-border rounded px-1.5 md:px-2 py-1 md:py-1.5 text-xs md:text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
            />
            <div className="absolute right-0.5 md:right-1 top-1/2 -translate-y-1/2 flex flex-col">
              <button onClick={() => adjustPrice(setLimitPrice, limitPrice, true)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▲</button>
              <button onClick={() => adjustPrice(setLimitPrice, limitPrice, false)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▼</button>
            </div>
          </div>
        </div>
      )}

      {orderType === "STOP HFT" && (
        <div className="border-b border-border pb-1.5 md:pb-2">
          <label className="text-[10px] md:text-xs text-foreground/60 font-semibold mb-0.5 md:mb-1 block">Stop Price</label>
          <div className="relative">
            <input
              type="number"
              step={Math.pow(10, -digits).toString()}
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder={ltp?.toFixed(digits)}
              className="w-full bg-background border border-border rounded px-1.5 md:px-2 py-1 md:py-1.5 text-xs md:text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
            />
            <div className="absolute right-0.5 md:right-1 top-1/2 -translate-y-1/2 flex flex-col">
              <button onClick={() => adjustPrice(setStopPrice, stopPrice, true)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▲</button>
              <button onClick={() => adjustPrice(setStopPrice, stopPrice, false)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▼</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Leverage Selector */}
      <div className="border-b border-border pb-1.5 md:pb-2">
        <label className="text-[10px] md:text-xs text-foreground/60 font-semibold mb-0.5 md:mb-1 block">Leverage</label>
        <Select value={selectedLeverage.toString()} onValueChange={(value) => setSelectedLeverage(Number(value))}>
          <SelectTrigger className="w-full h-8 md:h-9 text-xs md:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {leverageOptions.map((lev) => (
              <SelectItem key={lev} value={lev.toString()}>
                1:{lev}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 6.5. Stop Loss */}
      <div className="border-b border-border pb-1.5 md:pb-2">
        <label className="text-[10px] md:text-xs text-foreground/60 font-semibold mb-0.5 md:mb-1 block">Stop Loss (SL)</label>
        <div className="relative">
          <input
            type="number"
            step={Math.pow(10, -digits).toString()}
            value={sl}
            onChange={(e) => setSl(e.target.value)}
            placeholder={orderSide === "BUY" ? (ltp ? (ltp * 0.99).toFixed(digits) : "") : (ltp ? (ltp * 1.01).toFixed(digits) : "")}
            className="w-full bg-background border border-border rounded px-1.5 md:px-2 py-1 md:py-1.5 text-xs md:text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
          />
          <div className="absolute right-0.5 md:right-1 top-1/2 -translate-y-1/2 flex flex-col">
            <button onClick={() => adjustPrice(setSl, sl, true)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▲</button>
            <button onClick={() => adjustPrice(setSl, sl, false)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▼</button>
          </div>
        </div>
      </div>

      {/* 6.6. Take Profit */}
      <div className="border-b border-border pb-1.5 md:pb-2">
        <label className="text-[10px] md:text-xs text-foreground/60 font-semibold mb-0.5 md:mb-1 block">Take Profit (TP)</label>
        <div className="relative">
          <input
            type="number"
            step={Math.pow(10, -digits).toString()}
            value={tp}
            onChange={(e) => setTp(e.target.value)}
            placeholder={orderSide === "BUY" ? (ltp ? (ltp * 1.01).toFixed(digits) : "") : (ltp ? (ltp * 0.99).toFixed(digits) : "")}
            className="w-full bg-background border border-border rounded px-1.5 md:px-2 py-1 md:py-1.5 text-xs md:text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
          />
          <div className="absolute right-0.5 md:right-1 top-1/2 -translate-y-1/2 flex flex-col">
            <button onClick={() => adjustPrice(setTp, tp, true)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▲</button>
            <button onClick={() => adjustPrice(setTp, tp, false)} className="text-foreground font-bold text-[10px] md:text-xs leading-none">▼</button>
          </div>
        </div>
      </div>

      {/* 7. Margin Required */}
      <div className="border-b border-border pb-1.5 md:pb-2">
        <div className={cn(
          "text-xs md:text-sm font-bold",
          requiredMargin > (wallet?.freeMargin || 0) && "text-red-500"
        )}>
          Margin Required: ${requiredMargin.toFixed(2)}
        </div>
      </div>

      {/* 8. Available & Balance */}
      <div className="border-b border-border pb-1.5 md:pb-2">
        <div className="text-[10px] md:text-xs text-foreground/60 font-semibold">
          Available: ${(wallet?.freeMargin || 0).toFixed(2)} / Balance: ${(wallet?.balance || 0).toFixed(2)}
        </div>
      </div>

      {/* 9. Place Order Button */}
      <button
        onClick={() => place(orderSide)}
        disabled={!tick}
        className={cn(
          "w-full py-2 md:py-3 text-sm md:text-base font-bold rounded border transition-colors",
          orderSide === "BUY" 
            ? "bg-blue-500 text-white border-blue-500" 
            : "bg-red-500 text-white border-red-500",
          !tick && "opacity-50 cursor-not-allowed"
        )}
      >
        {orderSide}
      </button>

    </div>
  );
}