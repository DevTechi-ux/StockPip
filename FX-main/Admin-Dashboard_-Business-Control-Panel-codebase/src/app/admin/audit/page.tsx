"use client";

import { useState } from "react";
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
import { Search, Download, FileText, Shield, AlertTriangle, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const auditLogs = [
  {
    id: 1,
    timestamp: "2024-01-20 15:45:23",
    user: "Admin User",
    action: "User Suspended",
    target: "john@example.com",
    ip: "192.168.1.1",
    severity: "high",
    details: "Account suspended due to suspicious activity",
  },
  {
    id: 2,
    timestamp: "2024-01-20 15:30:12",
    user: "Admin User",
    action: "Fee Changed",
    target: "Trading Commission",
    ip: "192.168.1.1",
    severity: "medium",
    details: "Trading commission rate changed from 0.08% to 0.1%",
  },
  {
    id: 3,
    timestamp: "2024-01-20 15:15:45",
    user: "Support Team",
    action: "KYC Approved",
    target: "sarah@example.com",
    ip: "192.168.1.5",
    severity: "info",
    details: "KYC verification approved for user",
  },
  {
    id: 4,
    timestamp: "2024-01-20 14:50:33",
    user: "Admin User",
    action: "Instrument Added",
    target: "SOL/USD",
    ip: "192.168.1.1",
    severity: "medium",
    details: "New trading instrument added to platform",
  },
  {
    id: 5,
    timestamp: "2024-01-20 14:30:20",
    user: "Admin User",
    action: "Withdrawal Approved",
    target: "$50,000 - mike@example.com",
    ip: "192.168.1.1",
    severity: "high",
    details: "Large withdrawal manually approved",
  },
];

const systemLogs = [
  { timestamp: "2024-01-20 15:50:00", level: "error", message: "Database connection timeout", source: "API Server" },
  { timestamp: "2024-01-20 15:45:00", level: "warning", message: "High CPU usage detected", source: "Trading Engine" },
  { timestamp: "2024-01-20 15:40:00", level: "info", message: "Backup completed successfully", source: "Backup Service" },
  { timestamp: "2024-01-20 15:35:00", level: "info", message: "Cache cleared", source: "Cache Service" },
];

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all administrative actions and system events
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">23</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Security related</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Admin Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">Administrative actions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="system">System Logs</TabsTrigger>
          <TabsTrigger value="security">Security Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Administrative Audit Logs</CardTitle>
              <CardDescription>All administrative actions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="today">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id} className="ios-transition hover:bg-accent/50">
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell className="text-muted-foreground">{log.target}</TableCell>
                        <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.severity === "high"
                                ? "destructive"
                                : log.severity === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Platform system events and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log, idx) => (
                      <TableRow key={idx} className="ios-transition hover:bg-accent/50">
                        <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.level === "error"
                                ? "destructive"
                                : log.level === "warning"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{log.source}</TableCell>
                        <TableCell className="text-muted-foreground">{log.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Security Logs</CardTitle>
              <CardDescription>Security-related events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Security logs will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
