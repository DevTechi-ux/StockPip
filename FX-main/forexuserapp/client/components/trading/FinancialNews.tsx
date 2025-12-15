import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  time: string;
  instrument: string;
  headline: string;
  sentiment: "bullish" | "bearish" | "neutral";
  impact: "high" | "medium" | "low";
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    time: "2m ago",
    instrument: "EURUSD",
    headline: "ECB hints at potential rate adjustments as inflation stabilizes",
    sentiment: "bullish",
    impact: "high"
  },
  {
    id: "2",
    time: "8m ago",
    instrument: "GBPUSD",
    headline: "BoE maintains current policy stance amid economic uncertainty",
    sentiment: "neutral",
    impact: "medium"
  },
  {
    id: "3",
    time: "15m ago",
    instrument: "XAUUSD",
    headline: "Gold prices surge on geopolitical tensions",
    sentiment: "bullish",
    impact: "high"
  },
  {
    id: "4",
    time: "22m ago",
    instrument: "USDJPY",
    headline: "Yen strengthens following Fed dovish signals",
    sentiment: "bearish",
    impact: "medium"
  },
  {
    id: "5",
    time: "31m ago",
    instrument: "BTCUSD",
    headline: "Bitcoin breaks key resistance level above $65K",
    sentiment: "bullish",
    impact: "high"
  },
  {
    id: "6",
    time: "45m ago",
    instrument: "SPX500",
    headline: "US stocks rally on strong earnings season",
    sentiment: "bullish",
    impact: "high"
  },
  {
    id: "7",
    time: "1h ago",
    instrument: "USOIL",
    headline: "Oil prices decline on concerns over global demand",
    sentiment: "bearish",
    impact: "medium"
  }
];

export default function FinancialNews({ currentSymbol }: { currentSymbol: string }) {
  const [news] = React.useState<NewsItem[]>(mockNews);

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wide">Market News</h3>
        <span className="text-xs font-semibold text-foreground/60">{news.length}</span>
      </div>
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        {news
          .filter(item => item.instrument === currentSymbol || item.instrument.includes(currentSymbol.replace('USD', '')) || currentSymbol.includes(item.instrument.replace('USD', '')))
          .slice(0, 7)
          .map((item) => (
          <Card key={item.id} className="bg-white/70 dark:bg-white/5 backdrop-blur-lg border border-white/30 dark:border-white/10 hover:border-white/50 dark:hover:border-white/20 transition-all shadow-sm">
            <CardContent className="p-2 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-tight font-semibold text-foreground line-clamp-2">
                    {item.headline}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-lg uppercase tracking-wide backdrop-blur-sm",
                      item.sentiment === "bullish" 
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                        : item.sentiment === "bearish"
                        ? "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40"
                        : "bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/40"
                    )}>
                      {item.sentiment === "bullish" ? "▲" : item.sentiment === "bearish" ? "▼" : "→"} {item.sentiment}
                    </span>
                    <span className="text-[9px] font-semibold text-foreground/60">{item.time}</span>
                  </div>
                </div>
                {item.impact === "high" && (
                  <div className="flex-shrink-0 w-2 h-2 bg-white/40 dark:bg-white/20 rounded-full animate-pulse shadow-md" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}






