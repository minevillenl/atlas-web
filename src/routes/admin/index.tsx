import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Server,
  Activity,
  Database,
  Shield,
  BarChart3,
  Monitor,
  FileText,
  Bell,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";

const RouteComponent = () => {
  const stats = {
    totalUsers: 8457,
    activeUsers: 2134,
    totalServers: 48,
    onlineServers: 47,
    totalRequests: 125_847,
    avgResponseTime: 142,
    systemHealth: 99.2,
    storageUsed: 74.3,
  };

  const alerts = [
    { 
      id: 1, 
      message: "Database backup completed successfully", 
      time: "10 minutes ago", 
      severity: "info" 
    },
    { 
      id: 2, 
      message: "SSL certificate expires in 7 days", 
      time: "2 hours ago", 
      severity: "warning" 
    },
    { 
      id: 3, 
      message: "New user registration spike detected", 
      time: "4 hours ago", 
      severity: "info" 
    },
  ];

  const serverStats = [
    { region: "US East", servers: 16, online: 16, cpu: 45, memory: 62 },
    { region: "EU West", servers: 12, online: 12, cpu: 38, memory: 55 },
    { region: "Asia Pacific", servers: 20, online: 19, cpu: 52, memory: 71 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-semibold text-foreground">Administration Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System overview and management controls
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers.toLocaleString()} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.onlineServers}/{stats.totalServers}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.onlineServers / stats.totalServers) * 100).toFixed(1)}% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgResponseTime}ms avg response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <Progress value={stats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Server Infrastructure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {serverStats.map((region, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{region.region}</h4>
                      <p className="text-sm text-muted-foreground">
                        {region.online}/{region.servers} servers online
                      </p>
                    </div>
                    <Badge variant={region.online === region.servers ? "default" : "destructive"}>
                      {region.online === region.servers ? "Healthy" : "Issues"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>{region.cpu}%</span>
                      </div>
                      <Progress value={region.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{region.memory}%</span>
                      </div>
                      <Progress value={region.memory} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors">
              <Users className="h-4 w-4" />
              Manage Users
            </button>
            <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors">
              <Shield className="h-4 w-4" />
              Role Permissions
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors">
              <Server className="h-4 w-4" />
              Server Management
            </button>
            <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors">
              <Database className="h-4 w-4" />
              Database Tools
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports & Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors">
              <BarChart3 className="h-4 w-4" />
              View Reports
            </button>
            <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors">
              <FileText className="h-4 w-4" />
              Export Data
            </button>
          </CardContent>
        </Card>
      </div>

      {/* System Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Cpu className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">CPU Performance</p>
                <p className="text-sm text-muted-foreground">Average 45% utilization</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Storage Usage</p>
                <p className="text-sm text-muted-foreground">{stats.storageUsed}% of total capacity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Wifi className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Network Status</p>
                <p className="text-sm text-muted-foreground">All connections stable</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});
