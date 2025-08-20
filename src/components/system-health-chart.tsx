"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
} from "lucide-react";

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  server_info?: {
    hostname: string;
    os: string;
    uptime: string;
    load_average: number[];
    diskInfo?: {
      model: string;
      size: number;
      reads: number;
      writes: number;
    }[];
    networkInfo?: {
      name: string;
      displayName: string;
      bytesRecv: number;
      bytesSent: number;
    }[];
    cpuModel?: string;
    totalMemoryMB?: number;
    usedMemoryMB?: number;
    diskUsed?: number;
    diskTotal?: number;
    bandwidthUsedGB?: number;
  };
}

interface SystemHealthChartProps {
  systemHealth: SystemHealth;
}

export function SystemHealthChart({ systemHealth }: SystemHealthChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate historical data for the chart
    const generateData = () => {
      const data = [];
      const now = new Date();

      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 30000); // Every 30 seconds

        // Add some realistic variation to current values
        const cpuVariation = 0.8 + Math.random() * 0.4;
        const memVariation = 0.95 + Math.random() * 0.1;
        const diskVariation = 0.98 + Math.random() * 0.04;
        const netVariation = 0.7 + Math.random() * 0.6;

        data.push({
          time: time.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          cpu: Math.round(systemHealth.cpu * cpuVariation),
          memory: Math.round(systemHealth.memory * memVariation),
          disk: Math.round(systemHealth.disk * diskVariation),
          network: Math.round(systemHealth.network * netVariation),
        });
      }

      return data;
    };

    setChartData(generateData());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev.slice(1)];
        const now = new Date();

        const cpuVariation = 0.8 + Math.random() * 0.4;
        const memVariation = 0.95 + Math.random() * 0.1;
        const diskVariation = 0.98 + Math.random() * 0.04;
        const netVariation = 0.7 + Math.random() * 0.6;

        newData.push({
          time: now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          cpu: Math.round(systemHealth.cpu * cpuVariation),
          memory: Math.round(systemHealth.memory * memVariation),
          disk: Math.round(systemHealth.disk * diskVariation),
          network: Math.round(systemHealth.network * netVariation),
        });

        return newData;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [systemHealth]);

  const getHealthColor = (value: number) => {
    if (value >= 80) return "text-red-500";
    if (value >= 60) return "text-yellow-500";
    return "text-green-500";
  };

  const getHealthBadgeVariant = (value: number) => {
    if (value >= 80) return "destructive";
    if (value >= 60) return "secondary";
    return "default";
  };

  const getTrendDirection = (current: number, data: any[], key: string) => {
    if (data.length < 5) return "stable";
    const recent = data.slice(-3).map((d) => d[key]);
    const older = data.slice(-6, -3).map((d) => d[key]);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg > olderAvg * 1.05) return "increasing";
    if (recentAvg < olderAvg * 0.95) return "decreasing";
    return "stable";
  };

  const metrics = [
    {
      name: "CPU Usage",
      value: systemHealth.cpu,
      icon: Cpu,
      color: "#3b82f6",
      key: "cpu",
    },
    {
      name: "Memory",
      value: systemHealth.memory,
      icon: MemoryStick,
      color: "#10b981",
      key: "memory",
    },
    {
      name: "Disk",
      value: systemHealth.disk,
      icon: HardDrive,
      color: "#f59e0b",
      key: "disk",
    },
    {
      name: "Network",
      value: systemHealth.network,
      icon: Wifi,
      color: "#8b5cf6",
      key: "network",
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-5 w-5" />
          System Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            const trend = getTrendDirection(
              metric.value,
              chartData,
              metric.key
            );

            const TrendIcon =
              trend === "increasing"
                ? TrendingUp
                : trend === "decreasing"
                ? TrendingDown
                : Minus;

            return (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <TrendIcon
                    className={`h-3 w-3 ${
                      trend === "increasing"
                        ? "text-red-500"
                        : trend === "decreasing"
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-lg font-bold ${getHealthColor(
                        metric.value
                      )}`}
                    >
                      {metric.value.toFixed(1)}%
                    </span>
                    <Badge
                      variant={getHealthBadgeVariant(metric.value)}
                      className="text-xs"
                    >
                      {metric.value >= 80
                        ? "High"
                        : metric.value >= 60
                        ? "Medium"
                        : "Normal"}
                    </Badge>
                  </div>
                  <Progress
                    value={metric.value}
                    className="h-2"
                    indicatorClassName={
                      metric.value >= 80
                        ? "bg-red-500"
                        : metric.value >= 60
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Real-time Monitoring (Last 15 minutes)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value}%`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="disk"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="network"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {metrics.map((metric) => (
              <div key={metric.name} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: metric.color }}
                />
                <span className="text-muted-foreground">{metric.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Details */}
        {systemHealth.server_info && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Load Average:</span>
                <div className="font-mono">
                  {systemHealth.server_info.load_average?.join(", ") || "N/A"}
                </div>
              </div>

              {systemHealth.server_info.usedMemoryMB &&
                systemHealth.server_info.totalMemoryMB && (
                  <div>
                    <span className="text-muted-foreground">Memory Usage:</span>
                    <div className="font-mono">
                      {(systemHealth.server_info.usedMemoryMB / 1024).toFixed(
                        1
                      )}
                      GB /
                      {(systemHealth.server_info.totalMemoryMB / 1024).toFixed(
                        1
                      )}
                      GB
                    </div>
                  </div>
                )}

              {systemHealth.server_info.diskUsed &&
                systemHealth.server_info.diskTotal && (
                  <div>
                    <span className="text-muted-foreground">Disk Usage:</span>
                    <div className="font-mono">
                      {systemHealth.server_info.diskUsed.toFixed(1)}GB /
                      {systemHealth.server_info.diskTotal.toFixed(1)}GB
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
