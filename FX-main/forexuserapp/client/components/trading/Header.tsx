import { Moon, Sun, Bell, Wallet, TrendingUp, LineChart, Plug, Banknote, MessageSquare, User, Settings, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/state/app-store";
import { useTradingStore } from "@/state/trading-store";
import { NavLink } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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

export default function Header() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "dark");
  const { mode } = useAppStore();
  const { wallet } = useTradingStore();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header className="flex h-12 md:h-14 items-center gap-1 md:gap-3 border-b bg-background px-2 md:px-3">
      <img src="/suimLogo.jpeg" alt=" StockPip" className="h-5 md:h-9 w-auto object-contain" />
      {!isMobile && <div className="mx-1 md:mx-2 h-4 md:h-6 w-px bg-border" />}
      
      {/* Navigation Buttons (replaced search bar) - Hidden on mobile */}
      {!isMobile && (
        <div className="flex flex-1 items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-center gap-1 md:gap-2 px-1.5 md:px-3 py-1.5 md:py-2 rounded-lg border transition-colors whitespace-nowrap text-[10px] md:text-sm ${
                  isActive 
                    ? "text-foreground border-foreground font-medium" 
                    : "text-muted-foreground border-border hover:text-foreground"
                }`
              }
              title={item.label}
            >
              <item.icon className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
              <span className="font-medium hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
      
      {/* Balance Display - Hidden on mobile */}
      {!isMobile && (
        <div className="hidden lg:flex items-center gap-2 md:gap-4 mr-1 md:mr-2">
          <div className="rounded-lg px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 md:gap-2">
            <Wallet className="h-3 w-3 md:h-4 md:w-4 text-foreground" />
            <div className="text-right">
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Balance</div>
              <div className="text-xs md:text-sm font-bold text-foreground">${(wallet?.balance || 0).toFixed(2)}</div>
            </div>
          </div>
          {wallet && (wallet.equity || 0) !== (wallet.balance || 0) && (
            <div className="rounded-lg px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 md:gap-2">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-foreground" />
              <div className="text-right">
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Equity</div>
                <div className="text-xs md:text-sm font-bold text-foreground">${(wallet?.equity || 0).toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right side buttons - Show only mode badge on mobile */}
      <div className="flex items-center justify-end gap-1 md:gap-2 ml-auto">
        {!isMobile && (
          <>
            <button
              aria-label="toggle theme"
              className="inline-flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-lg border hover:border-foreground transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-3 w-3 md:h-4 md:w-4" /> : <Moon className="h-3 w-3 md:h-4 md:w-4" />}
            </button>
            <button className="inline-flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-lg border hover:border-foreground transition-colors relative">
              <Bell className="h-3 w-3 md:h-4 md:w-4" />
              <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500 rounded-full border border-background"></span>
            </button>
          </>
        )}
        <div className="ml-0.5 md:ml-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-foreground text-[9px] md:text-xs font-bold">{mode.toUpperCase()}</div>
      </div>
    </header>
  );
}
