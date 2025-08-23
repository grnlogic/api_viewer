// API configuration and helper functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://45.158.126.252:8082";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = "GET", headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// API endpoints
export const API_ENDPOINTS = {
  SERVICES: "/api/services",
  SERVICE_DETAIL: (id: string) => `/api/services/${id}`,
  SERVICE_CREATE: "/api/services",
  SERVICE_UPDATE: (id: string) => `/api/services/${id}`,
  SERVICE_DELETE: (id: string) => `/api/services/${id}`,
  STATUS_OVERVIEW: "/api/status/overview",
  STATUS_HISTORY: (serviceId: string, days = 90) =>
    `/api/status/history/${serviceId}?days=${days}`,
  METRICS: (serviceId: string, days = 90) =>
    `/api/metrics/${serviceId}?days=${days}`,
  SYSTEM_HEALTH: "/api/health/system",
  REMOTE_HEALTH: "/api/remote-health/rekap-penjualan",
  REMOTE_HEALTH_LAPORAN_HARIAN: "/api/remote-health/laporan-harian",
  REMOTE_BACKENDS: "/api/remote-health/backends",
  REMOTE_HEALTH_ALL: "/api/remote-health/status/all",
  REMOTE_HEALTH_BY_ID: (id: string) => `/api/remote-health/status/${id}`,
  WEBHOOKS_STATUS: "/api/webhooks/status",
  SSE_STATUS: "/api/sse/status",
  RESPONSE_TIME_TRENDS: (hours = 24) => `/api/response-time/trends?hours=${hours}`,
  RESPONSE_TIME_BY_SERVICE: "/api/response-time/by-service",
  RESPONSE_TIME_SERVICE: (serviceId: string, hours = 24) => 
    `/api/response-time/service/${serviceId}?hours=${hours}`,
};
