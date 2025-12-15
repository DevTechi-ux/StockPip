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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const instruments = [
  {
    id: 1,
    symbol: "BTC/USD",
    name: "Bitcoin",
    category: "Crypto",
    price: "$45,230.50",
    change: "+2.45%",
    trend: "up",
    volume: "$2.4B",
    status: "active",
    leverage: "1:100",
    spread: "0.5",
  },
  {
    id: 2,
    symbol: "ETH/USD",
    name: "Ethereum",
    category: "Crypto",
    price: "$2,845.30",
    change: "+1.82%",
    trend: "up",
    volume: "$1.2B",
    status: "active",
    leverage: "1:50",
    spread: "0.4",
  },
  {
    id: 3,
    symbol: "EUR/USD",
    name: "Euro Dollar",
    category: "Forex",
    price: "1.0850",
    change: "-0.12%",
    trend: "down",
    volume: "$5.8B",
    status: "active",
    leverage: "1:500",
    spread: "0.2",
  },
  {
    id: 4,
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "Stock",
    price: "$178.45",
    change: "+0.85%",
    trend: "up",
    volume: "$890M",
    status: "active",
    leverage: "1:20",
    spread: "0.1",
  },
  {
    id: 5,
    symbol: "XAU/USD",
    name: "Gold",
    category: "Commodity",
    price: "$2,045.50",
    change: "-0.35%",
    trend: "down",
    volume: "$3.2B",
    status: "suspended",
    leverage: "1:100",
    spread: "0.3",
  },
];

export default function InstrumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instruments Management</h1>
          <p className="text-muted-foreground">
            Configure and manage trading instruments
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Instrument
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Instrument</DialogTitle>
              <DialogDescription>Configure a new trading instrument</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input id="symbol" placeholder="BTC/USD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Bitcoin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="commodity">Commodity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leverage">Max Leverage</Label>
                  <Input id="leverage" placeholder="1:100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spread">Spread</Label>
                  <Input id="spread" placeholder="0.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission (%)</Label>
                  <Input id="commission" placeholder="0.1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minTrade">Min Trade Size</Label>
                  <Input id="minTrade" placeholder="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTrade">Max Trade Size</Label>
                  <Input id="maxTrade" placeholder="100" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch id="active" defaultChecked />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Create Instrument</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Instruments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$14.2B</div>
            <p className="text-xs text-muted-foreground">+12.5% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Temporarily disabled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>All Instruments</CardTitle>
          <CardDescription>
            View and configure trading instruments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instruments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="commodity">Commodity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Leverage</TableHead>
                  <TableHead>Spread</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instruments.map((instrument) => (
                  <TableRow key={instrument.id} className="ios-transition hover:bg-accent/50">
                    <TableCell>
                      <div>
                        <p className="font-bold">{instrument.symbol}</p>
                        <p className="text-xs text-muted-foreground">{instrument.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{instrument.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{instrument.price}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${instrument.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {instrument.trend === "up" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {instrument.change}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{instrument.volume}</TableCell>
                    <TableCell>{instrument.leverage}</TableCell>
                    <TableCell>{instrument.spread}</TableCell>
                    <TableCell>
                      <Badge
                        variant={instrument.status === "active" ? "default" : "destructive"}
                      >
                        {instrument.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
