import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTradingStore } from "@/state/trading-store";
import { usePriceStore, formatPrice, SYMBOLS } from "@/lib/priceFeed";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import React from "react";
import { calculatePNL } from "@shared/trading-calculations";

export default function BottomTabs({ 
  onToggleHeight, 
  isExpanded,
  defaultTab = "positions"
}: { 
  onToggleHeight?: () => void; 
  isExpanded?: boolean;
  defaultTab?: "positions" | "pending" | "history";
}) {
  const { positions, orders, history, closePosition, closeAll, updatePositionsPNL } = useTradingStore();
  const { prices } = usePriceStore();
  
  // Update PNL in real-time when prices change
  React.useEffect(() => {
    if (positions.length > 0 && Object.keys(prices).length > 0) {
      updatePositionsPNL(prices);
    }
  }, [prices, positions.length, updatePositionsPNL]);

  const ltpMap: Record<string, number> = Object.fromEntries(
    Object.entries(prices).map(([k, v]) => [k, (v.bid + v.ask) / 2])
  );

  return (
    <div className="h-full w-full border-t bg-background">
      <Tabs defaultValue={defaultTab} key={defaultTab} className="h-full">
        <div className="flex items-center justify-between px-1 md:px-3 py-0.5 md:py-1 flex-wrap gap-1 md:gap-2">
          <TabsList className="h-7 md:h-8 border border-border">
            <TabsTrigger value="positions" className="text-[10px] md:text-xs px-1 md:px-2 font-bold">Pos ({positions.length})</TabsTrigger>
            <TabsTrigger value="pending" className="text-[10px] md:text-xs px-1 md:px-2 font-bold">Pend ({orders.length})</TabsTrigger>
            <TabsTrigger value="history" className="text-[10px] md:text-xs px-1 md:px-2 font-bold">Hist ({history.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-0.5 md:gap-1">
            <Button size="sm" variant="secondary" className="h-6 px-1 md:px-2 text-[10px] md:text-xs font-bold border border-border" onClick={() => closeAll("all", ltpMap)}>Close all</Button>
            <Button size="sm" variant="secondary" className="h-6 px-1 md:px-2 text-xs font-bold hidden md:block border border-border" onClick={() => closeAll("profit", ltpMap)}>Profit</Button>
            <Button size="sm" variant="secondary" className="h-6 px-1 md:px-2 text-xs font-bold hidden md:block border border-border" onClick={() => closeAll("loss", ltpMap)}>Loss</Button>
            {onToggleHeight && (
              <Button size="sm" variant="secondary" className="h-6 px-1 md:px-2 text-[10px] md:text-xs font-bold border border-border" onClick={onToggleHeight}>
                {isExpanded ? <ChevronDown className="h-3 w-3 md:h-4 md:w-4" /> : <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />}
              </Button>
            )}
          </div>
        </div>
        <TabsContent value="positions" className="h-[calc(100%-2.5rem)] px-0.5 md:px-2">
          <div className="h-full overflow-auto scrollbar-hide">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/40 dark:bg-white/5 backdrop-blur-sm">
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2">ID</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden md:table-cell font-bold px-1 md:px-2">TIME</TableHead>
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2">SYM</TableHead>
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2">ORDER</TableHead>
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2">LOT</TableHead>
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2">PRICE</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden lg:table-cell font-bold px-1 md:px-2">SL</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden lg:table-cell font-bold px-1 md:px-2">TP</TableHead>
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2">LTP</TableHead>
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2">PNL</TableHead>
                  <TableHead className="text-[10px] md:text-xs font-bold px-1 md:px-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((p) => {
                  const t = prices[p.symbol];
                  const ltp = t ? (t.bid + t.ask) / 2 : p.entry;
                  const currentPrice = t ? (p.side === "BUY" ? t.bid : t.ask) : p.entry;
                  const symbolInfo = SYMBOLS.find(s => s.code === p.symbol);
                  // Use stored PNL if available, otherwise calculate using shared function
                  const pnl = p.pnl !== undefined ? p.pnl : (t ? calculatePNL(p.side, p.entry, currentPrice, p.lot, p.symbol) : 0);
                  const isProfit = pnl >= 0;
                  return (
                    <TableRow key={p.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-white/20 dark:border-white/10">
                      <TableCell className="text-[10px] md:text-xs font-bold text-foreground px-1 md:px-2">{p.id}</TableCell>
                      <TableCell className="text-[10px] md:text-xs text-foreground/60 hidden md:table-cell font-semibold px-1 md:px-2">{new Date(p.openTime).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-[10px] md:text-xs font-bold text-foreground px-1 md:px-2">{p.symbol}</TableCell>
                      <TableCell className="text-[10px] md:text-xs px-1 md:px-2">
                        <span className={cn(
                          "px-1 md:px-2 py-0.5 rounded-lg font-bold text-[8px] md:text-[10px] backdrop-blur-sm",
                          p.side === "BUY" 
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40" 
                            : "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40"
                        )}>
                          {p.side}
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs font-bold text-foreground px-1 md:px-2">{p.lot.toFixed(2)}</TableCell>
                      <TableCell className="text-[10px] md:text-xs font-semibold text-foreground/80 px-1 md:px-2">{formatPrice(p.entry, symbolInfo?.digits || 5)}</TableCell>
                      <TableCell className="text-[10px] md:text-xs font-semibold text-orange-500 dark:text-orange-400 hidden lg:table-cell px-1 md:px-2">{p.sl ? formatPrice(p.sl, symbolInfo?.digits || 5) : "-"}</TableCell>
                      <TableCell className="text-[10px] md:text-xs font-semibold text-green-500 dark:text-green-400 hidden lg:table-cell px-1 md:px-2">{p.tp ? formatPrice(p.tp, symbolInfo?.digits || 5) : "-"}</TableCell>
                      <TableCell className="text-[10px] md:text-xs font-bold text-blue-500 dark:text-blue-400 px-1 md:px-2">{formatPrice(ltp, symbolInfo?.digits || 5)}</TableCell>
                      <TableCell className={cn(
                        "text-[10px] md:text-xs font-bold px-1 md:px-2",
                        isProfit ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                      )}>
                        {isProfit ? "▲" : "▼"} ${pnl.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-0.5 md:px-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/20 text-[10px] md:text-xs px-1 md:px-2 rounded transition-colors font-bold h-6 md:h-8" 
                          onClick={() => closePosition(p.id, ltp)}
                        >
                          ✕
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="pending" className="h-[calc(100%-2.5rem)] px-0.5 md:px-2">
          <div className="h-full overflow-auto scrollbar-hide">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">ID</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden md:table-cell px-1 md:px-2">TIME</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">SYM</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">TYPE</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">ORDER</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">LOT</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">PRICE</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden lg:table-cell px-1 md:px-2">SL</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden lg:table-cell px-1 md:px-2">TP</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const symbolInfo = SYMBOLS.find(s => s.code === o.symbol);
                  return (
                    <TableRow key={o.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <TableCell className="text-[10px] md:text-xs font-medium px-1 md:px-2">{o.id}</TableCell>
                      <TableCell className="text-[10px] md:text-xs text-gray-400 hidden md:table-cell px-1 md:px-2">{new Date(o.createdAt).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-[10px] md:text-xs font-semibold px-1 md:px-2">{o.symbol}</TableCell>
                      <TableCell className="text-[10px] md:text-xs px-1 md:px-2">
                        <span className="px-1 md:px-2 py-0.5 rounded font-bold text-[8px] md:text-[10px] bg-white/20 dark:bg-white/10 text-foreground/80 border border-white/30 dark:border-white/20">
                          {o.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs px-1 md:px-2">
                        <span className={cn(
                          "px-1 md:px-2 py-0.5 rounded font-bold text-[8px] md:text-[10px]",
                          o.side === "BUY" 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                            : "bg-red-500/20 text-red-400 border border-red-500/50"
                        )}>
                          {o.side}
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs font-medium px-1 md:px-2">{o.lot.toFixed(2)}</TableCell>
                      <TableCell className="text-[10px] md:text-xs text-gray-300 px-1 md:px-2">{formatPrice(o.price || 0, symbolInfo?.digits || 5)}</TableCell>
                      <TableCell className="text-[10px] md:text-xs text-orange-400 hidden lg:table-cell px-1 md:px-2">{o.sl ? formatPrice(o.sl, symbolInfo?.digits || 5) : "-"}</TableCell>
                      <TableCell className="text-[10px] md:text-xs text-green-400 hidden lg:table-cell px-1 md:px-2">{o.tp ? formatPrice(o.tp, symbolInfo?.digits || 5) : "-"}</TableCell>
                      <TableCell className="px-0.5 md:px-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 text-[10px] md:text-xs px-1 md:px-2 rounded transition-colors h-6 md:h-8" 
                          onClick={() => {
                            // TODO: Implement cancel order functionality
                            console.log('Cancel order:', o.id);
                          }}
                        >
                          ✕
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="history" className="h-[calc(100%-2.5rem)] px-0.5 md:px-2">
          <div className="h-full overflow-auto scrollbar-hide">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">ID</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">SYM</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">ORDER</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">LOT</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">ENTRY</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">EXIT</TableHead>
                  <TableHead className="text-[10px] md:text-xs px-1 md:px-2">PNL</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden md:table-cell px-1 md:px-2">CLOSE TIME</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="text-[10px] md:text-xs px-1 md:px-2">{h.id}</TableCell>
                    <TableCell className="text-[10px] md:text-xs px-1 md:px-2">{h.symbol}</TableCell>
                    <TableCell className="text-[10px] md:text-xs px-1 md:px-2"><span className={h.side === "BUY" ? "text-emerald-500" : "text-red-500"}>{h.side}</span></TableCell>
                    <TableCell className="text-[10px] md:text-xs px-1 md:px-2">{h.lot.toFixed(2)}</TableCell>
                    <TableCell className="text-[10px] md:text-xs px-1 md:px-2">{formatPrice(h.entry, 2)}</TableCell>
                    <TableCell className="text-[10px] md:text-xs px-1 md:px-2">{formatPrice(h.exit, 2)}</TableCell>
                    <TableCell className={`text-[10px] md:text-xs px-1 md:px-2 ${h.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>{h.pnl.toFixed(2)}</TableCell>
                    <TableCell className="text-[10px] md:text-xs hidden md:table-cell px-1 md:px-2">{new Date(h.closeTime).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
