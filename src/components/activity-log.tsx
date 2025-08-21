"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface ActivityLogEntry {
  id: string;
  type: "status_change" | "incident" | "maintenance" | "recovery";
  service: string;
  message: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

interface ActivityLogProps {
  services: Array<{
    id: string;
    name: string;
    status: "operational" | "degraded" | "outage";
  }>;
}

export function ActivityLog({ services }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    // Generate mock activity log based on current services
    const generateActivities = () => {
      const activities: ActivityLogEntry[] = [];
      const now = new Date();

      // If no services provided, generate some default activities
      const servicesToUse =
        services.length > 0
          ? services
          : [
              {
                id: "1",
                name: "Rekap Penjualan",
                status: "operational" as const,
              },
              {
                id: "2",
                name: "HRD-SISTEM MONITORING",
                status: "operational" as const,
              },
              {
                id: "3",
                name: "Laporan Harian",
                status: "operational" as const,
              },
            ];

      // Add some recent activities
      servicesToUse.forEach((service, index) => {
        // Recent status check
        activities.push({
          id: `${service.id}-check-${index}`,
          type: "status_change",
          service: service.name,
          message:
            service.status === "operational"
              ? "Service health check passed"
              : service.status === "degraded"
              ? "Service experiencing performance issues"
              : "Service is currently unavailable",
          timestamp: new Date(now.getTime() - Math.random() * 3600000), // Last hour
          severity:
            service.status === "operational"
              ? "low"
              : service.status === "degraded"
              ? "medium"
              : "critical",
        });

        // Add some historical events
        if (Math.random() > 0.7) {
          activities.push({
            id: `${service.id}-incident-${index}`,
            type: "incident",
            service: service.name,
            message: "Temporary connection timeout resolved",
            timestamp: new Date(now.getTime() - Math.random() * 86400000 * 2), // Last 2 days
            severity: "medium",
          });
        }

        if (Math.random() > 0.8) {
          activities.push({
            id: `${service.id}-maintenance-${index}`,
            type: "maintenance",
            service: service.name,
            message: "Scheduled maintenance completed successfully",
            timestamp: new Date(now.getTime() - Math.random() * 86400000 * 7), // Last week
            severity: "low",
          });
        }
      });

      // Add system-wide events
      activities.push({
        id: "system-startup",
        type: "recovery",
        service: "System",
        message: "Monitoring system started successfully",
        timestamp: new Date(now.getTime() - 86400000), // Yesterday
        severity: "low",
      });

      // Sort by timestamp (newest first)
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    };

    setActivities(generateActivities());
  }, [services]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_change":
        return CheckCircle;
      case "incident":
        return AlertTriangle;
      case "maintenance":
        return Clock;
      case "recovery":
        return TrendingUp;
      default:
        return Activity;
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-950/30 dark:bg-red-900/20 border-red-500/50";
      case "high":
        return "text-orange-400 bg-orange-950/30 dark:bg-orange-900/20 border-orange-500/50";
      case "medium":
        return "text-yellow-400 bg-yellow-950/30 dark:bg-yellow-900/20 border-yellow-500/50";
      case "low":
        return "text-green-400 bg-green-950/30 dark:bg-green-900/20 border-green-500/50";
      default:
        return "text-gray-400 bg-gray-800/30 dark:bg-gray-700/20 border-gray-600/50";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>
        );
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <Card className="w-full bg-gray-900/20 dark:bg-gray-800/30 border-gray-700/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No recent activities
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border-l-4 ${getActivityColor(
                    activity.severity
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <ActivityIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {activity.service}
                        </span>
                        {getSeverityBadge(activity.severity)}
                      </div>

                      <p className="text-sm text-gray-300 dark:text-gray-400 mb-1">
                        {activity.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimestamp(activity.timestamp)}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {activity.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-gray-700/30">
          <div className="text-xs text-muted-foreground text-center">
            Showing last 10 activities • Real-time monitoring active
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
