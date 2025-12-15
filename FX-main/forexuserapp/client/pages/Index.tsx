import { useEffect, useMemo, useState } from "react";
import Header from "@/components/trading/Header";
import MarketList from "@/components/trading/MarketList";
import React from "react";
import TradingViewWidget from "@/components/trading/TradingViewWidget";
import OrderTicket from "@/components/trading/OrderTicket";
import BottomTabs from "@/components/trading/BottomTabs";
import { usePriceStore } from "@/lib/priceFeed";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useStrategyEngine } from "@/lib/strategy-engine";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import MobileNav from "@/components/trading/MobileNav";
import { useWalletSync } from "@/hooks/useWalletSync";
import { useTradingStore } from "@/state/trading-store";
import { useNavigate } from "react-router-dom";
import MobileMoreMenu from "@/components/trading/MobileMoreMenu";

export default function Index() {
  const [symbol, setSymbol] = React.useState(() => {
    // Check if there's a selected symbol from watchlist page
    const selected = sessionStorage.getItem('selectedSymbol');
    if (selected) {
      sessionStorage.removeItem('selectedSymbol');
      return selected;
    }
    return "EURUSD";
  });
  const [theme, setTheme] = React.useState<"dark" | "light">(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"));
  const [showLeftSidebar, setShowLeftSidebar] = React.useState(true);
  const [showRightSidebar, setShowRightSidebar] = React.useState(true);
  const [openTicket, setOpenTicket] = React.useState(false);
  const [openMore, setOpenMore] = React.useState(false);
  const [chartExpanded, setChartExpanded] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const [activeBottomTab, setActiveBottomTab] = React.useState<"positions" | "pending" | "history">("positions");
  const isMobile = useIsMobile();
  const { subscribe } = usePriceStore();

  // Sync wallet balance from API
  useWalletSync();
  
  // Load positions, orders, and trade charge from database on mount
  React.useEffect(() => {
    const { loadPositions, loadOrders, loadTradeCharge } = useTradingStore.getState();
    loadPositions();
    loadOrders();
    loadTradeCharge();
  }, []);

  React.useEffect(() => {
    subscribe(symbol);
  }, [symbol, subscribe]);

  useStrategyEngine(symbol);

  React.useEffect(() => {
    const listener = () => setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    const id = setInterval(listener, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Order Ticket */}
        
        {!isMobile && (
          <div className="flex flex-col border-r border-gray-700 bg-background">
            {showLeftSidebar ? (
              <div className="w-72 flex flex-col h-full">
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <span className="font-semibold text-sm">Order Ticket</span>
                  <button 
                    onClick={() => setShowLeftSidebar(false)}
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
                  >

                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <OrderTicket symbol={symbol} />
                </div>
              </div>
            ) : (
              <div className="w-8 flex flex-col items-center py-2">
                <button 
                  onClick={() => setShowLeftSidebar(true)}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Chart Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative" style={{ minHeight: isMobile ? '300px' : '400px' }}>
            <TradingViewWidget symbol={symbol} theme={theme} />
          </div>
          <div ref={bottomRef} className={chartExpanded ? "h-[calc(50%-0.5rem)] flex-shrink-0" : "h-32 md:h-48 flex-shrink-0"}>
            <BottomTabs 
              onToggleHeight={() => setChartExpanded(!chartExpanded)} 
              isExpanded={chartExpanded}
              defaultTab={activeBottomTab}
            />
          </div>
        </main>

        {/* Right Sidebar - Markets */}
        {!isMobile && (
          <div className="flex flex-col border-l border-gray-700 bg-background">
            {showRightSidebar ? (
              <div className="w-72 flex flex-col h-full">
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <span className="font-semibold text-sm">Markets</span>
                  <button 
                    onClick={() => setShowRightSidebar(false)}
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <MarketList active={symbol} onSelect={setSymbol} />
                </div>
              </div>
            ) : (
              <div className="w-8 flex flex-col items-center py-2">
                <button 
                  onClick={() => setShowRightSidebar(true)}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isMobile && (
        <>
          <MobileNav
            onTicket={() => setOpenTicket(true)}
            onMore={() => setOpenMore(true)}
          />
          <Drawer open={openTicket} onOpenChange={setOpenTicket}>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Order Ticket</DrawerTitle></DrawerHeader>
              <div className="p-3">
                <OrderTicket symbol={symbol} />
              </div>
            </DrawerContent>
          </Drawer>
          <Drawer open={openMore} onOpenChange={setOpenMore}>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader><DrawerTitle>More</DrawerTitle></DrawerHeader>
              <div className="p-4 overflow-auto">
                <MobileMoreMenu onClose={() => setOpenMore(false)} />
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
