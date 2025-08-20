"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";

interface Service {
  status: "operational" | "degraded" | "outage";
  uptime?: number;
  responseTime?: number;
}

interface QuickStatsProps {
  services: Service[];
}

export function QuickStats({ services }: QuickStatsProps) {
  const operationalCount = services.filter(
    (s) => s.status === "operational"
  ).length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const outageCount = services.filter((s) => s.status === "outage").length;

  const totalServices = services.length;
  const healthPercentage =
    totalServices > 0 ? (operationalCount / totalServices) * 100 : 0;

  const avgUptime =
    services
      .filter((s) => s.uptime !== undefined)
      .reduce((sum, service) => sum + (service.uptime || 0), 0) /
    (services.filter((s) => s.uptime !== undefined).length || 1);

  const avgResponseTime =
    services
      .filter((s) => s.responseTime !== undefined)
      .reduce((sum, service) => sum + (service.responseTime || 0), 0) /
    (services.filter((s) => s.responseTime !== undefined).length || 1);

  const getOverallStatus = () => {
    if (outageCount > 0) return "critical";
    if (degradedCount > 0) return "warning";
    return "healthy";
  };

  const overallStatus = getOverallStatus();

  const stats = [
    {
      label: "System Health",
      value: `${healthPercentage.toFixed(1)}%`,
      subtitle: `${operationalCount}/${totalServices} services`,
      icon:
        overallStatus === "healthy"
          ? CheckCircle
          : overallStatus === "warning"
          ? AlertTriangle
          : XCircle,
      color:
        overallStatus === "healthy"
          ? "text-green-400"
          : overallStatus === "warning"
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        overallStatus === "healthy"
          ? "bg-green-950/50 dark:bg-green-900/30"
          : overallStatus === "warning"
          ? "bg-yellow-950/50 dark:bg-yellow-900/30"
          : "bg-red-950/50 dark:bg-red-900/30",
    },
    {
      label: "Average Uptime",
      value: `${avgUptime.toFixed(1)}%`,
      subtitle: "Last 30 days",
      icon: TrendingUp,
      color:
        avgUptime >= 99
          ? "text-green-400"
          : avgUptime >= 95
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        avgUptime >= 99
          ? "bg-green-950/50 dark:bg-green-900/30"
          : avgUptime >= 95
          ? "bg-yellow-950/50 dark:bg-yellow-900/30"
          : "bg-red-950/50 dark:bg-red-900/30",
    },
    {
      label: "Response Time",
      value: `${Math.round(avgResponseTime)}ms`,
      subtitle: "Average response",
      icon: Clock,
      color:
        avgResponseTime <= 500
          ? "text-green-400"
          : avgResponseTime <= 1000
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        avgResponseTime <= 500
          ? "bg-green-950/50 dark:bg-green-900/30"
          : avgResponseTime <= 1000
          ? "bg-yellow-950/50 dark:bg-yellow-900/30"
          : "bg-red-950/50 dark:bg-red-900/30",
    },
    {
      label: "Active Monitoring",
      value: totalServices.toString(),
      subtitle: "Services monitored",
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-950/50 dark:bg-blue-900/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={index}
            className={`border border-gray-700/30 ${stat.bgColor} bg-gray-900/20 dark:bg-gray-800/30`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg bg-gray-800/50 dark:bg-gray-700/50`}
                >
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
