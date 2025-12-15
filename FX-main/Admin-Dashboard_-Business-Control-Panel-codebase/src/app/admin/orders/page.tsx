"use client";

import { useState, useEffect } from "react";
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
import { Search, X, RefreshCw } from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  lot_size: string;
  entry_price: string;
  exit_price: string;
  pnl: string;
  open_time: string;
  close_time: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all trading orders
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Closed trades</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profitable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{orders.filter(o => parseFloat(o.pnl || '0') > 0).length}</div>
            <p className="text-xs text-muted-foreground">{orders.length > 0 ? ((orders.filter(o => parseFloat(o.pnl || '0') > 0).length / orders.length) * 100).toFixed(1) : '0'}% win rate</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{orders.filter(o => parseFloat(o.pnl || '0') < 0).length}</div>
            <p className="text-xs text-muted-foreground">Losing trades</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${orders.reduce((sum, o) => sum + parseFloat(o.pnl || '0'), 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {orders.reduce((sum, o) => sum + parseFloat(o.pnl || '0'), 0) >= 0 ? '+' : ''}${orders.reduce((sum, o) => sum + parseFloat(o.pnl || '0'), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Realized profit</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            View and manage trading orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, user, or instrument..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Lot Size</TableHead>
                  <TableHead>Exit Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Close Time</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="animate-pulse">Loading orders...</div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No order history
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const pnlValue = parseFloat(order.pnl || '0');
                    return (
                      <TableRow key={order.id} className="ios-transition hover:bg-accent/50">
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-medium">{order.first_name} {order.last_name}</TableCell>
                        <TableCell className="font-bold">{order.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={order.side === "BUY" ? "default" : "secondary"}>
                            {order.side}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">Market</TableCell>
                        <TableCell>{parseFloat(order.lot_size || '0').toFixed(2)}</TableCell>
                        <TableCell className="font-medium">{parseFloat(order.exit_price || '0').toFixed(5)}</TableCell>
                        <TableCell>
                          <Badge variant={pnlValue >= 0 ? "default" : "destructive"}>
                            Closed
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{new Date(order.close_time).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className={`font-medium ${pnlValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {pnlValue >= 0 ? '+' : ''}${pnlValue.toFixed(2)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
