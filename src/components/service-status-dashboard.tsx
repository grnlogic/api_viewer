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
  LayoutDashboard,
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
import { SystemHealthChart } from "@/components/system-health-chart";
import { RemoteHealthMonitor } from "@/components/remote-health-monitor";
import { AlertNotifications } from "@/components/alert-notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickStats } from "@/components/quick-stats";
import { DigitalClock } from "@/components/digital-clock";
import { ServiceMetricsCard } from "@/components/service-metrics-card";
import { SystemInfoCard } from "@/components/system-info-card";
import { ResponseTimeChart } from "@/components/response-time-chart";
import { ServiceResponseTimeList } from "@/components/service-response-time-list";
import { ActivityLog } from "@/components/activity-log";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import { ErrorPage } from "@/components/error-page";
import { LoadingPage } from "@/components/loading-page";
import Link from "next/link";

interface Service {
  id: string | number;
  name: string;
  description?: string;
  status: "operational" | "degraded" | "outage";
  backendStatus?: string; // Keep original backend status (UP/DOWN/ERROR)
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
      (service.description &&
        service.description.toLowerCase().includes(searchQuery.toLowerCase()));
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
        diskUsed = healthData.disks[0].used / 1024 / 1024 / 1024; // GB
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
              id: String(service.id), // Ensure id is string
              description: service.description || "", // Handle missing description
              status: mapStatus(
                service.status || service.statusText || "unknown"
              ),
              backendStatus: service.status || "unknown", // Keep original backend status
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
              id: String(service.id), // Ensure id is string
              description: service.description || "", // Handle missing description
              status: mapStatus(
                service.status || service.statusText || "unknown"
              ),
              backendStatus: service.status || "unknown", // Keep original backend status
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
        diskUsed = healthData.disks[0].used / 1024 / 1024 / 1024; // GB
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

  // Fungsi untuk fallback status summary jika overallStatus tidak valid
  const getMajorityStatus = () => {
    if (services.length === 0) return "operational";
    const count = { operational: 0, degraded: 0, outage: 0 };
    services.forEach((s) => count[s.status]++);
    if (count.outage > 0) return "outage";
    if (count.degraded > 0) return "degraded";
    return "operational";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "Semua Sistem Berjalan";
      case "degraded":
        return "Sebagian Sistem Bermasalah";
      case "outage":
        return "Gangguan Sistem";
      default:
        return "Semua Sistem Berjalan";
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
              <Link href="/enhanced-dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Enhanced Dashboard
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
              <Link href="/processes">
                <Button variant="outline" size="sm" className="ml-2">
                  Monitoring Proses Server
                </Button>
              </Link>
            </div>
          </div>

          {/* Status Overview */}
          <div className="flex items-center justify-center gap-4 p-6 bg-card/80 backdrop-blur-sm rounded-lg border">
            <div
              className={`w-4 h-4 rounded-full ${getStatusColor(
                ["operational", "degraded", "outage"].includes(overallStatus)
                  ? overallStatus
                  : getMajorityStatus()
              )} animate-pulse`}
            />
            <span className="text-2xl font-semibold text-white drop-shadow-lg">
              {getStatusText(
                ["operational", "degraded", "outage"].includes(overallStatus)
                  ? overallStatus
                  : getMajorityStatus()
              )}
            </span>
            <Badge className="ml-2">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Alert Notifications */}
        <AlertNotifications />

        {/* Quick Stats Overview */}
        <QuickStats services={services} />

        {/* Main Dashboard Grid - Integrated Information Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {/* Digital Clock */}
          <div className="flex flex-col min-h-[280px]">
            <DigitalClock />
          </div>

          {/* Service Metrics */}
          <div className="flex flex-col min-h-[280px]">
            <ServiceMetricsCard services={filteredServices} />
          </div>

          {/* System Information */}
          <div className="flex flex-col min-h-[280px]">
            <SystemInfoCard systemHealth={systemHealth ?? undefined} />
          </div>

          {/* Response Time Chart */}
          <div className="flex flex-col min-h-[280px]">
            <ResponseTimeChart
              services={
                filteredServices.length > 0
                  ? filteredServices.map((s) => ({
                      id: s.id.toString(),
                      name: s.name,
                      responseTime: s.responseTime,
                      status: s.backendStatus || s.status, // Use backend status for chart
                    }))
                  : [
                      {
                        id: "1",
                        name: "Rekap Penjualan",
                        responseTime: 128,
                        status: "operational",
                      },
                      {
                        id: "2",
                        name: "HRD-SISTEM MONITORING",
                        responseTime: 142,
                        status: "operational",
                      },
                      {
                        id: "3",
                        name: "Laporan Harian",
                        responseTime: 123,
                        status: "operational",
                      },
                    ]
              }
            />
          </div>
        </div>

        {/* Service Response Time List - Moved to separate row */}
        <div className="w-full mt-6">
          <ServiceResponseTimeList />
        </div>

        {/* Remote Backend Health & Activity Section */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Remote Health Monitor */}
          <div className="lg:col-span-1">
            <RemoteHealthMonitor />
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-2">
            <ActivityLog
              services={filteredServices.map((s) => ({
                id: s.id.toString(),
                name: s.name,
                status: s.status,
              }))}
            />
          </div>
        </div>

        {/* System Health Chart (Full Width) */}
        {systemHealth && (
          <div className="w-full">
            <SystemHealthChart systemHealth={systemHealth} />
          </div>
        )}

        {/* Services Section */}
        <Card className="bg-gray-900/20 dark:bg-gray-800/30 border-gray-700/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Response Time Trends
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                    {services.length} services
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Monitor and manage all your services in one place
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="border-gray-600/50 hover:bg-gray-800/50"
              >
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
                  className="pl-10 bg-gray-800/30 border-gray-600/50 focus:border-gray-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-gray-800/30 border-gray-600/50">
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
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800/30 border border-gray-600/30">
                <TabsTrigger
                  value="grid"
                  className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
                >
                  Grid View
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white"
                >
                  List View
                </TabsTrigger>
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
