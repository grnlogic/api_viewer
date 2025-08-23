"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, GitBranch, AlertTriangle, CheckCircle } from "lucide-react";

interface ServiceNode {
  id: string;
  name: string;
  status: "UP" | "DOWN" | "WARNING";
  dependencies: string[];
  dependents: string[];
  criticality: "high" | "medium" | "low";
  responseTime?: number;
  errorRate?: number;
}

interface ServiceDependencyGraphProps {
  services: any[];
  className?: string;
}

export function ServiceDependencyGraph({
  services,
  className,
}: ServiceDependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [viewMode, setViewMode] = useState<
    "all" | "dependencies" | "dependents"
  >("all");
  const [criticalPath, setCriticalPath] = useState<string[]>([]);

  // Sample service dependency data
  const serviceNodes: ServiceNode[] = [
    {
      id: "frontend-dashboard",
      name: "Dashboard Frontend",
      status: "UP",
      dependencies: ["status-api", "auth-service"],
      dependents: [],
      criticality: "high",
      responseTime: 45,
      errorRate: 0.1,
    },
    {
      id: "status-api",
      name: "Status API",
      status: "UP",
      dependencies: ["database", "cache-redis"],
      dependents: ["frontend-dashboard", "mobile-app"],
      criticality: "high",
      responseTime: 120,
      errorRate: 0.2,
    },
    {
      id: "auth-service",
      name: "Authentication Service",
      status: "UP",
      dependencies: ["database", "ldap-server"],
      dependents: ["frontend-dashboard", "mobile-app", "admin-panel"],
      criticality: "high",
      responseTime: 89,
      errorRate: 0.05,
    },
    {
      id: "database",
      name: "PostgreSQL Database",
      status: "WARNING",
      dependencies: [],
      dependents: ["status-api", "auth-service", "reporting-service"],
      criticality: "high",
      responseTime: 245,
      errorRate: 0.8,
    },
    {
      id: "cache-redis",
      name: "Redis Cache",
      status: "UP",
      dependencies: [],
      dependents: ["status-api", "reporting-service"],
      criticality: "medium",
      responseTime: 12,
      errorRate: 0.01,
    },
    {
      id: "reporting-service",
      name: "Reporting Service",
      status: "DOWN",
      dependencies: ["database", "cache-redis"],
      dependents: ["admin-panel"],
      criticality: "medium",
      responseTime: 0,
      errorRate: 100,
    },
    {
      id: "mobile-app",
      name: "Mobile Application",
      status: "UP",
      dependencies: ["status-api", "auth-service"],
      dependents: [],
      criticality: "medium",
      responseTime: 156,
      errorRate: 0.3,
    },
    {
      id: "admin-panel",
      name: "Admin Panel",
      status: "UP",
      dependencies: ["auth-service", "reporting-service"],
      dependents: [],
      criticality: "low",
      responseTime: 234,
      errorRate: 2.1,
    },
    {
      id: "ldap-server",
      name: "LDAP Server",
      status: "UP",
      dependencies: [],
      dependents: ["auth-service"],
      criticality: "medium",
      responseTime: 67,
      errorRate: 0.02,
    },
  ];

  useEffect(() => {
    drawDependencyGraph();
  }, [selectedService, viewMode]);

  const drawDependencyGraph = () => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Calculate positions and connections
    const filteredNodes = getFilteredNodes();
    const positions = calculateNodePositions(filteredNodes);

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.background = "transparent";

    // Draw connections first (so they appear behind nodes)
    drawConnections(svg, filteredNodes, positions);

    // Draw nodes
    drawNodes(svg, filteredNodes, positions);

    containerRef.current.appendChild(svg);
  };

  const getFilteredNodes = () => {
    if (!selectedService || selectedService === "all") return serviceNodes;

    const selected = serviceNodes.find((s) => s.id === selectedService);
    if (!selected) return serviceNodes;

    let filtered = [selected];

    if (viewMode === "all" || viewMode === "dependencies") {
      // Add all dependencies recursively
      const addDependencies = (
        nodeId: string,
        visited: Set<string> = new Set()
      ) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = serviceNodes.find((s) => s.id === nodeId);
        if (!node) return;

        node.dependencies.forEach((depId) => {
          const depNode = serviceNodes.find((s) => s.id === depId);
          if (depNode && !filtered.includes(depNode)) {
            filtered.push(depNode);
          }
          addDependencies(depId, visited);
        });
      };
      addDependencies(selectedService);
    }

    if (viewMode === "all" || viewMode === "dependents") {
      // Add all dependents recursively
      const addDependents = (
        nodeId: string,
        visited: Set<string> = new Set()
      ) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = serviceNodes.find((s) => s.id === nodeId);
        if (!node) return;

        node.dependents.forEach((depId) => {
          const depNode = serviceNodes.find((s) => s.id === depId);
          if (depNode && !filtered.includes(depNode)) {
            filtered.push(depNode);
          }
          addDependents(depId, visited);
        });
      };
      addDependents(selectedService);
    }

    return filtered;
  };

  const calculateNodePositions = (nodes: ServiceNode[]) => {
    const positions: { [key: string]: { x: number; y: number } } = {};

    // Simple layered layout
    const layers: { [key: number]: ServiceNode[] } = {};

    // Calculate layer for each node based on dependency depth
    const calculateLayer = (
      nodeId: string,
      visited: Set<string> = new Set()
    ): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node || node.dependencies.length === 0) return 0;

      const depLayers = node.dependencies
        .map((depId) => calculateLayer(depId, new Set(visited)))
        .filter((layer) => layer !== undefined);

      return depLayers.length > 0 ? Math.max(...depLayers) + 1 : 0;
    };

    nodes.forEach((node) => {
      const layer = calculateLayer(node.id);
      if (!layers[layer]) layers[layer] = [];
      layers[layer].push(node);
    });

    // Position nodes in layers
    const layerKeys = Object.keys(layers)
      .map(Number)
      .sort((a, b) => a - b);
    const containerWidth = 800;
    const containerHeight = 400;
    const layerHeight = containerHeight / (layerKeys.length + 1);

    layerKeys.forEach((layerIndex, index) => {
      const nodesInLayer = layers[layerIndex];
      const nodeWidth = containerWidth / (nodesInLayer.length + 1);

      nodesInLayer.forEach((node, nodeIndex) => {
        positions[node.id] = {
          x: nodeWidth * (nodeIndex + 1),
          y: layerHeight * (index + 1),
        };
      });
    });

    return positions;
  };

  const drawConnections = (
    svg: SVGElement,
    nodes: ServiceNode[],
    positions: { [key: string]: { x: number; y: number } }
  ) => {
    nodes.forEach((node) => {
      node.dependencies.forEach((depId) => {
        const fromPos = positions[depId];
        const toPos = positions[node.id];

        if (fromPos && toPos) {
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", fromPos.x.toString());
          line.setAttribute("y1", fromPos.y.toString());
          line.setAttribute("x2", toPos.x.toString());
          line.setAttribute("y2", toPos.y.toString());
          line.setAttribute("stroke", getConnectionColor(node, depId));
          line.setAttribute("stroke-width", "2");
          line.setAttribute("marker-end", "url(#arrowhead)");

          svg.appendChild(line);
        }
      });
    });

    // Add arrowhead marker
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "10");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
    polygon.setAttribute("fill", "#666");

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  };

  const drawNodes = (
    svg: SVGElement,
    nodes: ServiceNode[],
    positions: { [key: string]: { x: number; y: number } }
  ) => {
    nodes.forEach((node) => {
      const pos = positions[node.id];
      if (!pos) return;

      // Node circle
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", pos.x.toString());
      circle.setAttribute("cy", pos.y.toString());
      circle.setAttribute("r", "30");
      circle.setAttribute("fill", getNodeColor(node.status));
      circle.setAttribute("stroke", getNodeBorderColor(node.criticality));
      circle.setAttribute("stroke-width", "3");
      circle.style.cursor = "pointer";

      circle.addEventListener("click", () => {
        setSelectedService(node.id === selectedService ? "all" : node.id);
      });

      svg.appendChild(circle);

      // Node label
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", pos.x.toString());
      text.setAttribute("y", (pos.y + 50).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "currentColor");
      text.setAttribute("font-size", "12");
      text.setAttribute("font-weight", "bold");
      text.textContent = node.name;

      svg.appendChild(text);

      // Status indicator
      const statusCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      statusCircle.setAttribute("cx", (pos.x + 20).toString());
      statusCircle.setAttribute("cy", (pos.y - 20).toString());
      statusCircle.setAttribute("r", "6");
      statusCircle.setAttribute("fill", getStatusIndicatorColor(node.status));
      statusCircle.setAttribute("stroke", "white");
      statusCircle.setAttribute("stroke-width", "2");

      svg.appendChild(statusCircle);
    });
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case "UP":
        return "#10b981";
      case "DOWN":
        return "#ef4444";
      case "WARNING":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getNodeBorderColor = (criticality: string) => {
    switch (criticality) {
      case "high":
        return "#dc2626";
      case "medium":
        return "#d97706";
      case "low":
        return "#059669";
      default:
        return "#6b7280";
    }
  };

  const getStatusIndicatorColor = (status: string) => {
    switch (status) {
      case "UP":
        return "#22c55e";
      case "DOWN":
        return "#ef4444";
      case "WARNING":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  const getConnectionColor = (node: ServiceNode, depId: string) => {
    const depNode = serviceNodes.find((s) => s.id === depId);
    if (!depNode) return "#6b7280";

    if (depNode.status === "DOWN") return "#ef4444";
    if (depNode.status === "WARNING" || node.status === "WARNING")
      return "#f59e0b";
    return "#10b981";
  };

  const findCriticalPath = () => {
    // Find the path from most critical failing service to dependents
    const failingCritical = serviceNodes.filter(
      (s) => s.status !== "UP" && s.criticality === "high"
    );

    if (failingCritical.length > 0) {
      const path: string[] = [];
      const addDependents = (
        nodeId: string,
        visited: Set<string> = new Set()
      ) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        path.push(nodeId);

        const node = serviceNodes.find((s) => s.id === nodeId);
        if (node) {
          node.dependents.forEach((depId) => addDependents(depId, visited));
        }
      };

      addDependents(failingCritical[0].id);
      setCriticalPath(path);
    }
  };

  useEffect(() => {
    findCriticalPath();
  }, []);

  const selectedServiceData = serviceNodes.find(
    (s) => s.id === selectedService
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Service Dependency Graph
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {serviceNodes.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={viewMode}
              onValueChange={(value: any) => setViewMode(value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="dependencies">Dependencies</SelectItem>
                <SelectItem value="dependents">Dependents</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={drawDependencyGraph}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {criticalPath.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              Critical failure affecting {criticalPath.length} services
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex gap-4">
          <div
            ref={containerRef}
            className="flex-1 h-96 border rounded-lg bg-gray-50 dark:bg-gray-900 relative overflow-hidden"
          />

          {selectedServiceData && (
            <div className="w-64 space-y-4">
              <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedServiceData.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      variant={
                        selectedServiceData.status === "UP"
                          ? "default"
                          : selectedServiceData.status === "WARNING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedServiceData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Criticality:</span>
                    <Badge
                      variant={
                        selectedServiceData.criticality === "high"
                          ? "destructive"
                          : selectedServiceData.criticality === "medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {selectedServiceData.criticality}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Dependencies:</span>
                    <span>{selectedServiceData.dependencies.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dependents:</span>
                    <span>{selectedServiceData.dependents.length}</span>
                  </div>
                  {selectedServiceData.responseTime !== undefined && (
                    <div className="flex justify-between">
                      <span>Response:</span>
                      <span
                        className={
                          selectedServiceData.responseTime > 200
                            ? "text-red-500"
                            : selectedServiceData.responseTime > 100
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {selectedServiceData.responseTime}ms
                      </span>
                    </div>
                  )}
                  {selectedServiceData.errorRate !== undefined && (
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span
                        className={
                          selectedServiceData.errorRate > 5
                            ? "text-red-500"
                            : selectedServiceData.errorRate > 1
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {selectedServiceData.errorRate}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                <h4 className="font-medium mb-2">Legend</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 border border-red-800 rounded-full"></div>
                    <span>High Criticality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-600 border border-yellow-800 rounded-full"></div>
                    <span>Medium Criticality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 border border-green-800 rounded-full"></div>
                    <span>Low Criticality</span>
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
