import React from "react";
import { BarChart3, TrendingUp, TrendingDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type Timeframe = "1" | "5" | "15" | "30" | "60" | "240" | "1D" | "1W";
export type Indicator = "RSI" | "MACD" | "BB" | "MA" | "EMA" | "NONE";

export default function ChartToolbar({
  timeframe,
  setTimeframe,
  indicator,
  setIndicator,
}: {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  indicator: Indicator;
  setIndicator: (ind: Indicator) => void;
}) {
  const timeframes: { label: string; value: Timeframe }[] = [
    { label: "1m", value: "1" },
    { label: "5m", value: "5" },
    { label: "15m", value: "15" },
    { label: "30m", value: "30" },
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
  ];

  const indicators: { label: string; value: Indicator; icon: React.ReactNode }[] = [
    { label: "None", value: "NONE", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "RSI", value: "RSI", icon: <TrendingUp className="h-4 w-4" /> },
    { label: "MACD", value: "MACD", icon: <TrendingDown className="h-4 w-4" /> },
    { label: "BB", value: "BB", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border">
      {/* Timeframes */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap border border-border",
              timeframe === tf.value
                ? "text-foreground border-foreground/50"
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
