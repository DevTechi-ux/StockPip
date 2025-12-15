"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DollarSign, CheckCircle, XCircle, Eye, RefreshCw, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface FundRequest {
  id: string;
  user_id: string;
  account_id: string;
  request_type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number | string;
  currency: string;
  payment_method: string;
  bank_account_id?: string;
  transaction_id?: string;
  screenshot_url?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  account_name?: string;
  bank_name?: string;
}

export default function FundRequestsPage() {
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchFundRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/fund-requests?limit=100');
      const data = await response.json();
      if (data.success) {
        setFundRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching fund requests:', error);
      toast.error('Failed to fetch fund requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFundRequests();
  }, []);

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    try {
      const endpoint = processAction === 'approve' ? 'approve' : 'reject';
      const response = await fetch(`/api/admin/fund-requests/${selectedRequest.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: adminNotes,
          adminId: 'admin-001' // In real app, get from JWT token
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Request ${processAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        setIsProcessDialogOpen(false);
        setAdminNotes('');
        fetchFundRequests();
      } else {
        toast.error(data.message || `Failed to ${processAction} request`);
      }
    } catch (error) {
      toast.error(`Failed to ${processAction} request`);
    }
  };

  const openDetailsDialog = (request: FundRequest) => {
    setSelectedRequest(request);
    setIsDetailsDialogOpen(true);
  };

  const openProcessDialog = (request: FundRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setProcessAction(action);
    setAdminNotes('');
    setIsProcessDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'DEPOSIT' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  const filteredRequests = fundRequests.filter(request => {
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    const typeMatch = typeFilter === 'all' || request.request_type === typeFilter;
    return statusMatch && typeMatch;
  });

  const pendingCount = fundRequests.filter(r => r.status === 'PENDING').length;
  const pendingAmount = fundRequests
    .filter(r => r.status === 'PENDING')
    .reduce((sum, r) => sum + parseFloat(String(r.amount)) || 0, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fund Requests</h1>
          <p className="text-muted-foreground">
            Manage deposit and withdrawal requests
          </p>
        </div>
        <Button onClick={fetchFundRequests} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">${pendingAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fundRequests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fundRequests.filter(r => 
                r.status === 'APPROVED' && 
                new Date(r.processed_at || '').toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="typeFilter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Fund Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>Review and process fund requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Method</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="font-medium">{request.first_name} {request.last_name}</div>
                        <div className="text-sm text-muted-foreground">{request.email}</div>
                      </td>
                      <td className="p-2">
                        <Badge className={getTypeColor(request.request_type)}>
                          {request.request_type}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">${parseFloat(String(request.amount)).toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{request.currency}</div>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {request.payment_method}
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openDetailsDialog(request)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          {request.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => openProcessDialog(request, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => openProcessDialog(request, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Complete information about this fund request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <div className="font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedRequest.email}</div>
                </div>
                <div>
                  <Label>Request Type</Label>
                  <Badge className={getTypeColor(selectedRequest.request_type)}>
                    {selectedRequest.request_type}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <div className="font-medium">${parseFloat(String(selectedRequest.amount)).toFixed(2)} {selectedRequest.currency}</div>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <div className="font-medium">{selectedRequest.payment_method}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <Label>Created</Label>
                  <div className="font-medium">{new Date(selectedRequest.created_at).toLocaleString()}</div>
                </div>
              </div>

              {selectedRequest.transaction_id && (
                <div>
                  <Label>Transaction ID</Label>
                  <div className="font-medium">{selectedRequest.transaction_id}</div>
                </div>
              )}

              {selectedRequest.screenshot_url && (
                <div>
                  <Label>Screenshot</Label>
                  <div className="mt-2">
                    <img 
                      src={selectedRequest.screenshot_url} 
                      alt="Payment screenshot" 
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <div className="p-2 bg-muted rounded text-sm">{selectedRequest.admin_notes}</div>
                </div>
              )}

              {selectedRequest.processed_at && (
                <div>
                  <Label>Processed</Label>
                  <div className="font-medium">{new Date(selectedRequest.processed_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Request Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {processAction === 'approve' 
                ? 'Approve this fund request and add funds to user account' 
                : 'Reject this fund request with a reason'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded">
                <div className="font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</div>
                <div className="text-sm text-muted-foreground">{selectedRequest.email}</div>
                <div className="font-medium mt-2">
                  {selectedRequest.request_type}: ${parseFloat(String(selectedRequest.amount)).toFixed(2)}
                </div>
              </div>
              
              <div>
                <Label htmlFor="adminNotes">
                  {processAction === 'approve' ? 'Notes (Optional)' : 'Reason for Rejection'}
                </Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={processAction === 'approve' 
                    ? 'Add any notes about this approval...' 
                    : 'Enter reason for rejection...'
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant={processAction === 'approve' ? 'default' : 'destructive'}
                  onClick={handleProcessRequest}
                >
                  {processAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}








