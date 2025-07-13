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
      url: "https://rekap-penjualan.api.padudjayaputera.com",
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
          newHealthStatus[backend.name] = {
            status: response.status || "UNKNOWN",
            message: response.message || "OK",
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          newHealthStatus[backend.name] = {
            status: "ERROR",
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
        return "bg-green-500";
      case "DOWN":
      case "ERROR":
        return "bg-red-500";
      case "DEGRADED":
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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DOWN":
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "DEGRADED":
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
        return "Operational";
      case "DOWN":
      case "ERROR":
        return "Down";
      case "DEGRADED":
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
                <Badge variant="secondary">Checking...</Badge>
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
                    variant={
                      status?.status === "UP" || status?.status === "OK"
                        ? "default"
                        : "destructive"
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
