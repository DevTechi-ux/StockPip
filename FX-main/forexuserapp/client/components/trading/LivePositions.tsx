import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/priceFeed";
import { toast } from "sonner";

interface Position {
  id: string;
  symbol: string;
  side: string;
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  swap: number;
  commission: number;
  unrealizedProfit: number;
  time: string;
}

export default function LivePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/positions", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPositions(data);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    
    // Refresh positions every 3 seconds
    const interval = setInterval(fetchPositions, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = (positionId: string) => {
    if (window.confirm('Are you sure you want to close this position?')) {
      // For now, just remove from local state
      // In a real app, you'd call an API to close the position
      setPositions(prev => prev.filter(p => p.id !== positionId));
      toast.success('Position closed successfully');
    }
  };

  const getSideColor = (side: string) => {
    return side.toLowerCase().includes('buy') ? 'text-green-600' : 'text-red-600';
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalProfit = positions.reduce((sum, pos) => sum + (pos.unrealizedProfit || 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              Open Positions
              <Badge variant="secondary">Loading...</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading positions...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Open Positions ({positions.length})
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </div>
          {positions.length > 0 && (
            <div className={`text-lg font-semibold ${getProfitColor(totalProfit)}`}>
              {formatCurrency(totalProfit)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No open positions
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => (
              <div
                key={position.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-lg">{position.symbol}</div>
                    <Badge 
                      variant="outline" 
                      className={getSideColor(position.side)}
                    >
                      {position.side}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {position.volume} lots
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleClosePosition(position.id)}
                  >
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Open Price</div>
                    <div className="font-semibold">
                      {formatPrice(position.openPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Current Price</div>
                    <div className="font-semibold">
                      {formatPrice(position.currentPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">P&L</div>
                    <div className={`font-semibold ${getProfitColor(position.unrealizedProfit || 0)}`}>
                      {formatCurrency(position.unrealizedProfit || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Swap</div>
                    <div className="font-semibold">
                      {formatCurrency(position.swap || 0)}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Opened: {new Date(position.time).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
