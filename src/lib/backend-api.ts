// src/lib/backend-api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://status-page-api.padudjayaputera.com";

export interface RemoteBackend {
  id?: number;
  name: string;
  url: string;
  healthEndpoint: string;
  description: string;
  enabled: boolean;
}

export interface RemoteHealthStatus {
  status: string;
  message?: string;
  timestamp?: string;
  backend?: RemoteBackend;
}

/**
 * Fetch all remote backends from database
 */
export async function fetchRemoteBackends(): Promise<RemoteBackend[]> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/backends`);
  if (!response.ok) {
    throw new Error(`Failed to fetch backends: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Add a new remote backend
 */
export async function addRemoteBackend(backend: Omit<RemoteBackend, 'id'>): Promise<RemoteBackend> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/backends`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backend),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add backend: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Update an existing remote backend
 */
export async function updateRemoteBackend(id: number, backend: Omit<RemoteBackend, 'id'>): Promise<RemoteBackend> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/backends/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backend),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update backend: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Delete a remote backend
 */
export async function deleteRemoteBackend(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/backends/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete backend: ${response.status} ${response.statusText}`);
  }
}

/**
 * Bulk add/update remote backends
 */
export async function bulkUpdateRemoteBackends(backends: Omit<RemoteBackend, 'id'>[]): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/backends/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backends),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to bulk update backends: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Seed default backends (only if database is empty)
 */
export async function seedDefaultBackends(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/backends/seed`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to seed backends: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get health status for all backends
 */
export async function fetchAllRemoteHealth(): Promise<Record<string, RemoteHealthStatus>> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/status/all`);
  if (!response.ok) {
    throw new Error(`Failed to fetch health status: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get health status for specific backend by ID
 */
export async function fetchRemoteHealthById(backendId: number): Promise<RemoteHealthStatus> {
  const response = await fetch(`${API_BASE_URL}/api/remote-health/status/${backendId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch health status: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
