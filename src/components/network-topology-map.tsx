"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface NetworkNode {
  id: string;
  label: string;
  status: "UP" | "DOWN" | "WARNING";
  type: "server" | "database" | "api" | "frontend";
  cpu?: number;
  memory?: number;
  responseTime?: number;
}

interface NetworkEdge {
  from: string;
  to: string;
  label?: string;
  status: "healthy" | "degraded" | "failed";
}

interface NetworkTopologyMapProps {
  services: any[];
  className?: string;
}

export function NetworkTopologyMap({
  services,
  className,
}: NetworkTopologyMapProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const [network, setNetwork] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sample network data - in real app, this would come from your API
  const networkNodes: NetworkNode[] = [
    {
      id: "server-1",
      label: "Main Server",
      status: "UP",
      type: "server",
      cpu: 45,
      memory: 67,
      responseTime: 120,
    },
    {
      id: "api-1",
      label: "Status API",
      status: "UP",
      type: "api",
      cpu: 30,
      memory: 45,
      responseTime: 89,
    },
    {
      id: "db-1",
      label: "PostgreSQL DB",
      status: "WARNING",
      type: "database",
      cpu: 78,
      memory: 82,
      responseTime: 245,
    },
    {
      id: "frontend-1",
      label: "Dashboard UI",
      status: "UP",
      type: "frontend",
      cpu: 25,
      memory: 38,
      responseTime: 45,
    },
    {
      id: "api-2",
      label: "Rekap Penjualan",
      status: "DOWN",
      type: "api",
      cpu: 0,
      memory: 0,
      responseTime: 0,
    },
    {
      id: "api-3",
      label: "Laporan Harian",
      status: "UP",
      type: "api",
      cpu: 35,
      memory: 52,
      responseTime: 156,
    },
  ];

  const networkEdges: NetworkEdge[] = [
    { from: "frontend-1", to: "api-1", status: "healthy", label: "HTTPS" },
    { from: "api-1", to: "db-1", status: "degraded", label: "SQL" },
    { from: "api-1", to: "server-1", status: "healthy", label: "Internal" },
    { from: "server-1", to: "api-2", status: "failed", label: "REST" },
    { from: "server-1", to: "api-3", status: "healthy", label: "REST" },
    { from: "frontend-1", to: "api-2", status: "failed", label: "HTTPS" },
    { from: "frontend-1", to: "api-3", status: "healthy", label: "HTTPS" },
  ];

  useEffect(() => {
    if (!networkRef.current) return;

    let isMounted = true;
    (async () => {
      const [{ DataSet }, { Network }]: any = await Promise.all([
        import("vis-data"),
        import("vis-network"),
      ]);

      if (!isMounted || !networkRef.current) return;

      const nodes = new DataSet(
        networkNodes.map((node) => ({
          id: node.id,
          label: `${node.label}\n${node.status}`,
          shape: getNodeShape(node.type),
          color: getNodeColor(node.status),
          font: { color: "#333", size: 12 },
          borderWidth: 2,
          chosen: true,
        }))
      );

      const edges = new DataSet(
        networkEdges.map((edge, index) => ({
          id: `edge-${index}`,
          from: edge.from,
          to: edge.to,
          label: edge.label,
          color: getEdgeColor(edge.status),
          width: edge.status === "failed" ? 4 : 2,
          dashes: edge.status === "degraded" ? [5, 5] : false,
          arrows: "to",
        }))
      );

      const data = { nodes, edges };
      const options = {
        physics: {
          enabled: true,
          stabilization: { iterations: 100 },
        },
        interaction: {
          hover: true,
          selectConnectedEdges: false,
        },
        layout: {
          improvedLayout: true,
        },
        nodes: {
          font: { size: 12 },
          scaling: {
            min: 20,
            max: 50,
          },
        },
        edges: {
          font: { size: 10, color: "#333" },
          smooth: {
            enabled: true,
            type: "cubicBezier",
            forceDirection: "horizontal",
            roundness: 0.4,
          },
        },
      };

      const networkInstance = new Network(networkRef.current!, data, options);

      networkInstance.on("click", (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = networkNodes.find((n) => n.id === nodeId);
          setSelectedNode(node || null);
        } else {
          setSelectedNode(null);
        }
      });

      if (!isMounted) return;
      setNetwork(networkInstance);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const getNodeShape = (type: string) => {
    switch (type) {
      case "server":
        return "box";
      case "database":
        return "database";
      case "api":
        return "ellipse";
      case "frontend":
        return "diamond";
      default:
        return "dot";
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case "UP":
        return { background: "#10b981", border: "#059669" };
      case "DOWN":
        return { background: "#ef4444", border: "#dc2626" };
      case "WARNING":
        return { background: "#f59e0b", border: "#d97706" };
      default:
        return { background: "#6b7280", border: "#4b5563" };
    }
  };

  const getEdgeColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "#10b981";
      case "degraded":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleRefresh = () => {
    if (network) {
      network.redraw();
    }
  };

  const handleZoomIn = () => {
    if (network) {
      const scale = network.getScale();
      network.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (network) {
      const scale = network.getScale();
      network.moveTo({ scale: scale * 0.8 });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card
      className={`${className} ${isFullscreen ? "fixed inset-4 z-50" : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Network Topology Map
          <Badge variant="outline" className="ml-2">
            {networkNodes.filter((n) => n.status === "UP").length}/
            {networkNodes.length} Online
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div
            ref={networkRef}
            className={`border rounded-lg bg-gray-50 dark:bg-gray-900 ${
              isFullscreen ? "h-[calc(100vh-12rem)]" : "h-96"
            } flex-1`}
          />

          {selectedNode && (
            <div className="w-64 space-y-4">
              <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedNode.label}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      variant={
                        selectedNode.status === "UP"
                          ? "default"
                          : selectedNode.status === "WARNING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedNode.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{selectedNode.type}</span>
                  </div>
                  {selectedNode.cpu !== undefined && (
                    <div className="flex justify-between">
                      <span>CPU:</span>
                      <span
                        className={
                          selectedNode.cpu > 80
                            ? "text-red-500"
                            : selectedNode.cpu > 60
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {selectedNode.cpu}%
                      </span>
                    </div>
                  )}
                  {selectedNode.memory !== undefined && (
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span
                        className={
                          selectedNode.memory > 80
                            ? "text-red-500"
                            : selectedNode.memory > 60
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {selectedNode.memory}%
                      </span>
                    </div>
                  )}
                  {selectedNode.responseTime !== undefined && (
                    <div className="flex justify-between">
                      <span>Response:</span>
                      <span
                        className={
                          selectedNode.responseTime > 200
                            ? "text-red-500"
                            : selectedNode.responseTime > 100
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {selectedNode.responseTime}ms
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                <h4 className="font-medium mb-2">Legend</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Healthy Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Degraded Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Failed Connection</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
