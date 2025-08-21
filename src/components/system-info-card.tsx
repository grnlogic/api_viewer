"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  Globe,
  Server,
  Database,
  Clock,
  MapPin,
  Zap,
} from "lucide-react";

interface NetworkInfo {
  displayName: string;
  name: string;
  bytesRecv: number;
  bytesSent: number;
}

interface SystemInfoCardProps {
  systemHealth?: {
    server_info?: {
      hostname: string;
      os: string;
      uptime: string;
      cpuModel?: string;
      totalMemoryMB?: number;
      diskTotal?: number;
      bandwidthUsedGB?: number;
      networkInfo?: NetworkInfo[];
    };
  };
}

export function SystemInfoCard({ systemHealth }: SystemInfoCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const formatBandwidth = (gb: number) => {
    if (gb < 1) return `${(gb * 1024).toFixed(1)} MB`;
    return `${gb.toFixed(2)} GB`;
  };

  const serverInfo = systemHealth?.server_info || {
    hostname: "Focal Fossa",
    os: "Ubuntu 20.04 LTS",
    uptime: "79h",
    cpuModel: "Intel(R) Xeon(R) CPU L5-2690 v4 @ 2.60GHz",
    totalMemoryMB: 3932, // 3.84 GB
    diskTotal: 39.3,
    bandwidthUsedGB: 28.86,
    networkInfo: [
      {
        displayName: "Red Hat, Inc. Virtio network device",
        name: "eth0",
        bytesRecv: 1499 * 1024 * 1024, // 1.499 GB
        bytesSent: 23.88 * 1024 * 1024 // 23.88 GB  
      }
    ]
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-5 w-5" />
          System Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Server Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="text-muted-foreground">Hostname:</span>{" "}
              <Badge variant="outline" className="ml-1">
                {serverInfo?.hostname || "Focal Fossa"}
              </Badge>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="text-muted-foreground">OS:</span>{" "}
              <Badge variant="outline" className="ml-1">
                {serverInfo?.os || "Ubuntu 20.04 LTS"}
              </Badge>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="text-muted-foreground">Uptime:</span>{" "}
              <Badge variant="outline" className="ml-1">
                {serverInfo?.uptime || "79h"}
              </Badge>
            </span>
          </div>
        </div>

        {/* Hardware Info */}
        <div className="pt-2 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">CPU:</span>
            <div className="text-xs text-muted-foreground mt-1 ml-4">
              {serverInfo?.cpuModel || "Intel(R) Xeon(R) CPU L5-2690 v4 @ 2.60GHz"}
            </div>
          </div>
        </div>

        {/* Memory Info */}
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="text-muted-foreground">Total Memory:</span>{" "}
            <Badge variant="outline" className="ml-1">
              {formatBytes((serverInfo?.totalMemoryMB || 3932) * 1024 * 1024)}
            </Badge>
          </span>
        </div>

        {/* Disk Info */}
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="text-muted-foreground">Disk Space:</span>{" "}
            <Badge variant="outline" className="ml-1">
              {(serverInfo?.diskTotal || 39.3).toFixed(1)} GB
            </Badge>
          </span>
        </div>

        {/* Network Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Network Interfaces:
            </span>
          </div>
          <div className="space-y-1 ml-6">
            {(serverInfo?.networkInfo || []).slice(0, 2).map((net, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium">{net.displayName}</div>
                <div className="text-muted-foreground">
                  ↓ {formatBytes(net.bytesRecv)} | ↑{" "}
                  {formatBytes(net.bytesSent)}
                </div>
              </div>
            ))}
            {(!serverInfo?.networkInfo || serverInfo.networkInfo.length === 0) && (
              <div className="text-xs">
                <div className="font-medium">Red Hat, Inc. Virtio network device</div>
                <div className="text-muted-foreground">
                  ↓ 1.49 GB | ↑ 23.88 GB
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bandwidth Usage */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="text-muted-foreground">Bandwidth Used:</span>{" "}
            <Badge variant="outline" className="ml-1">
              {formatBandwidth(serverInfo?.bandwidthUsedGB || 28.86)}
            </Badge>
          </span>
        </div>

        {/* Location/Region */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="text-muted-foreground">Region:</span>{" "}
              <Badge variant="outline" className="ml-1">
                Asia/Jakarta
              </Badge>
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {currentTime.toLocaleTimeString("id-ID")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
