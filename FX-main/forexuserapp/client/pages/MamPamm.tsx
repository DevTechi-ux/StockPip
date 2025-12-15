import Header from "@/components/trading/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Users, DollarSign, CheckCircle, Clock, XCircle, Plus, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface MamAccount {
  id: string;
  account_name: string;
  account_type: 'MAM' | 'PAMM';
  account_number: string;
  master_profit_share: number;
  min_investment: number;
  max_investment: number;
  is_active: boolean;
  is_admin_approved: boolean;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  manager_name?: string;
  investors_count?: number;
  total_net_profit?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
}

export default function MamPamm() {
  const [activeTab, setActiveTab] = React.useState<string>("browse");
  const [publicAccounts, setPublicAccounts] = React.useState<MamAccount[]>([]);
  const [myAccounts, setMyAccounts] = React.useState<MamAccount[]>([]);
  const [myInvestments, setMyInvestments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<MamAccount | null>(null);

  const [createForm, setCreateForm] = React.useState({
    account_name: "",
    account_type: "MAM" as 'MAM' | 'PAMM',
    strategy_description: "",
    risk_level: "MEDIUM" as 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH',
    min_investment: "100",
    max_investment: "100000",
    master_profit_share: "20"
  });

  const [joinForm, setJoinForm] = React.useState({
    investment_amount: "",
    risk_multiplier: "1.00"
  });

  React.useEffect(() => {
    fetchPublicAccounts();
    fetchMyAccounts();
    fetchMyInvestments();
  }, []);

  const fetchPublicAccounts = async () => {
    try {
      const response = await fetch('/api/mam/public');
      if (response.ok) {
        const data = await response.json();
        setPublicAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching public accounts:', error);
    }
  };

  const fetchMyAccounts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/mam/my-accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching my accounts:', error);
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
        setMyInvestments(data);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const handleCreateAccount = async () => {
    if (!createForm.account_name) {
      toast.error("Please enter account name");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch('/api/mam/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_name: createForm.account_name,
          account_type: createForm.account_type,
          strategy_description: createForm.strategy_description,
          risk_level: createForm.risk_level,
          min_investment: parseFloat(createForm.min_investment),
          max_investment: parseFloat(createForm.max_investment),
          master_profit_share: parseFloat(createForm.master_profit_share),
          max_investors: 100
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("MAM/PAMM account created! Pending admin approval.");
        setIsCreateDialogOpen(false);
        setCreateForm({
          account_name: "",
          account_type: "MAM",
          strategy_description: "",
          risk_level: "MEDIUM",
          min_investment: "100",
          max_investment: "100000",
          master_profit_share: "20"
        });
        fetchMyAccounts();
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAccount = async () => {
    if (!selectedAccount || !joinForm.investment_amount) {
      toast.error("Please enter investment amount");
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
          investment_amount: parseFloat(joinForm.investment_amount),
          risk_multiplier: parseFloat(joinForm.risk_multiplier)
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Successfully joined MAM/PAMM account!");
        setIsJoinDialogOpen(false);
        setJoinForm({ investment_amount: "", risk_multiplier: "1.00" });
        setSelectedAccount(null);
        fetchPublicAccounts();
        fetchMyInvestments();
      } else {
        toast.error(data.error || "Failed to join account");
      }
    } catch (error) {
      console.error('Error joining account:', error);
      toast.error("Error joining account");
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

  const getStatusBadge = (account: MamAccount) => {
    if (!account.is_admin_approved) {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
    if (!account.is_active) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
    }
    return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
  };

  const getROI = (profit: number, trades: MamAccount) => {
    if (!profit || profit === 0) return "0.00";
    const winRate = trades.winning_trades && trades.losing_trades 
      ? ((trades.winning_trades / (trades.winning_trades + trades.losing_trades)) * 100).toFixed(1)
      : "0.0";
    return winRate;
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">MAM / PAMM Accounts</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create MAM/PAMM Account</DialogTitle>
                <DialogDescription>Start managing investors' funds and earn performance fees</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name *</Label>
                  <Input
                    id="account_name"
                    placeholder="e.g., High Performance Trading"
                    value={createForm.account_name}
                    onChange={(e) => setCreateForm({ ...createForm, account_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type *</Label>
                  <Select value={createForm.account_type} onValueChange={(value: 'MAM' | 'PAMM') => setCreateForm({ ...createForm, account_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAM">MAM (Multi-Account Manager)</SelectItem>
                      <SelectItem value="PAMM">PAMM (Percent Allocation Management Module)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_level">Risk Level *</Label>
                  <Select value={createForm.risk_level} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH') => setCreateForm({ ...createForm, risk_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Risk</SelectItem>
                      <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                      <SelectItem value="HIGH">High Risk</SelectItem>
                      <SelectItem value="VERY_HIGH">Very High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_investment">Min Investment (USD) *</Label>
                    <Input
                      id="min_investment"
                      type="number"
                      value={createForm.min_investment}
                      onChange={(e) => setCreateForm({ ...createForm, min_investment: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_investment">Max Investment (USD) *</Label>
                    <Input
                      id="max_investment"
                      type="number"
                      value={createForm.max_investment}
                      onChange={(e) => setCreateForm({ ...createForm, max_investment: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="master_profit_share">Performance Fee (%) *</Label>
                  <Input
                    id="master_profit_share"
                    type="number"
                    min="1"
                    max="50"
                    value={createForm.master_profit_share}
                    onChange={(e) => setCreateForm({ ...createForm, master_profit_share: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Percentage of profit you keep (typically 10-30%)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy_description">Strategy Description</Label>
                  <textarea
                    id="strategy_description"
                    className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-border rounded-md"
                    placeholder="Describe your trading strategy..."
                    value={createForm.strategy_description}
                    onChange={(e) => setCreateForm({ ...createForm, strategy_description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAccount} disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="investments">My Investments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Browse Public Accounts */}
          <TabsContent value="browse" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicAccounts.map((account) => (
                <Card key={account.id} className="cursor-pointer hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{account.account_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge>{account.account_type}</Badge>
                          <Badge className={getRiskColor(account.risk_level)}>{account.risk_level}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Manager:</span>
                        <span className="font-semibold">{account.manager_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Investors:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Users className="h-3 w-3" /> {account.investors_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Min Investment:</span>
                        <span className="font-semibold">${account.min_investment}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="font-semibold">{account.master_profit_share}%</span>
                      </div>
                      {account.total_trades && account.total_trades > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className={`font-semibold ${account.winning_trades && account.winning_trades > account.losing_trades ? 'text-green-600' : 'text-red-600'}`}>
                            {getROI(account.total_net_profit || 0, account)}%
                          </span>
                        </div>
                      )}
                      {account.total_net_profit && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total P/L:</span>
                          <span className={`font-semibold ${account.total_net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${account.total_net_profit.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedAccount(account);
                        setIsJoinDialogOpen(true);
                      }}
                    >
                      Join Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {publicAccounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No public MAM/PAMM accounts available yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Manage My Accounts */}
          <TabsContent value="manage" className="space-y-4">
            <div className="grid gap-4">
              {myAccounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{account.account_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(account)}
                          <Badge>{account.account_type}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <SettingsIcon className="h-4 w-4 mr-2" /> Manage
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-semibold">{account.account_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Investors</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Users className="h-3 w-3" /> {account.investors_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <p className="font-semibold">${account.total_investments || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                      <p className={`font-semibold ${account.total_net_profit && account.total_net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${account.total_net_profit?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {myAccounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't created any MAM/PAMM accounts yet.</p>
              </div>
            )}
          </TabsContent>

          {/* My Investments */}
          <TabsContent value="investments" className="space-y-4">
            <div className="grid gap-4">
              {myInvestments.map((investment) => (
                <Card key={investment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{investment.account_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge>{investment.account_type}</Badge>
                          <Badge>{investment.manager_name}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Investment</p>
                      <p className="font-semibold">${investment.investment_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="font-semibold">${investment.current_balance || investment.investment_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total P/L</p>
                      <p className={`font-semibold ${investment.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${investment.total_profit_loss?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Performance Fee</p>
                      <p className="font-semibold">{investment.master_profit_share}%</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {myInvestments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't invested in any accounts yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Performance charts and analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Join Account Dialog */}
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join {selectedAccount?.account_name}</DialogTitle>
              <DialogDescription>Invest in this MAM/PAMM account</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-muted/50 p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Type:</span>
                    <span className="font-semibold">{selectedAccount.account_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <Badge className={getRiskColor(selectedAccount.risk_level)}>{selectedAccount.risk_level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Min Investment:</span>
                    <span className="font-semibold">${selectedAccount.min_investment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Performance Fee:</span>
                    <span className="font-semibold">{selectedAccount.master_profit_share}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment_amount">Investment Amount (USD) *</Label>
                  <Input
                    id="investment_amount"
                    type="number"
                    min={selectedAccount.min_investment}
                    max={selectedAccount.max_investment}
                    value={joinForm.investment_amount}
                    onChange={(e) => setJoinForm({ ...joinForm, investment_amount: e.target.value })}
                  />
                </div>

                {selectedAccount.account_type === 'MAM' && (
                  <div className="space-y-2">
                    <Label htmlFor="risk_multiplier">Risk Multiplier</Label>
                    <Input
                      id="risk_multiplier"
                      type="number"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={joinForm.risk_multiplier}
                      onChange={(e) => setJoinForm({ ...joinForm, risk_multiplier: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Multiplier for lot size (1x = same as manager)</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleJoinAccount} disabled={loading}>
                {loading ? "Joining..." : "Join Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

