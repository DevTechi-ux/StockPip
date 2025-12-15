"use client";

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
import { Search, Plus, TrendingUp, Users, DollarSign, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const pammAccounts = [
  {
    id: 1,
    manager: "David Martinez",
    email: "david@example.com",
    investors: 78,
    pool: "$5.2M",
    performance: "+22.5%",
    status: "active",
    allocation: 85,
  },
  {
    id: 2,
    manager: "Emma Thompson",
    email: "emma@example.com",
    investors: 64,
    pool: "$3.8M",
    performance: "+18.9%",
    status: "active",
    allocation: 72,
  },
  {
    id: 3,
    manager: "Robert Garcia",
    email: "robert@example.com",
    investors: 52,
    pool: "$2.9M",
    performance: "+15.3%",
    status: "active",
    allocation: 68,
  },
];

const investors = [
  { name: "Alice Johnson", investment: "$120K", share: "2.3%", profit: "+$27K" },
  { name: "Bob Smith", investment: "$85K", share: "1.6%", profit: "+$19.1K" },
  { name: "Carol White", investment: "$200K", share: "3.8%", profit: "+$45K" },
  { name: "David Lee", investment: "$150K", share: "2.9%", profit: "+$33.8K" },
];

export default function PAMMPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PAMM (Percent Allocation Management)</h1>
          <p className="text-muted-foreground">
            Manage PAMM pools and investor allocations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create PAMM Pool
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Total Pools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active PAMM pools</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Pool Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18.5M</div>
            <p className="text-xs text-muted-foreground">Combined pool value</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Investors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">Active investors</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+19.8%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>PAMM Pools</CardTitle>
          <CardDescription>All percent allocation management pools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PAMM pools..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-4">
            {pammAccounts.map((pool) => (
              <Card key={pool.id} className="ios-transition hover:bg-accent/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={`https://i.pravatar.cc/150?u=${pool.email}`}
                          alt={pool.manager}
                        />
                        <AvatarFallback className="text-xl">
                          {pool.manager.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{pool.manager}</h3>
                          <Badge variant={pool.status === "active" ? "default" : "secondary"}>
                            {pool.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{pool.email}</p>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-muted-foreground">Investors</p>
                            <p className="font-medium">{pool.investors}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pool Size</p>
                            <p className="font-bold">{pool.pool}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Performance</p>
                            <p className="font-bold text-green-500">{pool.performance}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Pool Allocation</p>
                        <Progress value={pool.allocation} className="h-2 w-32" />
                        <p className="text-xs text-muted-foreground mt-1">{pool.allocation}% utilized</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Pool
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Recent Investors</CardTitle>
          <CardDescription>Latest investor activities across all pools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Pool Share</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investors.map((investor, idx) => (
                  <TableRow key={idx} className="ios-transition hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={`https://i.pravatar.cc/150?u=${investor.name}`}
                            alt={investor.name}
                          />
                          <AvatarFallback>
                            {investor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{investor.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{investor.investment}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{investor.share}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-green-500">{investor.profit}</TableCell>
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
