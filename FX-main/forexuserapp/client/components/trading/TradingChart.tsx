import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePriceStore } from "@/lib/priceFeed";

export default function TradingChart({ symbol, theme }: { symbol: string; theme: "dark" | "light" }) {
  const { prices, subscribe } = usePriceStore();
  const [data, setData] = React.useState<{ time: number; value: number }[]>([]);

  React.useEffect(() => {
    subscribe(symbol);
    // Initialize with empty data - will be populated by real price feed from WebSocket
    setData([]);
  }, [symbol, subscribe]);

  React.useEffect(() => {
    const t = prices[symbol];
    if (!t) return;
    const ltp = (t.bid + t.ask) / 2;
    setData((prev) => {
      const next = [...prev, { time: Date.now(), value: ltp }];
      return next.slice(-240);
    });
  }, [prices, symbol]);

  const gridColor = theme === "dark" ? "#1e293b" : "#e2e8f0";
  const textColor = theme === "dark" ? "#94a3b8" : "#334155";

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <YAxis 
            stroke={textColor} 
            tick={{ fill: textColor, fontSize: 12 }} 
            domain={["dataMin - 0.001", "dataMax + 0.001"]} 
            width={70}
            tickFormatter={(v) => v.toFixed(5)}
          />
          <Tooltip
            contentStyle={{ 
              background: theme === "dark" ? "#0b1220" : "#fff", 
              border: `1px solid ${gridColor}`,
              borderRadius: "6px"
            }}
            labelFormatter={(v) => new Date(v as number).toLocaleTimeString()}
            formatter={(v: number) => [v.toFixed(5), symbol]}
          />
          <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#priceGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
