"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiCall, API_ENDPOINTS } from "@/lib/api";
import { Plus, X, AlertCircle, CheckCircle } from "lucide-react";

interface ServiceFormData {
  name: string;
  url: string;
  description: string;
}

interface AddServiceFormProps {
  onServiceAdded?: () => void;
}

export function AddServiceForm({ onServiceAdded }: AddServiceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    url: "",
    description: "",
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
      await apiCall(API_ENDPOINTS.SERVICE_CREATE, {
        method: "POST",
        body: formData,
      });

      setSuccess(true);
      setFormData({ name: "", url: "", description: "" });

      // Call the callback to refresh the services list
      if (onServiceAdded) {
        onServiceAdded();
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({ name: "", url: "", description: "" });
    setError(null);
    setSuccess(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add New Service
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add New Service</CardTitle>
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
                Service added successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Service"}
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
