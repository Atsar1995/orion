export type HousekeepingBoardItem = {
  readonly taskId?: string;
  readonly inventoryItemId: string;
  readonly roomNumber: string;
  readonly propertyId: string;
  readonly roomStatus: string;
  readonly extendedStatus: string;
  readonly taskStatus?: string;
  readonly cleaningType?: string;
  readonly assignedTo?: string;
  readonly priority: string;
  readonly isBlocked: boolean;
};

export type HousekeepingDashboardView = {
  readonly board: readonly HousekeepingBoardItem[];
  readonly queue: readonly HousekeepingBoardItem[];
  readonly summary: {
    readonly readyRooms: number;
    readonly awaitingCleaning: number;
    readonly inProgress: number;
    readonly underMaintenance: number;
    readonly inspectionPending: number;
  };
};

export type MaintenanceListItem = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: string;
  readonly status: string;
  readonly type: string;
  readonly roomLabel?: string;
  readonly assignedTo?: string;
  readonly vendorName?: string;
  readonly reportedAt: string;
};

export type MaintenanceDashboardView = {
  readonly workOrders: readonly MaintenanceListItem[];
  readonly backlog: number;
  readonly critical: number;
  readonly preventiveDue: number;
};

export type HousekeepingBriefContribution = {
  readonly readyRooms: number;
  readonly awaitingCleaning: number;
  readonly criticalMaintenance: number;
  readonly inspectionFailures: number;
  readonly assetHealthScore: number;
  readonly cleaningProgressPercent: number;
};
