import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
}

export default function RealTimeAccountInfo() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccountInfo = async () => {
    try {
      // Prefer public balance endpoint (no 404 if auth route is off)
      const userData = localStorage.getItem("user");
      let userId: string | null = null;
      if (userData) {
        try { userId = JSON.parse(userData)?.id || null; } catch {}
      }
      if (!userId) {
        const t = localStorage.getItem('auth_token');
        if (t && t.includes('.')) {
          try { userId = JSON.parse(atob(t.split('.')[1]))?.userId || null; } catch {}
        }
      }

      if (userId) {
        const r = await fetch(`/api/user/balance/${userId}`);
        if (r.ok) {
          const d = await r.json();
          setAccountInfo({
            balance: parseFloat(d.balance) || 0,
            equity: parseFloat(d.equity) || parseFloat(d.balance) || 0,
            margin: 0,
            freeMargin: parseFloat(d.balance) || 0,
            marginLevel: 0,
            currency: d.currency || 'USD',
            leverage: d.leverage || 500
          });
          setIsConnected(true);
          return;
        }
      }

      // Fallback to secured route if available
      const token = localStorage.getItem("auth_token");
      if (token) {
        const response = await fetch("/api/account", {
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setAccountInfo(data);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error("Error fetching account info:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
    
    // Refresh account info every 5 seconds
    const interval = setInterval(fetchAccountInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getMarginLevelColor = (level: number) => {
    if (level >= 200) return "bg-green-500";
    if (level >= 100) return "bg-white/40 dark:bg-white/20";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Account Information
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading account data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accountInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Account Information
            <Badge variant="destructive">Offline</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Unable to load account data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Account Information
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Live" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-lg font-semibold">
              {formatCurrency(accountInfo.balance, accountInfo.currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Equity</div>
            <div className="text-lg font-semibold">
              {formatCurrency(accountInfo.equity, accountInfo.currency)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Used Margin</div>
            <div className="text-lg font-semibold">
              {formatCurrency(accountInfo.margin, accountInfo.currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Free Margin</div>
            <div className="text-lg font-semibold">
              {formatCurrency(accountInfo.freeMargin, accountInfo.currency)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Margin Level</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">
                {accountInfo.marginLevel.toFixed(2)}%
              </div>
              <div 
                className={`w-3 h-3 rounded-full ${getMarginLevelColor(accountInfo.marginLevel)}`}
              />
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Leverage</div>
            <div className="text-lg font-semibold">
              1:{accountInfo.leverage}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            P&L: {formatCurrency(accountInfo.equity - accountInfo.balance, accountInfo.currency)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}





