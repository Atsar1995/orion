/**
 * ORION Hospitality — Housekeeping & Maintenance Operations (Mission P-007.5).
 * Event-driven room readiness, cleaning, maintenance, and inspections.
 */

export type HousekeepingTaskStatus = "pending" | "assigned" | "in_progress" | "completed" | "inspected" | "cancelled";

export type CleaningType = "standard" | "deep_clean" | "turndown" | "checkout" | "stayover";

export type MaintenanceWorkOrderStatus = "open" | "assigned" | "in_progress" | "resolved" | "cancelled";

export type MaintenanceWorkOrderType = "corrective" | "preventive" | "inspection_follow_up";

export type MaintenancePriority = "low" | "medium" | "high" | "critical";

export type InspectionType = "housekeeping" | "engineering" | "safety" | "quality_audit";

export type InspectionResult = "pass" | "fail" | "conditional";

export type ExtendedRoomStatus =
  | "vacant_clean"
  | "vacant_dirty"
  | "occupied_clean"
  | "occupied_dirty"
  | "inspected"
  | "out_of_order"
  | "out_of_service"
  | "under_maintenance"
  | "blocked";

/** Canonical housekeeping task — linked to inventory item. */
export type HousekeepingTaskRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly inventoryItemId: string;
  readonly stayId?: string;
  readonly status: HousekeepingTaskStatus;
  readonly cleaningType: CleaningType;
  readonly assignedTo?: string;
  readonly priority: "normal" | "high" | "urgent";
  readonly notes?: string;
  readonly createdAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly inspectedAt?: string;
  readonly inspectedBy?: string;
};

export type MaintenanceWorkOrderRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly inventoryItemId?: string;
  readonly assetId?: string;
  readonly title: string;
  readonly description: string;
  readonly type: MaintenanceWorkOrderType;
  readonly priority: MaintenancePriority;
  readonly status: MaintenanceWorkOrderStatus;
  readonly assignedTo?: string;
  readonly vendorName?: string;
  readonly reportedAt: string;
  readonly scheduledAt?: string;
  readonly resolvedAt?: string;
};

export type InspectionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly inventoryItemId?: string;
  readonly taskId?: string;
  readonly type: InspectionType;
  readonly result: InspectionResult;
  readonly score?: number;
  readonly notes?: string;
  readonly inspectedBy: string;
  readonly inspectedAt: string;
};

export type AssetRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly name: string;
  readonly category: string;
  readonly inventoryItemId?: string;
  readonly status: "operational" | "degraded" | "offline";
  readonly lastServiceAt?: string;
  readonly nextServiceAt?: string;
};

export type MaintenanceScheduleRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly assetId: string;
  readonly title: string;
  readonly frequencyDays: number;
  readonly nextDueAt: string;
  readonly lastCompletedAt?: string;
};

export type LinenItemRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly type: string;
  readonly quantity: number;
  readonly status: "available" | "in_laundry" | "low_stock";
};

export type LostAndFoundRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly inventoryItemId?: string;
  readonly description: string;
  readonly foundAt: string;
  readonly status: "stored" | "claimed" | "disposed";
  readonly guestId?: string;
};

export type CreateHousekeepingTaskInput = {
  readonly propertyId: string;
  readonly inventoryItemId: string;
  readonly stayId?: string;
  readonly cleaningType?: CleaningType;
  readonly priority?: "normal" | "high" | "urgent";
  readonly notes?: string;
};

export type AssignTaskInput = {
  readonly taskId: string;
  readonly assignedTo: string;
};

export type CreateMaintenanceInput = {
  readonly propertyId: string;
  readonly inventoryItemId?: string;
  readonly assetId?: string;
  readonly title: string;
  readonly description: string;
  readonly type?: MaintenanceWorkOrderType;
  readonly priority: MaintenancePriority;
  readonly assignedTo?: string;
  readonly vendorName?: string;
  readonly scheduledAt?: string;
};

export type HousekeepingBriefSignals = {
  readonly readyRooms: number;
  readonly awaitingCleaning: number;
  readonly criticalMaintenance: number;
  readonly inspectionFailures: number;
  readonly assetHealthScore: number;
  readonly cleaningProgressPercent: number;
};

export type PublishHousekeepingEventInput = {
  readonly eventType:
    | "HousekeepingTaskCreated"
    | "HousekeepingCompleted"
    | "RoomInspected"
    | "MaintenanceRequested"
    | "MaintenanceResolved"
    | "InspectionFailed";
  readonly taskId?: string;
  readonly workOrderId?: string;
  readonly inventoryItemId?: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};
