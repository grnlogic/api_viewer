"use client";

import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, AlertCircle } from "lucide-react";
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
import { QuickStats } from "@/components/quick-stats";
import { DigitalClock } from "@/components/digital-clock";
import { ServiceMetricsCard } from "@/components/service-metrics-card";
import { SystemInfoCard } from "@/components/system-info-card";
import { ResponseTimeChart } from "@/components/response-time-chart";
import { ServiceResponseTimeList } from "@/components/service-response-time-list";
import ActivityLog from "@/components/activity-log";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import { ErrorPage } from "@/components/error-page";
import { LoadingPage } from "@/components/loading-page";

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

  // Mapping status dari backend ke frontend dengan debug logging
  const mapStatus = (
    status: string,
    responseTime?: number
  ): "operational" | "degraded" | "outage" => {
    console.log(`🔍 Mapping status: "${status}" with responseTime: ${responseTime}`);

    const result = (() => {
      switch (status?.toUpperCase()) {
        case "UP":
          // Jika response time > 1000ms, anggap degraded meskipun UP
          if (responseTime && responseTime > 1000) {
            return "degraded";
          }
          return "operational";
        case "DEGRADED":
          return "degraded";
        case "DOWN":
        case "ERROR":
          return "outage";
        default:
          return "outage";
      }
    })();

    console.log(`✅ Status "${status}" mapped to "${result}"`);
    return result;
  };

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
                service.status || service.statusText || "unknown",
                service.lastResponseTimeMs
              ),
              backendStatus: service.status || "unknown", // Keep original backend status
              uptime: metricsData.uptime || 0,
              responseTime:
                metricsData.responseTime || service.lastResponseTimeMs || 0,
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
                service.status || service.statusText || "unknown",
                service.lastResponseTimeMs
              ),
              backendStatus: service.status || "unknown", // Keep original backend status
              uptime: 0,
              responseTime: service.lastResponseTimeMs || 0,
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
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://status-page-api.padudjayaputera.com"
      }/api/sse/status`
    );

    eventSource.onmessage = (event) => {
      try {
        let dataStr = event.data;
        // Remove 'data: ' prefix if present
        if (dataStr.startsWith("data: ")) {
          dataStr = dataStr.slice(6);
        }
        const backendServices = JSON.parse(dataStr);

        // Jika data adalah array services dari backend
        if (Array.isArray(backendServices)) {
          setServices((prevServices) =>
            prevServices.map((service) => {
              const backendService = backendServices.find(
                (bs: any) => bs.id === Number(service.id)
              );

              if (backendService) {
                const mappedStatus = mapStatus(
                  backendService.status,
                  backendService.lastResponseTimeMs
                );

                console.log(
                  `SSE Update - Service: ${service.name}, Backend Status: ${backendService.status}, Mapped Status: ${mappedStatus}`
                );

                return {
                  ...service,
                  status: mappedStatus,
                  backendStatus: backendService.status,
                  responseTime: backendService.lastResponseTimeMs || service.responseTime,
                };
              }

              return service;
            })
          );
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error, "Raw data:", event.data);
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
      <div className="relative z-10 container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col space-y-4">
          <div className="text-center">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                Service Status Monitor
              </h1>
              <p className="text-sm sm:text-base text-white/80 drop-shadow-sm">
                Real-time monitoring dashboard for all services
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 sm:p-6 bg-card/80 backdrop-blur-sm rounded-lg border">
            <div
              className={`w-4 h-4 rounded-full ${getStatusColor(
                ["operational", "degraded", "outage"].includes(overallStatus)
                  ? overallStatus
                  : getMajorityStatus()
              )} animate-pulse`}
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-white drop-shadow-lg text-center">
              {getStatusText(
                ["operational", "degraded", "outage"].includes(overallStatus)
                  ? overallStatus
                  : getMajorityStatus()
              )}
            </span>
            <Badge className="text-xs sm:text-sm">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Alert Notifications */}
        <AlertNotifications />

        {/* Quick Stats Overview */}
        <QuickStats services={services} />

        {/* Main Dashboard Grid - Integrated Information Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {/* Digital Clock */}
          <div className="flex flex-col min-h-[200px] sm:min-h-[280px]">
            <DigitalClock />
          </div>

          {/* Service Metrics */}
          <div className="flex flex-col min-h-[200px] sm:min-h-[280px]">
            <ServiceMetricsCard services={filteredServices} />
          </div>

          {/* System Information */}
          <div className="flex flex-col min-h-[200px] sm:min-h-[280px]">
            <SystemInfoCard systemHealth={systemHealth ?? undefined} />
          </div>

          {/* Response Time Chart */}
          <div className="flex flex-col min-h-[200px] sm:min-h-[280px]">
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
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Remote Health Monitor */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <RemoteHealthMonitor />
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <ActivityLog />
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
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-lg sm:text-xl">
                    Response Time Trends
                  </span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs sm:text-sm w-fit">
                    {services.length} services
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Monitor and manage all your services in one place
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="border-gray-600/50 hover:bg-gray-800/50 text-xs sm:text-sm w-fit"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Refresh
              </Button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/30 border-gray-600/50 focus:border-gray-500 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-gray-800/30 border-gray-600/50 text-sm">
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

          <CardContent className="pt-4">
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-gray-800/30 border border-gray-600/30">
                <TabsTrigger
                  value="grid"
                  className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white text-xs sm:text-sm"
                >
                  Grid View
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-gray-700/50 data-[state=active]:text-white text-xs sm:text-sm"
                >
                  List View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-3 sm:space-y-4">
                <div className="grid gap-3 sm:gap-4">
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
              <div className="text-center py-8 sm:py-12">
                <div className="text-muted-foreground text-sm sm:text-base">
                  No services found matching your criteria
                </div>
              </div>
            )}

            {services.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-muted-foreground text-sm sm:text-base">
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
