export type PropertyListItem = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly city: string;
  readonly operationalStatus: string;
  readonly inventoryCount: number;
  readonly unavailableCount: number;
  readonly healthScore: number;
};

export type PropertyPortfolioView = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly propertyCount: number;
  readonly totalInventory: number;
};

export type PropertyDetailView = {
  readonly property: import("@/types/hospitality").HospitalityProperty;
  readonly location: import("@/types/hospitality-inventory").PropertyLocation | null;
  readonly zones: readonly import("@/types/hospitality-inventory").PropertyZone[];
  readonly accommodationTypes: readonly import("@/types/hospitality-inventory").AccommodationType[];
  readonly inventoryCount: number;
  readonly buildings: readonly { id: string; name: string; wingCount: number; floorCount: number }[];
  readonly media: readonly { id: string; type: string; caption: string; url: string }[];
  readonly statusBreakdown: Record<string, number>;
};

export type InventoryListItem = {
  readonly id: string;
  readonly label: string;
  readonly kind: string;
  readonly propertyName: string;
  readonly propertyId: string;
  readonly accommodationType: string;
  readonly status: string;
  readonly maintenanceStatus: string;
  readonly operationalStatus: string;
  readonly capacity: number;
  readonly isVip: boolean;
  readonly accessible: boolean;
};

export type InventoryExplorerView = {
  readonly totalItems: number;
  readonly properties: readonly { id: string; name: string; count: number }[];
  readonly items: readonly InventoryListItem[];
  readonly filters: {
    readonly kinds: readonly string[];
    readonly statuses: readonly string[];
  };
};

export type InventoryAnalyticsView = {
  readonly totalProperties: number;
  readonly totalInventory: number;
  readonly unavailableInventory: number;
  readonly totalCapacity: number;
  readonly inventoryHealthScore: number;
  readonly utilizationPercent: number;
  readonly inventoryByKind: readonly { kind: string; count: number }[];
  readonly recommendations: readonly {
    priority: number;
    title: string;
    description: string;
  }[];
};

export type InventoryBriefContribution = {
  readonly totalProperties: number;
  readonly inventoryHealthScore: number;
  readonly unavailableInventory: number;
  readonly totalCapacity: number;
  readonly operationalAlerts: readonly string[];
};
