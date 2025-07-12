"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, MemoryStick, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import untuk ApexCharts
const ApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-muted animate-pulse rounded" />,
});

// Dynamic import untuk Recharts components
const RechartsComponents = dynamic(
  () =>
    import("./recharts-wrapper").then((mod) => ({
      default: mod.RechartsComponents,
    })),
  { ssr: false }
);

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
    diskInfo?: {
      model: string;
      size: number;
      reads: number;
      writes: number;
    }[];
    networkInfo?: {
      name: string;
      displayName: string;
      bytesRecv: number;
      bytesSent: number;
    }[];
    cpuModel?: string;
    cpuHz?: string;
    totalMemoryMB?: number;
    usedMemoryMB?: number;
    diskUsed?: number;
    diskTotal?: number;
    bandwidthUsedGB?: string;
  };
}

interface SystemHealthCardProps {
  systemHealth: SystemHealth;
}

export function SystemHealthCard({ systemHealth }: SystemHealthCardProps) {
  const [isClient, setIsClient] = useState(false);
  const [cpuHistory, setCpuHistory] = useState<{ time: string; cpu: number }[]>(
    []
  );
  const [cpuCandles, setCpuCandles] = useState<{ x: string; y: number[] }[]>(
    []
  );

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Saat komponen mount, ambil dari localStorage
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      const saved = localStorage.getItem("cpuHistory");
      if (saved) {
        setCpuHistory(JSON.parse(saved));
      }
    }
  }, [isClient]);

  // Saat cpuHistory berubah, simpan ke localStorage
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      localStorage.setItem("cpuHistory", JSON.stringify(cpuHistory));
    }
  }, [cpuHistory, isClient]);

  useEffect(() => {
    if (systemHealth?.cpu !== undefined) {
      setCpuHistory((prev) => {
        const next = [
          ...prev,
          { time: new Date().toLocaleTimeString(), cpu: systemHealth.cpu },
        ];
        return next.slice(-30);
      });
    }
  }, [systemHealth?.cpu]);

  // Group cpuHistory jadi candle per 2 data (lebih banyak stick)
  useEffect(() => {
    const interval = 2; // lebih rapat, lebih banyak stick
    const grouped: { x: string; y: number[] }[] = [];
    for (let i = 0; i < cpuHistory.length; i += interval) {
      const chunk = cpuHistory.slice(i, i + interval);
      if (chunk.length > 0) {
        const open = chunk[0].cpu;
        const close = chunk[chunk.length - 1].cpu;
        const high = Math.max(...chunk.map((d) => d.cpu));
        const low = Math.min(...chunk.map((d) => d.cpu));
        grouped.push({
          x: chunk[0].time,
          y: [open, high, low, close],
        });
      }
    }
    setCpuCandles(grouped.slice(-30)); // tampilkan hingga 30 candle terakhir
  }, [cpuHistory]);

  const getHealthColor = (value: number) => {
    if (value >= 80) return "text-red-600";
    if (value >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getHealthBg = (value: number) => {
    if (value >= 80)
      return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    if (value >= 60)
      return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
    return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
  };

  const metrics = [
    {
      name: "CPU Usage",
      value: systemHealth.cpu,
      icon: Cpu,
      unit: "%",
    },
    {
      name: "Memory Usage",
      value: systemHealth.memory,
      icon: MemoryStick,
      unit: "%",
    },
    {
      name: "Disk Usage",
      value: systemHealth.disk,
      icon: HardDrive,
      unit: "%",
    },
    {
      name: "Network Usage",
      value: systemHealth.network,
      icon: Wifi,
      unit: "%",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              System Health
              <Badge className="text-xs">Live</Badge>
            </CardTitle>
            <CardDescription>
              Current server resource utilization
            </CardDescription>
          </div>
          {systemHealth.server_info && (
            <div className="text-right text-sm text-muted-foreground">
              <div className="font-medium">
                {systemHealth.server_info.hostname}
              </div>
              <div>{systemHealth.server_info.os}</div>
              <div>Uptime: {systemHealth.server_info.uptime}</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.name}
                className={`${getHealthBg(metric.value)} border-2`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Icon
                      className={`h-5 w-5 ${getHealthColor(metric.value)}`}
                    />
                    <span
                      className={`text-2xl font-bold ${getHealthColor(
                        metric.value
                      )}`}
                    >
                      {typeof metric.value === "number"
                        ? metric.value.toFixed(2)
                        : metric.value}
                      {metric.unit}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    <Progress
                      value={metric.value}
                      className="h-2"
                      indicatorClassName={
                        metric.value >= 80
                          ? "bg-red-500"
                          : metric.value >= 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CPU Usage Line Chart */}
        {isClient && cpuHistory.length > 1 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">CPU Usage History</h4>
            <RechartsComponents data={cpuHistory} />
          </div>
        )}

        {/* CPU Usage Candlestick Chart */}
        {isClient && cpuCandles.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">CPU Usage Candlestick</h4>
            <ApexCharts
              options={{
                chart: {
                  type: "candlestick",
                  height: 200,
                  toolbar: { show: false },
                },
                xaxis: { type: "category", labels: { show: false } },
                yaxis: {
                  min: 0,
                  max: 35, // 0-35%
                  labels: { formatter: (v: number) => `${v}%` },
                },
                plotOptions: {
                  candlestick: {
                    colors: {
                      upward: "#22c55e", // hijau jika turun (close < open)
                      downward: "#ef4444", // merah jika naik (close > open)
                    },
                    wick: {
                      useFillColor: true,
                    },
                  },
                },
                tooltip: { enabled: true },
              }}
              series={[{ data: cpuCandles }]}
              type="candlestick"
              height={200}
            />
          </div>
        )}

        {systemHealth.server_info && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">CPU Info</h4>
              <div className="text-sm">
                Model: <strong>{systemHealth.server_info.cpuModel}</strong>
                <br />
                {systemHealth.server_info.cpuHz && (
                  <>
                    Frekuensi:{" "}
                    <strong>{systemHealth.server_info.cpuHz} MHz</strong>
                    <br />
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Memory Info</h4>
              <div className="text-sm">
                Total:{" "}
                <strong>
                  {systemHealth.server_info.totalMemoryMB?.toFixed(0)} MB
                </strong>
                <br />
                Used:{" "}
                <strong>
                  {systemHealth.server_info.usedMemoryMB?.toFixed(0)} MB
                </strong>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Disk Info</h4>
              <div className="text-sm">
                Used: <strong>{systemHealth.server_info.diskUsed} GB</strong> /{" "}
                <strong>{systemHealth.server_info.diskTotal} GB</strong>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Network Info</h4>
              <div className="text-sm">
                Bandwidth Used:{" "}
                <strong>{systemHealth.server_info.bandwidthUsedGB} GB</strong>
              </div>
            </div>
          </div>
        )}

        {systemHealth.server_info?.diskInfo && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Disk Info</h4>
            {systemHealth.server_info.diskInfo.map((disk, idx) => (
              <div key={idx} className="text-sm mb-1">
                <span>
                  Model: <strong>{disk.model}</strong>
                </span>
                ,{" "}
                <span>
                  Size:{" "}
                  <strong>
                    {(disk.size / 1024 / 1024 / 1024).toFixed(1)} GB
                  </strong>
                </span>
                ,{" "}
                <span>
                  Reads: <strong>{disk.reads}</strong>
                </span>
                ,{" "}
                <span>
                  Writes: <strong>{disk.writes}</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {systemHealth.server_info?.networkInfo && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Network Info</h4>
            {systemHealth.server_info.networkInfo.map((net, idx) => (
              <div key={idx} className="text-sm mb-1">
                <span>
                  Interface:{" "}
                  <strong>
                    {net.displayName} ({net.name})
                  </strong>
                </span>
                ,{" "}
                <span>
                  Recv:{" "}
                  <strong>{(net.bytesRecv / 1024 / 1024).toFixed(1)} MB</strong>
                </span>
                ,{" "}
                <span>
                  Sent:{" "}
                  <strong>{(net.bytesSent / 1024 / 1024).toFixed(1)} MB</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {systemHealth.server_info?.load_average && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Load Average</h4>
            <div className="flex gap-4 text-sm">
              <span>
                1min:{" "}
                <strong>{systemHealth.server_info.load_average[0]}</strong>
              </span>
              <span>
                5min:{" "}
                <strong>{systemHealth.server_info.load_average[1]}</strong>
              </span>
              <span>
                15min:{" "}
                <strong>{systemHealth.server_info.load_average[2]}</strong>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
