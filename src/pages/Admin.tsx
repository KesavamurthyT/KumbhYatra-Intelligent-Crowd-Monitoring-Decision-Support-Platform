import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DroneManagement from "@/components/admin/DroneManagement";
import VolunteerManagement from "@/components/admin/VolunteerManagement";
import VIPManagement from "@/components/admin/VIPManagement";
import NotificationCenter from "@/components/admin/NotificationCenter";
import CrowdHeatmapControls from "@/components/admin/CrowdHeatmapControls";
import { 
  MapPin, 
  Users, 
  Radio, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Plane,
  MessageSquare,
  UserCheck,
  Crown
} from "lucide-react";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock dashboard stats
  const stats = {
    totalPilgrims: 2847521,
    activeVolunteers: 245,
    activeDrones: 12,
    criticalAlerts: 3,
    avgCrowdDensity: 67,
    systemStatus: "operational"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">KumbhYatra Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Central Command & Control</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={stats.systemStatus === "operational" ? "default" : "destructive"}>
                <Activity className="w-3 h-3 mr-1" />
                {stats.systemStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="drones" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Drone Management
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Volunteers
            </TabsTrigger>
            <TabsTrigger value="vips" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              VIP Management
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pilgrims</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPilgrims.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12.3% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeVolunteers}</div>
                  <p className="text-xs text-muted-foreground">
                    85% deployment rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Drones</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeDrones}</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires immediate attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setActiveTab("drones")}
                  >
                    <Plane className="w-6 h-6" />
                    Manage Drones
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setActiveTab("volunteers")}
                  >
                    <Users className="w-6 h-6" />
                    Volunteer Control
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Radio className="w-6 h-6" />
                    Send Broadcast
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Crowd Heatmap & Site Map Controls */}
            <CrowdHeatmapControls />
          </TabsContent>

          {/* Drone Management Tab */}
          <TabsContent value="drones" className="space-y-6">
            <DroneManagement />
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="space-y-6">
            <VolunteerManagement />
          </TabsContent>

          {/* VIP Management Tab */}
          <TabsContent value="vips" className="space-y-6">
            <VIPManagement />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
