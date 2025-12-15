"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Percent, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrokerCharge {
  id: string;
  charge_type: string;
  symbol: string;
  charge_value: string;
  charge_type_value: string;
  is_active: boolean;
}

export default function FeesPage() {
  const [charges, setCharges] = useState<BrokerCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<BrokerCharge | null>(null);
  const [formData, setFormData] = useState({
    charge_type: 'SPREAD',
    symbol: 'EURUSD',
    charge_value: '0',
    charge_type_value: 'PER_LOT',
    is_active: true
  });

  const fetchCharges = async () => {
    try {
      const response = await fetch('/api/admin/broker-charges');
      const data = await response.json();
      if (data.success) {
        setCharges(data.charges);
      }
    } catch (error) {
      console.error('Error fetching charges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const handleEdit = (charge: BrokerCharge) => {
    setEditingCharge(charge);
    setFormData({
      charge_type: charge.charge_type,
      symbol: charge.symbol,
      charge_value: charge.charge_value,
      charge_type_value: charge.charge_type_value,
      is_active: charge.is_active
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingCharge 
        ? '/api/admin/broker-charges'
        : '/api/admin/broker-charges';
      
      const method = editingCharge ? 'PUT' : 'POST';
      const body = editingCharge 
        ? { ...formData, id: editingCharge.id }
        : formData;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      if (data.success) {
        fetchCharges();
        setEditDialogOpen(false);
        setEditingCharge(null);
      }
    } catch (error) {
      console.error('Error saving charge:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this charge?')) return;
    
    try {
      const response = await fetch(`/api/admin/broker-charges?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchCharges();
      }
    } catch (error) {
      console.error('Error deleting charge:', error);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fees Configuration</h1>
        <p className="text-muted-foreground">
          Manage platform fees and commission structures
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Fee Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$145.2K</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trading Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45.2K</div>
            <p className="text-xs text-muted-foreground">Primary revenue source</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Avg Commission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.08%</div>
            <p className="text-xs text-muted-foreground">Across all instruments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="broker-charges" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="broker-charges">Broker Charges</TabsTrigger>
          <TabsTrigger value="general">General Fees</TabsTrigger>
          <TabsTrigger value="trading">Trading Fees</TabsTrigger>
          <TabsTrigger value="withdrawal">Withdrawal Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="broker-charges" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Broker Charges Management</CardTitle>
                  <CardDescription>Configure swap, spread, and trade charges</CardDescription>
                </div>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingCharge(null); setFormData({ charge_type: 'SPREAD', symbol: 'EURUSD', charge_value: '0', charge_type_value: 'PER_LOT', is_active: true }); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Charge
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCharge ? 'Edit' : 'Add'} Broker Charge</DialogTitle>
                      <DialogDescription>Configure swap, spread, and commission charges</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Charge Type</Label>
                        <Select value={formData.charge_type} onValueChange={(v) => setFormData({...formData, charge_type: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SPREAD">Spread</SelectItem>
                            <SelectItem value="SWAP_LONG">Swap Long</SelectItem>
                            <SelectItem value="SWAP_SHORT">Swap Short</SelectItem>
                            <SelectItem value="COMMISSION">Commission</SelectItem>
                            <SelectItem value="TRADE_FEE">Trade Fee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Symbol</Label>
                        <Input value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} placeholder="EURUSD, ALL, etc." />
                      </div>
                      <div className="space-y-2">
                        <Label>Charge Value</Label>
                        <Input type="number" step="0.00001" value={formData.charge_value} onChange={(e) => setFormData({...formData, charge_value: e.target.value})} placeholder="0.00010" />
                      </div>
                      <div className="space-y-2">
                        <Label>Charge Type</Label>
                        <Select value={formData.charge_type_value} onValueChange={(v) => setFormData({...formData, charge_type_value: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PER_LOT">Per Lot</SelectItem>
                            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                            <SelectItem value="FIXED">Fixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} />
                        <Label htmlFor="active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading charges...</div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Charge Type</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {charges.map((charge) => (
                        <TableRow key={charge.id}>
                          <TableCell className="font-medium">{charge.charge_type}</TableCell>
                          <TableCell>{charge.symbol}</TableCell>
                          <TableCell>{charge.charge_value}</TableCell>
                          <TableCell>{charge.charge_type_value}</TableCell>
                          <TableCell>
                            <Badge variant={charge.is_active ? "default" : "secondary"}>
                              {charge.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(charge)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(charge.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Fee Structure Overview</CardTitle>
              <CardDescription>Current fee configuration and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="ios-transition hover:bg-accent/50">
                      <TableCell className="font-medium">Trading Commission</TableCell>
                      <TableCell className="font-bold">0.1%</TableCell>
                      <TableCell className="text-green-500">$45.2K</TableCell>
                      <TableCell>
                        <Badge variant="default">active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="ios-transition hover:bg-accent/50">
                      <TableCell className="font-medium">Withdrawal Fee</TableCell>
                      <TableCell className="font-bold">$25</TableCell>
                      <TableCell className="text-green-500">$12.5K</TableCell>
                      <TableCell>
                        <Badge variant="default">active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="ios-transition hover:bg-accent/50">
                      <TableCell className="font-medium">Deposit Fee</TableCell>
                      <TableCell className="font-bold">0%</TableCell>
                      <TableCell className="text-green-500">$0</TableCell>
                      <TableCell>
                        <Badge variant="secondary">inactive</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="ios-transition hover:bg-accent/50">
                      <TableCell className="font-medium">Overnight Fee</TableCell>
                      <TableCell className="font-bold">0.05%</TableCell>
                      <TableCell className="text-green-500">$8.9K</TableCell>
                      <TableCell>
                        <Badge variant="default">active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="ios-transition hover:bg-accent/50">
                      <TableCell className="font-medium">Inactivity Fee</TableCell>
                      <TableCell className="font-bold">$10/mo</TableCell>
                      <TableCell className="text-green-500">$2.3K</TableCell>
                      <TableCell>
                        <Badge variant="default">active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Trading Commission Settings</CardTitle>
              <CardDescription>Configure commission rates for different instruments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Trading Commission</Label>
                    <p className="text-sm text-muted-foreground">Charge commission on all trades</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Default Commission Rate</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-rate">Rate (%)</Label>
                    <Input id="default-rate" type="number" defaultValue="0.1" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-commission">Minimum ($)</Label>
                    <Input id="min-commission" type="number" defaultValue="1" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Instrument-Specific Rates</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">Crypto</span>
                    <Input type="number" placeholder="Rate %" defaultValue="0.15" />
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">Forex</span>
                    <Input type="number" placeholder="Rate %" defaultValue="0.08" />
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">Stocks</span>
                    <Input type="number" placeholder="Rate %" defaultValue="0.05" />
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">Commodities</span>
                    <Input type="number" placeholder="Rate %" defaultValue="0.10" />
                    <Badge>Active</Badge>
                  </div>
                </div>
              </div>

              <Button className="w-full">Save Trading Fees</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Withdrawal Fee Settings</CardTitle>
              <CardDescription>Configure withdrawal fees by payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Withdrawal Fees</Label>
                  <p className="text-sm text-muted-foreground">Charge fees on withdrawals</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-4">
                <Label>Payment Method Fees</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">Bank Transfer</span>
                    <Input type="number" placeholder="Fixed ($)" defaultValue="25" />
                    <Input type="number" placeholder="Rate (%)" defaultValue="0" />
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">Credit Card</span>
                    <Input type="number" placeholder="Fixed ($)" defaultValue="10" />
                    <Input type="number" placeholder="Rate (%)" defaultValue="2.5" />
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">Crypto</span>
                    <Input type="number" placeholder="Fixed ($)" defaultValue="5" />
                    <Input type="number" placeholder="Rate (%)" defaultValue="0.5" />
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">PayPal</span>
                    <Input type="number" placeholder="Fixed ($)" defaultValue="15" />
                    <Input type="number" placeholder="Rate (%)" defaultValue="1.5" />
                    <Badge>Active</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="free-withdrawals">Free Withdrawals per Month</Label>
                <Input id="free-withdrawals" type="number" defaultValue="2" />
              </div>

              <Button className="w-full">Save Withdrawal Fees</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Special Fee Settings</CardTitle>
              <CardDescription>Configure overnight, inactivity, and other special fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Overnight Swap Fee</Label>
                    <p className="text-sm text-muted-foreground">Charge for positions held overnight</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="overnight-rate">Rate (%)</Label>
                    <Input id="overnight-rate" type="number" defaultValue="0.05" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="charge-time">Charge Time</Label>
                    <Input id="charge-time" type="time" defaultValue="00:00" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Inactivity Fee</Label>
                    <p className="text-sm text-muted-foreground">Charge for dormant accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inactivity-fee">Fee Amount ($)</Label>
                    <Input id="inactivity-fee" type="number" defaultValue="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inactivity-period">Inactivity Period (days)</Label>
                    <Input id="inactivity-period" type="number" defaultValue="90" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Currency Conversion Fee</Label>
                    <p className="text-sm text-muted-foreground">Charge for currency conversions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversion-rate">Rate (%)</Label>
                  <Input id="conversion-rate" type="number" defaultValue="0.5" step="0.1" />
                </div>
              </div>

              <Button className="w-full">Save Special Fees</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
