import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketList from "@/components/trading/MarketList";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYMBOLS } from "@/lib/priceFeed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWalletSync } from "@/hooks/useWalletSync";

export default function MobileWatchlist() {
  const navigate = useNavigate();
  const [activeSymbol, setActiveSymbol] = useState("EURUSD");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteSymbols');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync wallet balance from API
  useWalletSync();

  const toggleFavorite = (symbol: string) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter(s => s !== symbol)
      : [...favorites, symbol];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteSymbols', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    // Load favorites on mount
    const saved = localStorage.getItem('favoriteSymbols');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background pb-16 safe-area-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background safe-area-top">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mobile/trade')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Watchlist</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="all" className="flex-1">All Symbols</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 overflow-auto m-0 p-0">
          <MarketList 
            active={activeSymbol} 
            onSelect={(symbol) => {
              setActiveSymbol(symbol);
              navigate('/mobile/trade', { state: { symbol } });
            }} 
          />
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 overflow-auto m-0 p-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No favorite symbols yet</p>
              <p className="text-sm mt-2">Add symbols to favorites from All Symbols</p>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((symbol) => {
                const symbolInfo = SYMBOLS.find(s => s.code === symbol);
                return (
                  <Card
                    key={symbol}
                    className={cn(
                      "cursor-pointer hover:bg-accent transition-colors",
                      activeSymbol === symbol && "border-primary bg-accent"
                    )}
                    onClick={() => {
                      setActiveSymbol(symbol);
                      navigate('/mobile/trade', { state: { symbol } });
                    }}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{symbolInfo?.flag || symbol}</span>
                        <div>
                          <div className="font-semibold">{symbol}</div>
                          <div className="text-sm text-muted-foreground">{symbolInfo?.name || symbol}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(symbol);
                        }}
                      >
                        <Star className={cn("h-5 w-5", favorites.includes(symbol) ? "fill-yellow-400 text-yellow-400" : "")} />
                      </Button>
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



