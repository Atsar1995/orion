/** Operational status of an ORION integration provider (ES-060). */
export type ProviderStatus = "connected" | "disconnected" | "syncing" | "error";

/** Capability exposed by a registered provider. */
export type ProviderCapability =
  | "metrics"
  | "alerts"
  | "recommendations"
  | "brief"
  | "tasks"
  | "trends"
  | "calendar"
  | "email"
  | "health";

/** Runtime health of a provider connection. */
export type ProviderHealth = {
  status: ProviderStatus;
  healthy: boolean;
  lastCheckedAt: string;
  message?: string;
};

/** Connection state for a provider. */
export type ProviderConnection = {
  connected: boolean;
  connectedAt?: string;
  lastSyncAt?: string;
};

/** Provider registration and runtime configuration. */
export type ProviderConfig = {
  id: string;
  name: string;
  enabled: boolean;
  mock?: boolean;
  workspace?: string;
};

/** Standard async result envelope for provider operations. */
export type ProviderResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  providerId: string;
  timestamp: string;
};

/** Core provider contract — ES-060 · ES-065 integration boundary. */
export interface Provider {
  readonly id: string;
  readonly name: string;
  readonly config: ProviderConfig;
  connect(): Promise<ProviderResult<ProviderConnection>>;
  disconnect(): Promise<ProviderResult<void>>;
  healthCheck(): Promise<ProviderResult<ProviderHealth>>;
  sync(): Promise<ProviderResult<void>>;
  refresh(): Promise<ProviderResult<void>>;
  getCapabilities(): ProviderCapability[];
}

/** Aggregated health report for all registered providers. */
export type ProviderHealthReport = {
  generatedAt: string;
  total: number;
  healthy: number;
  unhealthy: number;
  providers: Array<{
    id: string;
    name: string;
    health: ProviderHealth;
  }>;
};

/** Dashboard fragment contributed by a workspace or integration provider. */
export type ProviderDashboardContribution = {
  providerId: string;
  workspace?: string;
  metric?: import("@/types/intelligence").ExecutiveMetric;
  healthDriver?: import("@/types/intelligence").BusinessHealthDriver;
  recommendations?: import("@/types/intelligence").Recommendation[];
  alerts?: import("@/types/intelligence").Alert[];
  trends?: import("@/types/intelligence").Trend[];
  briefSegments?: string[];
  tasks?: import("@/types/intelligence").ExecutiveTask[];
};

/** Provider that supplies executive dashboard intelligence data. */
export interface DashboardDataProvider extends Provider {
  fetchDashboardContribution(): Promise<ProviderResult<ProviderDashboardContribution>>;
}
