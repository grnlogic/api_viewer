"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import { X, AlertCircle, CheckCircle, Edit } from "lucide-react";

interface ServiceFormData {
  name: string;
  url: string;
  description: string;
}

interface Service extends ServiceFormData {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface EditServiceFormProps {
  service: Service;
  onServiceUpdated?: () => void;
  onCancel?: () => void;
}

export function EditServiceForm({
  service,
  onServiceUpdated,
  onCancel,
}: EditServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: service.name,
    url: service.url,
    description: service.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Service name is required");
      return false;
    }
    if (!formData.url.trim()) {
      setError("Service URL is required");
      return false;
    }
    if (!formData.url.match(/^https?:\/\/.+/)) {
      setError("URL must start with http:// or https://");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await apiCall(API_ENDPOINTS.SERVICE_UPDATE(service.id.toString()), {
        method: "PUT",
        body: formData,
      });

      setSuccess(true);

      // Call the callback to refresh the services list
      if (onServiceUpdated) {
        onServiceUpdated();
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        if (onCancel) {
          onCancel();
        }
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Edit Service
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Service Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., API Gateway"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">
              Service URL *
            </label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://api.example.com/health"
              value={formData.url}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Optional description of the service"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Service updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
