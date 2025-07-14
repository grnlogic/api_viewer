"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  Download,
  AlertCircle,
} from "lucide-react";
import { ServiceStatusItem } from "@/components/service-status-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusOverviewCards } from "@/components/status-overview-cards";
import { SystemHealthCard } from "@/components/system-health-card";
import { RemoteHealthMonitor } from "@/components/remote-health-monitor";
import { AlertNotifications } from "@/components/alert-notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import { ErrorPage } from "@/components/error-page";
import { LoadingPage } from "@/components/loading-page";

interface Service {
  id: string;
  name: string;
  description: string;
  status: "operational" | "degraded" | "outage";
  uptime?: number;
  responseTime?: number;
  lastIncident: string | null;
  statusHistory: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    status: "operational" | "degraded" | "outage";
  }>;
}

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
    diskInfo?: Array<{
      size: number;
      reads: number;
      writes: number;
      model: string;
    }>;
    networkInfo?: Array<{
      displayName: string;
      name: string;
      bytesRecv: number;
      bytesSent: number;
    }>;
  };
}

export function ServiceStatusDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<
    "operational" | "degraded" | "outage"
  >("operational");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add filtering logic
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch services using apiCall
      const servicesData = await apiCall(API_ENDPOINTS.SERVICES);

      // Fetch status overview using apiCall
      const overviewData = await apiCall(API_ENDPOINTS.STATUS_OVERVIEW);

      // Fetch system health using apiCall
      const healthData = await apiCall(API_ENDPOINTS.SYSTEM_HEALTH);
      console.log("Raw healthData from backend:", healthData);

      // CPU
      const cpu =
        healthData.cpuLoad !== undefined ? healthData.cpuLoad * 100 : 0;

      // Memory
      const totalMemoryMB = healthData.totalMemory / 1024 / 1024;
      const usedMemoryMB =
        (healthData.totalMemory - healthData.availableMemory) / 1024 / 1024;
      const memory =
        healthData.totalMemory && healthData.availableMemory
          ? ((healthData.totalMemory - healthData.availableMemory) /
              healthData.totalMemory) *
            100
          : 0;

      // Disk
      let disk = 0;
      let diskUsed = 0;
      let diskTotal = 0;
      let diskInfo = null;
      if (healthData.disks && healthData.disks.length > 0) {
        diskTotal = healthData.disks[0].size / 1024 / 1024 / 1024; // GB
        // Jika ada info used, gunakan, jika tidak, tampilkan reads/writes saja
        // Misal, gunakan dummy 8.32 GB used (harusnya dari backend)
        diskUsed = 8.32; // <-- Ganti dengan data asli jika ada
        disk = (diskUsed / diskTotal) * 100;
        diskInfo = healthData.disks.map((d: any) => ({
          size: typeof d.size === "number" ? d.size : parseInt(d.size, 10) || 0,
          reads: d.reads,
          writes: d.writes,
          model: d.model,
        }));
      }

      // Network
      let network = 0;
      let networkInfo = null;
      let bandwidthUsedGB = 0;
      if (healthData.networks && healthData.networks.length > 0) {
        const net = healthData.networks[0];
        bandwidthUsedGB = Number(
          ((net.bytesRecv + net.bytesSent) / 1024 / 1024 / 1024).toFixed(2)
        ); // GB
        network = bandwidthUsedGB;
        networkInfo = healthData.networks.map((n: any) => ({
          displayName: n.displayName,
          name: n.name,
          bytesRecv: n.bytesRecv,
          bytesSent: n.bytesSent,
        }));
      }

      const mappedSystemHealth = {
        cpu,
        memory,
        disk,
        network,
        server_info: {
          hostname: healthData.osCodename || "-",
          os: `${healthData.osFamily || ""} ${
            healthData.osVersion || ""
          }`.trim(),
          uptime: healthData.systemUptimeSeconds
            ? `${Math.floor(healthData.systemUptimeSeconds / 3600)}h`
            : "-",
          load_average: healthData.server_info?.load_average || [],
          diskInfo,
          networkInfo,
          cpuModel: healthData.cpuModel,
          cpuHz: healthData.cpuHz, // jika ada
          totalMemoryMB,
          usedMemoryMB,
          diskUsed,
          diskTotal,
          bandwidthUsedGB,
        },
      };
      console.log("Mapped systemHealth for card:", mappedSystemHealth);
      setSystemHealth(mappedSystemHealth);

      // Mapping status dari backend ke frontend
      const mapStatus = (status: string) => {
        switch (status?.toUpperCase()) {
          case "UP":
            return "operational";
          case "DEGRADED":
            return "degraded";
          default:
            return "outage";
        }
      };

      // Fetch history and metrics for each service
      const servicesWithHistory = await Promise.all(
        servicesData.map(async (service: any) => {
          try {
            const [historyData, metricsData] = await Promise.all([
              apiCall(API_ENDPOINTS.STATUS_HISTORY(service.id, 90)).catch(
                () => ({ history: [] })
              ),
              apiCall(API_ENDPOINTS.METRICS(service.id, 90)).catch(() => ({
                uptime: 0,
                responseTime: 0,
                lastIncident: null,
              })),
            ]);

            // Mapping statusHistory agar sesuai format FE
            const mappedHistory = Array.isArray(historyData)
              ? historyData.map((item) => {
                  const isUp = item.status === "UP";
                  return {
                    date: item.checkedAt,
                    status: mapStatus(item.status),
                    open: isUp ? 1 : 0,
                    high: isUp ? 1 : 0,
                    low: isUp ? 1 : 0,
                    close: isUp ? 1 : 0,
                  };
                })
              : [];

            return {
              ...service,
              ...metricsData,
              status: mapStatus(
                service.status || service.statusText || "unknown"
              ),
              uptime: metricsData.uptime || 0,
              responseTime: metricsData.responseTime || 0,
              statusHistory: mappedHistory,
            };
          } catch (error) {
            console.error(
              `Error fetching data for service ${service.id}:`,
              error
            );
            return {
              ...service,
              status: mapStatus(
                service.status || service.statusText || "unknown"
              ),
              uptime: 0,
              responseTime: 0,
              lastIncident: null,
              statusHistory: [] as {
                date: string;
                open: number;
                high: number;
                low: number;
                close: number;
                status: "operational" | "degraded" | "outage";
              }[],
            };
          }
        })
      );

      setServices(servicesWithHistory);
      setOverallStatus(overviewData.overall_status);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fungsi khusus untuk fetch system health saja
  const fetchSystemHealth = async () => {
    try {
      const healthData = await apiCall(API_ENDPOINTS.SYSTEM_HEALTH);
      // CPU
      const cpu =
        healthData.cpuLoad !== undefined ? healthData.cpuLoad * 100 : 0;
      // Memory
      const totalMemoryMB = healthData.totalMemory / 1024 / 1024;
      const usedMemoryMB =
        (healthData.totalMemory - healthData.availableMemory) / 1024 / 1024;
      const memory =
        healthData.totalMemory && healthData.availableMemory
          ? ((healthData.totalMemory - healthData.availableMemory) /
              healthData.totalMemory) *
            100
          : 0;
      // Disk
      let disk = 0;
      let diskUsed = 0;
      let diskTotal = 0;
      let diskInfo = null;
      if (healthData.disks && healthData.disks.length > 0) {
        diskTotal = healthData.disks[0].size / 1024 / 1024 / 1024; // GB
        diskUsed = 8.32; // Dummy, ganti jika ada data asli
        disk = (diskUsed / diskTotal) * 100;
        diskInfo = healthData.disks.map((d: any) => ({
          size: typeof d.size === "number" ? d.size : parseInt(d.size, 10) || 0,
          reads: d.reads,
          writes: d.writes,
          model: d.model,
        }));
      }
      // Network
      let network = 0;
      let networkInfo = null;
      let bandwidthUsedGB = 0;
      if (healthData.networks && healthData.networks.length > 0) {
        const net = healthData.networks[0];
        bandwidthUsedGB = Number(
          ((net.bytesRecv + net.bytesSent) / 1024 / 1024 / 1024).toFixed(2)
        ); // GB
        network = bandwidthUsedGB;
        networkInfo = healthData.networks.map((n: any) => ({
          displayName: n.displayName,
          name: n.name,
          bytesRecv: n.bytesRecv,
          bytesSent: n.bytesSent,
        }));
      }
      const mappedSystemHealth = {
        cpu,
        memory,
        disk,
        network,
        server_info: {
          hostname: healthData.osCodename || "-",
          os: `${healthData.osFamily || ""} ${
            healthData.osVersion || ""
          }`.trim(),
          uptime: healthData.systemUptimeSeconds
            ? `${Math.floor(healthData.systemUptimeSeconds / 3600)}h`
            : "-",
          load_average: healthData.server_info?.load_average || [],
          diskInfo,
          networkInfo,
          cpuModel: healthData.cpuModel,
          cpuHz: healthData.cpuHz, // jika ada
          totalMemoryMB,
          usedMemoryMB,
          diskUsed,
          diskTotal,
          bandwidthUsedGB,
        },
      };
      setSystemHealth(mappedSystemHealth);
    } catch (error) {
      // Optional: handle error khusus system health
    }
  };

  useEffect(() => {
    fetchData(); // hanya sekali saat mount

    // Polling hanya untuk system health
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 5000);

    // Setup SSE for real-time updates using the correct backend URL
    const eventSource = new EventSource(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://45.158.126.252:8082"
      }/api/sse/status`
    );

    eventSource.onmessage = (event) => {
      try {
        let dataStr = event.data;
        // Remove 'data: ' prefix if present
        if (dataStr.startsWith("data: ")) {
          dataStr = dataStr.slice(6);
        }
        const data = JSON.parse(dataStr);
        if (data.type === "status_update") {
          setServices((prev) =>
            prev.map((service) =>
              service.id === data.service_id
                ? { ...service, status: data.status }
                : service
            )
          );
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      // Silent error handling for SSE connection issues
      // console.error("SSE connection error:", error);
    };

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "outage":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "All Systems Operational";
      case "degraded":
        return "Some Systems Degraded";
      case "outage":
        return "System Outage";
      default:
        return "Unknown Status";
    }
  };

  if (loading) {
    return (
      <LoadingPage message="Memuat data dashboard..." showProgress={true} />
    );
  }

  if (error) {
    // Determine error type based on error message
    let errorType: "connection" | "server" | "network" | "maintenance" =
      "connection";

    if (error.includes("Failed to fetch") || error.includes("network")) {
      errorType = "network";
    } else if (error.includes("maintenance")) {
      errorType = "maintenance";
    } else if (error.includes("server") || error.includes("500")) {
      errorType = "server";
    }

    return (
      <ErrorPage
        error={error}
        errorType={errorType}
        onRetry={fetchData}
        showBackToHome={false}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Content */}
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Service Status Monitor
              </h1>
              <p className="text-white/80 drop-shadow-sm">
                Real-time monitoring dashboard for all services
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          <div className="flex items-center justify-center gap-4 p-6 bg-card/80 backdrop-blur-sm rounded-lg border">
            <div
              className={`w-4 h-4 rounded-full ${getStatusColor(
                overallStatus
              )} animate-pulse`}
            />
            <span className="text-2xl font-semibold text-white drop-shadow-lg">
              {getStatusText(overallStatus)}
            </span>
            <Badge className="ml-2">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Alert Notifications */}
        <AlertNotifications />

        {/* Overview Cards */}
        <StatusOverviewCards services={services} />

        {/* System Health */}
        {systemHealth && <SystemHealthCard systemHealth={systemHealth} />}

        {/* Remote Backend Health */}
        <RemoteHealthMonitor />

        {/* Services Section */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Services Status
                  <Badge>{services.length} services</Badge>
                </CardTitle>
                <CardDescription>
                  Monitor and manage all your services in one place
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="outage">Outage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4">
                <div className="grid gap-4">
                  {filteredServices.map((service) => (
                    <ServiceStatusItem key={service.id} service={service} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-2">
                {filteredServices.map((service) => (
                  <ServiceStatusItem
                    key={service.id}
                    service={service}
                    compact
                  />
                ))}
              </TabsContent>
            </Tabs>

            {filteredServices.length === 0 && services.length > 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  No services found matching your criteria
                </div>
              </div>
            )}

            {services.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  No services configured. Please check your backend connection.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
