/** Hospitality workspace module constants (Mission P-007). */

export const HOSPITALITY_WORKSPACE_ID = "hospitality" as const;
export const HOSPITALITY_MODULE_KEY = "hospitality" as const;
export const HOSPITALITY_PROVIDER_ID = "hospitality" as const;
export const HOSPITALITY_WORKSPACE_LABEL = "Hospitality" as const;
export const HOSPITALITY_BASE_PATH = "/hospitality" as const;
export const HOSPITALITY_IIL_SERVICE_ID = "hospitality-workspace" as const;

export const HOSPITALITY_ROUTE_PERMISSIONS = {
  overview: { action: "read" as const },
  reservations: { action: "read" as const },
  guests: { action: "read" as const },
  rooms: { action: "read" as const },
  frontOffice: { action: "read" as const },
  housekeeping: { action: "read" as const },
  billing: { action: "read" as const },
  operations: { action: "read" as const },
  reports: { action: "read" as const },
  properties: { action: "read" as const },
  inventory: { action: "read" as const },
  settings: { action: "write" as const },
} as const;

export const DEFAULT_PROPERTY_ID = "prop-orania-heritage";
