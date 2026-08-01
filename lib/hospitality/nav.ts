import type { WorkspaceNavItem } from "@/lib/workspace-nav";
import { HOSPITALITY_BASE_PATH, HOSPITALITY_ROUTE_PERMISSIONS } from "@/lib/hospitality/constants";

export type HospitalityNavItem = WorkspaceNavItem & {
  permission?: { action: "read" | "write" };
};

/** Hospitality workspace sub-navigation (Mission P-007). */
export const HOSPITALITY_NAV: HospitalityNavItem[] = [
  { label: "Overview", href: HOSPITALITY_BASE_PATH, permission: HOSPITALITY_ROUTE_PERMISSIONS.overview },
  { label: "Reservations", href: "/hospitality/reservations", permission: HOSPITALITY_ROUTE_PERMISSIONS.reservations },
  { label: "Guests", href: "/hospitality/guests", permission: HOSPITALITY_ROUTE_PERMISSIONS.guests },
  { label: "Properties", href: "/hospitality/properties", permission: HOSPITALITY_ROUTE_PERMISSIONS.properties },
  { label: "Inventory", href: "/hospitality/inventory", permission: HOSPITALITY_ROUTE_PERMISSIONS.inventory },
  { label: "Rooms", href: "/hospitality/rooms", permission: HOSPITALITY_ROUTE_PERMISSIONS.rooms },
  { label: "Front Office", href: "/hospitality/front-office", permission: HOSPITALITY_ROUTE_PERMISSIONS.frontOffice },
  { label: "Housekeeping", href: "/hospitality/housekeeping", permission: HOSPITALITY_ROUTE_PERMISSIONS.housekeeping },
  { label: "Billing", href: "/hospitality/billing", permission: HOSPITALITY_ROUTE_PERMISSIONS.billing },
  { label: "Operations", href: "/hospitality/operations", permission: HOSPITALITY_ROUTE_PERMISSIONS.operations },
  { label: "Reports", href: "/hospitality/reports", permission: HOSPITALITY_ROUTE_PERMISSIONS.reports },
];

export { HOSPITALITY_BASE_PATH };
