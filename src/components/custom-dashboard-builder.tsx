"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Save,
  Trash2,
  Settings,
  Grid3X3,
  BarChart3,
  Activity,
  Gauge,
  Eye,
  Edit,
  Download,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ResponseTimeChart } from "@/components/response-time-chart";
import { apiCall, API_ENDPOINTS } from "@/lib/api";

// Dynamically import react-grid-layout to avoid SSR issues
const GridLayout = dynamic<any>(
  async () => {
    const mod: any = await import("react-grid-layout");
    const Responsive = mod?.Responsive ?? mod?.default?.Responsive;
    const WidthProvider = mod?.WidthProvider ?? mod?.default?.WidthProvider;
    if (!Responsive) {
      throw new Error("react-grid-layout Responsive export not found");
    }
    // Prefer width provider if available
    return WidthProvider ? WidthProvider(Responsive) : Responsive;
  },
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center">Loading dashboard builder...</div>
    ),
  }
);

interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "status" | "table" | "heatmap" | "topology";
  title: string;
  dataSource: string;
  config: any;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: any[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomDashboardBuilderProps {
  className?: string;
}

const widgetTypes = [
  {
    id: "chart",
    name: "Chart",
    icon: BarChart3,
    description: "Line, bar, or pie charts",
  },
  {
    id: "metric",
    name: "Metric Card",
    icon: Gauge,
    description: "Single metric display",
  },
  {
    id: "status",
    name: "Status Grid",
    icon: Grid3X3,
    description: "Service status overview",
  },
  {
    id: "table",
    name: "Data Table",
    icon: Activity,
    description: "Tabular data display",
  },
  {
    id: "heatmap",
    name: "Heatmap",
    icon: Activity,
    description: "Performance heatmap",
  },
  {
    id: "topology",
    name: "Network Map",
    icon: Activity,
    description: "Network topology",
  },
];

const dataSources = [
  { id: "services", name: "Services Status" },
  { id: "metrics", name: "Performance Metrics" },
  { id: "logs", name: "System Logs" },
  { id: "alerts", name: "Alert History" },
  { id: "uptime", name: "Uptime Statistics" },
  { id: "response_time", name: "Response Time" },
];

export function CustomDashboardBuilder({
  className,
}: CustomDashboardBuilderProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState("");
  const [newWidgetTitle, setNewWidgetTitle] = useState("");
  const [newWidgetDataSource, setNewWidgetDataSource] = useState("");
  const [layouts, setLayouts] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);

  // Sample dashboards
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await apiCall(API_ENDPOINTS.SERVICES);

        // Map services data dengan konversi status
        const mappedServices = servicesData.map((service: any) => ({
          id: service.id.toString(),
          name: service.name,
          responseTime: service.lastResponseTimeMs || 0,
          status: service.status, // Use backend status directly (UP/DOWN/ERROR)
        }));

        setServices(mappedServices);
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback to empty array if error
        setServices([]);
      }
    };

    fetchServices();

    // Refresh services data every 30 seconds
    const interval = setInterval(fetchServices, 30000);

    const sampleDashboards: Dashboard[] = [
      {
        id: "default",
        name: "System Overview",
        description: "Main monitoring dashboard",
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets: [
          {
            id: "widget-1",
            type: "status",
            title: "Service Status",
            dataSource: "services",
            config: { showDetails: true },
            layout: { x: 0, y: 0, w: 6, h: 4 },
          },
          {
            id: "widget-2",
            type: "chart",
            title: "Response Time Trends",
            dataSource: "response_time",
            config: { chartType: "line", timeRange: "24h" },
            layout: { x: 6, y: 0, w: 6, h: 4 },
          },
          {
            id: "widget-3",
            type: "metric",
            title: "System CPU",
            dataSource: "metrics",
            config: { metric: "cpu_usage", threshold: 80 },
            layout: { x: 0, y: 4, w: 3, h: 3 },
          },
          {
            id: "widget-4",
            type: "metric",
            title: "Memory Usage",
            dataSource: "metrics",
            config: { metric: "memory_usage", threshold: 85 },
            layout: { x: 3, y: 4, w: 3, h: 3 },
          },
        ],
        layout: [],
      },
      {
        id: "performance",
        name: "Performance Analytics",
        description: "Detailed performance monitoring",
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets: [
          {
            id: "widget-5",
            type: "heatmap",
            title: "Performance Heatmap",
            dataSource: "metrics",
            config: { metric: "response_time" },
            layout: { x: 0, y: 0, w: 8, h: 6 },
          },
          {
            id: "widget-6",
            type: "topology",
            title: "Network Topology",
            dataSource: "services",
            config: { showMetrics: true },
            layout: { x: 8, y: 0, w: 4, h: 6 },
          },
        ],
        layout: [],
      },
    ];

    setDashboards(sampleDashboards);
    setCurrentDashboard(sampleDashboards[0]);

    return () => clearInterval(interval);
  }, []);

  const handleAddWidget = () => {
    if (
      !currentDashboard ||
      !selectedWidgetType ||
      !newWidgetTitle ||
      !newWidgetDataSource
    )
      return;

    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: selectedWidgetType as any,
      title: newWidgetTitle,
      dataSource: newWidgetDataSource,
      config: {},
      layout: { x: 0, y: 0, w: 6, h: 4 },
    };

    const updatedDashboard = {
      ...currentDashboard,
      widgets: [...currentDashboard.widgets, newWidget],
      updatedAt: new Date().toISOString(),
    };

    setCurrentDashboard(updatedDashboard);
    setDashboards((prev) =>
      prev.map((d) => (d.id === updatedDashboard.id ? updatedDashboard : d))
    );

    // Reset form
    setShowAddWidget(false);
    setSelectedWidgetType("");
    setNewWidgetTitle("");
    setNewWidgetDataSource("");
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    const updatedDashboard = {
      ...currentDashboard,
      widgets: currentDashboard.widgets.filter((w) => w.id !== widgetId),
      updatedAt: new Date().toISOString(),
    };

    setCurrentDashboard(updatedDashboard);
    setDashboards((prev) =>
      prev.map((d) => (d.id === updatedDashboard.id ? updatedDashboard : d))
    );
  };

  const handleLayoutChange = (layout: any, layouts: any) => {
    if (!currentDashboard || !isEditing) return;

    const updatedWidgets = currentDashboard.widgets.map((widget) => {
      const layoutItem = layout.find((l: any) => l.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          layout: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          },
        };
      }
      return widget;
    });

    const updatedDashboard = {
      ...currentDashboard,
      widgets: updatedWidgets,
      updatedAt: new Date().toISOString(),
    };

    setCurrentDashboard(updatedDashboard);
    setLayouts(layouts);
  };

  const handleSaveDashboard = () => {
    if (!currentDashboard) return;

    setDashboards((prev) =>
      prev.map((d) => (d.id === currentDashboard.id ? currentDashboard : d))
    );
    setIsEditing(false);
  };

  const handleCreateNewDashboard = () => {
    const newDashboard: Dashboard = {
      id: `dashboard-${Date.now()}`,
      name: "New Dashboard",
      description: "Custom dashboard",
      widgets: [],
      layout: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDashboards((prev) => [...prev, newDashboard]);
    setCurrentDashboard(newDashboard);
    setIsEditing(true);
  };

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      className: "h-full",
    };

    switch (widget.type) {
      case "status":
        return (
          <Card key={widget.id} {...commonProps}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="default">API: UP</Badge>
                <Badge variant="destructive">DB: DOWN</Badge>
                <Badge variant="secondary">Cache: WARNING</Badge>
                <Badge variant="default">Auth: UP</Badge>
              </div>
            </CardContent>
          </Card>
        );

      case "metric":
        return (
          <Card key={widget.id} {...commonProps}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">67%</div>
                <div className="text-sm text-gray-500">Current Usage</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "67%" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "chart":
        // Check if this is specifically a response time chart
        if (
          widget.title.toLowerCase().includes("response time") ||
          widget.dataSource === "response_time"
        ) {
          return (
            <div key={widget.id} className={commonProps.className}>
              <ResponseTimeChart services={services} />
            </div>
          );
        }

        // Default chart visualization for other chart types
        return (
          <Card key={widget.id} {...commonProps}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-full flex items-center justify-center text-gray-500">
                <BarChart3 className="h-12 w-12" />
                <span className="ml-2">Chart Visualization</span>
              </div>
            </CardContent>
          </Card>
        );

      case "table":
        return (
          <Card key={widget.id} {...commonProps}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs">
                <div className="grid grid-cols-3 gap-1 font-semibold mb-1">
                  <div>Service</div>
                  <div>Status</div>
                  <div>Uptime</div>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  <div>API</div>
                  <div>UP</div>
                  <div>99.9%</div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div>DB</div>
                  <div>DOWN</div>
                  <div>95.2%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card key={widget.id} {...commonProps}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-full flex items-center justify-center text-gray-500">
                <Activity className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  if (!currentDashboard) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-4">No Dashboard Selected</h3>
          <Button onClick={handleCreateNewDashboard}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Dashboard Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                {isEditing ? (
                  <Input
                    value={currentDashboard.name}
                    onChange={(e) =>
                      setCurrentDashboard({
                        ...currentDashboard,
                        name: e.target.value,
                      })
                    }
                    className="w-64"
                  />
                ) : (
                  currentDashboard.name
                )}
                {currentDashboard.isPublic && (
                  <Badge variant="outline">Public</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? (
                  <Input
                    value={currentDashboard.description}
                    onChange={(e) =>
                      setCurrentDashboard({
                        ...currentDashboard,
                        description: e.target.value,
                      })
                    }
                    className="w-96"
                  />
                ) : (
                  currentDashboard.description
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <Select
                value={currentDashboard.id}
                onValueChange={(value) => {
                  const dashboard = dashboards.find((d) => d.id === value);
                  if (dashboard) setCurrentDashboard(dashboard);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dashboards.map((dashboard) => (
                    <SelectItem key={dashboard.id} value={dashboard.id}>
                      {dashboard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isEditing ? (
                <>
                  <Button onClick={handleSaveDashboard}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </>
              )}

              <Button variant="outline" onClick={handleCreateNewDashboard}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Widget Panel */}
      {isEditing && showAddWidget && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Add New Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Widget Type
                </label>
                <Select
                  value={selectedWidgetType}
                  onValueChange={setSelectedWidgetType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {widgetTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  placeholder="Widget title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data Source
                </label>
                <Select
                  value={newWidgetDataSource}
                  onValueChange={setNewWidgetDataSource}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleAddWidget}>Add Widget</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddWidget(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Toolbar */}
      {isEditing && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddWidget(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Dashboard Settings
              </Button>
              <div className="text-sm text-gray-500 ml-auto">
                Drag widgets to rearrange • Resize by dragging corners
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div className="min-h-[600px]">
        {typeof window !== "undefined" && (
          <GridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={isEditing}
            isResizable={isEditing}
            margin={[16, 16]}
            useCSSTransforms={true}
          >
            {currentDashboard.widgets.map((widget) => (
              <div
                key={widget.id}
                data-grid={{
                  x: widget.layout.x,
                  y: widget.layout.y,
                  w: widget.layout.w,
                  h: widget.layout.h,
                  i: widget.id,
                }}
                className="relative group"
              >
                {renderWidget(widget)}
                {isEditing && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteWidget(widget.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
}
