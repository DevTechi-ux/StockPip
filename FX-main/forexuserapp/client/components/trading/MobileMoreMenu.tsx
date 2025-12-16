import { NavLink, useNavigate } from "react-router-dom";
import { LineChart, Wallet, Plug, Banknote, Award, MessageSquare, User, Settings, Moon, Sun, Bell, X, LogOut } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { useTradingStore } from "@/state/trading-store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const navItems = [
  { to: "/userdashboard", icon: LineChart, label: "Chart" },
  { to: "/userdashboard/portfolio", icon: Wallet, label: "Portfolio" },
  { to: "/userdashboard/api", icon: Plug, label: "API" },
  { to: "/userdashboard/wallet", icon: Banknote, label: "Wallet" },
  { to: "/userdashboard/ib", icon: Award, label: "IB" },
  { to: "/userdashboard/support", icon: MessageSquare, label: "Support" },
  { to: "/userdashboard/profile", icon: User, label: "Profile" },
  { to: "/userdashboard/settings", icon: Settings, label: "Settings" },
];

function MobileMoreMenu({ onClose }: { onClose: () => void }) {
  const { mode } = useAppStore();
  const { wallet } = useTradingStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 mb-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground hover:bg-muted"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-base">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        {/* Balance & Equity */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Balance:</div>
          <div className="font-bold text-foreground">${(wallet?.balance || 0).toFixed(2)}</div>
        </div>
        {wallet && (wallet.equity || 0) !== (wallet.balance || 0) && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Equity:</div>
            <div className="font-bold text-foreground">${(wallet?.equity || 0).toFixed(2)}</div>
          </div>
        )}

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Theme:</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Notifications:</div>
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-background"></span>
          </Button>
        </div>

        {/* Trading Mode */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Mode:</div>
          <div className="px-2 py-1 rounded border border-foreground text-xs font-bold">{mode.toUpperCase()}</div>
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full mt-4"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default MobileMoreMenu;
