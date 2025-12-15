import Header from "@/components/trading/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, CheckCircle, Clock, DollarSign, Users, TrendingUp, Award, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface IbDashboard {
  ib: {
    id: string;
    ib_name: string;
    referral_code: string;
    ib_level: number;
    commission_type: string;
    commission_rate: number;
    status: string;
    total_earnings: number;
    pending_earnings: number;
    total_clients: number;
  };
  stats: {
    total_clients: number;
    total_commissions: number;
    pending_earnings: number;
    total_paid: number;
    total_sub_ibs: number;
  };
  recent_commissions: any[];
  recent_referrals: any[];
}

export default function Ib() {
  const [dashboard, setDashboard] = React.useState<IbDashboard | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = React.useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const [applyForm, setApplyForm] = React.useState({
    ib_name: "",
    parent_referral_code: ""
  });

  const [withdrawForm, setWithdrawForm] = React.useState({
    amount: "",
    withdrawal_method: "BANK_TRANSFER",
    bank_details: ""
  });

  React.useEffect(() => {
    checkIbStatus();
  }, []);

  const checkIbStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/ib/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      } else if (response.status === 404) {
        setDashboard(null); // Not an IB yet
      }
    } catch (error) {
      console.error('Error checking IB status:', error);
    }
  };

  const handleApply = async () => {
    if (!applyForm.ib_name) {
      toast.error("Please enter IB name");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch('/api/ib/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ib_name: applyForm.ib_name,
          parent_referral_code: applyForm.parent_referral_code || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("IB application submitted! Pending admin approval.");
        setIsApplyDialogOpen(false);
        setApplyForm({ ib_name: "", parent_referral_code: "" });
        checkIbStatus();
      } else {
        toast.error(data.error || "Failed to apply for IB");
      }
    } catch (error) {
      console.error('Error applying for IB:', error);
      toast.error("Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.amount) {
      toast.error("Please enter amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch('/api/ib/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawForm.amount),
          withdrawal_method: withdrawForm.withdrawal_method,
          bank_details: JSON.stringify({ details: withdrawForm.bank_details })
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Withdrawal request submitted!");
        setIsWithdrawDialogOpen(false);
        setWithdrawForm({ amount: "", withdrawal_method: "BANK_TRANSFER", bank_details: "" });
        checkIbStatus();
      } else {
        toast.error(data.error || "Failed to submit withdrawal");
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast.error("Error submitting withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!dashboard?.ib) return;
    
    const link = `${window.location.origin}/register?ref=${dashboard.ib.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // If not an IB, show application form
  if (!dashboard || !dashboard.ib) {
    return (
      <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
        <Header />
        <div className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Become an Introducing Broker</h1>
          
          <div className="max-w-3xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  What is an Introducing Broker (IB)?
                </CardTitle>
                <CardDescription>Earn commissions by referring traders to our platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-border bg-muted/50 p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" /> Refer Traders
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Share your unique referral link with traders and earn commission on their trades
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-muted/50 p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Earn Commission
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get paid per lot or percentage based on commission type
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-primary/10 p-4">
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Competitive commission rates</li>
                    <li>• Real-time earnings tracking</li>
                    <li>• Multi-level commission structure</li>
                    <li>• Regular payouts</li>
                    <li>• Dedicated IB dashboard</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Apply to Become an IB
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for IB Account</DialogTitle>
                  <DialogDescription>Get your referral link and start earning commissions</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ib_name">IB Name *</Label>
                    <Input
                      id="ib_name"
                      placeholder="e.g., Your Company Name"
                      value={applyForm.ib_name}
                      onChange={(e) => setApplyForm({ ...applyForm, ib_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_referral_code">Parent IB Code (Optional)</Label>
                    <Input
                      id="parent_referral_code"
                      placeholder="If you have an IB referral code"
                      value={applyForm.parent_referral_code}
                      onChange={(e) => setApplyForm({ ...applyForm, parent_referral_code: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Enter if you were referred by an existing IB</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleApply} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  const ib = dashboard.ib;
  const stats = dashboard.stats;

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">IB Dashboard</h1>
          <div className="flex items-center gap-2">
            {getStatusBadge(ib.status)}
            {ib.status === 'approved' && (
              <Button onClick={() => setIsWithdrawDialogOpen(true)} disabled={stats.pending_earnings < 50}>
                <DollarSign className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                ${stats.total_paid || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pending: ${stats.pending_earnings || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clients Referred</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5" />
                {stats.total_clients || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commission Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Award className="h-5 w-5" />
                {ib.commission_rate} {ib.commission_type === 'per_lot' ? '/lot' : '%'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {stats.total_commissions || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="referral" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="referral">Referral</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Referral Link Tab */}
          <TabsContent value="referral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Link</CardTitle>
                <CardDescription>Share this link with traders to earn commissions on their trades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Referral Code</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-4 py-3 rounded-md font-mono text-sm">
                      {ib.referral_code}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(ib.referral_code);
                        toast.success("Code copied!");
                      }}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Complete Referral Link</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-4 py-3 rounded-md font-mono text-xs truncate">
                      {window.location.origin}/register?ref={ib.referral_code}
                    </code>
                    <Button size="sm" onClick={copyReferralLink}>
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-primary/10 p-4">
                  <p className="text-sm font-semibold mb-2">How it works:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>1. Share your referral link with potential traders</li>
                    <li>2. They register and start trading</li>
                    <li>3. You earn commission on every trade they make</li>
                    <li>4. Withdraw your earnings anytime</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>All your earned commissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Lots</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboard.recent_commissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No commissions yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        dashboard.recent_commissions.map((commission) => (
                          <TableRow key={commission.id}>
                            <TableCell>{new Date(commission.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{commission.first_name} {commission.last_name}</TableCell>
                            <TableCell>{commission.lot_size}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${commission.commission_amount}
                            </TableCell>
                            <TableCell>
                              {commission.status === 'paid' && <Badge className="bg-green-500">Paid</Badge>}
                              {commission.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Referred Clients</CardTitle>
                <CardDescription>People who registered using your referral link</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Total Trades</TableHead>
                        <TableHead>Total Lots</TableHead>
                        <TableHead>Total Commission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboard.recent_referrals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No clients yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        dashboard.recent_referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell>{new Date(referral.registered_at).toLocaleDateString()}</TableCell>
                            <TableCell>{referral.first_name} {referral.last_name}</TableCell>
                            <TableCell>{referral.total_trades || 0}</TableCell>
                            <TableCell>{referral.total_lots || 0}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${referral.total_commission || 0}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detailed analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Withdraw Dialog */}
        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>Withdraw your pending commission earnings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw_amount">Amount (USD) *</Label>
                <Input
                  id="withdraw_amount"
                  type="number"
                  min="50"
                  max={stats.pending_earnings}
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Available: ${stats.pending_earnings || 0}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_details">Bank Details *</Label>
                <textarea
                  id="bank_details"
                  className="w-full min-h-[100px] px-3 py-2 text-sm bg-background border border-border rounded-md"
                  placeholder="Account holder name, account number, bank name, IFSC..."
                  value={withdrawForm.bank_details}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_details: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleWithdraw} disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}










