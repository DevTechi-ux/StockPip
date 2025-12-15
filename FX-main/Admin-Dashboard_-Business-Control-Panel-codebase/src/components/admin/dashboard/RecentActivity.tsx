"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    user: "John Doe",
    email: "john@example.com",
    action: "New Trade",
    type: "BUY",
    amount: "$2,450",
    time: "2m ago",
  },
  {
    user: "Sarah Smith",
    email: "sarah@example.com",
    action: "KYC Verified",
    type: "VERIFIED",
    amount: "-",
    time: "5m ago",
  },
  {
    user: "Mike Johnson",
    email: "mike@example.com",
    action: "Withdrawal",
    type: "WITHDRAW",
    amount: "$1,200",
    time: "12m ago",
  },
  {
    user: "Emma Davis",
    email: "emma@example.com",
    action: "New User",
    type: "SIGNUP",
    amount: "-",
    time: "18m ago",
  },
  {
    user: "Tom Wilson",
    email: "tom@example.com",
    action: "Deposit",
    type: "DEPOSIT",
    amount: "$5,000",
    time: "25m ago",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-center gap-4 ios-transition hover:bg-accent/50 p-2 rounded-lg -mx-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${activity.email}`} alt={activity.user} />
            <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user}</p>
            <p className="text-xs text-muted-foreground">{activity.action}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge variant={
              activity.type === "BUY" ? "default" :
              activity.type === "VERIFIED" ? "secondary" :
              activity.type === "WITHDRAW" ? "destructive" :
              "outline"
            } className="text-xs">
              {activity.type}
            </Badge>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
