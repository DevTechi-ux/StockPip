import { LineChart, Wallet, Layers3, Banknote, BookOpen, User, Settings, Plug, MessageSquare } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/userdashboard", icon: LineChart, label: "Chart" },
  { to: "/userdashboard/portfolio", icon: Wallet, label: "Portfolio" },
  { to: "/userdashboard/api", icon: Plug, label: "API" },
  { to: "/userdashboard/wallet", icon: Banknote, label: "Wallet" },
  { to: "/userdashboard/mam", icon: Layers3, label: "MAM" },
  { to: "/userdashboard/pamm", icon: Layers3, label: "PAMM" },
  { to: "/userdashboard/learn", icon: BookOpen, label: "Learn" },
  { to: "/userdashboard/support", icon: MessageSquare, label: "Support" },
  { to: "/userdashboard/profile", icon: User, label: "Profile" },
  { to: "/userdashboard/settings", icon: Settings, label: "Settings" },
];

export default function SideNav() {
  return (
    <aside className="flex h-full w-12 flex-col items-center gap-2 border-r bg-sidebar py-2">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            `flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground ${isActive ? "bg-accent text-foreground" : "bg-background"}`
          }
          title={it.label}
        >
          <it.icon className="h-4 w-4" />
        </NavLink>
      ))}
    </aside>
  );
}
