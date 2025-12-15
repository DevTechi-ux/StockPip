import Header from "@/components/trading/Header";
import { useStrategyStore } from "@/state/strategy-store";
import { Button } from "@/components/ui/button";

export default function Strategy() {
  const { strategies, subs, subscribe, unsubscribe } = useStrategyStore();

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-6">
          <h1 className="mb-3 text-2xl font-semibold">FX Strategies</h1>
          <p className="mb-4 text-sm text-muted-foreground">Subscribe to automate trades. Each strategy enforces ATR-based stop loss, position sizing by risk %, and daily loss caps.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategies.map((s) => {
              const on = !!subs[s.id];
              return (
                <article key={s.id} className="rounded-md border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium">{s.name}</h2>
                    {s.premium && <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-400">Premium</span>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.style} • TF {s.timeframe} • Risk {s.risk}</div>
                  <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Button size="sm" onClick={() => (on ? unsubscribe(s.id) : subscribe(s.id))}>{on ? "Unsubscribe" : "Subscribe"}</Button>
                    <StrategyInfo s={s} />
                  </div>
                </article>
              );
            })}
          </div>
      </div>
    </div>
  );
}

function StrategyInfo({ s }: any) {
  const details = [
    "ATR stop 1.5x-2.5x depending on regime",
    "Risk per trade capped at 0.5% (demo) / configurable (real)",
    "Max daily loss 2%, pause after breach",
    "Symbol universe: majors + BTC/ETH",
  ];
  return (
    <div className="text-right text-[10px] text-muted-foreground" title={[s.description, ...details].join("\n- ")}>How it works</div>
  );
}
