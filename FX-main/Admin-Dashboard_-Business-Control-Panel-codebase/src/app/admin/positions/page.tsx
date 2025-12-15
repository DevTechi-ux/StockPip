"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Position {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  lot_size: string;
  entry_price: string;
  current_price: string;
  pnl: string;
  status: string;
  open_time: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface CloseFormValues {
  lot_size: string;
  entry_price: string;
  current_price: string;
  pnl: string;
  status: string;
  side: string;
}

export default function PositionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [positionToClose, setPositionToClose] = useState<Position | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [closeForm, setCloseForm] = useState<CloseFormValues | null>(null);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/admin/positions');
      const data = await response.json();
      if (data.success) {
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = (position: Position) => {
    setPositionToClose(position);
    setCloseForm({
      lot_size: position.lot_size || "",
      entry_price: position.entry_price || "",
      current_price: position.current_price || position.entry_price || "",
      pnl: position.pnl || "",
      status: position.status || "OPEN",
      side: position.side || "BUY",
    });
    setIsCloseDialogOpen(true);
  };

  const confirmClosePosition = async () => {
    if (!positionToClose || !closeForm) return;

    setIsClosing(true);
    try {
      // Use existing backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/admin/positions/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: positionToClose.id,
          currentPrice: closeForm.current_price || closeForm.entry_price,
          entryPrice: closeForm.entry_price,
          lotSize: closeForm.lot_size,
          pnl: closeForm.pnl,
          status: closeForm.status,
          side: closeForm.side,
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Position closed successfully');
        setIsCloseDialogOpen(false);
        setPositionToClose(null);
        setCloseForm(null);
        fetchPositions(); // Refresh positions list
      } else {
        toast.error(data.message || 'Failed to close position');
      }
    } catch (error) {
      console.error('Error closing position:', error);
      toast.error('Failed to close position');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions Management</h1>
          <p className="text-muted-foreground">
            Monitor all open trading positions
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPositions}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">Active trades</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${positions.reduce((sum, p) => sum + parseFloat(p.pnl || '0'), 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {positions.reduce((sum, p) => sum + parseFloat(p.pnl || '0'), 0) >= 0 ? '+' : ''}${positions.reduce((sum, p) => sum + parseFloat(p.pnl || '0'), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Unrealized profit</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Margin Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${positions.reduce((sum, p) => sum + parseFloat(p.lot_size || '0') * parseFloat(p.entry_price || '0') * 100000 / 100, 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length > 0 ? ((positions.filter(p => parseFloat(p.pnl || '0') > 0).length / positions.length) * 100).toFixed(1) : '0'}%</div>
            <p className="text-xs text-muted-foreground">Current positions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>
            Real-time view of all active positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by position ID, user, or instrument..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Position Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Leverage</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="animate-pulse">Loading positions...</div>
                    </TableCell>
                  </TableRow>
                ) : positions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No open positions
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((position) => {
                    const pnlValue = parseFloat(position.pnl || '0');
                    const isProfitable = pnlValue >= 0;
                    const pnlPercent = position.entry_price && parseFloat(position.entry_price) > 0 
                      ? ((pnlValue / (parseFloat(position.lot_size || '0') * parseFloat(position.entry_price) * 100000)) * 100).toFixed(2)
                      : '0.00';
                    
                    return (
                      <TableRow key={position.id} className="ios-transition hover:bg-accent/50">
                        <TableCell className="font-mono text-xs">{position.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-medium">{position.first_name} {position.last_name}</TableCell>
                        <TableCell className="font-bold">{position.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={position.side === "BUY" ? "default" : "secondary"}>
                            {position.side}
                          </Badge>
                        </TableCell>
                        <TableCell>{parseFloat(position.lot_size || '0').toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{parseFloat(position.entry_price || '0').toFixed(5)}</TableCell>
                        <TableCell className="font-medium">{parseFloat(position.current_price || position.entry_price || '0').toFixed(5)}</TableCell>
                        <TableCell>
                          <div className={isProfitable ? "text-green-500" : "text-red-500"}>
                            <div className="flex items-center gap-1">
                              {isProfitable ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <div>
                                <p className="font-bold">{isProfitable ? '+' : ''}${pnlValue.toFixed(2)}</p>
                                <p className="text-xs">{isProfitable ? '+' : ''}{pnlPercent}%</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>1:100</TableCell>
                        <TableCell>${(parseFloat(position.lot_size || '0') * parseFloat(position.entry_price || '0') * 100000 / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleClosePosition(position)}
                            disabled={position.status !== 'OPEN'}
                          >
                            <X className="h-3 w-3" />
                            Close
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Close Position Confirmation Dialog */}
      <Dialog
        open={isCloseDialogOpen}
        onOpenChange={(open) => {
          setIsCloseDialogOpen(open);
          if (!open) {
            setPositionToClose(null);
            setCloseForm(null);
            setIsClosing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Position</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this position? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {positionToClose && closeForm && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Position ID</span>
                  <Input value={positionToClose.id} disabled />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">User</span>
                  <Input value={`${positionToClose.first_name} ${positionToClose.last_name}`} disabled />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Symbol</span>
                  <Input value={positionToClose.symbol} disabled />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Side</span>
                  <Select
                    value={closeForm.side}
                    onValueChange={(value) =>
                      setCloseForm((prev) => (prev ? { ...prev, side: value } : prev))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Lot Size</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={closeForm.lot_size}
                    onChange={(e) =>
                      setCloseForm((prev) =>
                        prev ? { ...prev, lot_size: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Entry Price</span>
                  <Input
                    type="number"
                    step="0.00001"
                    value={closeForm.entry_price}
                    onChange={(e) =>
                      setCloseForm((prev) =>
                        prev ? { ...prev, entry_price: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Exit Price / LTP</span>
                  <Input
                    type="number"
                    step="0.00001"
                    value={closeForm.current_price}
                    onChange={(e) =>
                      setCloseForm((prev) =>
                        prev ? { ...prev, current_price: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">P&L (USD)</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={closeForm.pnl}
                    onChange={(e) =>
                      setCloseForm((prev) =>
                        prev ? { ...prev, pnl: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Select
                    value={closeForm.status}
                    onValueChange={(value) =>
                      setCloseForm((prev) => (prev ? { ...prev, status: value } : prev))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">OPEN</SelectItem>
                      <SelectItem value="CLOSED">CLOSED</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust the values as required before confirming the close action. These values will be sent to the backend close endpoint.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCloseDialogOpen(false);
                setPositionToClose(null);
                setCloseForm(null);
              }}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClosePosition} disabled={isClosing}>
              {isClosing ? 'Closing...' : 'Close Position'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
