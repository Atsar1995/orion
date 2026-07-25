import { isGoogleAnalyticsConfigured } from "@/lib/providers/google-analytics/GA4Config";
import type {
  IntegrationAuthType,
  IntegrationCategory,
  IntegrationProviderType,
} from "@/lib/integrations/types";

export const PROVIDER_FRAMEWORK_VERSION = "1.0.0";

type ProviderMetadata = {
  category: IntegrationCategory;
  authType: IntegrationAuthType;
  providerType: IntegrationProviderType;
  version: string;
  permissions: string[];
};

/** Static integration metadata keyed by provider id — presentation layer only. */
export const PROVIDER_INTEGRATION_METADATA: Record<string, ProviderMetadata> = {
  crm: {
    category: "crm",
    authType: "manual",
    providerType: "mock",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["user-data", "metrics", "recommendations"],
  },
  finance: {
    category: "finance",
    authType: "manual",
    providerType: "mock",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["metrics", "alerts", "reports"],
  },
  marketing: {
    category: "marketing",
    authType: "manual",
    providerType: "mock",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["metrics", "recommendations", "trends"],
  },
  "google-analytics": {
    category: "analytics",
    authType: "oauth2",
    providerType: "live",
    version: "1.0.0",
    permissions: ["providers", "external-apis", "storage", "metrics"],
  },
  hospitality: {
    category: "hospitality",
    authType: "manual",
    providerType: "mock",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["metrics", "alerts", "recommendations"],
  },
  commerce: {
    category: "commerce",
    authType: "manual",
    providerType: "mock",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["metrics", "health"],
  },
  calendar: {
    category: "communication",
    authType: "manual",
    providerType: "mock",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["calendar", "tasks"],
  },
  email: {
    category: "communication",
    authType: "manual",
    providerType: "mock",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["email", "tasks", "notifications"],
  },
};

const PLUGIN_CATEGORY_MAP: Record<string, IntegrationCategory> = {
  analytics: "analytics",
  finance: "finance",
  ai: "ai",
  integration: "developer",
  productivity: "developer",
};

export function resolveProviderMetadata(providerId: string, mock?: boolean): ProviderMetadata {
  const known = PROVIDER_INTEGRATION_METADATA[providerId];

  if (known) {
    return known;
  }

  return {
    category: "developer",
    authType: "manual",
    providerType: mock ? "mock" : "live",
    version: PROVIDER_FRAMEWORK_VERSION,
    permissions: ["providers"],
  };
}

export function resolvePluginCategory(category: string): IntegrationCategory {
  return PLUGIN_CATEGORY_MAP[category] ?? "developer";
}

export function resolveCredentialStatus(
  providerId: string,
  authType: IntegrationAuthType,
): "configured" | "missing" | "not-required" {
  if (authType === "manual") {
    return "not-required";
  }

  if (providerId === "google-analytics") {
    return isGoogleAnalyticsConfigured() ? "configured" : "missing";
  }

  return "missing";
}

/** Maps plugin permission scopes to human-readable labels. */
export function formatPluginPermissions(scopes: string[]): string[] {
  return scopes.map((scope) => scope.replace(/-/g, " "));
}
