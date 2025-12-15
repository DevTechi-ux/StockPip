import Header from "@/components/trading/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import React from "react";
import { toast } from "sonner";
import { Copy, Trash2, Plus, Key, Webhook, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Webhook {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  autoExecute: boolean;
  requireConfirmation: boolean;
  allowedSymbols: string[];
  maxLotSize: number | null;
  lastReceivedSignal: string | null;
  createdAt: string;
}

interface Signal {
  id: string;
  signal_name: string;
  symbol: string;
  signal_type: string;
  lot_size: number;
  price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  confidence_level: number;
  status: string;
  created_at: string;
  executed_at: string | null;
}

export default function Api() {
  const [apiKey, setApiKey] = React.useState<string>("");
  const [webhooks, setWebhooks] = React.useState<Webhook[]>([]);
  const [signals, setSignals] = React.useState<Signal[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("api-key");
  
  // New webhook form
  const [webhookForm, setWebhookForm] = React.useState({
    name: "",
    url: "",
    autoExecute: false,
    requireConfirmation: true,
    allowedSymbols: "",
    maxLotSize: ""
  });

  React.useEffect(() => {
    loadApiKey();
    loadWebhooks();
    loadSignals();
  }, []);

  const loadApiKey = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/api-key', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey || "");
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadWebhooks = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/webhooks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
    }
  };

  const loadSignals = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/signals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSignals(data);
      }
    } catch (error) {
      console.error('Error loading signals:', error);
    }
  };

  const generateApiKey = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch('/api/api-key/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setApiKey(data.apiKey);
        toast.success("API key generated successfully");
      } else {
        toast.error(data.error || "Failed to generate API key");
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error("Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const createWebhook = async () => {
    try {
      if (!webhookForm.url) {
        toast.error("Webhook URL is required");
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const allowedSymbols = webhookForm.allowedSymbols
        ? webhookForm.allowedSymbols.split(',').map(s => s.trim())
        : [];

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: webhookForm.name || 'Webhook',
          url: webhookForm.url,
          autoExecute: webhookForm.autoExecute,
          requireConfirmation: webhookForm.requireConfirmation,
          allowedSymbols: allowedSymbols,
          maxLotSize: webhookForm.maxLotSize ? parseFloat(webhookForm.maxLotSize) : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Webhook created successfully");
        setWebhookForm({
          name: "",
          url: "",
          autoExecute: false,
          requireConfirmation: true,
          allowedSymbols: "",
          maxLotSize: ""
        });
        loadWebhooks();
      } else {
        toast.error(data.error || "Failed to create webhook");
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error("Failed to create webhook");
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Webhook deleted successfully");
        loadWebhooks();
      } else {
        toast.error("Failed to delete webhook");
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error("Failed to delete webhook");
    } finally {
      setLoading(false);
    }
  };

  const webhookUrl = apiKey ? `http://localhost:8080/api/webhooks/receive-signal` : "";

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-background text-foreground">
      <Header />
        <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">API Access</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Signals
            </TabsTrigger>
          </TabsList>

          {/* API Key Tab */}
          <TabsContent value="api-key" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>Generate an API key to connect external platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={apiKey || "No API key generated"}
                      readOnly
                      className="font-mono text-xs"
                    />
                    {apiKey && (
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(apiKey)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Button onClick={generateApiKey} disabled={loading}>
                  {apiKey ? "Regenerate API Key" : "Generate API Key"}
                </Button>

                {apiKey && (
                  <div className="rounded-md border border-border bg-muted/50 p-4 space-y-2">
                    <h3 className="font-semibold text-sm">How to use:</h3>
                    <p className="text-xs text-muted-foreground">
                      Send trading signals to: <code className="text-xs bg-background px-1 py-0.5 rounded">{webhookUrl}</code>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Include header: <code className="text-xs bg-background px-1 py-0.5 rounded">X-API-Key: {apiKey.substring(0, 20)}...</code>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>Configure where to receive trading signals from external platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-name">Webhook Name</Label>
                    <Input
                      id="webhook-name"
                      value={webhookForm.name}
                      onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                      placeholder="e.g., TradingView Signals"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Redirect URL</Label>
                    <Input
                      id="webhook-url"
                      value={webhookForm.url}
                      onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                      placeholder="https://your-signal-source.com/webhook"
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-execute">Auto Execute Signals</Label>
                      <p className="text-xs text-muted-foreground">Automatically execute trades without confirmation</p>
                    </div>
                    <Switch
                      id="auto-execute"
                      checked={webhookForm.autoExecute}
                      onCheckedChange={(checked) => setWebhookForm({ ...webhookForm, autoExecute: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="require-confirmation">Require Confirmation</Label>
                      <p className="text-xs text-muted-foreground">Manually approve each signal before execution</p>
                    </div>
                    <Switch
                      id="require-confirmation"
                      checked={webhookForm.requireConfirmation}
                      onCheckedChange={(checked) => setWebhookForm({ ...webhookForm, requireConfirmation: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowed-symbols">Allowed Symbols (comma-separated)</Label>
                    <Input
                      id="allowed-symbols"
                      value={webhookForm.allowedSymbols}
                      onChange={(e) => setWebhookForm({ ...webhookForm, allowedSymbols: e.target.value })}
                      placeholder="e.g., EURUSD, GBPUSD, BTCUSD (leave empty for all)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-lot-size">Max Lot Size</Label>
                    <Input
                      id="max-lot-size"
                      type="number"
                      step="0.01"
                      value={webhookForm.maxLotSize}
                      onChange={(e) => setWebhookForm({ ...webhookForm, maxLotSize: e.target.value })}
                      placeholder="e.g., 1.00 (leave empty for no limit)"
                    />
                  </div>

                  <Button onClick={createWebhook} disabled={loading || !apiKey} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle>Your Webhooks</CardTitle>
                <CardDescription>Manage your configured webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                {webhooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No webhooks configured</p>
                ) : (
                  <div className="space-y-2">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="border border-border rounded-md p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{webhook.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{webhook.url}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteWebhook(webhook.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={webhook.isActive ? "default" : "secondary"}>
                            {webhook.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant={webhook.autoExecute ? "default" : "outline"}>
                            {webhook.autoExecute ? "Auto Execute" : "Manual"}
                          </Badge>
                          {webhook.maxLotSize && (
                            <Badge variant="outline">Max: {webhook.maxLotSize} lot</Badge>
                          )}
          </div>
        </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trading Signals</CardTitle>
                <CardDescription>Recent signals received from your webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                {signals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No signals received yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Signal</TableHead>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Lot Size</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {signals.map((signal) => (
                          <TableRow key={signal.id}>
                            <TableCell className="font-medium">{signal.signal_name}</TableCell>
                            <TableCell>{signal.symbol}</TableCell>
                            <TableCell>
                              <span className={signal.signal_type === "BUY" ? "text-green-500" : "text-red-500"}>
                                {signal.signal_type}
                              </span>
                            </TableCell>
                            <TableCell>{signal.lot_size}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  signal.status === "EXECUTED"
                                    ? "default"
                                    : signal.status === "PENDING"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {signal.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(signal.created_at).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
