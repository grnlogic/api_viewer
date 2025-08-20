"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { apiCall, API_ENDPOINTS } from "@/lib/api";

interface RemoteHealthStatus {
  status: string;
  message?: string;
  timestamp?: string;
}

interface RemoteBackend {
  name: string;
  url: string;
  endpoint: string;
  description: string;
}

export function RemoteHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<
    Record<string, RemoteHealthStatus>
  >({});
  const [loading, setLoading] = useState(true);

  const remoteBackends: RemoteBackend[] = [
    {
      name: "Rekap Penjualan",
      url: "https://rekap-penjualan-api.padudjayaputera.com",
      endpoint: API_ENDPOINTS.REMOTE_HEALTH,
      description: "Backend untuk sistem rekap penjualan",
    },
    {
      name: "Laporan Harian",
      url: "https://laporan-harian.padudjayaputera.com",
      endpoint: API_ENDPOINTS.REMOTE_HEALTH_LAPORAN_HARIAN,
      description: "Backend untuk sistem laporan harian",
    },
  ];

  const fetchRemoteHealth = async () => {
    try {
      setLoading(true);
      const newHealthStatus: Record<string, RemoteHealthStatus> = {};

      for (const backend of remoteBackends) {
        try {
          const response = await apiCall(backend.endpoint);
          console.log(`Response for ${backend.name}:`, response);

          // Normalize status response
          let normalizedStatus = "UNKNOWN";
          let message = "OK";

          if (response) {
            // Handle different response formats
            if (typeof response === "string") {
              normalizedStatus = response.toUpperCase();
            } else if (response.status) {
              normalizedStatus = response.status.toUpperCase();
              message = response.message || "OK";
            } else if (response.details && response.details.status) {
              normalizedStatus = response.details.status.toUpperCase();
              message = response.details.message || "OK";
            }

            // Map various status formats to consistent ones
            if (
              ["UP", "OK", "OPERATIONAL", "HEALTHY", "RUNNING"].includes(
                normalizedStatus
              )
            ) {
              normalizedStatus = "UP";
            } else if (
              ["DOWN", "ERROR", "FAILED", "OFFLINE"].includes(normalizedStatus)
            ) {
              normalizedStatus = "DOWN";
            } else if (
              ["DEGRADED", "WARNING", "PARTIAL"].includes(normalizedStatus)
            ) {
              normalizedStatus = "DEGRADED";
            }
          }

          newHealthStatus[backend.name] = {
            status: normalizedStatus,
            message,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error checking ${backend.name}:`, error);
          newHealthStatus[backend.name] = {
            status: "DOWN",
            message:
              error instanceof Error ? error.message : "Connection failed",
            timestamp: new Date().toISOString(),
          };
        }
      }

      setHealthStatus(newHealthStatus);
    } catch (error) {
      console.error("Failed to fetch remote health:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoteHealth();

    // Polling setiap 30 detik
    const interval = setInterval(fetchRemoteHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "UP":
      case "OK":
      case "OPERATIONAL":
      case "HEALTHY":
      case "RUNNING":
        return "bg-green-500";
      case "DOWN":
      case "ERROR":
      case "FAILED":
      case "OFFLINE":
        return "bg-red-500";
      case "DEGRADED":
      case "WARNING":
      case "PARTIAL":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "UP":
      case "OK":
      case "OPERATIONAL":
      case "HEALTHY":
      case "RUNNING":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DOWN":
      case "ERROR":
      case "FAILED":
      case "OFFLINE":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "DEGRADED":
      case "WARNING":
      case "PARTIAL":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "UP":
      case "OK":
      case "OPERATIONAL":
      case "HEALTHY":
      case "RUNNING":
        return "Operational";
      case "DOWN":
      case "ERROR":
      case "FAILED":
      case "OFFLINE":
        return "Down";
      case "DEGRADED":
      case "WARNING":
      case "PARTIAL":
        return "Degraded";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remote Backend Health</CardTitle>
          <CardDescription>
            Monitoring external backend services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {remoteBackends.map((backend) => (
              <div
                key={backend.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-medium">{backend.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {backend.description}
                    </div>
                  </div>
                </div>
                <Badge>Checking...</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remote Backend Health</CardTitle>
        <CardDescription>Monitoring external backend services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {remoteBackends.map((backend) => {
            const status = healthStatus[backend.name];
            return (
              <div
                key={backend.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(
                      status?.status || "UNKNOWN"
                    )}`}
                  ></div>
                  <div>
                    <div className="font-medium">{backend.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {backend.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {backend.url}
                    </div>
                    {status?.message && status.message !== "OK" && (
                      <div className="text-xs text-red-600 mt-1">
                        {status.message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status?.status || "UNKNOWN")}
                  <Badge
                    className={
                      status?.status === "UP" ||
                      status?.status === "OK" ||
                      status?.status === "OPERATIONAL"
                        ? "bg-green-500 text-white"
                        : status?.status === "DOWN" ||
                          status?.status === "ERROR"
                        ? "bg-red-500 text-white"
                        : status?.status === "DEGRADED"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-500 text-white"
                    }
                  >
                    {getStatusText(status?.status || "UNKNOWN")}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
