"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  ShoppingCart,
  Target,
  Network,
  Layers,
  DollarSign,
  ShieldCheck,
  MessageSquare,
  FileText,
  Settings,
  Building2,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Wallets",
        href: "/admin/wallets",
        icon: Wallet,
      },
      {
        title: "KYC Verification",
        href: "/admin/kyc",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Trading",
    items: [
      {
        title: "Instruments",
        href: "/admin/instruments",
        icon: TrendingUp,
      },
      {
        title: "Transactions",
        href: "/admin/transactions",
        icon: ArrowLeftRight,
      },
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Positions",
        href: "/admin/positions",
        icon: Target,
      },
    ],
  },
  {
    title: "Portfolio Management",
    items: [
      {
        title: "MAM/PAMM",
        href: "/admin/mam",
        icon: Layers,
      },
      {
        title: "IB Management",
        href: "/admin/ib",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Bank Management",
        href: "/admin/bank-management",
        icon: CreditCard,
      },
      {
        title: "Fund Management",
        href: "/admin/fund-requests",
        icon: Building2,
      },
      {
        title: "Fees",
        href: "/admin/fees",
        icon: DollarSign,
      },
      {
        title: "Support",
        href: "/admin/support",
        icon: MessageSquare,
      },
      {
        title: "Audit Logs",
        href: "/admin/audit",
        icon: FileText,
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card glass-effect">
      <div className="flex h-16 items-center justify-center border-b border-border px-6">
        <img src="/suimLogo.jpeg" alt="StockPip Admin" className="h-10 w-auto object-contain" />
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <div className="space-y-4 px-3">
          {navigationGroups.map((group, idx) => (
            <div key={idx}>
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h2>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ios-transition",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
              {idx < navigationGroups.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}