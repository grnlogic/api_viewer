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

  if (compact) {
    return (
      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {service.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {service.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Kolom Kiri - Identitas Layanan */}
              <div className="md:col-span-3 flex items-center gap-3">
                <CollapsibleTrigger className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </CollapsibleTrigger>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-white">
                    {service.name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Kolom Tengah - Status Timeline */}
              <div className="md:col-span-6">
                <div className="h-8 w-full">
                  <StatusTimeline
                    data={service.statusHistory.map((h) => ({
                      date: h.date,
                      status: h.status,
                    }))}
                  />
                </div>
              </div>

              {/* Kolom Kanan - Status Terkini */}
              <div className="md:col-span-3 flex justify-end">
                <Badge className={getStatusColor(service.status)}>
                  {getStatusText(service.status)}
                </Badge>
              </div>
            </div>

            {/* Expandable Details */}
            <CollapsibleContent className="mt-4">
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Performance Metrics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uptime (90 days)</span>
                        <span className="font-medium">
                          {service.uptime ? service.uptime.toFixed(2) : "0.00"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Response Time</span>
                        <span className="font-medium">
                          {service.responseTime || 0}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Last Incident */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Last Incident
                    </h4>
                    <div className="text-sm">
                      {service.lastIncident ? (
                        <div className="space-y-1">
                          <div className="text-gray-600">
                            {formatDate(service.lastIncident)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Service degradation resolved
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">No recent incidents</div>
                      )}
                    </div>
                  </div>

                  {/* Status History Summary */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operational Days</span>
                        <span className="font-medium text-green-600">
                          {
                            service.statusHistory.filter(
                              (h) => h.status === "operational"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Degraded Days</span>
                        <span className="font-medium text-yellow-600">
                          {
                            service.statusHistory.filter(
                              (h) => h.status === "degraded"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Outage Days</span>
                        <span className="font-medium text-red-600">
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
