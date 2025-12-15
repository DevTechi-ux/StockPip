import { useEffect, useState } from "react";
import { usePriceStore, SYMBOLS, formatPrice } from "@/lib/priceFeed";
import { cn } from "@/lib/utils";

const FLAGS: Record<string, string> = {
  // Forex pairs
  'EURUSD': '🇪🇺 🇺🇸',
  'GBPUSD': '🇬🇧 🇺🇸',
  'USDJPY': '🇺🇸 🇯🇵',
  'AUDUSD': '🇦🇺 🇺🇸',
  'USDCAD': '🇺🇸 🇨🇦',
  'NZDUSD': '🇳🇿 🇺🇸',
  'USDCHF': '🇺🇸 🇨🇭',
  'EURJPY': '🇪🇺 🇯🇵',
  'GBPJPY': '🇬🇧 🇯🇵',
  'AUDJPY': '🇦🇺 🇯🇵',
  'EURGBP': '🇪🇺 🇬🇧',
  'EURAUD': '🇪🇺 🇦🇺',
  'EURNZD': '🇪🇺 🇳🇿',
  'EURCHF': '🇪🇺 🇨🇭',
  'GBPCHF': '🇬🇧 🇨🇭',
  'GBPAUD': '🇬🇧 🇦🇺',
  'GBPCAD': '🇬🇧 🇨🇦',
  'AUDCHF': '🇦🇺 🇨🇭',
  'AUDCAD': '🇦🇺 🇨🇦',
  'AUDNZD': '🇦🇺 🇳🇿',
  'CADJPY': '🇨🇦 🇯🇵',
  'CHFJPY': '🇨🇭 🇯🇵',
  'NZDJPY': '🇳🇿 🇯🇵',
  'USDSGD': '🇺🇸 🇸🇬',
  'USDHKD': '🇺🇸 🇭🇰',
  'USDMXN': '🇺🇸 🇲🇽',
  'USDZAR': '🇺🇸 🇿🇦',
  'USDTRY': '🇺🇸 🇹🇷',
  // Metals & Commodities
  'XAUUSD': '🥇',
  'XAGUSD': '🥈',
  'XPTUSD': '💍',
  'XPDUSD': '⚙️',
  'USOIL': '🛢️',
  'UKOIL': '🛢️',
  'NGAS': '⛽',
  'WHEAT': '🌾',
  'CORN': '🌽',
  'SOYBEAN': '🌱',
  'COFFEE': '☕',
  'SUGAR': '🍬',
  'COTTON': '🏵️',
  // Indices
  'US30': '🇺🇸',
  'SPX500': '🇺🇸',
  'NAS100': '🇺🇸',
  'UK100': '🇬🇧',
  'GER40': '🇩🇪',
  'FRA40': '🇫🇷',
  'JPN225': '🇯🇵',
  'AUS200': '🇦🇺',
  // Crypto
  'BTCUSD': '₿',
  'ETHUSD': 'Ξ',
  'LTCUSD': 'Ł',
  'XRPUSD': '✕',
  'ADAUSD': '₳',
  'DOTUSD': '●',
  'LINKUSD': '⬡',
  'BNBUSD': '🟡',
  // Stocks
  'AAPL': '🍎',
  'GOOGL': '🔍',
  'MSFT': '🪟',
  'AMZN': '📦',
  'TSLA': '🚗',
  'META': '👤',
  'NVDA': '💻',
  'NFLX': '🎬',
  'AMD': '💾',
  'INTC': '🖥️'
};

export default function MarketList({ onSelect, active }: { onSelect: (code: string) => void; active: string }) {
  const { prices, subscribe } = usePriceStore();
  
  // Default watchlist: 12 most popular major currency pairs
  const getInitialWatchlist = (): string[] => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing watchlist from localStorage:', e);
      }
    }
    return [
      'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 
      'USDCHF', 'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP', 
      'AUDJPY', 'EURAUD'
    ];
  };
  
  const [watchlist, setWatchlist] = useState<string[]>(getInitialWatchlist);
  
  const getInitialShowAll = () => {
    const saved = localStorage.getItem('showAllSymbols');
    return saved === 'true';
  };
  const [showAll, setShowAll] = useState(getInitialShowAll);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const getInitialExpandedCategories = (): string[] => {
    const saved = localStorage.getItem('expandedCategories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing expandedCategories from localStorage:', e);
      }
    }
    return ['FOREX'];
  };
  const [expandedCategories, setExpandedCategories] = useState<string[]>(getInitialExpandedCategories);
  
  useEffect(() => {
    // Subscribe once to start the connection
    subscribe('EURUSD');
  }, []); // Empty dependency array to run only once

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      const newWatchlist = prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol];
      // Save to localStorage
      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newExpanded = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      // Save to localStorage
      localStorage.setItem('expandedCategories', JSON.stringify(newExpanded));
      return newExpanded;
    });
  };

  // Filter symbols that have real-time prices OR match search term
  const filteredSymbols = SYMBOLS.filter(s => {
    const hasPrice = prices[s.code];
    const matchesSearch = s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Show symbols with real prices OR if user is searching
    return hasPrice || matchesSearch;
  });

  // Group symbols by category
  const groupedSymbols = filteredSymbols.reduce((acc, symbol) => {
    const category = symbol.sector;
    if (!acc[category]) acc[category] = [];
    acc[category].push(symbol);
    return acc;
  }, {} as Record<string, typeof SYMBOLS>);

  // Category display names
  const categoryNames: Record<string, string> = {
    'FOREX': 'Forex',
    'CFD': 'Stocks',
    'CRYPTO': 'Crypto',
    'INDICES': 'Indices',
    'METALS': 'Commodities'
  };

  const watchlistSymbols = filteredSymbols.filter(s => watchlist.includes(s.code));

  // Ensure tiny, consistent numbers that never overflow the row
  const formatSpread = (v?: number, digits?: number) => {
    if (v === undefined || v === null || isNaN(v as number)) return "0";
    const d = Math.min(Math.max(digits ?? 5, 0), 5);
    return (v as number).toFixed(d);
  };

  return (
    <div className="h-full w-full bg-background text-foreground flex flex-col">
      {/* Header Tabs */}
      <div className="flex bg-background border-b border-border">
        <button
          onClick={() => {
            const newValue = false;
            setShowAll(newValue);
            localStorage.setItem('showAllSymbols', String(newValue));
          }}
          className={cn(
            "flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors",
            !showAll 
              ? "text-foreground border-b-2 border-foreground/30 font-semibold" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          FAVORITES
        </button>
        <button
          onClick={() => {
            const newValue = true;
            setShowAll(newValue);
            localStorage.setItem('showAllSymbols', String(newValue));
          }}
          className={cn(
            "flex-1 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors",
            showAll 
              ? "text-foreground border-b-2 border-foreground/30 font-semibold" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ALL SYMBOLS
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!showAll ? (
          // Favorites View
          <div className="p-1 space-y-1">
            {watchlistSymbols.map(s => {
              const price = prices[s.code];
              const changePercent = price?.changePercent || 0;
              const isPositive = changePercent > 0;
              
          return (
                <div
              key={s.code}
              onClick={() => onSelect(s.code)}
              className={cn(
                    "flex items-center justify-between p-1.5 md:p-2 rounded cursor-pointer transition-all border border-border",
                    active === s.code 
                      ? "border-foreground/50" 
                      : "hover:border-foreground/30"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="font-semibold text-foreground text-xs md:text-sm truncate">{s.code}</div>
                  </div>
                  <div className="text-right min-w-0">
                    <div className="flex gap-2 md:gap-3 items-center justify-end mb-0.5">
                      <div className="text-green-600 dark:text-green-400 font-normal text-[10px] md:text-xs tabular-nums">
                        {price ? formatPrice(price.bid, price.digits || s.digits) : '---'}
                      </div>
                      <div className="text-red-600 dark:text-red-400 font-normal text-[10px] md:text-xs tabular-nums">
                        {price ? formatPrice(price.ask, price.digits || s.digits) : '---'}
                      </div>
                    </div>
                    <div className="text-[9px] text-muted-foreground hidden md:block">
                      H: {price ? formatPrice(price.high, price.digits || s.digits) : '---'} 
                      {'  '}L: {price ? formatPrice(price.low, price.digits || s.digits) : '---'}
                    </div>
                  </div>
                </div>
              );
            })}
            {watchlistSymbols.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No favorites added
              </div>
            )}
          </div>
        ) : (
          // All Symbols View with Categories
          <div>
            {Object.entries(groupedSymbols).map(([category, symbols]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 transition-colors border-b border-border"
                >
                  <span className="font-medium text-foreground">{categoryNames[category] || category}</span>
                  <span className="text-foreground/70">
                    {expandedCategories.includes(category) ? '⌄' : '⌃'}
                  </span>
                </button>
                {expandedCategories.includes(category) && (
                  <div className="p-1 space-y-1">
                    {symbols.map(s => {
                      const isInWatchlist = watchlist.includes(s.code);
                      return (
                        <div
                          key={s.code}
                          onClick={() => onSelect(s.code)}
                          className={cn(
                            "flex items-center justify-between p-1.5 md:p-2 rounded cursor-pointer transition-all border border-border",
                            active === s.code && "border-foreground/50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-xs">{FLAGS[s.code] || '🔸'}</div>
                            <span className="font-semibold text-foreground text-xs md:text-sm">{s.code}</span>
                            <span className="text-[10px] text-muted-foreground hidden md:inline">{s.sector.toLowerCase()}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(s.code);
                            }}
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                              isInWatchlist
                                ? "bg-foreground/20 text-foreground font-semibold border border-foreground/30"
                                : "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600"
                            )}
                          >
                            {isInWatchlist ? '★' : '+'}
            </button>
                        </div>
          );
        })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

