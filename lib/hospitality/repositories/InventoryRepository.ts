import type {
  AccommodationType,
  Amenity,
  CreateInventoryItemInput,
  CreatePropertyInput,
  InventoryAvailability,
  InventoryItem,
  InventorySearchFilter,
  MediaAsset,
  PropertyLocation,
  PropertyPortfolio,
  PropertyZone,
} from "@/types/hospitality-inventory";
import type { HospitalityProperty, RoomStatus } from "@/types/hospitality";
import type { HospitalityRepository } from "@/lib/hospitality/repositories/HospitalityRepository";

/** Inventory & property data access contract (Mission P-007.1). */
export type InventoryRepository = HospitalityRepository & {
  getPortfolio(organizationId: string): PropertyPortfolio | null;
  listPortfolios(organizationId: string): PropertyPortfolio[];
  createProperty(input: CreatePropertyInput, organizationId: string): HospitalityProperty;
  updateProperty(propertyId: string, patch: Partial<HospitalityProperty>): HospitalityProperty | null;
  deleteProperty(propertyId: string): boolean;
  listZones(propertyId: string): PropertyZone[];
  listAmenities(organizationId: string): Amenity[];
  getAmenity(id: string): Amenity | null;
  listAccommodationTypes(propertyId: string): AccommodationType[];
  getAccommodationType(id: string): AccommodationType | null;
  listInventoryItems(propertyId?: string): InventoryItem[];
  getInventoryItem(id: string): InventoryItem | null;
  createInventoryItem(input: CreateInventoryItemInput): InventoryItem;
  updateInventoryItem(id: string, patch: Partial<InventoryItem>): InventoryItem | null;
  bulkUpdateInventoryStatus(ids: readonly string[], status: RoomStatus): number;
  bulkArchiveInventory(ids: readonly string[]): number;
  searchInventory(filter: InventorySearchFilter, organizationId: string): InventoryItem[];
  listMedia(propertyId?: string, inventoryItemId?: string): MediaAsset[];
  getPropertyLocation(propertyId: string): PropertyLocation | null;
  listAvailability(propertyId: string, date?: string): InventoryAvailability[];
  propertySlugExists(organizationId: string, slug: string, excludeId?: string): boolean;
  inventoryLabelExists(propertyId: string, label: string, excludeId?: string): boolean;
};
