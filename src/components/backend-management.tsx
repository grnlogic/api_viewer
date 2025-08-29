"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  fetchRemoteBackends,
  addRemoteBackend,
  updateRemoteBackend,
  deleteRemoteBackend,
  RemoteBackend,
} from "@/lib/backend-api";
import { Plus, Edit, Trash2, Save, X, Database, RefreshCw } from "lucide-react";

export function BackendManagement() {
  const [backends, setBackends] = useState<RemoteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<RemoteBackend>>({
    name: "",
    url: "",
    healthEndpoint: "/api/health/status",
    description: "",
    enabled: true,
  });

  const loadBackends = async () => {
    try {
      setLoading(true);
      const data = await fetchRemoteBackends();
      setBackends(data);
    } catch (error) {
      console.error("Failed to load backends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackends();
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        // Update existing
        await updateRemoteBackend(
          editingId,
          formData as Omit<RemoteBackend, "id">
        );
      } else {
        // Add new
        await addRemoteBackend(formData as Omit<RemoteBackend, "id">);
      }

      // Reload data
      await loadBackends();

      // Reset form
      setFormData({
        name: "",
        url: "",
        healthEndpoint: "/api/health/status",
        description: "",
        enabled: true,
      });
      setEditingId(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to save backend:", error);
      alert("Failed to save backend. Please check console for details.");
    }
  };

  const handleEdit = (backend: RemoteBackend) => {
    setFormData({
      name: backend.name,
      url: backend.url,
      healthEndpoint: backend.healthEndpoint,
      description: backend.description,
      enabled: backend.enabled,
    });
    setEditingId(backend.id!);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteRemoteBackend(id);
        await loadBackends();
      } catch (error) {
        console.error("Failed to delete backend:", error);
        alert("Failed to delete backend. Please check console for details.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      url: "",
      healthEndpoint: "/api/health/status",
      description: "",
      enabled: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backend Management
              </CardTitle>
              <CardDescription>
                Manage remote backend configurations stored in database
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadBackends}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Backend
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? "Edit Backend" : "Add New Backend"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      Backend Name
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Rekap Penjualan"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="url"
                      className="block text-sm font-medium mb-1"
                    >
                      Backend URL
                    </label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="https://api.example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="healthEndpoint"
                    className="block text-sm font-medium mb-1"
                  >
                    Health Check Endpoint
                  </label>
                  <Input
                    id="healthEndpoint"
                    value={formData.healthEndpoint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        healthEndpoint: e.target.value,
                      })
                    }
                    placeholder="/api/health/status"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: any) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this backend service"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e: any) =>
                      setFormData({ ...formData, enabled: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium">
                    Enabled
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? "Update" : "Save"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backends List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading backends...</p>
              </div>
            ) : backends.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  No Backends Configured
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your first backend to start monitoring.
                </p>
              </div>
            ) : (
              backends.map((backend) => (
                <Card key={backend.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{backend.name}</h3>
                          <Badge
                            variant={backend.enabled ? "default" : "secondary"}
                          >
                            {backend.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">URL:</span>{" "}
                            <code className="bg-gray-100 px-1 rounded">
                              {backend.url}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium">
                              Health Endpoint:
                            </span>{" "}
                            <code className="bg-gray-100 px-1 rounded">
                              {backend.healthEndpoint}
                            </code>
                          </div>
                          {backend.description && (
                            <div>
                              <span className="font-medium">Description:</span>{" "}
                              {backend.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(backend)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() =>
                            handleDelete(backend.id!, backend.name)
                          }
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
