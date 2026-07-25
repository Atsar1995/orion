import type { ProviderCapability, ProviderHealth, ProviderStatus } from "@/types/providers";

/** Integration Center category taxonomy. */
export type IntegrationCategory =
  | "marketing"
  | "crm"
  | "finance"
  | "hospitality"
  | "commerce"
  | "communication"
  | "ai"
  | "analytics"
  | "storage"
  | "developer";

/** Supported authentication modes for the connection wizard. */
export type IntegrationAuthType = "oauth2" | "api-key" | "service-account" | "manual";

/** Provider implementation class exposed in the Integration Center. */
export type IntegrationProviderType = "live" | "mock" | "plugin";

/** Credential readiness for a provider connection. */
export type CredentialStatus = "configured" | "missing" | "expiring" | "not-required";

/** Sync activity log entry for Integration Center history. */
export type IntegrationSyncEvent = {
  id: string;
  providerId: string;
  providerName: string;
  action: "connect" | "disconnect" | "sync" | "refresh" | "health-check" | "reconnect";
  success: boolean;
  message: string;
  timestamp: string;
};

/** Integration log entry for admin log viewer. */
export type IntegrationLogEntry = {
  id: string;
  providerId: string;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
};

/** Provider record rendered in the Integration Center. */
export type IntegrationProviderRecord = {
  id: string;
  name: string;
  version: string;
  status: ProviderStatus;
  health: ProviderHealth;
  lastSync?: string;
  connectedAt?: string;
  capabilities: ProviderCapability[];
  authType: IntegrationAuthType;
  permissions: string[];
  providerType: IntegrationProviderType;
  category: IntegrationCategory;
  enabled: boolean;
  workspace?: string;
  credentialStatus: CredentialStatus;
  tokenExpiresAt?: string;
};

/** Dashboard summary for the Integration Center header. */
export type IntegrationCenterDashboard = {
  connectedProviders: number;
  disconnectedProviders: number;
  healthyProviders: number;
  unhealthyProviders: number;
  failedConnections: number;
  upcomingTokenExpirations: number;
  recentSyncActivity: IntegrationSyncEvent[];
};

/** Full snapshot consumed by the Integration Center page. */
export type IntegrationCenterSnapshot = {
  generatedAt: string;
  dashboard: IntegrationCenterDashboard;
  providers: IntegrationProviderRecord[];
  categories: IntegrationCategory[];
  syncHistory: IntegrationSyncEvent[];
  logs: IntegrationLogEntry[];
};

/** Wizard auth mode selection. */
export type ConnectionWizardMode = IntegrationAuthType;

/** Category display metadata. */
export type IntegrationCategoryMeta = {
  id: IntegrationCategory;
  label: string;
  description: string;
};

export const INTEGRATION_CATEGORIES: IntegrationCategoryMeta[] = [
  { id: "marketing", label: "Marketing", description: "Campaigns, ads, and audience analytics" },
  { id: "crm", label: "CRM", description: "Customer relationships and pipeline data" },
  { id: "finance", label: "Finance", description: "Revenue, expenses, and cash flow" },
  { id: "hospitality", label: "Hospitality", description: "Occupancy, guest experience, and operations" },
  { id: "commerce", label: "Commerce", description: "Orders, catalogue, and storefront data" },
  { id: "communication", label: "Communication", description: "Email, calendar, and messaging" },
  { id: "ai", label: "AI", description: "AI skills and inference services" },
  { id: "analytics", label: "Analytics", description: "Web and product analytics connectors" },
  { id: "storage", label: "Storage", description: "File and object storage integrations" },
  { id: "developer", label: "Developer", description: "Developer tools and source control" },
];

export const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> =
  INTEGRATION_CATEGORIES.reduce(
    (accumulator, category) => {
      accumulator[category.id] = category.label;
      return accumulator;
    },
    {} as Record<IntegrationCategory, string>,
  );
