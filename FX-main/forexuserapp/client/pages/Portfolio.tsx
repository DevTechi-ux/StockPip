import { useEffect, useState } from "react";
import Header from "@/components/trading/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTradingStore } from "@/state/trading-store";
import { usePriceStore, formatPrice, SYMBOLS } from "@/lib/priceFeed";
import { Button } from "@/components/ui/button";

interface UserBalance {
  balance: number;
  equity: number;
  account_leverage: number;
  account_currency: string;
}

export default function Portfolio() {
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");
  const { positions, history, loadPositions } = useTradingStore();
  const { prices } = usePriceStore();

  // Calculate unrealized P&L from open positions with correct contract size
  const unrealizedPnL = positions.reduce((total, position) => {
    const ticker = prices[position.symbol];
    if (!ticker) return total;
    
    const ltp = (ticker.bid + ticker.ask) / 2;
    const symbolInfo = SYMBOLS.find(s => s.code === position.symbol);
    const contractSize = symbolInfo?.contractSize || 100000;
    const pnl = (position.side === "BUY" ? ltp - position.entry : position.entry - ltp) * position.lot * contractSize;
    return total + pnl;
  }, 0);

  // Calculate realized P&L from closed trades
  const realizedPnL = history.reduce((total, trade) => total + trade.pnl, 0);

  useEffect(() => {
    fetchUserBalance();
    loadPositions();
    loadTradingHistory();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchUserBalance();
      loadPositions();
      loadTradingHistory();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUserBalance = async () => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('No user data found, using demo balance');
        setUserBalance({
          balance: 0,
          equity: 0,
          account_leverage: 500,
          account_currency: 'USD'
        });
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      const response = await fetch(`/api/user/balance/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserBalance({
          balance: parseFloat(data.balance) || 0,
          equity: parseFloat(data.equity) || 0,
          account_leverage: data.leverage || 500,
          account_currency: data.currency || 'USD'
        });
      } else {
        // Fallback to demo balance
        setUserBalance({
          balance: 0,
          equity: 0,
          account_leverage: 500,
          account_currency: 'USD'
        });
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
      setUserBalance({
        balance: 0,
        equity: 0,
        account_leverage: 500,
        account_currency: 'USD'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTradingHistory = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const dbHistory = await response.json();
        const historyItems = dbHistory.map((h: any) => ({
          id: h.id,
          symbol: h.symbol,
          side: h.side,
          lot: parseFloat(h.lot_size),
          entry: parseFloat(h.entry_price),
          exit: parseFloat(h.exit_price),
          pnl: parseFloat(h.pnl),
          commission: parseFloat(h.commission) || 0,
          closeTime: new Date(h.close_time).getTime()
        }));
        
        // Update the store with history
        useTradingStore.setState({ history: historyItems });
      }
    } catch (error) {
      console.error('Error loading trading history:', error);
    }
  };

  if (loading) {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-6">
          <div className="animate-pulse">
              <h1 className="mb-6 text-2xl font-bold">Portfolio</h1>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const balance = userBalance?.balance || 0;
  const equity = balance + unrealizedPnL;

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="mb-6 text-2xl font-bold">Portfolio</h1>
          
          {/* Balance Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Account balance</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${equity.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Real-time (includes P&L)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${unrealizedPnL.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Open positions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Realized P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${realizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${realizedPnL.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Closed trades</p>
              </CardContent>
            </Card>
          </div>

          {/* Positions & History with Tab Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {activeTab === "positions" ? `Open Positions (${positions.length})` : `Trade History (${history.length})`}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={activeTab === "positions" ? "default" : "secondary"}
                    className="h-8 px-4 text-xs font-bold"
                    onClick={() => setActiveTab("positions")}
                  >
                    Positions
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activeTab === "history" ? "default" : "secondary"}
                    className="h-8 px-4 text-xs font-bold"
                    onClick={() => setActiveTab("history")}
                  >
                    History
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "positions" ? (
                positions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No open positions.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Lot Size</TableHead>
                          <TableHead>Entry Price</TableHead>
                          <TableHead>Current Price</TableHead>
                          <TableHead>P&L</TableHead>
                          <TableHead>Open Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.map((position) => {
                          const ticker = prices[position.symbol];
                          const ltp = ticker ? (ticker.bid + ticker.ask) / 2 : position.entry;
                          const symbolInfo = SYMBOLS.find(s => s.code === position.symbol);
                          const contractSize = symbolInfo?.contractSize || 100000;
                          const pnl = (position.side === "BUY" ? ltp - position.entry : position.entry - ltp) * position.lot * contractSize;
                          
                          return (
                            <TableRow key={position.id}>
                              <TableCell className="font-medium">{position.symbol}</TableCell>
                              <TableCell>
                                <span className={position.side === "BUY" ? "text-green-500" : "text-red-500"}>
                                  {position.side}
                                </span>
                              </TableCell>
                              <TableCell>{position.lot.toFixed(2)}</TableCell>
                              <TableCell>{formatPrice(position.entry, symbolInfo?.digits || 5)}</TableCell>
                              <TableCell>{formatPrice(ltp, symbolInfo?.digits || 5)}</TableCell>
                              <TableCell className={pnl >= 0 ? "text-green-500" : "text-red-500"}>
                                ${pnl.toFixed(2)}
                              </TableCell>
                              <TableCell>{new Date(position.openTime).toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )
              ) : (
                history.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No trade history yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Lot Size</TableHead>
                          <TableHead>Entry Price</TableHead>
                          <TableHead>Exit Price</TableHead>
                          <TableHead>P&L</TableHead>
                          <TableHead>Broker Fee</TableHead>
                          <TableHead>Close Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((trade) => {
                          const symbolInfo = SYMBOLS.find(s => s.code === trade.symbol);
                          return (
                            <TableRow key={trade.id}>
                              <TableCell className="font-medium">{trade.symbol}</TableCell>
                              <TableCell>
                                <span className={trade.side === "BUY" ? "text-green-500" : "text-red-500"}>
                                  {trade.side}
                                </span>
                              </TableCell>
                              <TableCell>{trade.lot.toFixed(2)}</TableCell>
                              <TableCell>{formatPrice(trade.entry, symbolInfo?.digits || 5)}</TableCell>
                              <TableCell>{formatPrice(trade.exit, symbolInfo?.digits || 5)}</TableCell>
                              <TableCell className={trade.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                                ${trade.pnl.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-yellow-500">
                                ${(trade.commission || 0).toFixed(2)}
                              </TableCell>
                              <TableCell>{new Date(trade.closeTime).toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}








