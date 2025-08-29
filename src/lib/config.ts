// src/lib/config.ts
import remoteBackendsConfig from '@/config/remote-backends.json';

export interface RemoteBackendConfig {
  name: string;
  url: string;
  healthEndpoint: string;
  description: string;
  enabled: boolean;
}

export interface RemoteBackendsConfig {
  backends: RemoteBackendConfig[];
}

/**
 * Get remote backends configuration from JSON file with optional environment variable overrides
 */
export function getRemoteBackendsConfig(): RemoteBackendConfig[] {
  const configBackends = (remoteBackendsConfig as RemoteBackendsConfig).backends;
  
  // Override URLs from environment variables if available
  return configBackends.map(backend => {
    const envKey = `REMOTE_BACKEND_${backend.name.toUpperCase().replace(/\s+/g, '_')}_URL`;
    const envUrl = process.env[envKey];
    
    return {
      ...backend,
      url: envUrl || backend.url
    };
  });
}

/**
 * Get remote backend config by name
 */
export function getRemoteBackendByName(name: string): RemoteBackendConfig | undefined {
  return getRemoteBackendsConfig().find(backend => backend.name === name);
}

/**
 * Get enabled remote backends only
 */
export function getEnabledRemoteBackends(): RemoteBackendConfig[] {
  return getRemoteBackendsConfig().filter(backend => backend.enabled);
}
