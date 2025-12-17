"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, DollarSign, CheckCircle, Clock, XCircle, TrendingUp, Award, Activity } from "lucide-react";
import { toast } from "sonner";

interface IbAccount {
  id: string;
  ib_name: string;
  referral_code: string;
  ib_level: number;
  commission_type: string;
  commission_rate: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  total_earnings: number;
  pending_earnings: number;
  total_clients: number;
  first_name: string;
  last_name: string;
  email: string;
  total_paid: number;
  pending_commissions: number;
}

interface IbWithdrawal {
  id: string;
  ib_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  withdrawal_method: string;
  created_at: string;
  processed_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function IbManagementPage() {
  const [ibAccounts, setIbAccounts] = useState<IbAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<IbWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [selectedIb, setSelectedIb] = useState<IbAccount | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IbWithdrawal | null>(null);

  const [approvalForm, setApprovalForm] = useState({
    commission_rate: "5.00",
    commission_type: "per_lot",
    admin_notes: ""
  });

  const [withdrawalForm, setWithdrawalForm] = useState({
    admin_notes: ""
  });

  useEffect(() => {
    fetchIbAccounts();
    fetchWithdrawals();
  }, []);

  const fetchIbAccounts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/ib-accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIbAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching IB accounts:', error);
      toast.error("Failed to fetch IB accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/ib-withdrawals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleApproveIb = async (action: 'approved' | 'rejected' | 'suspended') => {
    if (!selectedIb) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/ib-accounts/${selectedIb.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action,
          admin_notes: approvalForm.admin_notes,
          commission_rate: parseFloat(approvalForm.commission_rate),
          commission_type: approvalForm.commission_type
        })
      });

      if (response.ok) {
        toast.success(`IB account ${action} successfully`);
        setIsApprovalDialogOpen(false);
        setApprovalForm({ commission_rate: "5.00", commission_type: "per_lot", admin_notes: "" });
        fetchIbAccounts();
      } else {
        toast.error("Failed to update IB status");
      }
    } catch (error) {
      console.error('Error updating IB status:', error);
      toast.error("Error updating IB status");
    }
  };

  const handleProcessWithdrawal = async (action: 'approved' | 'rejected' | 'paid') => {
    if (!selectedWithdrawal) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/ib-withdrawals/${selectedWithdrawal.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: action,
          admin_notes: withdrawalForm.admin_notes
        })
      });

      if (response.ok) {
        toast.success(`Withdrawal ${action} successfully`);
        setIsWithdrawalDialogOpen(false);
        setWithdrawalForm({ admin_notes: "" });
        fetchWithdrawals();
        fetchIbAccounts();
      } else {
        toast.error("Failed to process withdrawal");
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error("Error processing withdrawal");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Introducing Broker Management</h1>
      </div>

      <Tabs defaultValue="ib-accounts" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="ib-accounts">IB Accounts</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* IB Accounts Tab */}
        <TabsContent value="ib-accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                IB Accounts ({ibAccounts.length})
              </CardTitle>
              <CardDescription>Manage Introducing Broker accounts and commissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : ibAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No IB accounts found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IB Name</TableHead>
                        <TableHead>Referral Code</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Clients</TableHead>
                        <TableHead>Earnings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ibAccounts.map((ib) => (
                        <TableRow key={ib.id}>
                          <TableCell className="font-semibold">{ib.ib_name}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{ib.referral_code}</code>
                          </TableCell>
                          <TableCell>{ib.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Level {ib.ib_level}</Badge>
                          </TableCell>
                          <TableCell>
                            {ib.commission_rate} {ib.commission_type === 'per_lot' ? '/lot' : '%'}
                          </TableCell>
                          <TableCell className="font-semibold">{ib.total_clients || 0}</TableCell>
                          <TableCell>
                            <div className="text-green-600 font-semibold">${ib.total_paid || 0}</div>
                            <div className="text-xs text-muted-foreground">Pending: ${ib.pending_commissions || 0}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(ib.status)}</TableCell>
                          <TableCell>
                            {ib.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedIb(ib);
                                    setIsApprovalDialogOpen(true);
                                  }}
                                >
                                  Review
                                </Button>
                              </div>
                            )}
                            {ib.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  setSelectedIb(ib);
                                  await handleApproveIb('suspended');
                                }}
                              >
                                Suspend
                              </Button>
                            )}
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

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                IB Withdrawal Requests ({withdrawals.filter(w => w.status === 'pending').length} pending)
              </CardTitle>
              <CardDescription>Process IB commission withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IB Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No withdrawal requests
                        </TableCell>
                      </TableRow>
                    ) : (
                      withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell className="font-semibold">{withdrawal.ib_name}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            ${withdrawal.amount}
                          </TableCell>
                          <TableCell>{withdrawal.withdrawal_method}</TableCell>
                          <TableCell>{new Date(withdrawal.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                          <TableCell>
                            {withdrawal.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setIsWithdrawalDialogOpen(true);
                                }}
                              >
                                Process
                              </Button>
                            )}
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total IBs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {ibAccounts.filter(ib => ib.status === 'approved').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients Referred</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {ibAccounts.reduce((sum, ib) => sum + (ib.total_clients || 0), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Commissions Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
                  <DollarSign className="h-5 w-5" />
                  ${(() => {
                    const totalPaid = ibAccounts.reduce((sum, ib) => sum + (Number(ib.total_paid) || 0), 0);
                    return totalPaid.toFixed(2);
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* IB Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review IB Application</DialogTitle>
            <DialogDescription>{selectedIb?.ib_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Commission Rate</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                value={approvalForm.commission_rate}
                onChange={(e) => setApprovalForm({ ...approvalForm, commission_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_type">Commission Type</Label>
              <Select value={approvalForm.commission_type} onValueChange={(value) => setApprovalForm({ ...approvalForm, commission_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_lot">Per Lot</SelectItem>
                  <SelectItem value="spread_share">Spread Share %</SelectItem>
                  <SelectItem value="profit_share">Profit Share %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={approvalForm.admin_notes}
                onChange={(e) => setApprovalForm({ ...approvalForm, admin_notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleApproveIb('rejected')}>Reject</Button>
            <Button onClick={() => handleApproveIb('approved')}>Approve</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Process Dialog */}
      <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Withdrawal</DialogTitle>
            <DialogDescription>${selectedWithdrawal?.amount}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal_notes">Admin Notes</Label>
              <Textarea
                id="withdrawal_notes"
                value={withdrawalForm.admin_notes}
                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, admin_notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsWithdrawalDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleProcessWithdrawal('rejected')}>Reject</Button>
            <Button onClick={() => handleProcessWithdrawal('approved')}>Approve</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

