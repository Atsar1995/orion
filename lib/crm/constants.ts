/** CRM workspace module constants (CTO-008 v2). */

export const CRM_IIL_SERVICE_ID = "crm-workspace" as const;

export const CRM_WORKSPACE_ID = "crm" as const;

export const CRM_MODULE_KEY = "crm" as const;

export const CRM_PROVIDER_ID = "crm" as const;

export const CRM_WORKSPACE_LABEL = "Customer Intelligence" as const;

export const CRM_BASE_PATH = "/crm" as const;

/** Route permission metadata — enforced when RBAC ships (ES-009). */
export const CRM_ROUTE_PERMISSIONS = {
  overview: { action: "read" as const },
  customers: { action: "read" as const },
  parties: { action: "read" as const },
  companies: { action: "read" as const },
  opportunities: { action: "read" as const },
  leads: { action: "read" as const },
  forecast: { action: "read" as const },
  proposals: { action: "read" as const },
  contracts: { action: "read" as const },
  rateAgreements: { action: "read" as const },
  renewals: { action: "read" as const },
  analytics: { action: "read" as const },
  customerAnalytics: { action: "read" as const },
  executive: { action: "read" as const },
  activities: { action: "read" as const },
  insights: { action: "read" as const },
  relationships: { action: "read" as const },
  activity: { action: "read" as const },
  communications: { action: "read" as const },
  reports: { action: "read" as const },
  settings: { action: "write" as const },
} as const;
