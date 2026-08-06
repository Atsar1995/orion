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
    status: "active",
    mission: "P-010.4",
  },
  { key: "supplier_management", label: "Supplier Management", status: "active", mission: "P-010.7" },
  { key: "requisitioning", label: "Requisitioning", status: "active", mission: "P-010.8" },
  { key: "ordering", label: "Purchase Ordering", status: "active", mission: "P-010.9" },
  { key: "receiving", label: "Goods Receipt", status: "active", mission: "P-010.10" },
  { key: "invoicing", label: "Supplier Invoice", status: "active", mission: "P-010.11" },
  { key: "rbac", label: "RBAC Catalog", status: "active", mission: "P-010.5" },
  { key: "canonical_events", label: "Canonical Events", status: "active", mission: "P-010.6" },
  { key: "rest_api", label: "REST API", status: "active", mission: "P-010.12" },
];
