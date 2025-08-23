"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddServiceForm } from "@/components/add-service-form";
import { EditServiceForm } from "@/components/edit-service-form";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import {
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface Service {
  id: number;
  name: string;
  url: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall(API_ENDPOINTS.SERVICES);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await apiCall(API_ENDPOINTS.SERVICE_DELETE(id.toString()), {
        method: "DELETE",
      });

      // Refresh the list
      fetchServices();
    } catch (err) {
      alert(
        `Failed to delete service: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case "operational":
      case "up":
        return "default"; // green
      case "degraded":
        return "secondary"; // yellow
      case "outage":
      case "down":
        return "destructive"; // red
      default:
        return "outline"; // gray
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Settings className="h-8 w-8 text-blue-400" />
                </div>
                Service Management
              </h1>
              <p className="text-gray-300 text-lg">
                Add, edit, and manage your monitored services with ease
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {services.length} Active Services
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Real-time Monitoring
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={fetchServices}
                disabled={loading}
                className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 text-white"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="bg-red-900/20 border-red-500/50 text-red-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add/Edit Service Form */}
          <div className="space-y-6">
            {editingService ? (
              <EditServiceForm
                service={{
                  ...editingService,
                  description: editingService.description || "",
                }}
                onServiceUpdated={() => {
                  fetchServices();
                  setEditingService(null);
                }}
                onCancel={() => setEditingService(null)}
              />
            ) : (
              <AddServiceForm onServiceAdded={fetchServices} />
            )}
          </div>

          {/* Services List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                Existing Services
                <span className="text-lg text-gray-400">
                  ({services.length})
                </span>
              </h2>
            </div>

            {services.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-700/50 rounded-full">
                      <Settings className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-300 font-medium">
                        No services found
                      </p>
                      <p className="text-gray-400 text-sm">
                        Add your first service using the form to get started
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {services.map((service, index) => (
                  <Card
                    key={service.id}
                    className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <CardTitle className="text-xl text-white flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            {service.name}
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={getStatusBadgeVariant(service.status)}
                              className="font-medium"
                            >
                              {service.status || "Unknown"}
                            </Badge>
                            <a
                              href={service.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors p-1 hover:bg-blue-500/20 rounded"
                              title="Open service URL"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                            title="Edit service"
                            onClick={() => setEditingService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            onClick={() =>
                              handleDeleteService(service.id, service.name)
                            }
                            title="Delete service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-sm text-gray-300">
                            <span className="font-medium text-gray-200">
                              URL:
                            </span>{" "}
                            <span className="text-blue-400 break-all">
                              {service.url}
                            </span>
                          </p>
                        </div>
                        {service.description && (
                          <div className="p-3 bg-gray-900/50 rounded-lg">
                            <p className="text-sm text-gray-300">
                              <span className="font-medium text-gray-200">
                                Description:
                              </span>{" "}
                              {service.description}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Created:</span>
                            <span>{formatDate(service.createdAt)}</span>
                          </div>
                          {service.updatedAt !== service.createdAt && (
                            <div className="flex justify-between">
                              <span>Updated:</span>
                              <span>{formatDate(service.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(75, 85, 99, 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.7);
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
