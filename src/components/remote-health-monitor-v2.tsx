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

  // Load remote backends from database
  const loadRemoteBackends = async () => {
    try {
      console.log("Loading remote backends from backend API...");
      const backends = await fetchRemoteBackends();
      console.log("Successfully loaded backends:", backends);
      setRemoteBackends(backends);
      return backends;
    } catch (error) {
      console.error("Failed to load remote backends:", error);
      setRemoteBackends([]);
      return [];
    }
  };

  // Fetch remote health status for all backends
  const fetchRemoteHealthStatus = async () => {
    try {
      setLoading(true);
      console.log("Starting health check...");

      // First, make sure we have the latest backends
      const backends = await loadRemoteBackends();

      if (backends.length === 0) {
        console.log("No backends configured");
        setHealthStatus({});
        return;
      }

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
        console.error("Failed to fetch health status:", error);

        // Set error status for all backends
        const errorStatus: Record<string, HealthStatusWithTimestamp> = {};
        backends.forEach((backend) => {
          errorStatus[backend.name] = {
            status: "DOWN",
            message: "Failed to fetch health status",
            timestamp: new Date().toISOString(),
          };
        });

        setHealthStatus(errorStatus);
      }
    } catch (error) {
      console.error("Error in health status fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoteHealthStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRemoteHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "UP":
      case "OK":
      case "OPERATIONAL":
      case "HEALTHY":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "DOWN":
      case "ERROR":
      case "FAILED":
      case "OFFLINE":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "DEGRADED":
      case "WARNING":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "UP":
      case "OK":
      case "OPERATIONAL":
      case "HEALTHY":
        return "bg-green-500";
      case "DOWN":
      case "ERROR":
      case "FAILED":
      case "OFFLINE":
        return "bg-red-500";
      case "DEGRADED":
      case "WARNING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "UP":
      case "OK":
      case "OPERATIONAL":
      case "HEALTHY":
        return "default" as const;
      case "DOWN":
      case "ERROR":
      case "FAILED":
      case "OFFLINE":
        return "destructive" as const;
      case "DEGRADED":
      case "WARNING":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  if (loading && remoteBackends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Remote Health Monitor
          </CardTitle>
          <CardDescription>
            Loading backend configurations from database...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (remoteBackends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Remote Health Monitor
          </CardTitle>
          <CardDescription>
            No remote backends configured in database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Backends Configured
            </h3>
            <p className="text-gray-600 mb-4">
              Please configure remote backends in the database to monitor their
              health status.
            </p>
            <div className="text-sm text-gray-500">
              <p>Use the backend API to add backends:</p>
              <p className="font-mono mt-2">POST /api/remote-health/backends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Remote Health Monitor
              </CardTitle>
              <CardDescription>
                Monitoring {remoteBackends.length} remote backend services from
                database
              </CardDescription>
            </div>
            <Button
              onClick={fetchRemoteHealthStatus}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {remoteBackends.map((backend) => {
              const status = healthStatus[backend.name];
              const statusText = status?.status || "CHECKING";

              return (
                <Card key={backend.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {backend.name}
                      </CardTitle>
                      {getStatusIcon(statusText)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          statusText
                        )}`}
                      />
                      <Badge variant={getStatusBadgeVariant(statusText)}>
                        {statusText}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">URL:</span>
                        <div className="font-mono text-xs text-gray-600 break-all">
                          {backend.url}
                        </div>
                      </div>
                      {backend.description && (
                        <div>
                          <span className="font-medium">Description:</span>
                          <div className="text-gray-600">
                            {backend.description}
                          </div>
                        </div>
                      )}
                      {status?.message && (
                        <div>
                          <span className="font-medium">Message:</span>
                          <div className="text-gray-600">{status.message}</div>
                        </div>
                      )}
                      {status?.timestamp && (
                        <div>
                          <span className="font-medium">Last Check:</span>
                          <div className="text-gray-500 text-xs">
                            {new Date(status.timestamp).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
              <span className="text-sm text-gray-600">
                Checking health status...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs font-mono">
            <div>Backends Count: {remoteBackends.length}</div>
            <div>Health Status Count: {Object.keys(healthStatus).length}</div>
            <div>
              Backend API: {process.env.NEXT_PUBLIC_BACKEND_URL}
              /api/remote-health
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
