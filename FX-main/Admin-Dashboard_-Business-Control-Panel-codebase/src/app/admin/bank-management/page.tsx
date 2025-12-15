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
import { CreditCard, Plus, Edit, Trash2, Building2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  bank_code: string;
  account_type: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export default function BankManagementPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    bank_code: "",
    account_type: "BUSINESS",
    currency: "USD"
  });

  const [editForm, setEditForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    bank_code: "",
    account_type: "BUSINESS",
    currency: "USD"
  });

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await fetch("/api/admin/bank-accounts");
      if (response.ok) {
        const data = await response.json();
        setBankAccounts(data.accounts || []);
      } else {
        toast.error("Failed to fetch bank accounts");
      }
    } catch (error) {
      toast.error("Error fetching bank accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const response = await fetch("/api/admin/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        toast.success("Bank account created successfully");
        setIsCreateDialogOpen(false);
        setCreateForm({
          bank_name: "",
          account_name: "",
          account_number: "",
          bank_code: "",
          account_type: "BUSINESS",
          currency: "USD"
        });
        fetchBankAccounts();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to create bank account");
      }
    } catch (error) {
      toast.error("Error creating bank account");
    }
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;

    try {
      const response = await fetch(`/api/admin/bank-accounts/${selectedAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success("Bank account updated successfully");
        setIsEditDialogOpen(false);
        setSelectedAccount(null);
        fetchBankAccounts();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update bank account");
      }
    } catch (error) {
      toast.error("Error updating bank account");
    }
  };

  const handleToggleStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/bank-accounts/${accountId}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        toast.success(`Bank account ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchBankAccounts();
      } else {
        toast.error("Failed to update account status");
      }
    } catch (error) {
      toast.error("Error updating account status");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this bank account?")) return;

    try {
      const response = await fetch(`/api/admin/bank-accounts/${accountId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Bank account deleted successfully");
        fetchBankAccounts();
      } else {
        toast.error("Failed to delete bank account");
      }
    } catch (error) {
      toast.error("Error deleting bank account");
    }
  };

  const openEditDialog = (account: BankAccount) => {
    setSelectedAccount(account);
    setEditForm({
      bank_name: account.bank_name,
      account_name: account.account_name,
      account_number: account.account_number,
      bank_code: account.bank_code,
      account_type: account.account_type,
      currency: account.currency
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Management</h1>
          <p className="text-muted-foreground">
            Manage bank accounts for deposits and withdrawals
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Bank Account</DialogTitle>
              <DialogDescription>
                Add a new bank account for user deposits and withdrawals.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      placeholder="e.g., State Bank of India"
                      value={createForm.bank_name}
                      onChange={(e) => setCreateForm({ ...createForm, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_name">Account Holder Name</Label>
                    <Input
                      id="account_name"
                      placeholder="Full name as per bank"
                      value={createForm.account_name}
                      onChange={(e) => setCreateForm({ ...createForm, account_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      placeholder="Bank account number"
                      value={createForm.account_number}
                      onChange={(e) => setCreateForm({ ...createForm, account_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_code">Bank Code/IFSC</Label>
                    <Input
                      id="bank_code"
                      placeholder="e.g., SBIN0001234"
                      value={createForm.bank_code}
                      onChange={(e) => setCreateForm({ ...createForm, bank_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select value={createForm.account_type} onValueChange={(value) => setCreateForm({ ...createForm, account_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAVINGS">Savings</SelectItem>
                        <SelectItem value="CHECKING">Checking</SelectItem>
                        <SelectItem value="BUSINESS">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAccount}>Create Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {bankAccounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bank Accounts</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add bank accounts to enable user deposits and withdrawals
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Bank Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          bankAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">{account.bank_name}</CardTitle>
                      <CardDescription>{account.account_holder_name}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(account)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(account.id, account.is_active)}
                    >
                      {account.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Account Number</p>
                    <p className="font-mono">****{account.account_number.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">IFSC Code</p>
                    <p className="font-mono">{account.ifsc_code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Branch</p>
                    <p>{account.branch_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Type</p>
                    <p className="capitalize">{account.account_type}</p>
                  </div>
                  {account.upi_id && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">UPI ID</p>
                      <p className="font-mono">{account.upi_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update bank account information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_bank_name">Bank Name</Label>
                <Input
                  id="edit_bank_name"
                  value={editForm.bank_name}
                  onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_account_holder_name">Account Holder Name</Label>
                <Input
                  id="edit_account_holder_name"
                  value={editForm.account_holder_name}
                  onChange={(e) => setEditForm({ ...editForm, account_holder_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_account_number">Account Number</Label>
                <Input
                  id="edit_account_number"
                  value={editForm.account_number}
                  onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_ifsc_code">IFSC Code</Label>
                <Input
                  id="edit_ifsc_code"
                  value={editForm.ifsc_code}
                  onChange={(e) => setEditForm({ ...editForm, ifsc_code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_branch_name">Branch Name</Label>
                <Input
                  id="edit_branch_name"
                  value={editForm.branch_name}
                  onChange={(e) => setEditForm({ ...editForm, branch_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_account_type">Account Type</Label>
                <Select value={editForm.account_type} onValueChange={(value) => setEditForm({ ...editForm, account_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_upi_id">UPI ID (Optional)</Label>
              <Input
                id="edit_upi_id"
                value={editForm.upi_id}
                onChange={(e) => setEditForm({ ...editForm, upi_id: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAccount}>Update Account</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}






