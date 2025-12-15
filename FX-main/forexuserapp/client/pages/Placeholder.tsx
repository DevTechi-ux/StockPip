import Header from "@/components/trading/Header";
import { useTradingStore } from "@/state/trading-store";
import { usePriceStore, formatPrice } from "@/lib/priceFeed";
import { Button } from "@/components/ui/button";

export default function Placeholder({ title }: { title: string }) {
  const { positions, history, closePosition, wallet } = useTradingStore();
  const { prices } = usePriceStore();

  const unrealized = positions.reduce((sum, p) => {
    const t = prices[p.symbol];
    const ltp = t ? (t.bid + t.ask) / 2 : p.entry;
    const pnl = (p.side === "BUY" ? ltp - p.entry : p.entry - ltp) * p.lot * 100;
    return sum + pnl;
  }, 0);
  const realized = history.reduce((s, h) => s + h.pnl, 0);
  const equity = wallet.balance + unrealized;

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-3 md:p-6">
          <h1 className="mb-3 text-xl md:text-2xl font-semibold">{title}</h1>

          {/* KPIs */}
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi title="Balance" value={`$${formatNum(wallet.balance)}`} subtitle="Account balance" />
            <Kpi title="Equity" value={`$${formatNum(equity)}`} subtitle="Real-time (includes PnL)" />
            <Kpi title="Unrealized PnL" value={`$${formatNum(unrealized)}`} subtitle="Open positions" valueClass={unrealized >= 0 ? "text-emerald-400" : "text-rose-400"} />
            <Kpi title="Realized PnL" value={`$${formatNum(realized)}`} subtitle="Closed trades" valueClass={realized >= 0 ? "text-emerald-400" : "text-rose-400"} />
          </div>

          {/* Open Positions */}
          <section className="mt-6 rounded-md border bg-card">
            <div className="flex items-center justify-between border-b p-3">
              <h2 className="text-sm font-medium">Open Positions</h2>
              <span className="text-xs text-muted-foreground">{positions.length} open</span>
            </div>
            <div className="overflow-x-auto p-2">
              {positions.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No open positions.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">ID</th>
                      <th className="p-2">Symbol</th>
                      <th className="p-2">Side</th>
                      <th className="p-2">Lot</th>
                      <th className="p-2">Entry</th>
                      <th className="p-2">LTP</th>
                      <th className="p-2">PnL</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(p => {
                      const t = prices[p.symbol];
                      const ltp = t ? (t.bid + t.ask) / 2 : p.entry;
                      const pnl = (p.side === "BUY" ? ltp - p.entry : p.entry - ltp) * p.lot * 100;
                      return (
                        <tr key={p.id} className="border-b/50">
                          <td className="p-2">{p.id}</td>
                          <td className="p-2">{p.symbol}</td>
                          <td className="p-2">{p.side}</td>
                          <td className="p-2">{p.lot}</td>
                          <td className="p-2">{formatPrice(p.entry, 2)}</td>
                          <td className="p-2">{formatPrice(ltp, 2)}</td>
                          <td className={`p-2 ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{pnl.toFixed(2)}</td>
                          <td className="p-2">
                            <Button size="sm" variant="secondary" onClick={() => closePosition(p.id, ltp)}>Close</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Trade History */}
          <section className="mt-6 rounded-md border bg-card">
            <div className="flex items-center justify-between border-b p-3">
              <h2 className="text-sm font-medium">Trade History</h2>
              <span className="text-xs text-muted-foreground">{history.length} trades</span>
            </div>
            <div className="overflow-x-auto p-2">
              {history.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No trade history yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Time</th>
                      <th className="p-2">Symbol</th>
                      <th className="p-2">Side</th>
                      <th className="p-2">Lot</th>
                      <th className="p-2">Entry</th>
                      <th className="p-2">Exit</th>
                      <th className="p-2">PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.id} className="border-b/50">
                        <td className="p-2 text-muted-foreground">{new Date(h.closeTime).toLocaleString()}</td>
                        <td className="p-2">{h.symbol}</td>
                        <td className="p-2">{h.side}</td>
                        <td className="p-2">{h.lot}</td>
                        <td className="p-2">{formatPrice(h.entry, 2)}</td>
                        <td className="p-2">{formatPrice(h.exit, 2)}</td>
                        <td className={`p-2 ${h.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{h.pnl.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
      </div>
    </div>
  );
}

function Kpi({ title, value, subtitle, valueClass }: { title: string; value: string; subtitle?: string; valueClass?: string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className={`mt-1 text-2xl font-semibold ${valueClass ?? ""}`}>{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );
}

function formatNum(x: number) {
  const sign = x < 0 ? "-" : "";
  const n = Math.abs(x);
  return `${sign}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
