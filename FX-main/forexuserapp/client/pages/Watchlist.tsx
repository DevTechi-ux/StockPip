import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Header from "@/components/trading/Header";
import { SYMBOLS, usePriceStore, formatPrice } from "@/lib/priceFeed";

const FLAGS: Record<string, string> = {
  'EURUSD': '🇪🇺 🇺🇸', 'GBPUSD': '🇬🇧 🇺🇸', 'USDJPY': '🇺🇸 🇯🇵',
  'AUDUSD': '🇦🇺 🇺🇸', 'USDCAD': '🇺🇸 🇨🇦', 'NZDUSD': '🇳🇿 🇺🇸',
  'USDCHF': '🇺🇸 🇨🇭', 'EURJPY': '🇪🇺 🇯🇵', 'GBPJPY': '🇬🇧 🇯🇵',
  'AUDJPY': '🇦🇺 🇯🇵', 'EURGBP': '🇪🇺 🇬🇧', 'EURAUD': '🇪🇺 🇦🇺',
  'EURNZD': '🇪🇺 🇳🇿', 'EURCHF': '🇪🇺 🇨🇭', 'GBPCHF': '🇬🇧 🇨🇭',
  'GBPAUD': '🇬🇧 🇦🇺', 'GBPCAD': '🇬🇧 🇨🇦', 'AUDCHF': '🇦🇺 🇨🇭',
  'AUDCAD': '🇦🇺 🇨🇦', 'AUDNZD': '🇦🇺 🇳🇿', 'CADJPY': '🇨🇦 🇯🇵',
  'CHFJPY': '🇨🇭 🇯🇵', 'NZDJPY': '🇳🇿 🇯🇵', 'USDSGD': '🇺🇸 🇸🇬',
  'USDHKD': '🇺🇸 🇭🇰', 'USDMXN': '🇺🇸 🇲🇽', 'USDZAR': '🇺🇸 🇿🇦',
  'USDTRY': '🇺🇸 🇹🇷', 'XAUUSD': '🥇', 'XAGUSD': '🥈', 'XPTUSD': '💍',
  'XPDUSD': '⚙️', 'USOIL': '🛢️', 'UKOIL': '🛢️', 'NGAS': '⛽',
  'WHEAT': '🌾', 'CORN': '🌽', 'SOYBEAN': '🌱', 'COFFEE': '☕',
  'SUGAR': '🍬', 'COTTON': '🏵️', 'US30': '🇺🇸', 'SPX500': '🇺🇸',
  'NAS100': '🇺🇸', 'UK100': '🇬🇧', 'GER40': '🇩🇪', 'FRA40': '🇫🇷',
  'JPN225': '🇯🇵', 'AUS200': '🇦🇺', 'BTCUSD': '₿', 'ETHUSD': 'Ξ',
  'LTCUSD': 'Ł', 'XRPUSD': '✕', 'ADAUSD': '₳', 'DOTUSD': '●',
  'LINKUSD': '⬡', 'BNBUSD': '🟡', 'AAPL': '🍎', 'GOOGL': '🔍',
  'MSFT': '🪟', 'AMZN': '📦', 'TSLA': '🚗', 'META': '👤', 'NVDA': '💻',
  'NFLX': '🎬', 'AMD': '💾', 'INTC': '🖥️'
};

export default function Watchlist() {
  const navigate = useNavigate();
  // Check window width directly for immediate mobile detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 768;
  });
  const { prices, subscribe } = usePriceStore();
  
  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeSymbol, setActiveSymbol] = useState("EURUSD");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['FOREX']);

  useEffect(() => {
    subscribe('EURUSD');
  }, [subscribe]);

  useEffect(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  const toggleFavorite = (symbol: string) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(s => s !== symbol)
      : [...favorites, symbol];
    setFavorites(newFavorites);
    localStorage.setItem('watchlist', JSON.stringify(newFavorites));
  };

  const handleSymbolSelect = (symbol: string) => {
    setActiveSymbol(symbol);
    sessionStorage.setItem('selectedSymbol', symbol);
    navigate('/');
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newExpanded = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      localStorage.setItem('expandedCategories', JSON.stringify(newExpanded));
      return newExpanded;
    });
  };

  // Only redirect on desktop
  useEffect(() => {
    if (!isMobile) {
      navigate('/', { replace: true });
    }
  }, [isMobile, navigate]);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  // Filter symbols
  const filteredSymbols = SYMBOLS.filter(s => {
    const hasPrice = prices[s.code];
    const matchesSearch = s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchTerm.toLowerCase());
    return hasPrice || matchesSearch;
  });

  // Group symbols by category
  const groupedSymbols = filteredSymbols.reduce((acc, symbol) => {
    const category = symbol.sector;
    if (!acc[category]) acc[category] = [];
    acc[category].push(symbol);
    return acc;
  }, {} as Record<string, typeof SYMBOLS>);

  const categoryNames: Record<string, string> = {
    'FOREX': 'Forex',
    'CFD': 'Stocks',
    'CRYPTO': 'Crypto',
    'INDICES': 'Indices',
    'METALS': 'Commodities'
  };

  const favoriteSymbols = filteredSymbols.filter(s => favorites.includes(s.code));

  const formatSpread = (v?: number, digits?: number) => {
    if (v === undefined || v === null || isNaN(v as number)) return "0";
    const d = Math.min(Math.max(digits ?? 5, 0), 5);
    return (v as number).toFixed(d);
  };

  return (
    <div className="h-screen flex flex-col bg-background pb-16 safe-area-bottom">
      <Header />
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background safe-area-top">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('/');
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Watchlist</h1>
      </div>
      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="all" className="flex-1">All Symbols</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="flex-1 overflow-auto m-0 p-0">
          {/* Search Bar */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search symbols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
            />
          </div>
          
          {/* All Symbols by Category */}
          <div className="pb-4">
            {Object.entries(groupedSymbols).map(([category, symbols]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 transition-colors border-b border-border bg-background"
                >
                  <span className="font-medium text-foreground text-sm">{categoryNames[category] || category}</span>
                  <span className="text-foreground/70 text-sm">
                    {expandedCategories.includes(category) ? '⌄' : '⌃'}
                  </span>
                </button>
                {expandedCategories.includes(category) && (
                  <div className="space-y-1 px-2">
                    {symbols.map(s => {
                      const price = prices[s.code];
                      const isInFavorites = favorites.includes(s.code);
                      return (
                        <div
                          key={s.code}
                          onClick={() => handleSymbolSelect(s.code)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded cursor-pointer transition-all border border-border",
                            activeSymbol === s.code && "border-foreground/50 bg-accent"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-base">{FLAGS[s.code] || '🔸'}</span>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground text-sm">{s.code}</div>
                              <div className="text-xs text-muted-foreground truncate">{s.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right min-w-0">
                              <div className="flex gap-1.5 items-center justify-end">
                                <div className="text-green-600 dark:text-green-400 font-normal text-xs tabular-nums">
                                  {price ? formatPrice(price.bid, price.digits || s.digits) : '---'}
                                </div>
                                <div className="text-red-600 dark:text-red-400 font-normal text-xs tabular-nums">
                                  {price ? formatPrice(price.ask, price.digits || s.digits) : '---'}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(s.code);
                              }}
                            >
                              <Star className={cn("h-4 w-4", isInFavorites ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="favorites" className="flex-1 overflow-auto m-0 p-3">
          {favoriteSymbols.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">No favorite symbols yet</p>
              <p className="text-xs mt-2">Add symbols to favorites from All Symbols</p>
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteSymbols.map((s) => {
                const price = prices[s.code];
                return (
                  <Card
                    key={s.code}
                    className={cn(
                      "cursor-pointer hover:bg-accent transition-colors",
                      activeSymbol === s.code && "border-primary bg-accent"
                    )}
                    onClick={() => handleSymbolSelect(s.code)}
                  >
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xl">{FLAGS[s.code] || '🔸'}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm">{s.code}</div>
                          <div className="text-xs text-muted-foreground truncate">{s.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex gap-1.5 items-center justify-end">
                            <div className="text-green-600 dark:text-green-400 font-normal text-xs tabular-nums">
                              {price ? formatPrice(price.bid, price.digits || s.digits) : '---'}
                            </div>
                            <div className="text-red-600 dark:text-red-400 font-normal text-xs tabular-nums">
                              {price ? formatPrice(price.ask, price.digits || s.digits) : '---'}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(s.code);
                          }}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}



