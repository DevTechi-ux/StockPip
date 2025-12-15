"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Lock,
  Trash2,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const userData = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 234 567 8900",
  address: "123 Main St, New York, NY 10001",
  joined: "2024-01-15",
  status: "active",
  kyc: "verified",
  balance: "$12,450.00",
  totalDeposits: "$50,000",
  totalWithdrawals: "$37,550",
  trades: 234,
  winRate: "68.5%",
  profit: "+$8,920",
};

const transactions = [
  { id: 1, type: "Deposit", amount: "$5,000", status: "completed", date: "2024-01-20" },
  { id: 2, type: "Withdrawal", amount: "$2,500", status: "completed", date: "2024-01-22" },
  { id: 3, type: "Trade", amount: "$1,200", status: "completed", date: "2024-01-23" },
  { id: 4, type: "Deposit", amount: "$3,000", status: "pending", date: "2024-01-25" },
];

const trades = [
  { id: 1, instrument: "BTC/USD", type: "BUY", size: "0.5", entry: "$45,230", current: "$46,100", pnl: "+$435", status: "open" },
  { id: 2, instrument: "ETH/USD", type: "SELL", size: "2.0", entry: "$2,850", current: "$2,800", pnl: "+$100", status: "open" },
  { id: 3, instrument: "EUR/USD", type: "BUY", size: "10000", entry: "1.0850", current: "1.0890", pnl: "+$40", status: "closed" },
];

const activityLogs = [
  { action: "Login", ip: "192.168.1.1", location: "New York, US", time: "2 hours ago" },
  { action: "Trade Executed", ip: "192.168.1.1", location: "New York, US", time: "3 hours ago" },
  { action: "Password Changed", ip: "192.168.1.1", location: "New York, US", time: "1 day ago" },
  { action: "KYC Verified", ip: "192.168.1.1", location: "New York, US", time: "2 days ago" },
];

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">Detailed user information and activity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Lock className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${userData.email}`}
                  alt={userData.name}
                />
                <AvatarFallback className="text-2xl">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{userData.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{userData.email}</p>
              <div className="flex gap-2">
                <Badge variant={userData.status === "active" ? "default" : "secondary"}>
                  {userData.status}
                </Badge>
                <Badge variant={userData.kyc === "verified" ? "default" : "outline"}>
                  {userData.kyc}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{userData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{userData.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {userData.joined}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Account Active</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trading Enabled</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Notifications</span>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.balance}</div>
                <p className="text-xs text-muted-foreground">Available funds</p>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{userData.profit}</div>
                <p className="text-xs text-muted-foreground">Win rate: {userData.winRate}</p>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Total Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.trades}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Edit User Details</CardTitle>
              <CardDescription>Update user information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={userData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={userData.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={userData.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Balance</Label>
                  <Input id="balance" defaultValue={userData.balance} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue={userData.address} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All deposits, withdrawals, and trades</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.type}</TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "completed" ? "default" : "outline"}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Trading History</CardTitle>
              <CardDescription>All open and closed positions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.instrument}</TableCell>
                      <TableCell>
                        <Badge variant={trade.type === "BUY" ? "default" : "secondary"}>
                          {trade.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.size}</TableCell>
                      <TableCell>{trade.entry}</TableCell>
                      <TableCell>{trade.current}</TableCell>
                      <TableCell className="font-medium text-green-500">{trade.pnl}</TableCell>
                      <TableCell>
                        <Badge variant={trade.status === "open" ? "default" : "outline"}>
                          {trade.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>User actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg bg-accent/50"
                  >
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.ip} • {log.location}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
