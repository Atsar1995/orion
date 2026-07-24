/** ORION Platform version for Executive Intelligence. */
export const PLATFORM_VERSION = "2.0.0";

/** Current Executive Provider interface version. */
export const PROVIDER_VERSION = "1.0.0";

/** Supported provider versions accepted by the registry. */
export const SUPPORTED_PROVIDER_VERSIONS = ["1.0.0"] as const;

/** Registered workspace identifiers — single source of truth. */
export const WORKSPACE_IDS = {
  FINANCE: "finance",
  CRM: "crm",
  HOSPITALITY: "hospitality",
  COMMERCE: "commerce",
  MARKETING: "marketing",
  OPERATIONS: "operations",
  HR: "hr",
  LEGAL: "legal",
  PROJECTS: "projects",
  PROCUREMENT: "procurement",
} as const;

/** Maximum providers permitted in the registry. */
export const REGISTRY_MAX_PROVIDERS = 32;

/** Default health score thresholds for platform classification. */
export const DEFAULT_HEALTH_THRESHOLDS = {
  healthy: 75,
  attention: 60,
  critical: 0,
} as const;

/** Default executive priority impact levels. */
export const DEFAULT_PRIORITY_LEVELS = ["high", "medium", "low"] as const;
