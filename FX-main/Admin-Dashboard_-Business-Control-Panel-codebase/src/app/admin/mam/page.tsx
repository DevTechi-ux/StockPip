"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Users, TrendingUp, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface MamAccount {
  id: string;
  account_name: string;
  account_type: 'MAM' | 'PAMM';
  first_name: string;
  last_name: string;
  email: string;
  investors_count: number;
  total_trades: number;
  total_net_profit: number;
  is_admin_approved: boolean;
  is_active: boolean;
}

export default function MAMPage() {
  const [accounts, setAccounts] = useState<MamAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/mam-accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching MAM accounts:', error);
      toast.error("Failed to fetch MAM accounts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MAM (Multi-Account Manager)</h1>
          <p className="text-muted-foreground">
            Manage multi-account trading and money managers
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add MAM Manager
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add MAM Manager</DialogTitle>
              <DialogDescription>Create a new multi-account manager</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager Account</Label>
                <Input id="manager" placeholder="Select manager account..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Commission (%)</Label>
                <Input id="commission" type="number" defaultValue="20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minInvestment">Minimum Investment</Label>
                <Input id="minInvestment" type="number" defaultValue="1000" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch id="active" defaultChecked />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Create Manager</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">All managers</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Investors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.reduce((sum, a) => sum + (a.investors_count || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">Total investors</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.reduce((sum, a) => sum + (a.total_trades || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">All accounts</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${accounts.reduce((sum, a) => sum + (a.total_net_profit || 0), 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${accounts.reduce((sum, a) => sum + (a.total_net_profit || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>MAM/PAMM Accounts</CardTitle>
          <CardDescription>All multi-account managers and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No MAM/PAMM accounts found</div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Investors</TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead>Net Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                  <TableRow key={account.id} className="ios-transition hover:bg-accent/50">
                    <TableCell>
                      <div className="font-medium">{account.account_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.account_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {(account.first_name || '').charAt(0)}{(account.last_name || '').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{account.first_name} {account.last_name}</p>
                          <p className="text-xs text-muted-foreground">{account.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{account.investors_count || 0}</TableCell>
                    <TableCell className="font-medium">{account.total_trades || 0}</TableCell>
                    <TableCell className={`font-bold ${(account.total_net_profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${(account.total_net_profit || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={account.is_active && account.is_admin_approved ? "default" : "secondary"}
                      >
                        {account.is_active && account.is_admin_approved ? "Active" : account.is_admin_approved ? "Inactive" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        {!account.is_admin_approved && "Approve"}
                        {account.is_active && account.is_admin_approved && "Suspend"}
                        {!account.is_active && account.is_admin_approved && "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
