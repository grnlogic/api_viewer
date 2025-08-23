"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Network,
  GitBranch,
  Thermometer,
  Settings,
  Maximize2,
  Info,
} from "lucide-react";
import { NetworkTopologyMap } from "@/components/network-topology-map";
import { ServiceDependencyGraph } from "@/components/service-dependency-graph";
import { PerformanceHeatmap } from "@/components/performance-heatmap";
import { CustomDashboardBuilder } from "@/components/custom-dashboard-builder";

export default function EnhancedDashboard() {
  const services: any[] = [];
  const [activeTab, setActiveTab] = useState("overview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Fix hydration error by updating time on client side only
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const dashboardStats = {
    totalServices: 9,
    healthyServices: 6,
    criticalServices: 1,
    warningServices: 2,
    averageResponseTime: 145,
    systemUptime: 99.7,
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`p-6 space-y-6 ${
        isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8" />
            Enhanced Dashboards
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Advanced visualization and monitoring tools for comprehensive system
            insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats.totalServices}
              </div>
              <div className="text-sm text-gray-500">Total Services</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.healthyServices}
              </div>
              <div className="text-sm text-gray-500">Healthy</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {dashboardStats.criticalServices}
              </div>
              <div className="text-sm text-gray-500">Critical</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardStats.warningServices}
              </div>
              <div className="text-sm text-gray-500">Warning</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardStats.averageResponseTime}ms
              </div>
              <div className="text-sm text-gray-500">Avg Response</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {dashboardStats.systemUptime}%
              </div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="topology" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network Topology
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Dependencies
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Dashboard Overview
                <Badge variant="outline" className="ml-2">
                  Enhanced
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Available Visualizations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Network className="h-6 w-6 text-blue-500" />
                      <div>
                        <div className="font-medium">Network Topology Map</div>
                        <div className="text-sm text-gray-500">
                          Interactive network visualization with real-time
                          status
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <GitBranch className="h-6 w-6 text-green-500" />
                      <div>
                        <div className="font-medium">
                          Service Dependency Graph
                        </div>
                        <div className="text-sm text-gray-500">
                          Visualize service relationships and dependencies
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Thermometer className="h-6 w-6 text-red-500" />
                      <div>
                        <div className="font-medium">Performance Heatmap</div>
                        <div className="text-sm text-gray-500">
                          Real-time performance metrics visualization
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <LayoutDashboard className="h-6 w-6 text-purple-500" />
                      <div>
                        <div className="font-medium">
                          Custom Dashboard Builder
                        </div>
                        <div className="text-sm text-gray-500">
                          Create personalized monitoring dashboards
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Key Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Real-time data updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">
                        Interactive visualizations
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">
                        Drag & drop dashboard builder
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Customizable widgets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Performance monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-sm">
                        Export & sharing capabilities
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Dashboard Builder */}
          <CustomDashboardBuilder />
        </TabsContent>

        <TabsContent value="topology" className="space-y-6">
          <NetworkTopologyMap services={services} />
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <ServiceDependencyGraph services={services} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceHeatmap />
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      {!isFullscreen && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Enhanced Dashboard v1.0 - Real-time monitoring and visualization
                platform
              </div>
              <div>Last updated: {currentTime || "Loading..."}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
