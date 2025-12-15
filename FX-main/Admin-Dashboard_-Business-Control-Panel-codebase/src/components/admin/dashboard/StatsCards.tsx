"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "12,234",
    change: "+12.5%",
    icon: Users,
    trend: "up",
  },
  {
    title: "Active Trades",
    value: "3,456",
    change: "+8.2%",
    icon: Activity,
    trend: "up",
  },
  {
    title: "Trading Volume",
    value: "$2.4M",
    change: "+23.1%",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "Total Revenue",
    value: "$145.2K",
    change: "+5.4%",
    icon: DollarSign,
    trend: "up",
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="glass-effect ios-transition hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
