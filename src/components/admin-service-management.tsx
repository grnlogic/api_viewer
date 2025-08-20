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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Service Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, and manage your monitored services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchServices} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add/Edit Service Form */}
        <div>
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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Existing Services ({services.length})
          </h2>

          {services.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No services found. Add your first service using the form.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {services.map((service) => (
                <Card key={service.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {service.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={getStatusBadgeVariant(service.status)}
                          >
                            {service.status || "Unknown"}
                          </Badge>
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit service"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
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
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <strong>URL:</strong> {service.url}
                      </p>
                      {service.description && (
                        <p>
                          <strong>Description:</strong> {service.description}
                        </p>
                      )}
                      <p>
                        <strong>Created:</strong>{" "}
                        {formatDate(service.createdAt)}
                      </p>
                      {service.updatedAt !== service.createdAt && (
                        <p>
                          <strong>Updated:</strong>{" "}
                          {formatDate(service.updatedAt)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
