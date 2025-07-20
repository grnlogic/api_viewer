"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";

interface Service {
  status: "operational" | "degraded" | "outage";
}

interface StatusOverviewCardsProps {
  services: Service[];
}

export function StatusOverviewCards({ services }: StatusOverviewCardsProps) {
  const operationalCount = services.filter(
    (s) => s.status === "operational"
  ).length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const outageCount = services.filter((s) => s.status === "outage").length;
  const totalServices = services.length;

  const uptime =
    totalServices > 0
      ? ((operationalCount / totalServices) * 100).toFixed(1)
      : "0";

  const cards = [
    {
      title: "Operational",
      value: operationalCount,
      total: totalServices,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Degraded",
      value: degradedCount,
      total: totalServices,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      title: "Outage",
      value: outageCount,
      total: totalServices,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      title: "Overall Uptime",
      value: `${uptime}%`,
      total: null,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`${card.bgColor} ${card.borderColor} border-2`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${card.color}`}>
                  {typeof card.value === "number" && card.total
                    ? `${card.value}`
                    : card.value}
                </div>
                {card.total && (
                  <Badge className="text-xs">of {card.total}</Badge>
                )}
              </div>
              {card.total && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        card.title === "Operational"
                          ? "bg-green-500"
                          : card.title === "Degraded"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${
                          ((card.value as number) / card.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
