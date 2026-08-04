import type { CrmCapabilityDescriptor } from "@/types/crm-core";

/** Workspace foundation capabilities for CRM platform foundation (P-008.9). */
export const CRM_FOUNDATION_CAPABILITIES: readonly CrmCapabilityDescriptor[] = [
  { key: "workspace", label: "CRM Workspace", status: "active", mission: "P-008.1" },
  { key: "parties", label: "Party Management", status: "active", mission: "P-008.2" },
  { key: "commercial", label: "Commercial Operations", status: "active", mission: "P-008.3" },
  { key: "agreements", label: "Agreements Registry", status: "active", mission: "P-008.4" },
  {
    key: "commercial_intelligence",
    label: "Commercial Intelligence",
    status: "active",
    mission: "P-008.5",
  },
  {
    key: "customer_intelligence",
    label: "Customer Intelligence",
    status: "active",
    mission: "P-008.6",
  },
  {
    key: "executive_dashboard",
    label: "Executive Dashboard",
    status: "active",
    mission: "P-008.7",
  },
  {
    key: "platform_foundation",
    label: "Platform Foundation",
    status: "active",
    mission: "P-008.9",
  },
  { key: "platform_persistence", label: "Platform Persistence", status: "planned", mission: "P-008.10" },
  { key: "rbac", label: "RBAC Catalog", status: "planned", mission: "P-008.11" },
  { key: "canonical_events", label: "Canonical Events", status: "planned", mission: "P-008.12" },
  { key: "rest_api", label: "REST API", status: "planned", mission: "P-008.13" },
];
