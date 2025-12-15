"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const traders = [
  {
    name: "James Wilson",
    email: "james@example.com",
    trades: 234,
    profit: "+$45,231",
    profitPercent: "+23.5%",
    trend: "up",
  },
  {
    name: "Lisa Anderson",
    email: "lisa@example.com",
    trades: 189,
    profit: "+$38,420",
    profitPercent: "+19.2%",
    trend: "up",
  },
  {
    name: "Robert Brown",
    email: "robert@example.com",
    trades: 156,
    profit: "+$32,100",
    profitPercent: "+15.8%",
    trend: "up",
  },
  {
    name: "Emily Clark",
    email: "emily@example.com",
    trades: 142,
    profit: "+$28,950",
    profitPercent: "+14.1%",
    trend: "up",
  },
  {
    name: "Michael Davis",
    email: "michael@example.com",
    trades: 128,
    profit: "-$12,340",
    profitPercent: "-6.2%",
    trend: "down",
  },
];

export function TopTraders() {
  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle>Top Traders</CardTitle>
        <CardDescription>Best performing traders this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {traders.map((trader, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 ios-transition hover:bg-accent"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${trader.email}`} alt={trader.name} />
                  <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{trader.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{trader.trades} trades</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  {trader.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <p className={`text-sm font-bold ${trader.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    {trader.profit}
                  </p>
                </div>
                <Badge variant="outline" className="mt-1">
                  {trader.profitPercent}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
