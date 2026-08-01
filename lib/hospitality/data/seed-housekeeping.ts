import { DEFAULT_PROPERTY_ID } from "@/lib/hospitality/constants";
import type {
  AssetRecord,
  HousekeepingTaskRecord,
  InspectionRecord,
  LinenItemRecord,
  LostAndFoundRecord,
  MaintenanceScheduleRecord,
  MaintenanceWorkOrderRecord,
} from "@/types/hospitality-housekeeping";

const ORG_ID = "org-orania";
const NOW = "2026-07-30T09:00:00.000Z";

const ROOM_TO_INVENTORY: Record<string, string> = {
  "room-101": "inv-room-101",
  "room-112": "inv-room-112",
  "room-118": "inv-room-118",
  "room-204": "inv-room-204",
  "room-207": "inv-room-207",
  "room-305": "inv-room-305",
  "room-401": "inv-room-401",
};

export function buildHousekeepingSeed(): {
  tasks: HousekeepingTaskRecord[];
  workOrders: MaintenanceWorkOrderRecord[];
  inspections: InspectionRecord[];
  assets: AssetRecord[];
  schedules: MaintenanceScheduleRecord[];
  linen: LinenItemRecord[];
  lostAndFound: LostAndFoundRecord[];
} {
  const tasks: HousekeepingTaskRecord[] = [
    {
      id: "hk-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-112",
      status: "pending",
      cleaningType: "checkout",
      priority: "normal",
      notes: "Checkout clean — room 112",
      createdAt: NOW,
    },
    {
      id: "hk-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-118",
      status: "completed",
      cleaningType: "standard",
      assignedTo: "Housekeeping Team A",
      priority: "normal",
      createdAt: NOW,
      startedAt: NOW,
      completedAt: NOW,
    },
    {
      id: "hk-003",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-204",
      status: "inspected",
      cleaningType: "checkout",
      assignedTo: "Housekeeping Team B",
      priority: "high",
      createdAt: NOW,
      completedAt: NOW,
      inspectedAt: NOW,
      inspectedBy: "Supervisor Meera",
    },
    {
      id: "hk-004",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-305",
      status: "pending",
      cleaningType: "deep_clean",
      priority: "urgent",
      notes: "Blocked until maintenance complete",
      createdAt: NOW,
    },
  ];

  const workOrders: MaintenanceWorkOrderRecord[] = [
    {
      id: "wo-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-305",
      assetId: "asset-ac-305",
      title: "AC unit failure",
      description: "Guest reported AC not cooling. VIP arrival at 14:00.",
      type: "corrective",
      priority: "critical",
      status: "in_progress",
      assignedTo: "Engineering — Raj",
      reportedAt: NOW,
    },
    {
      id: "wo-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-101",
      assetId: "asset-plumbing-101",
      title: "Bathroom tap leak",
      description: "Minor leak under basin — scheduled repair.",
      type: "corrective",
      priority: "medium",
      status: "open",
      reportedAt: NOW,
      scheduledAt: "2026-07-31T09:00:00.000Z",
    },
    {
      id: "wo-003",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      assetId: "asset-boiler-main",
      title: "Preventive — boiler inspection",
      description: "Quarterly boiler safety inspection.",
      type: "preventive",
      priority: "high",
      status: "assigned",
      assignedTo: "Vendor — ThermoTech",
      vendorName: "ThermoTech Services",
      reportedAt: "2026-07-28T08:00:00.000Z",
      scheduledAt: "2026-08-01T08:00:00.000Z",
    },
  ];

  const inspections: InspectionRecord[] = [
    {
      id: "insp-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-204",
      taskId: "hk-003",
      type: "housekeeping",
      result: "pass",
      score: 96,
      inspectedBy: "Supervisor Meera",
      inspectedAt: NOW,
    },
    {
      id: "insp-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-305",
      type: "engineering",
      result: "fail",
      score: 42,
      notes: "AC compressor requires replacement",
      inspectedBy: "Engineering — Raj",
      inspectedAt: NOW,
    },
  ];

  const assets: AssetRecord[] = [
    {
      id: "asset-ac-305",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      name: "Split AC Unit — Room 305",
      category: "HVAC",
      inventoryItemId: "inv-room-305",
      status: "offline",
      lastServiceAt: "2026-04-15T00:00:00.000Z",
      nextServiceAt: "2026-07-30T00:00:00.000Z",
    },
    {
      id: "asset-boiler-main",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      name: "Main Palace Boiler",
      category: "Utilities",
      status: "operational",
      lastServiceAt: "2026-05-01T00:00:00.000Z",
      nextServiceAt: "2026-08-01T00:00:00.000Z",
    },
    {
      id: "asset-plumbing-101",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      name: "Basin Tap Assembly — Room 101",
      category: "Plumbing",
      inventoryItemId: "inv-room-101",
      status: "degraded",
    },
  ];

  const schedules: MaintenanceScheduleRecord[] = [
    {
      id: "sched-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      assetId: "asset-boiler-main",
      title: "Boiler quarterly inspection",
      frequencyDays: 90,
      nextDueAt: "2026-08-01T08:00:00.000Z",
      lastCompletedAt: "2026-05-01T00:00:00.000Z",
    },
  ];

  const linen: LinenItemRecord[] = [
    { id: "linen-001", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, type: "Bath Towels", quantity: 420, status: "available" },
    { id: "linen-002", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, type: "Bed Sheets", quantity: 85, status: "in_laundry" },
    { id: "linen-003", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, type: "Pillowcases", quantity: 45, status: "low_stock" },
  ];

  const lostAndFound: LostAndFoundRecord[] = [
    {
      id: "lf-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      inventoryItemId: "inv-room-207",
      description: "Silver cufflinks in velvet pouch",
      foundAt: "2026-07-29T10:00:00.000Z",
      status: "stored",
      guestId: "guest-nair",
    },
  ];

  return { tasks, workOrders, inspections, assets, schedules, linen, lostAndFound };
}

export { ROOM_TO_INVENTORY };
