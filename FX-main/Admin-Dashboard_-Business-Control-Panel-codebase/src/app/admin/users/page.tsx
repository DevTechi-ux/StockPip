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
import { Users, Plus, Edit, Trash2, DollarSign, Ban, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
  created_at: string;
  balance?: number;
  equity?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    userType: "user",
    leverage: 500,
    balance: 0
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    leverage: 500,
    isActive: true,
    isBanned: false,
    banReason: ""
  });

  const [fundForm, setFundForm] = useState({
    amount: "",
    description: "",
    action: "add" // add or deduct
  });

  const [banForm, setBanForm] = useState({
    ban: true,
    reason: ""
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Auto-refresh every 10 seconds to show new registrations immediately
    const interval = setInterval(() => {
      fetchUsers();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User created successfully');
        setIsCreateDialogOpen(false);
        setCreateForm({ email: "", password: "", firstName: "", lastName: "", userType: "user", leverage: 500, balance: 0 });
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User updated successfully');
        setIsEditDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User deactivated successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to deactivate user');
      }
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleFundAction = async () => {
    if (!selectedUser) return;

    try {
      const endpoint = fundForm.action === 'add' ? 'add-funds' : 'deduct-funds';
      const response = await fetch(`/api/admin/users/${selectedUser.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(fundForm.amount),
          description: fundForm.description
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Funds ${fundForm.action === 'add' ? 'added' : 'deducted'} successfully`);
        setIsFundDialogOpen(false);
        setFundForm({ amount: "", description: "", action: "add" });
        // Force refresh after a small delay to ensure database is updated
        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        toast.error(data.message || `Failed to ${fundForm.action} funds`);
      }
    } catch (error) {
      toast.error(`Failed to ${fundForm.action} funds`);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banForm)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`User ${banForm.ban ? 'banned' : 'unbanned'} successfully`);
        setIsBanDialogOpen(false);
        setBanForm({ ban: true, reason: "" });
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to update user status');
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      leverage: 500,
      isActive: user.is_active,
      isBanned: user.is_banned,
      banReason: user.ban_reason || ""
    });
    setIsEditDialogOpen(true);
  };

  const openFundDialog = (user: User) => {
    setSelectedUser(user);
    setIsFundDialogOpen(true);
  };

  const openBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanForm({
      ban: !user.is_banned,
      reason: user.ban_reason || ""
    });
    setIsBanDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, accounts, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userType">User Type</Label>
                    <Select value={createForm.userType} onValueChange={(value) => setCreateForm(prev => ({ ...prev, userType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leverage">Leverage</Label>
                    <Input
                      id="leverage"
                      type="number"
                      value={createForm.leverage}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, leverage: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="balance">Initial Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={createForm.balance}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
        </Button>
      </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({users.length})
          </CardTitle>
          <CardDescription>Manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-2">
                        <Badge variant={user.user_type === 'admin' ? 'default' : 'secondary'}>
                          {user.user_type}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {user.is_banned && (
                            <Badge variant="destructive">Banned</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">${(parseFloat(user.balance) || 0).toFixed(2)}</div>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(user)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openFundDialog(user)}>
                            <DollarSign className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openBanDialog(user)}>
                            {user.is_banned ? <UserCheck className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editLeverage">Leverage</Label>
              <Input
                id="editLeverage"
                type="number"
                value={editForm.leverage}
                onChange={(e) => setEditForm(prev => ({ ...prev, leverage: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fund Management Dialog */}
      <Dialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund Management</DialogTitle>
            <DialogDescription>Add or deduct funds from user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fundAction">Action</Label>
              <Select value={fundForm.action} onValueChange={(value) => setFundForm(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="add">Add Funds</SelectItem>
                  <SelectItem value="deduct">Deduct Funds</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div>
              <Label htmlFor="fundAmount">Amount</Label>
              <Input
                id="fundAmount"
                type="number"
                step="0.01"
                value={fundForm.amount}
                onChange={(e) => setFundForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fundDescription">Description</Label>
              <Textarea
                id="fundDescription"
                value={fundForm.description}
                onChange={(e) => setFundForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFundDialogOpen(false)}>
                Cancel
            </Button>
              <Button onClick={handleFundAction}>
                {fundForm.action === 'add' ? 'Add Funds' : 'Deduct Funds'}
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{banForm.ban ? 'Ban User' : 'Unban User'}</DialogTitle>
            <DialogDescription>
              {banForm.ban ? 'Ban this user from the platform' : 'Restore access for this user'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
                          <div>
              <Label htmlFor="banReason">Reason</Label>
              <Textarea
                id="banReason"
                value={banForm.reason}
                onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={banForm.ban ? "Enter reason for banning..." : "Enter reason for unbanning..."}
              />
                          </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={banForm.ban ? "destructive" : "default"}
                onClick={handleBanUser}
              >
                {banForm.ban ? 'Ban User' : 'Unban User'}
                            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}