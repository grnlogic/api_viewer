"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Terminal, Activity, Server, Monitor } from "lucide-react";
import LogViewer from "@/components/log-viewer";

export default function LogsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of application and system logs
          </p>
        </div>
      </div>

      <Tabs defaultValue="application" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="application" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Application Logs
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System Logs
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Application Logs
              </CardTitle>
              <CardDescription>
                Real-time streaming of Spring Boot application logs with
                filtering capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer
                title="Application Logs"
                endpoint="stream"
                icon={<Terminal className="h-5 w-5" />}
                defaultParams={{
                  lines: "100",
                  level: "INFO",
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Logs
              </CardTitle>
              <CardDescription>
                System-level logs from journalctl (Linux) or application logs
                (Windows)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer
                title="System Logs"
                endpoint="system"
                icon={<Server className="h-5 w-5" />}
                defaultParams={{
                  serviceName: "status-page-api.service",
                  lines: "50",
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Monitoring Logs
              </CardTitle>
              <CardDescription>
                Real-time system monitoring data and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogViewer
                title="Monitoring Logs"
                endpoint="monitoring"
                icon={<Activity className="h-5 w-5" />}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Connections
            </CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Log streaming connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Log Level</CardTitle>
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">INFO</div>
            <p className="text-xs text-muted-foreground">
              Current filter level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              Log streaming service
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
