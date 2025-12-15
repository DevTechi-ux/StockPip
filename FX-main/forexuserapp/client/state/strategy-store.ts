import { create } from "zustand";

export type Strategy = {
  id: string;
  name: string;
  style: "Momentum" | "Price Action" | "Swing" | "Intraday" | "Mean Reversion" | "Breakout" | "Trend" | "Premium";
  timeframe: string;
  risk: "Low" | "Medium" | "High";
  description: string;
  premium?: boolean;
};

type State = {
  strategies: Strategy[];
  subs: Record<string, boolean>;
  subscribe: (id: string) => void;
  unsubscribe: (id: string) => void;
};

const DEFAULTS: Strategy[] = [
  { id: "mom15", name: "Momentum 15m", style: "Momentum", timeframe: "15m", risk: "Medium", description: "Follows momentum with volatility filter and ATR-based stops." },
  { id: "mom1h", name: "Momentum 1h", style: "Momentum", timeframe: "1h", risk: "Low", description: "Higher TF momentum with tighter risk controls." },
  { id: "pa30", name: "Price Action 30m", style: "Price Action", timeframe: "30m", risk: "Medium", description: "Engulfing/pin bar entries with structure-based SL/TP." },
  { id: "swing4h", name: "Swing 4h", style: "Swing", timeframe: "4h", risk: "Low", description: "Swing structure, MA trend filter, ATR stops." },
  { id: "intraday5", name: "Intraday 5m", style: "Intraday", timeframe: "5m", risk: "High", description: "Mean reversion + VWAP bands with strict daily risk cap." },
  { id: "breakout", name: "Breakout", style: "Breakout", timeframe: "15m", risk: "High", description: "Session range breakout with volatility expansion." },
  { id: "trend", name: "Trend Follower", style: "Trend", timeframe: "1h", risk: "Medium", description: "MA cross + pullback entries, pyramiding limited to 2." },
  { id: "premiumX", name: "Pro Premium Alpha", style: "Premium", timeframe: "Mixed", risk: "Medium", description: "Multi-factor signals incl. momentum, breadth, regime filter.", premium: true },
];

export const useStrategyStore = create<State>((set, get) => ({
  strategies: DEFAULTS,
  subs: JSON.parse(localStorage.getItem("strategy_subs") || "{}"),
  subscribe: (id) => set((s) => {
    const subs = { ...s.subs, [id]: true };
    localStorage.setItem("strategy_subs", JSON.stringify(subs));
    return { subs };
  }),
  unsubscribe: (id) => set((s) => {
    const subs = { ...s.subs };
    delete subs[id];
    localStorage.setItem("strategy_subs", JSON.stringify(subs));
    return { subs };
  }),
}));
