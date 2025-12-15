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
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const transactions = [
  {
    id: "TXN001234",
    user: "John Doe",
    type: "deposit",
    amount: "$5,000.00",
    method: "Bank Transfer",
    status: "completed",
    date: "2024-01-20 10:30 AM",
    fee: "$0.00",
  },
  {
    id: "TXN001235",
    user: "Sarah Smith",
    type: "withdrawal",
    amount: "$2,500.00",
    method: "PayPal",
    status: "pending",
    date: "2024-01-20 11:15 AM",
    fee: "$25.00",
  },
  {
    id: "TXN001236",
    user: "Mike Johnson",
    type: "trade",
    amount: "$1,200.00",
    method: "BTC/USD",
    status: "completed",
    date: "2024-01-20 11:45 AM",
    fee: "$12.00",
  },
  {
    id: "TXN001237",
    user: "Emma Davis",
    type: "deposit",
    amount: "$10,000.00",
    method: "Crypto",
    status: "completed",
    date: "2024-01-20 12:20 PM",
    fee: "$0.00",
  },
  {
    id: "TXN001238",
    user: "Tom Wilson",
    type: "withdrawal",
    amount: "$3,000.00",
    method: "Bank Transfer",
    status: "failed",
    date: "2024-01-20 01:10 PM",
    fee: "$30.00",
  },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Monitor all platform transactions and transfers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">$1.8M</div>
            <p className="text-xs text-muted-foreground">+23.1% vs last month</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">$890K</div>
            <p className="text-xs text-muted-foreground">+8.4% vs last month</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$73.7K</div>
            <p className="text-xs text-muted-foreground">23 transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View and filter all platform transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user, or method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="trade">Trades</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="ios-transition hover:bg-accent/50">
                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                    <TableCell className="font-medium">{tx.user}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {tx.type === "deposit" ? (
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                        ) : tx.type === "withdrawal" ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{tx.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.method}</TableCell>
                    <TableCell>{tx.fee}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.status === "completed"
                            ? "default"
                            : tx.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{tx.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
