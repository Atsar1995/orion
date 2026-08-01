/**
 * ORION Hospitality — Property & Inventory Management types (Mission P-007.1).
 * Canonical accommodation model for all hospitality deployments.
 */

import type { RoomStatus } from "@/types/hospitality";

export type OperationalStatus = "active" | "inactive" | "renovation" | "archived";

export type MaintenanceStatus = "none" | "scheduled" | "in_progress" | "blocked";

export type AccommodationKind =
  | "room"
  | "suite"
  | "villa"
  | "cottage"
  | "tent"
  | "houseboat";

export type RoomCategory = "standard" | "deluxe" | "premium" | "suite" | "villa" | "unique";

export type AmenityCategory =
  | "general"
  | "bathroom"
  | "technology"
  | "food_beverage"
  | "wellness"
  | "accessibility"
  | "outdoor";

export type MediaAssetType = "photo" | "floor_plan" | "document";

export type ViewType =
  | "garden"
  | "lake"
  | "pool"
  | "mountain"
  | "city"
  | "courtyard"
  | "none";

export type BedType = "king" | "queen" | "twin" | "double" | "sofa_bed" | "bunk";

/** Organization-level property portfolio. */
export type PropertyPortfolio = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly propertyIds: readonly string[];
};

/** Property zone / area within a property. */
export type PropertyZone = {
  readonly id: string;
  readonly propertyId: string;
  readonly name: string;
  readonly description?: string;
  readonly buildingIds: readonly string[];
};

/** Catalog amenity (org-scoped). */
export type Amenity = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly category: AmenityCategory;
  readonly icon?: string;
};

/** Accommodation feature (view, technology, etc.). */
export type AccommodationFeature = {
  readonly id: string;
  readonly name: string;
  readonly category: "view" | "technology" | "comfort" | "service";
};

/** Bed configuration for an accommodation type. */
export type BedConfiguration = {
  readonly type: BedType;
  readonly count: number;
};

/** Accessibility profile for inventory items. */
export type AccessibilityProfile = {
  readonly wheelchairAccessible: boolean;
  readonly hearingAccessible: boolean;
  readonly visualAccessible: boolean;
  readonly rollInShower: boolean;
  readonly features: readonly string[];
};

/** Occupancy rules for an accommodation type. */
export type OccupancyRules = {
  readonly maxAdults: number;
  readonly maxChildren: number;
  readonly maxTotal: number;
  readonly extraBedAllowed: boolean;
};

/** Accommodation type — canonical room-type model. */
export type AccommodationType = {
  readonly id: string;
  readonly propertyId: string;
  readonly name: string;
  readonly kind: AccommodationKind;
  readonly category: RoomCategory;
  readonly baseRate: number;
  readonly maxOccupancy: number;
  readonly amenityIds: readonly string[];
  readonly features: readonly string[];
  readonly bedConfiguration: readonly BedConfiguration[];
  readonly views: readonly ViewType[];
  readonly accessibility: AccessibilityProfile;
  readonly occupancyRules: OccupancyRules;
  readonly description?: string;
};

/** Inventory item — canonical sellable accommodation unit. */
export type InventoryItem = {
  readonly id: string;
  readonly propertyId: string;
  readonly accommodationTypeId: string;
  readonly kind: AccommodationKind;
  readonly label: string;
  readonly floorId?: string;
  readonly zoneId?: string;
  readonly buildingId?: string;
  readonly status: RoomStatus;
  readonly maintenanceStatus: MaintenanceStatus;
  readonly operationalStatus: OperationalStatus;
  readonly accessibility: AccessibilityProfile;
  readonly mediaIds: readonly string[];
  readonly isVip: boolean;
  readonly capacity: number;
};

/** Media asset for properties and inventory. */
export type MediaAsset = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId?: string;
  readonly inventoryItemId?: string;
  readonly type: MediaAssetType;
  readonly url: string;
  readonly caption: string;
  readonly sortOrder: number;
};

/** GPS / address location for a property. */
export type PropertyLocation = {
  readonly propertyId: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly address: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
  readonly postalCode?: string;
};

/** Daily availability snapshot for an inventory item. */
export type InventoryAvailability = {
  readonly inventoryItemId: string;
  readonly propertyId: string;
  readonly date: string;
  readonly available: boolean;
  readonly reason?: string;
};

/** Inventory search filter. */
export type InventorySearchFilter = {
  readonly propertyId?: string;
  readonly kind?: AccommodationKind;
  readonly status?: RoomStatus;
  readonly operationalStatus?: OperationalStatus;
  readonly zoneId?: string;
  readonly buildingId?: string;
  readonly query?: string;
  readonly accessibleOnly?: boolean;
  readonly availableOnly?: boolean;
};

/** Bulk inventory operation. */
export type BulkInventoryOperation =
  | { readonly action: "archive"; readonly ids: readonly string[] }
  | { readonly action: "update_status"; readonly ids: readonly string[]; readonly status: RoomStatus }
  | { readonly action: "import"; readonly items: readonly Omit<InventoryItem, "id">[] };

export type CreatePropertyInput = {
  readonly name: string;
  readonly slug: string;
  readonly type: import("@/types/hospitality").HospitalityPropertyType;
  readonly address: string;
  readonly timeZone: string;
  readonly portfolioId?: string;
  readonly city?: string;
  readonly region?: string;
  readonly country?: string;
};

export type CreateInventoryItemInput = {
  readonly propertyId: string;
  readonly accommodationTypeId: string;
  readonly kind: AccommodationKind;
  readonly label: string;
  readonly floorId?: string;
  readonly zoneId?: string;
  readonly buildingId?: string;
  readonly capacity: number;
  readonly isVip?: boolean;
};

export type PublishInventoryEventInput = {
  readonly eventType: "PropertyUpdated" | "InventoryUpdated" | "InventoryStatusChanged";
  readonly entityId: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};
