"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Activity, Settings, BarChart3, RefreshCw } from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  created_at: string;
  balance?: number;
  equity?: number;
}

interface Stats {
  totalUsers: { count: number };
  totalAdmins: { count: number };
  totalPositions: { count: number };
  totalVolume: { volume: number };
  pendingDeposits: { count: number; amount: number };
  totalBalance: { total_balance: number };
  bannedUsers: { count: number };
  totalReferrals: { count: number };
  mamPammAccounts: { count: number };
  totalBrokerage: { total: number };
  totalSwap: { total: number };
  totalSpread: { total: number };
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [fundRequests, setFundRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch fund requests
      const fundRequestsResponse = await fetch('/api/admin/fund-requests?limit=5');
      const fundRequestsData = await fundRequestsResponse.json();
      if (fundRequestsData.success) {
        setFundRequests(fundRequestsData.requests);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            VentaBlack Trading Platform Administration
          </p>
        </div>
        <Button onClick={fetchData} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : stats?.totalUsers?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : `$${(stats?.totalBalance?.total_balance || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Platform balance</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : stats?.pendingDeposits?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">${(stats?.pendingDeposits?.amount || 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : stats?.totalPositions?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Open trades</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '--' : stats?.bannedUsers?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Suspended accounts</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : stats?.totalReferrals?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total referrals</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MAM/PAMM Accounts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : stats?.mamPammAccounts?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : `$${(stats?.totalVolume?.volume || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Brokerage & Charges Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brokerage</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {isLoading ? '--' : `$${(stats?.totalBrokerage?.total || 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">Commission earned</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Swap Charges</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {isLoading ? '--' : `$${(stats?.totalSwap?.total || 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">Overnight fees</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spread Charges</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {isLoading ? '--' : `$${(stats?.totalSpread?.total || 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">Spread revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Status
            </CardTitle>
            <CardDescription>Real-time system monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Server</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Trading App</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Running</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">MySQL Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div>
                      <div className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.user_type === 'admin' ? 'Admin' : 'User'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fund Requests
            </CardTitle>
            <CardDescription>Recent deposit/withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading requests...</p>
              </div>
            ) : fundRequests.length > 0 ? (
              <div className="space-y-3">
                {fundRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div>
                      <div className="text-sm font-medium">
                        {request.first_name} {request.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.request_type} - ${request.amount}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No fund requests found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
