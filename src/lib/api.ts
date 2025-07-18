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
  STATUS_OVERVIEW: "/api/status/overview",
  STATUS_HISTORY: (serviceId: string, days = 90) =>
    `/api/status/history/${serviceId}?days=${days}`,
  METRICS: (serviceId: string, days = 90) =>
    `/api/metrics/${serviceId}?days=${days}`,
  SYSTEM_HEALTH: "/api/health/system",
  REMOTE_HEALTH: "/api/remote-health/rekap-penjualan",
  REMOTE_HEALTH_LAPORAN_HARIAN: "/api/remote-health/laporan-harian",
  WEBHOOKS_STATUS: "/api/webhooks/status",
  SSE_STATUS: "/api/sse/status",
};
