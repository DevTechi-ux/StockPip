import Header from "@/components/trading/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Users, DollarSign, Eye, UserPlus, UserMinus, BarChart3, Clock, CheckCircle, User } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface TradeMasterAccount {
  id: string;
  account_name: string;
  account_type: 'MAM' | 'PAMM';
  account_number: string;
  manager_name: string;
  manager_email: string;
  master_profit_share: number;
  min_investment: number;
  max_investment: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  strategy_description: string;
  total_balance: number;
  investor_balance: number;
  investors_count: number;
  closed_trades_count: number;
  open_trades_count: number;
  winning_trades: number;
  losing_trades: number;
  total_profit_loss: number;
  manager_total_fees: number;
  is_active: boolean;
  created_at: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  lot_size: number;
  entry_price: number;
  exit_price?: number;
  status: 'OPEN' | 'CLOSED';
  profit_loss?: number;
  net_profit_loss?: number;
  open_time: string;
  close_time?: string;
}

export default function TradeMaster() {
  const [accounts, setAccounts] = React.useState<TradeMasterAccount[]>([]);
  const [myInvestments, setMyInvestments] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [selectedAccount, setSelectedAccount] = React.useState<TradeMasterAccount | null>(null);
  const [selectedTrades, setSelectedTrades] = React.useState<Trade[]>([]);
  const [showTradesDialog, setShowTradesDialog] = React.useState(false);
  const [showFollowDialog, setShowFollowDialog] = React.useState(false);
  const [followAmount, setFollowAmount] = React.useState("");

  React.useEffect(() => {
    fetchAccounts();
    fetchMyInvestments();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mam/trade-master');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching trade master accounts:', error);
      toast.error("Failed to load trade masters");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyInvestments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/mam/my-investments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const investmentIds = new Set(data.map((inv: any) => inv.account_id));
        setMyInvestments(investmentIds);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchAccountTrades = async (accountId: string) => {
    try {
      const response = await fetch(`/api/mam/${accountId}/trades`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTrades(data.trades || []);
        setShowTradesDialog(true);
      } else {
        toast.error("Failed to load trades");
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error("Failed to load trades");
    }
  };

  const handleFollow = async () => {
    if (!selectedAccount || !followAmount) {
      toast.error("Please enter investment amount");
      return;
    }

    const amount = parseFloat(followAmount);
    if (amount < selectedAccount.min_investment || amount > selectedAccount.max_investment) {
      toast.error(`Amount must be between $${selectedAccount.min_investment} and $${selectedAccount.max_investment}`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch('/api/mam/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          investment_amount: amount
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully followed! $${amount.toFixed(2)} deducted from your balance.`);
        setShowFollowDialog(false);
        setFollowAmount("");
        fetchAccounts();
        fetchMyInvestments();
      } else {
        toast.error(data.error || "Failed to follow account");
      }
    } catch (error) {
      console.error('Error following account:', error);
      toast.error("Error following account");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (investorId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch('/api/mam/unfollow', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ investorId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Successfully unfollowed");
        fetchAccounts();
        fetchMyInvestments();
      } else {
        toast.error(data.error || "Failed to unfollow");
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast.error("Error unfollowing account");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'VERY_HIGH': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateWinRate = (account: TradeMasterAccount) => {
    const total = account.winning_trades + account.losing_trades;
    if (total === 0) return 0;
    return ((account.winning_trades / total) * 100).toFixed(1);
  };

  const calculateROI = (account: TradeMasterAccount) => {
    if (!account.investor_balance || account.investor_balance === 0) return 0;
    return ((account.total_profit_loss / account.investor_balance) * 100).toFixed(2);
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Trade Master</h1>
          <p className="text-muted-foreground">
            Follow experienced traders and mirror their trades automatically
          </p>
        </div>

        {loading && accounts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : accounts.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No trade masters available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const isFollowing = myInvestments.has(account.id);
              const winRate = calculateWinRate(account);
              const roi = calculateROI(account);

              return (
                <Card key={account.id} className="glass-effect">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{account.account_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4" />
                          {account.manager_name}
                        </CardDescription>
                      </div>
                      <Badge variant={account.account_type === 'MAM' ? 'default' : 'secondary'}>
                        {account.account_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Profit/Loss</p>
                        <p className={`text-lg font-semibold ${account.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${account.total_profit_loss.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Win Rate</p>
                        <p className="text-lg font-semibold">{winRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROI</p>
                        <p className={`text-lg font-semibold ${parseFloat(roi) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {roi}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Followers</p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {account.investors_count}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Min Investment:</span>
                        <span className="font-medium">${account.min_investment}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Commission:</span>
                        <span className="font-medium">{account.master_profit_share}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <Badge className={getRiskColor(account.risk_level)}>{account.risk_level}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Trades:</span>
                        <span className="font-medium">
                          {account.closed_trades_count} closed, {account.open_trades_count} open
                        </span>
                      </div>
                    </div>

                    {account.strategy_description && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {account.strategy_description}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedAccount(account);
                          fetchAccountTrades(account.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Trades
                      </Button>
                      {isFollowing ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Get investor ID from my investments
                            fetch('/api/mam/my-investments', {
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                            })
                              .then(r => r.json())
                              .then(data => {
                                const investment = data.find((inv: any) => inv.account_id === account.id);
                                if (investment) {
                                  handleUnfollow(investment.id);
                                }
                              });
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedAccount(account);
                            setFollowAmount(account.min_investment.toString());
                            setShowFollowDialog(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* View Trades Dialog */}
        <Dialog open={showTradesDialog} onOpenChange={setShowTradesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Trades - {selectedAccount?.account_name}</DialogTitle>
              <DialogDescription>
                All trades executed by {selectedAccount?.manager_name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedTrades.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trades found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Lot Size</TableHead>
                      <TableHead>Entry Price</TableHead>
                      <TableHead>Exit Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Profit/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>
                          {new Date(trade.open_time).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={trade.side === 'BUY' ? 'default' : 'destructive'}>
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell>{trade.lot_size}</TableCell>
                        <TableCell>{trade.entry_price?.toFixed(5)}</TableCell>
                        <TableCell>{trade.exit_price?.toFixed(5) || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={trade.status === 'CLOSED' ? 'default' : 'secondary'}>
                            {trade.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={trade.net_profit_loss && trade.net_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {trade.net_profit_loss !== null && trade.net_profit_loss !== undefined
                            ? `$${trade.net_profit_loss.toFixed(2)}`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Follow Dialog */}
        <Dialog open={showFollowDialog} onOpenChange={setShowFollowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Follow {selectedAccount?.account_name}</DialogTitle>
              <DialogDescription>
                Invest in this trade master account. Your balance will be deducted and you'll automatically mirror all trades.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min={selectedAccount?.min_investment || 0}
                  max={selectedAccount?.max_investment || 100000}
                  value={followAmount}
                  onChange={(e) => setFollowAmount(e.target.value)}
                  placeholder={`Min: $${selectedAccount?.min_investment || 0}`}
                />
                <p className="text-xs text-muted-foreground">
                  Range: ${selectedAccount?.min_investment} - ${selectedAccount?.max_investment}
                </p>
              </div>
              {selectedAccount && (
                <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manager Commission:</span>
                    <span className="font-medium">{selectedAccount.master_profit_share}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Share:</span>
                    <span className="font-medium">{100 - selectedAccount.master_profit_share}%</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFollowDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleFollow}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Follow"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

