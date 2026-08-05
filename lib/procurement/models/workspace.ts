import type { ProcurementCapabilityDescriptor } from "@/lib/procurement/types/procurement-core";

/** Workspace foundation capabilities for Procurement platform foundation (P-010.3). */
export const PROCUREMENT_FOUNDATION_CAPABILITIES: readonly ProcurementCapabilityDescriptor[] = [
  {
    key: "platform_foundation",
    label: "Platform Foundation",
    status: "active",
    mission: "P-010.3",
  },
  {
    key: "platform_persistence",
    label: "Platform Persistence",
    status: "planned",
    mission: "P-010.4",
  },
  { key: "supplier_management", label: "Supplier Management", status: "planned", mission: "P-010.5" },
  { key: "requisitioning", label: "Requisitioning", status: "planned", mission: "P-010.6" },
  { key: "ordering", label: "Purchase Ordering", status: "planned", mission: "P-010.7" },
  { key: "rbac", label: "RBAC Catalog", status: "planned", mission: "P-010.8" },
  { key: "canonical_events", label: "Canonical Events", status: "planned", mission: "P-010.9" },
  { key: "rest_api", label: "REST API", status: "planned", mission: "P-010.10" },
];
