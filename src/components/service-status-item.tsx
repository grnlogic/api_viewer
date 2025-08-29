"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Activity,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatusTimeline } from "@/components/status-timeline";

interface ServiceStatusItemProps {
  service: {
    id: string | number;
    name: string;
    description?: string;
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
  };
  compact?: boolean;
}

export function ServiceStatusItem({
  service,
  compact = false,
}: ServiceStatusItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500 text-white";
      case "degraded":
        return "bg-yellow-500 text-black";
      case "outage":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded";
      case "outage":
        return "Outage";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Rekap statusHistory per hari, isi status setiap hari dengan status terakhir yang berlaku
  const getDailyStatusHistory = (
    statusHistory: typeof service.statusHistory
  ): { date: string; status: "operational" | "degraded" | "outage" }[] => {
    if (!statusHistory || statusHistory.length === 0) return [];
    // Urutkan statusHistory dari paling lama ke paling baru
    const sorted = [...statusHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    // Tentukan rentang tanggal dari tanggal terawal hingga hari ini
    const startDate = new Date(sorted[0].date);
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0); // hari ini, jam 00:00
    const days: {
      date: string;
      status: "operational" | "degraded" | "outage";
    }[] = [];
    let currentStatus: "operational" | "degraded" | "outage" = sorted[0].status;
    let idx = 0;
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      // Jika ada perubahan status di hari ini, update currentStatus
      while (
        idx < sorted.length &&
        new Date(sorted[idx].date).setHours(0, 0, 0, 0) === d.getTime()
      ) {
        currentStatus = sorted[idx].status;
        idx++;
      }
      const dayStr =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      days.push({ date: dayStr, status: currentStatus });
    }
    return days;
  };

  if (compact) {
    return (
      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {service.description || "No description"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-xs text-muted-foreground">
                {service.uptime ? service.uptime.toFixed(1) : "0.0"}% uptime
              </div>
              <Badge className={getStatusColor(service.status)}>
                {getStatusText(service.status)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center">
              {/* Kolom Kiri - Identitas Layanan */}
              <div className="lg:col-span-3 flex items-center gap-2 sm:gap-3">
                <CollapsibleTrigger className="flex items-center gap-1 sm:gap-2 hover:bg-gray-50/5 p-1 rounded transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  )}
                </CollapsibleTrigger>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate text-white">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                    {service.description || "No description"}
                  </p>
                </div>
              </div>

              {/* Kolom Tengah - Status Timeline */}
              <div className="lg:col-span-6 order-3 lg:order-2">
                <div className="h-6 sm:h-8 w-full">
                  <StatusTimeline
                    data={getDailyStatusHistory(service.statusHistory)}
                  />
                </div>
              </div>

              {/* Kolom Kanan - Status Terkini */}
              <div className="lg:col-span-3 flex justify-start lg:justify-end order-2 lg:order-3">
                <Badge className={`${getStatusColor(service.status)} text-xs sm:text-sm`}>
                  {getStatusText(service.status)}
                </Badge>
              </div>
            </div>

            {/* Expandable Details */}
            <CollapsibleContent className="mt-3 sm:mt-4">
              <div className="border-t border-gray-700 pt-3 sm:pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Metrics */}
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-white">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                      Performance Metrics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uptime (90 days)</span>
                        <span className="font-medium text-white">
                          {service.uptime ? service.uptime.toFixed(2) : "0.00"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Response Time</span>
                        <span className="font-medium text-white">
                          {service.responseTime || 0}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Last Incident */}
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-white">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                      Last Incident
                    </h4>
                    <div className="text-sm">
                      {service.lastIncident ? (
                        <div className="space-y-1">
                          <div className="text-gray-400">
                            {formatDate(service.lastIncident)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Service degradation resolved
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400">No recent incidents</div>
                      )}
                    </div>
                  </div>

                  {/* Status History Summary */}
                  <div className="space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-white">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      Status Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Operational Days</span>
                        <span className="font-medium text-green-400">
                          {
                            service.statusHistory.filter(
                              (h) => h.status === "operational"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Degraded Days</span>
                        <span className="font-medium text-yellow-400">
                          {
                            service.statusHistory.filter(
                              (h) => h.status === "degraded"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Outage Days</span>
                        <span className="font-medium text-red-400">
                          {
                            service.statusHistory.filter(
                              (h) => h.status === "outage"
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </Card>
    </TooltipProvider>
  );
}
