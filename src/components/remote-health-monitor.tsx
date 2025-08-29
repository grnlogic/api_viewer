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
  fetchRemoteBackends,
  fetchAllRemoteHealth,
  fetchRemoteHealthById,
  seedDefaultBackends,
  RemoteBackend,
  RemoteHealthStatus,
} from "@/lib/backend-api";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Database,
} from "lucide-react";

interface HealthStatusWithTimestamp extends RemoteHealthStatus {
  timestamp?: string;
}

export function RemoteHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<
    Record<string, HealthStatusWithTimestamp>
  >({});
  const [remoteBackends, setRemoteBackends] = useState<RemoteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  // Initialize remote backends data with auto-seeding
  const initializeData = async () => {
    try {
      setInitializing(true);
      console.log("Checking if seeding is needed...");

      // Try to fetch backends first
      try {
        const backends = await fetchRemoteBackends();
        if (backends.length === 0) {
          console.log("No backends found, seeding default data...");
          await seedDefaultBackends();
          // Fetch again after seeding
          const newBackends = await fetchRemoteBackends();
          setRemoteBackends(newBackends);
        } else {
          console.log("Backends already exist:", backends);
          setRemoteBackends(backends);
        }
      } catch (error) {
        console.log("Database might be empty, attempting to seed...");
        await seedDefaultBackends();
        const backends = await fetchRemoteBackends();
        setRemoteBackends(backends);
      }

      const response = await fetch("/api/remote-health/init", {
        method: "POST",
      });

      const result = await response.json();
      console.log("Initialization result:", result);

      // Refresh data after initialization
      setTimeout(() => {
        fetchAllRemoteHealth();
      }, 1000);
    } catch (error) {
      console.error("Failed to initialize data:", error);
    } finally {
      setInitializing(false);
    }
  };

  // Fetch remote backends from database
  const loadRemoteBackends = async () => {
    try {
      console.log("Loading remote backends from backend API...");
      const backends = await fetchRemoteBackends();
      console.log("Successfully loaded backends:", backends);
      setRemoteBackends(backends);
      return backends;
    } catch (error) {
      console.error("Failed to load remote backends:", error);
      // No fallback - must be configured in backend
      setRemoteBackends([]);
      return [];
    }
  };

  const fetchRemoteHealthStatus = async () => {
    try {
      setLoading(true);
      console.log("Starting health check...");

      // First, make sure we have the latest backends
      await loadRemoteBackends();

      // Try to get all health status at once
      try {
        console.log("Fetching all health status from backend API...");
        const allHealthStatus = await fetchAllRemoteHealth();
        console.log("All health status response:", allHealthStatus);

        // Add timestamp to each status
        const statusWithTimestamp: Record<string, HealthStatusWithTimestamp> =
          {};
        Object.keys(allHealthStatus).forEach((key) => {
          statusWithTimestamp[key] = {
            ...allHealthStatus[key],
            timestamp: new Date().toISOString(),
          };
        });

        setHealthStatus(statusWithTimestamp);
      } catch (error) {
        console.error(
          "Failed to fetch all health status, falling back to individual calls:",
          error
        );

        // Fallback: check each backend individually
        const newHealthStatus: Record<string, HealthStatusWithTimestamp> = {};

        for (const backend of remoteBackends) {
          if (backend.id) {
            try {
              console.log(`Checking health for ${backend.name}...`);
              const response = await fetchRemoteHealthById(backend.id);
              console.log(`Response for ${backend.name}:`, response);

              newHealthStatus[backend.name] = {
                ...response,
                timestamp: new Date().toISOString(),
              };
            } catch (backendError) {
              console.error(
                `Failed to fetch health for ${backend.name}:`,
                backendError
              );
              newHealthStatus[backend.name] = {
                status: "DOWN",
                message: "Failed to fetch health status",
                timestamp: new Date().toISOString(),
              };
            }
          }
        }

        setHealthStatus(newHealthStatus);
      }
    } catch (error) {
      console.error("Failed to fetch remote health:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoteHealthStatus();

    // Polling setiap 30 detik
    const interval = setInterval(fetchRemoteHealthStatus, 30000);

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
        <CardHeader className="px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-sm sm:text-base">
                Remote Backend Health
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Monitoring external backend services
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => fetchRemoteHealthStatus()}
                disabled={loading}
                size="sm"
                variant="outline"
                className="text-xs sm:text-sm"
              >
                <RefreshCw
                  className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
              <Button
                onClick={initializeData}
                disabled={initializing}
                size="sm"
                variant="outline"
                className="text-xs sm:text-sm"
              >
                <Database
                  className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${
                    initializing ? "animate-pulse" : ""
                  }`}
                />
                Init Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {remoteBackends.map((backend) => (
              <div
                key={backend.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">
                      {backend.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {backend.description}
                    </div>
                  </div>
                </div>
                <Badge className="text-xs self-start sm:self-auto">
                  Checking...
                </Badge>
              </div>
            ))}
            {remoteBackends.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <p className="text-muted-foreground text-sm">
                  Loading remote backends...
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
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
      <CardHeader className="px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <CardTitle className="text-sm sm:text-base">
              Remote Backend Health
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Monitoring external backend services
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => fetchRemoteHealthStatus()}
              disabled={loading}
              size="sm"
              variant="outline"
              className="text-xs sm:text-sm"
            >
              <RefreshCw
                className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            <Button
              onClick={initializeData}
              disabled={initializing}
              size="sm"
              variant="outline"
              className="text-xs sm:text-sm"
            >
              <Database
                className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${
                  initializing ? "animate-pulse" : ""
                }`}
              />
              Init Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {remoteBackends.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-muted-foreground text-sm">
              No remote backends configured
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Check console for debug information or click "Init Data" to add
              default backends
            </p>
            <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-xs text-gray-600 mb-2">Debug Info:</p>
              <p className="text-xs text-gray-500 break-all">
                API Base URL:{" "}
                {process.env.NEXT_PUBLIC_BACKEND_URL ||
                  "https://status-page-api.padudjayaputera.com"}
              </p>
              <p className="text-xs text-gray-500 break-all">
                Backend API: {process.env.NEXT_PUBLIC_BACKEND_URL}
                /api/remote-health
              </p>
              <p className="text-xs text-gray-500">
                Total Backends: {remoteBackends.length}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {remoteBackends.map((backend) => {
              const status = healthStatus[backend.name];
              return (
                <div
                  key={backend.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border rounded-lg"
                >
                  <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 sm:mt-0 ${getStatusColor(
                        status?.status || "UNKNOWN"
                      )}`}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">
                        {backend.name}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">
                        {backend.description}
                      </div>
                      <div className="text-xs text-muted-foreground break-all sm:truncate">
                        {backend.url}
                      </div>
                      {status?.message && status.message !== "OK" && (
                        <div className="text-xs text-red-600 mt-1 break-words">
                          {status.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    {getStatusIcon(status?.status || "UNKNOWN")}
                    <Badge
                      className={`text-xs ${
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
                      }`}
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
