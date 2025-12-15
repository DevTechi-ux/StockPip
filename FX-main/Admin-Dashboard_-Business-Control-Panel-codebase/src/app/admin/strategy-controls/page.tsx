"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, TrendingUp, Shield, AlertTriangle } from "lucide-react";

export default function StrategyControlsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Strategy Controls</h1>
        <p className="text-muted-foreground">
          Configure trading strategies and risk management parameters
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Running now</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Managed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.2M</div>
            <p className="text-xs text-muted-foreground">Under management</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+18.5%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Medium</div>
            <p className="text-xs text-muted-foreground">Balanced risk</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risk" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="auto">Auto Trading</TabsTrigger>
          <TabsTrigger value="limits">Position Limits</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Risk Management Settings</CardTitle>
              </div>
              <CardDescription>Configure platform-wide risk parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Global Stop Loss</Label>
                    <p className="text-sm text-muted-foreground">Automatic stop loss for all positions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Default Stop Loss (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[5]} max={20} step={0.5} className="flex-1" />
                    <Input type="number" defaultValue="5" className="w-20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Take Profit</Label>
                    <p className="text-sm text-muted-foreground">Automatic profit taking</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Default Take Profit (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[10]} max={50} step={1} className="flex-1" />
                    <Input type="number" defaultValue="10" className="w-20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum Drawdown (%)</Label>
                  <p className="text-sm text-muted-foreground">Close all positions if drawdown exceeds</p>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[20]} max={50} step={1} className="flex-1" />
                    <Input type="number" defaultValue="20" className="w-20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Margin Call Protection</Label>
                    <p className="text-sm text-muted-foreground">Alert before margin call</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Margin Call Level (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[80]} max={100} step={5} className="flex-1" />
                    <Input type="number" defaultValue="80" className="w-20" />
                  </div>
                </div>
              </div>

              <Button className="w-full">Save Risk Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <CardTitle>Auto Trading Configuration</CardTitle>
              </div>
              <CardDescription>Configure automated trading strategies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                <div className="space-y-1">
                  <Label>Enable Auto Trading</Label>
                  <p className="text-sm text-muted-foreground">Allow algorithmic trading</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Positions per Strategy</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Max Daily Trades</Label>
                  <Input type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label>Position Size (%)</Label>
                  <p className="text-sm text-muted-foreground mb-2">Percentage of balance per trade</p>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[2]} max={10} step={0.5} className="flex-1" />
                    <Input type="number" defaultValue="2" className="w-20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Strategy Performance Monitoring</Label>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <Badge>Active</Badge>
                      <span className="font-medium">Trend Following Strategy</span>
                    </div>
                    <span className="text-green-500 font-bold">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <Badge>Active</Badge>
                      <span className="font-medium">Mean Reversion Strategy</span>
                    </div>
                    <span className="text-green-500 font-bold">+8.3%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Paused</Badge>
                      <span className="font-medium">Breakout Strategy</span>
                    </div>
                    <span className="text-red-500 font-bold">-2.1%</span>
                  </div>
                </div>
              </div>

              <Button className="w-full">Save Auto Trading Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Position Limits</CardTitle>
              </div>
              <CardDescription>Set maximum position sizes and exposure limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Position Size (USD)</Label>
                  <Input type="number" defaultValue="100000" />
                </div>
                <div className="space-y-2">
                  <Label>Max Leverage</Label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label>Max Open Positions per User</Label>
                  <Input type="number" defaultValue="20" />
                </div>
                <div className="space-y-2">
                  <Label>Max Daily Volume per User (USD)</Label>
                  <Input type="number" defaultValue="1000000" />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Instrument-Specific Limits</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">BTC/USD</span>
                    <Input type="number" placeholder="Max size" defaultValue="10" />
                    <Input type="number" placeholder="Max leverage" defaultValue="100" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">ETH/USD</span>
                    <Input type="number" placeholder="Max size" defaultValue="50" />
                    <Input type="number" placeholder="Max leverage" defaultValue="50" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-accent/30">
                    <span className="font-medium">EUR/USD</span>
                    <Input type="number" placeholder="Max size" defaultValue="1000000" />
                    <Input type="number" placeholder="Max leverage" defaultValue="500" />
                  </div>
                </div>
              </div>

              <Button className="w-full">Save Position Limits</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Advanced Settings</CardTitle>
              </div>
              <CardDescription>Advanced trading and system configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Circuit Breaker</Label>
                    <p className="text-sm text-muted-foreground">Halt trading on extreme volatility</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Volatility Threshold (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider defaultValue={[15]} max={50} step={1} className="flex-1" />
                    <Input type="number" defaultValue="15" className="w-20" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Slippage Protection</Label>
                  <p className="text-sm text-muted-foreground">Reject orders with high slippage</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>News Trading Restrictions</Label>
                  <p className="text-sm text-muted-foreground">Limit trading during major news events</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Hedging Allowed</Label>
                  <p className="text-sm text-muted-foreground">Allow opposite positions on same instrument</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Order Execution Delay (ms)</Label>
                <Input type="number" defaultValue="100" />
              </div>

              <Button className="w-full">Save Advanced Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
