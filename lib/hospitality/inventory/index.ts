import type {
  InventoryAnalyticsView,
  InventoryExplorerView,
  InventoryListItem,
  PropertyDetailView,
  PropertyListItem,
  PropertyPortfolioView,
} from "@/lib/hospitality/models/inventory";
import type { InventoryRepository } from "@/lib/hospitality/repositories/InventoryRepository";
import type {
  BulkInventoryOperation,
  CreateInventoryItemInput,
  CreatePropertyInput,
  InventorySearchFilter,
} from "@/types/hospitality-inventory";
import type { HospitalityProperty, RoomStatus } from "@/types/hospitality";
import type { ServiceContext } from "@/types/services";

export type InventoryServiceContext = ServiceContext;

function countByStatus<T extends string>(items: readonly { status: T }[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
}

/** Property management service (Mission P-007.1). */
export class PropertyService {
  constructor(private readonly repository: InventoryRepository) {}

  getPortfolio(context: InventoryServiceContext): PropertyPortfolioView | null {
    const portfolio = this.repository.getPortfolio(context.organizationId);
    if (!portfolio) return null;
    const properties = this.repository
      .listProperties(context.organizationId)
      .filter((entry) => portfolio.propertyIds.includes(entry.id));
    return {
      id: portfolio.id,
      name: portfolio.name,
      description: portfolio.description,
      propertyCount: properties.length,
      totalInventory: properties.reduce(
        (sum, property) => sum + this.repository.listInventoryItems(property.id).length,
        0,
      ),
    };
  }

  listProperties(context: InventoryServiceContext): PropertyListItem[] {
    return this.repository.listProperties(context.organizationId).map((property) => {
      const inventory = this.repository.listInventoryItems(property.id);
      const unavailable = inventory.filter(
        (entry) =>
          entry.operationalStatus !== "active" ||
          entry.status === "out_of_service" ||
          entry.status === "maintenance" ||
          entry.maintenanceStatus !== "none",
      ).length;
      return {
        id: property.id,
        name: property.name,
        type: property.type.replaceAll("_", " "),
        city: property.city ?? "—",
        operationalStatus: property.operationalStatus ?? "active",
        inventoryCount: inventory.length,
        unavailableCount: unavailable,
        healthScore: inventory.length
          ? Math.round(((inventory.length - unavailable) / inventory.length) * 100)
          : 100,
      };
    });
  }

  getPropertyDetail(propertyId: string, context: InventoryServiceContext): PropertyDetailView | null {
    const property = this.repository.getProperty(propertyId);
    if (!property || property.organizationId !== context.organizationId) return null;
    const location = this.repository.getPropertyLocation(propertyId);
    const zones = this.repository.listZones(propertyId);
    const accommodationTypes = this.repository.listAccommodationTypes(propertyId);
    const inventory = this.repository.listInventoryItems(propertyId);
    const media = this.repository.listMedia(propertyId);
    const buildings = this.repository.listBuildings(propertyId);

    return {
      property,
      location,
      zones,
      accommodationTypes,
      inventoryCount: inventory.length,
      buildings: buildings.map((building) => ({
        id: building.id,
        name: building.name,
        wingCount: building.wings.length,
        floorCount: building.wings.reduce((sum, wing) => sum + wing.floors.length, 0),
      })),
      media: media.map((entry) => ({
        id: entry.id,
        type: entry.type,
        caption: entry.caption,
        url: entry.url,
      })),
      statusBreakdown: countByStatus(inventory),
    };
  }

  createProperty(input: CreatePropertyInput, context: InventoryServiceContext) {
    return this.repository.createProperty(input, context.organizationId);
  }

  updateProperty(propertyId: string, patch: Partial<HospitalityProperty>, context: InventoryServiceContext) {
    const property = this.repository.getProperty(propertyId);
    if (!property || property.organizationId !== context.organizationId) {
      throw new Error("PROPERTY_NOT_FOUND");
    }
    return this.repository.updateProperty(propertyId, patch);
  }

  deleteProperty(propertyId: string, context: InventoryServiceContext) {
    const property = this.repository.getProperty(propertyId);
    if (!property || property.organizationId !== context.organizationId) {
      throw new Error("PROPERTY_NOT_FOUND");
    }
    return this.repository.deleteProperty(propertyId);
  }
}

/** Inventory management service (Mission P-007.1). */
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  listInventory(propertyId: string | undefined, context: InventoryServiceContext): InventoryListItem[] {
    const filter: InventorySearchFilter = propertyId ? { propertyId } : {};
    return this.mapInventoryList(this.repository.searchInventory(filter, context.organizationId));
  }

  searchInventory(filter: InventorySearchFilter, context: InventoryServiceContext) {
    return this.mapInventoryList(this.repository.searchInventory(filter, context.organizationId));
  }

  getExplorerView(context: InventoryServiceContext, propertyId?: string): InventoryExplorerView {
    const items = this.searchInventory(propertyId ? { propertyId } : {}, context);
    const properties = this.repository.listProperties(context.organizationId);
    return {
      totalItems: items.length,
      properties: properties.map((property) => ({
        id: property.id,
        name: property.name,
        count: this.repository.listInventoryItems(property.id).length,
      })),
      items,
      filters: {
        kinds: ["room", "suite", "villa", "cottage", "tent", "houseboat"],
        statuses: ["available", "occupied", "dirty", "clean", "maintenance", "out_of_service"],
      },
    };
  }

  getInventoryItem(id: string, context: InventoryServiceContext) {
    const item = this.repository.getInventoryItem(id);
    if (!item) return null;
    const property = this.repository.getProperty(item.propertyId);
    if (property?.organizationId !== context.organizationId) return null;
    const accommodationType = this.repository.getAccommodationType(item.accommodationTypeId);
    const media = this.repository.listMedia(undefined, id);
    const zone = item.zoneId ? this.repository.listZones(item.propertyId).find((z) => z.id === item.zoneId) : null;
    return { item, property, accommodationType, media, zone };
  }

  createInventoryItem(input: CreateInventoryItemInput, context: InventoryServiceContext) {
    const property = this.repository.getProperty(input.propertyId);
    if (!property || property.organizationId !== context.organizationId) {
      throw new Error("PROPERTY_NOT_FOUND");
    }
    return this.repository.createInventoryItem(input);
  }

  updateInventoryItem(id: string, patch: Parameters<InventoryRepository["updateInventoryItem"]>[1], context: InventoryServiceContext) {
    const item = this.repository.getInventoryItem(id);
    if (!item) throw new Error("INVENTORY_NOT_FOUND");
    const property = this.repository.getProperty(item.propertyId);
    if (property?.organizationId !== context.organizationId) throw new Error("INVENTORY_NOT_FOUND");
    return this.repository.updateInventoryItem(id, patch);
  }

  executeBulkOperation(operation: BulkInventoryOperation, context: InventoryServiceContext) {
    if (operation.action === "import") {
      let created = 0;
      for (const item of operation.items) {
        const property = this.repository.getProperty(item.propertyId);
        if (property?.organizationId === context.organizationId) {
          this.repository.createInventoryItem(item);
          created += 1;
        }
      }
      return { created };
    }

    const ids = operation.ids;
    for (const id of ids) {
      const item = this.repository.getInventoryItem(id);
      const property = item ? this.repository.getProperty(item.propertyId) : null;
      if (!property || property.organizationId !== context.organizationId) {
        throw new Error("INVENTORY_NOT_FOUND");
      }
    }
    if (operation.action === "archive") {
      return { updated: this.repository.bulkArchiveInventory(ids) };
    }
    return { updated: this.repository.bulkUpdateInventoryStatus(ids, operation.status) };
  }

  private mapInventoryList(items: ReturnType<InventoryRepository["searchInventory"]>): InventoryListItem[] {
    return items.map((item) => {
      const property = this.repository.getProperty(item.propertyId);
      const type = this.repository.getAccommodationType(item.accommodationTypeId);
      return {
        id: item.id,
        label: item.label,
        kind: item.kind,
        propertyName: property?.name ?? "Unknown",
        propertyId: item.propertyId,
        accommodationType: type?.name ?? "Unknown",
        status: item.status.replaceAll("_", " "),
        maintenanceStatus: item.maintenanceStatus.replaceAll("_", " "),
        operationalStatus: item.operationalStatus,
        capacity: item.capacity,
        isVip: item.isVip,
        accessible: item.accessibility.wheelchairAccessible,
      };
    });
  }
}

/** Accommodation type service (Mission P-007.1). */
export class AccommodationService {
  constructor(private readonly repository: InventoryRepository) {}

  listAccommodationTypes(propertyId: string, context: InventoryServiceContext) {
    const property = this.repository.getProperty(propertyId);
    if (!property || property.organizationId !== context.organizationId) return [];
    return this.repository.listAccommodationTypes(propertyId).map((type) => ({
      id: type.id,
      name: type.name,
      kind: type.kind,
      category: type.category,
      baseRate: type.baseRate,
      maxOccupancy: type.maxOccupancy,
      inventoryCount: this.repository.listInventoryItems(propertyId).filter(
        (entry) => entry.accommodationTypeId === type.id,
      ).length,
      views: type.views,
      amenityCount: type.amenityIds.length,
    }));
  }
}

/** Amenity catalog service (Mission P-007.1). */
export class AmenityService {
  constructor(private readonly repository: InventoryRepository) {}

  listAmenities(context: InventoryServiceContext) {
    return this.repository.listAmenities(context.organizationId);
  }
}

/** Media asset service (Mission P-007.1). */
export class MediaService {
  constructor(private readonly repository: InventoryRepository) {}

  listMedia(context: InventoryServiceContext, propertyId?: string, inventoryItemId?: string) {
    if (propertyId) {
      const property = this.repository.getProperty(propertyId);
      if (!property || property.organizationId !== context.organizationId) return [];
    }
    return this.repository.listMedia(propertyId, inventoryItemId);
  }
}

/** Property location service (Mission P-007.1). */
export class LocationService {
  constructor(private readonly repository: InventoryRepository) {}

  getLocation(propertyId: string, context: InventoryServiceContext) {
    const property = this.repository.getProperty(propertyId);
    if (!property || property.organizationId !== context.organizationId) return null;
    return this.repository.getPropertyLocation(propertyId);
  }
}

/** Inventory status service (Mission P-007.1). */
export class StatusService {
  constructor(private readonly repository: InventoryRepository) {}

  updateStatus(id: string, status: RoomStatus, context: InventoryServiceContext) {
    const item = this.repository.getInventoryItem(id);
    if (!item) throw new Error("INVENTORY_NOT_FOUND");
    const property = this.repository.getProperty(item.propertyId);
    if (property?.organizationId !== context.organizationId) throw new Error("INVENTORY_NOT_FOUND");
    return this.repository.updateInventoryItem(id, { status });
  }

  updateMaintenanceStatus(
    id: string,
    maintenanceStatus: import("@/types/hospitality-inventory").MaintenanceStatus,
    context: InventoryServiceContext,
  ) {
    const item = this.repository.getInventoryItem(id);
    if (!item) throw new Error("INVENTORY_NOT_FOUND");
    const property = this.repository.getProperty(item.propertyId);
    if (property?.organizationId !== context.organizationId) throw new Error("INVENTORY_NOT_FOUND");
    const status = maintenanceStatus === "blocked" ? "maintenance" : item.status;
    return this.repository.updateInventoryItem(id, { maintenanceStatus, status });
  }
}

/** Inventory search service (Mission P-007.1). */
export class InventorySearchService {
  constructor(private readonly repository: InventoryRepository) {}

  search(filter: InventorySearchFilter, context: InventoryServiceContext) {
    return this.repository.searchInventory(filter, context.organizationId);
  }

  queryAvailability(propertyId: string, date: string, context: InventoryServiceContext) {
    const property = this.repository.getProperty(propertyId);
    if (!property || property.organizationId !== context.organizationId) return [];
    return this.repository.listAvailability(propertyId, date);
  }
}

/** Property & inventory analytics (Mission P-007.1). */
export class PropertyAnalyticsService {
  constructor(private readonly repository: InventoryRepository) {}

  getAnalytics(context: InventoryServiceContext): InventoryAnalyticsView {
    const properties = this.repository.listProperties(context.organizationId);
    const allItems = properties.flatMap((property) => this.repository.listInventoryItems(property.id));
    const unavailable = allItems.filter(
      (entry) =>
        entry.status === "maintenance" ||
        entry.status === "out_of_service" ||
        entry.maintenanceStatus !== "none" ||
        entry.operationalStatus !== "active",
    );
    const byKind = allItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.kind] = (acc[item.kind] ?? 0) + 1;
      return acc;
    }, {});
    const utilization =
      allItems.length > 0
        ? Math.round(
            (allItems.filter((entry) => entry.status === "occupied").length / allItems.length) * 100,
          )
        : 0;

    return {
      totalProperties: properties.length,
      totalInventory: allItems.length,
      unavailableInventory: unavailable.length,
      totalCapacity: allItems.reduce((sum, entry) => sum + entry.capacity, 0),
      inventoryHealthScore: allItems.length
        ? Math.round(((allItems.length - unavailable.length) / allItems.length) * 100)
        : 100,
      utilizationPercent: utilization,
      inventoryByKind: Object.entries(byKind).map(([kind, count]) => ({ kind, count })),
      recommendations: [
        {
          priority: 1,
          title: "Resolve blocked inventory before peak season",
          description: `${unavailable.length} unit(s) unavailable across the portfolio.`,
        },
        {
          priority: 2,
          title: "Expand houseboat inventory",
          description: "Houseboat occupancy trending above homestay average.",
        },
      ],
    };
  }
}

/** Facade for property & inventory management (Mission P-007.1). */
export class HospitalityInventoryFacade {
  readonly properties: PropertyService;
  readonly inventory: InventoryService;
  readonly accommodation: AccommodationService;
  readonly amenities: AmenityService;
  readonly media: MediaService;
  readonly location: LocationService;
  readonly status: StatusService;
  readonly search: InventorySearchService;
  readonly analytics: PropertyAnalyticsService;

  constructor(repository: InventoryRepository) {
    this.properties = new PropertyService(repository);
    this.inventory = new InventoryService(repository);
    this.accommodation = new AccommodationService(repository);
    this.amenities = new AmenityService(repository);
    this.media = new MediaService(repository);
    this.location = new LocationService(repository);
    this.status = new StatusService(repository);
    this.search = new InventorySearchService(repository);
    this.analytics = new PropertyAnalyticsService(repository);
  }
}
