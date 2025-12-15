import { useEffect } from "react";
import Header from "@/components/trading/Header";
import { usePriceStore, SYMBOLS, formatPrice } from "@/lib/priceFeed";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Markets() {
  const { prices, subscribe } = usePriceStore();

  useEffect(() => {
    SYMBOLS.forEach((s) => subscribe(s.code));
  }, [subscribe]);

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
      <div className="p-4">
          <h1 className="mb-4 text-xl font-semibold">Markets</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SYMBOLS.map((s) => {
              const t = prices[s.code];
              const mid = t ? (t.bid + t.ask) / 2 : undefined;
              return (
                <div key={s.code} className="rounded-md border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{s.code}</div>
                    <div className="text-xs text-muted-foreground">{s.sector}</div>
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{mid ? formatPrice(mid, 2) : "--"}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{s.name}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-md border bg-card">
            <div className="p-3 text-sm font-medium">Live Watchlist</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Bid</TableHead>
                    <TableHead>Ask</TableHead>
                    <TableHead>LTP</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SYMBOLS.map((s) => {
                    const t = prices[s.code];
                    const ltp = t ? (t.bid + t.ask) / 2 : undefined;
                    return (
                      <TableRow key={s.code}>
                        <TableCell className="font-medium">{s.code}</TableCell>
                        <TableCell className="text-xs">{s.sector}</TableCell>
                        <TableCell>{t ? formatPrice(t.bid, 2) : "--"}</TableCell>
                        <TableCell>{t ? formatPrice(t.ask, 2) : "--"}</TableCell>
                        <TableCell>{ltp ? formatPrice(ltp, 2) : "--"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t ? new Date(t.ts).toLocaleTimeString() : "--"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
      </div>
    </div>
  );
}
