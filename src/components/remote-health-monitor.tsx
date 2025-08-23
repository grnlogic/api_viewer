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
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Database,
} from "lucide-react";
import { apiCall, API_ENDPOINTS } from "@/lib/api";

interface RemoteHealthStatus {
  status: string;
  message?: string;
  timestamp?: string;
}

interface RemoteBackend {
  id: number;
  name: string;
  url: string;
  healthEndpoint: string;
  description: string;
  enabled: boolean;
}

export function RemoteHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<
    Record<string, RemoteHealthStatus>
  >({});
  const [remoteBackends, setRemoteBackends] = useState<RemoteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  // Initialize remote backends data
  const initializeData = async () => {
    try {
      setInitializing(true);
      console.log("Initializing remote backends data...");

      const response = await fetch("/api/remote-health/init", {
        method: "POST",
      });

      const result = await response.json();
      console.log("Initialization result:", result);

      // Refresh data after initialization
      setTimeout(() => {
        fetchRemoteHealth();
      }, 1000);
    } catch (error) {
      console.error("Failed to initialize data:", error);
    } finally {
      setInitializing(false);
    }
  };

  // Fetch remote backends from database
  const fetchRemoteBackends = async () => {
    try {
      console.log(
        "Fetching remote backends from:",
        API_ENDPOINTS.REMOTE_BACKENDS
      );
      const backends = await apiCall(API_ENDPOINTS.REMOTE_BACKENDS);
      console.log("Successfully fetched backends from API:", backends);
      setRemoteBackends(backends);
      return backends;
    } catch (error) {
      console.error("Failed to fetch remote backends:", error);
      console.log("Using fallback data...");
      // Fallback to hardcoded data if API fails
      const fallbackBackends = [
        {
          id: 1,
          name: "Rekap Penjualan",
          url: "https://rekap-penjualan-api.padudjayaputera.com",
          healthEndpoint: "/api/health/status",
          description: "Backend untuk sistem rekap penjualan",
          enabled: true,
        },
        {
          id: 2,
          name: "Laporan Harian",
          url: "https://laporan-harian.padudjayaputera.com",
          healthEndpoint: "/api/health/status",
          description: "Backend untuk sistem laporan harian",
          enabled: true,
        },
      ];
      setRemoteBackends(fallbackBackends);
      return fallbackBackends;
    }
  };

  const fetchRemoteHealth = async () => {
    try {
      setLoading(true);
      console.log("Starting fetchRemoteHealth...");

      // First, get the list of remote backends from database
      const backends = await fetchRemoteBackends();
      console.log("Backends retrieved:", backends);

      // Try to get all health status at once
      try {
        console.log(
          "Trying to fetch all health status from:",
          API_ENDPOINTS.REMOTE_HEALTH_ALL
        );
        const allHealthStatus = await apiCall(API_ENDPOINTS.REMOTE_HEALTH_ALL);
        console.log("All health status response:", allHealthStatus);
        setHealthStatus(allHealthStatus);
      } catch (error) {
        console.error(
          "Failed to fetch all health status, falling back to individual calls:",
          error
        );

        // Fallback: check each backend individually
        const newHealthStatus: Record<string, RemoteHealthStatus> = {};

        for (const backend of backends) {
          try {
            // Use the new endpoint that takes backend ID
            const endpoint = API_ENDPOINTS.REMOTE_HEALTH_BY_ID(
              backend.id.toString()
            );
            console.log(
              `Checking health for ${backend.name} at endpoint:`,
              endpoint
            );
            const response = await apiCall(endpoint);
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
                ["DOWN", "ERROR", "FAILED", "OFFLINE"].includes(
                  normalizedStatus
                )
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

        console.log("Final health status:", newHealthStatus);
        setHealthStatus(newHealthStatus);
      }
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
  }, []); // Empty dependency array since we're fetching backends inside fetchRemoteHealth

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Remote Backend Health</CardTitle>
              <CardDescription>
                Monitoring external backend services
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => fetchRemoteHealth()}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={initializeData}
                disabled={initializing}
                size="sm"
                variant="outline"
              >
                <Database
                  className={`h-4 w-4 mr-2 ${
                    initializing ? "animate-pulse" : ""
                  }`}
                />
                Init Data
              </Button>
            </div>
          </div>
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
            {remoteBackends.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Loading remote backends...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  If this takes too long, try clicking "Init Data" button above
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Remote Backend Health</CardTitle>
            <CardDescription>
              Monitoring external backend services
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => fetchRemoteHealth()}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={initializeData}
              disabled={initializing}
              size="sm"
              variant="outline"
            >
              <Database
                className={`h-4 w-4 mr-2 ${
                  initializing ? "animate-pulse" : ""
                }`}
              />
              Init Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {remoteBackends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No remote backends configured
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check console for debug information or click "Init Data" to add
              default backends
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-xs text-gray-600 mb-2">Debug Info:</p>
              <p className="text-xs text-gray-500">
                API Base URL:{" "}
                {process.env.NEXT_PUBLIC_BACKEND_URL ||
                  "http://45.158.126.252:8082"}
              </p>
              <p className="text-xs text-gray-500">
                Backends Endpoint: {API_ENDPOINTS.REMOTE_BACKENDS}
              </p>
              <p className="text-xs text-gray-500">
                Health All Endpoint: {API_ENDPOINTS.REMOTE_HEALTH_ALL}
              </p>
            </div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
