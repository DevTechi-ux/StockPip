"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Building2,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface FundAccount {
  id: number;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface FundTransaction {
  id: number;
  accountId: number;
  transactionType: string;
  amount: number;
  fromAccountId: number | null;
  toAccountId: number | null;
  description: string;
  referenceId: string;
  adminId: number | null;
  status: string;
  createdAt: string;
  account: { id: number; accountName: string };
  admin: { id: number; name: string } | null;
}

interface FundStats {
  totalBalance: number;
  balanceByType: {
    operating: number;
    reserve: number;
    commission: number;
  };
  accountStats: {
    totalAccounts: number;
    activeAccounts: number;
    frozenAccounts: number;
  };
  transactionStats: {
    totalTransactions: number;
    byType: {
      deposit: { count: number; total: number };
      withdrawal: { count: number; total: number };
      transfer: { count: number; total: number };
      fee_collection: { count: number; total: number };
      commission: { count: number; total: number };
    };
    recent: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
  };
}

export default function FundsManagementPage() {
  const [accounts, setAccounts] = useState<FundAccount[]>([]);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [stats, setStats] = useState<FundStats | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<FundAccount | null>(null);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const res = await fetch("/api/admin/fund-accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      toast.error("Failed to load fund accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const res = await fetch("/api/admin/fund-transactions?limit=50");
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch("/api/admin/fund-stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      accountName: formData.get("accountName") as string,
      accountType: formData.get("accountType") as string,
      balance: parseFloat(formData.get("balance") as string) || 0,
      description: formData.get("description") as string,
    };

    try {
      const res = await fetch("/api/admin/fund-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Fund account created successfully");
      setIsAccountDialogOpen(false);
      fetchAccounts();
      fetchStats();
    } catch (error) {
      toast.error("Failed to create fund account");
    }
  };

  const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      accountId: parseInt(formData.get("accountId") as string),
      transactionType: "deposit",
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      referenceId: formData.get("referenceId") as string,
    };

    try {
      const res = await fetch("/api/admin/fund-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Deposit processed successfully");
      setIsDepositDialogOpen(false);
      fetchAccounts();
      fetchTransactions();
      fetchStats();
    } catch (error) {
      toast.error("Failed to process deposit");
    }
  };

  const handleWithdrawal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      accountId: parseInt(formData.get("accountId") as string),
      transactionType: "withdrawal",
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      referenceId: formData.get("referenceId") as string,
    };

    try {
      const res = await fetch("/api/admin/fund-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Withdrawal processed successfully");
      setIsWithdrawalDialogOpen(false);
      fetchAccounts();
      fetchTransactions();
      fetchStats();
    } catch (error) {
      toast.error("Failed to process withdrawal");
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      fromAccountId: parseInt(formData.get("fromAccountId") as string),
      toAccountId: parseInt(formData.get("toAccountId") as string),
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      referenceId: formData.get("referenceId") as string,
    };

    try {
      const res = await fetch("/api/admin/fund-transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Transfer completed successfully");
      setIsTransferDialogOpen(false);
      fetchAccounts();
      fetchTransactions();
      fetchStats();
    } catch (error) {
      toast.error("Failed to process transfer");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "transfer":
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />;
      case "fee_collection":
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      case "commission":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "operating":
        return "bg-blue-500/10 text-blue-500";
      case "reserve":
        return "bg-green-500/10 text-green-500";
      case "commission":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fund Management</h1>
          <p className="text-muted-foreground">
            Manage platform fund accounts and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => {
            fetchAccounts();
            fetchTransactions();
            fetchStats();
          }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : formatCurrency(stats?.totalBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.accountStats.activeAccounts || 0} active accounts
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {isLoadingStats ? "..." : formatCurrency(stats?.balanceByType.operating || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Daily operations</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reserve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {isLoadingStats ? "..." : formatCurrency(stats?.balanceByType.reserve || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Emergency fund</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {isLoadingStats ? "..." : formatCurrency(stats?.balanceByType.commission || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Fees collected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fund Accounts</CardTitle>
                  <CardDescription>Manage platform fund accounts</CardDescription>
                </div>
                <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleCreateAccount}>
                      <DialogHeader>
                        <DialogTitle>Create Fund Account</DialogTitle>
                        <DialogDescription>
                          Create a new fund account for platform operations
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountName">Account Name</Label>
                          <Input
                            id="accountName"
                            name="accountName"
                            placeholder="e.g., Operating Account"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select name="accountType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="operating">Operating</SelectItem>
                              <SelectItem value="reserve">Reserve</SelectItem>
                              <SelectItem value="commission">Commission</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="balance">Initial Balance</Label>
                          <Input
                            id="balance"
                            name="balance"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            defaultValue="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            placeholder="Account description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Account</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAccounts ? (
                <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accounts.map((account) => (
                    <Card key={account.id} className="glass-effect border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{account.accountName}</CardTitle>
                          </div>
                          <Badge
                            variant={account.status === "active" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {account.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Balance</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(account.balance)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={getAccountTypeColor(account.accountType)}>
                            {account.accountType}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {account.currency}
                          </p>
                        </div>
                        {account.description && (
                          <p className="text-sm text-muted-foreground">
                            {account.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all fund transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} className="ios-transition hover:bg-accent/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.transactionType)}
                              <span className="capitalize">{tx.transactionType.replace("_", " ")}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {tx.account?.accountName || "N/A"}
                          </TableCell>
                          <TableCell className={`font-bold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {tx.amount >= 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {tx.description || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {tx.referenceId || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {tx.admin?.name || "System"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Deposit Card */}
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                  <CardTitle>Deposit</CardTitle>
                </div>
                <CardDescription>Add funds to an account</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleDeposit}>
                      <DialogHeader>
                        <DialogTitle>Process Deposit</DialogTitle>
                        <DialogDescription>
                          Add funds to a fund account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="deposit-account">Account</Label>
                          <Select name="accountId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.filter(a => a.status === "active").map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.accountName} ({formatCurrency(account.balance)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deposit-amount">Amount</Label>
                          <Input
                            id="deposit-amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deposit-reference">Reference ID</Label>
                          <Input
                            id="deposit-reference"
                            name="referenceId"
                            placeholder="e.g., DEP-2024-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deposit-description">Description</Label>
                          <Textarea
                            id="deposit-description"
                            name="description"
                            placeholder="Transaction description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Process Deposit</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Withdrawal Card */}
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                  <CardTitle>Withdrawal</CardTitle>
                </div>
                <CardDescription>Withdraw funds from an account</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Withdrawal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleWithdrawal}>
                      <DialogHeader>
                        <DialogTitle>Process Withdrawal</DialogTitle>
                        <DialogDescription>
                          Withdraw funds from a fund account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdrawal-account">Account</Label>
                          <Select name="accountId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.filter(a => a.status === "active").map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.accountName} ({formatCurrency(account.balance)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawal-amount">Amount</Label>
                          <Input
                            id="withdrawal-amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawal-reference">Reference ID</Label>
                          <Input
                            id="withdrawal-reference"
                            name="referenceId"
                            placeholder="e.g., WD-2024-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="withdrawal-description">Description</Label>
                          <Textarea
                            id="withdrawal-description"
                            name="description"
                            placeholder="Transaction description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" variant="destructive">Process Withdrawal</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Transfer Card */}
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5 text-blue-500" />
                  <CardTitle>Transfer</CardTitle>
                </div>
                <CardDescription>Transfer between accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Transfer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleTransfer}>
                      <DialogHeader>
                        <DialogTitle>Transfer Funds</DialogTitle>
                        <DialogDescription>
                          Transfer funds between fund accounts
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="from-account">From Account</Label>
                          <Select name="fromAccountId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.filter(a => a.status === "active").map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.accountName} ({formatCurrency(account.balance)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="to-account">To Account</Label>
                          <Select name="toAccountId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.filter(a => a.status === "active").map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.accountName} ({formatCurrency(account.balance)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transfer-amount">Amount</Label>
                          <Input
                            id="transfer-amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transfer-reference">Reference ID</Label>
                          <Input
                            id="transfer-reference"
                            name="referenceId"
                            placeholder="e.g., TRF-2024-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transfer-description">Description</Label>
                          <Textarea
                            id="transfer-description"
                            name="description"
                            placeholder="Transaction description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Process Transfer</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
