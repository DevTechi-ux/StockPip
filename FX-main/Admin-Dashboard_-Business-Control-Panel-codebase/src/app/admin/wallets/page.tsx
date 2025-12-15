"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Search, Plus, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const wallets = [
  {
    id: 1,
    user: "John Doe",
    email: "john@example.com",
    balance: "$12,450.00",
    available: "$12,000.00",
    locked: "$450.00",
    currency: "USD",
    status: "active",
  },
  {
    id: 2,
    user: "Sarah Smith",
    email: "sarah@example.com",
    balance: "$8,920.00",
    available: "$8,920.00",
    locked: "$0.00",
    currency: "USD",
    status: "active",
  },
  {
    id: 3,
    user: "Mike Johnson",
    email: "mike@example.com",
    balance: "$5,670.00",
    available: "$5,200.00",
    locked: "$470.00",
    currency: "USD",
    status: "frozen",
  },
];

const deposits = [
  { id: 1, user: "John Doe", amount: "$5,000", method: "Bank Transfer", status: "completed", date: "2024-01-20" },
  { id: 2, user: "Sarah Smith", amount: "$3,000", method: "Credit Card", status: "pending", date: "2024-01-22" },
  { id: 3, user: "Emma Davis", amount: "$10,000", method: "Crypto", status: "completed", date: "2024-01-23" },
];

const withdrawals = [
  { id: 1, user: "Mike Johnson", amount: "$2,500", method: "Bank Transfer", status: "processing", date: "2024-01-21" },
  { id: 2, user: "Tom Wilson", amount: "$1,200", method: "PayPal", status: "completed", date: "2024-01-22" },
  { id: 3, user: "Emma Davis", amount: "$5,000", method: "Bank Transfer", status: "pending", date: "2024-01-24" },
];

export default function WalletsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
          <p className="text-muted-foreground">Monitor and manage user wallets and transactions</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Manual Transaction
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">Across all wallets</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45.2K</div>
            <p className="text-xs text-muted-foreground">12 pending</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28.5K</div>
            <p className="text-xs text-muted-foreground">8 pending</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frozen Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.3K</div>
            <p className="text-xs text-muted-foreground">34 wallets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="wallets">All Wallets</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>User Wallets</CardTitle>
              <CardDescription>Monitor all user wallet balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Locked</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.id} className="ios-transition hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{wallet.user}</p>
                            <p className="text-xs text-muted-foreground">{wallet.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{wallet.balance}</TableCell>
                        <TableCell className="text-green-500">{wallet.available}</TableCell>
                        <TableCell className="text-orange-500">{wallet.locked}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{wallet.currency}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={wallet.status === "active" ? "default" : "destructive"}
                          >
                            {wallet.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Adjust
                            </Button>
                            <Button variant="outline" size="sm">
                              Freeze
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Deposit Requests</CardTitle>
              <CardDescription>Review and approve deposit transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((deposit) => (
                      <TableRow key={deposit.id} className="ios-transition hover:bg-accent/50">
                        <TableCell className="font-medium">{deposit.user}</TableCell>
                        <TableCell className="font-bold text-green-500">
                          <div className="flex items-center gap-1">
                            <ArrowDownRight className="h-4 w-4" />
                            {deposit.amount}
                          </div>
                        </TableCell>
                        <TableCell>{deposit.method}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              deposit.status === "completed"
                                ? "default"
                                : deposit.status === "pending"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {deposit.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{deposit.date}</TableCell>
                        <TableCell className="text-right">
                          {deposit.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                Approve
                              </Button>
                              <Button variant="destructive" size="sm">
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Review and process withdrawal transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="ios-transition hover:bg-accent/50">
                        <TableCell className="font-medium">{withdrawal.user}</TableCell>
                        <TableCell className="font-bold text-red-500">
                          <div className="flex items-center gap-1">
                            <ArrowUpRight className="h-4 w-4" />
                            {withdrawal.amount}
                          </div>
                        </TableCell>
                        <TableCell>{withdrawal.method}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              withdrawal.status === "completed"
                                ? "default"
                                : withdrawal.status === "pending"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{withdrawal.date}</TableCell>
                        <TableCell className="text-right">
                          {withdrawal.status !== "completed" && (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                Process
                              </Button>
                              <Button variant="destructive" size="sm">
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
