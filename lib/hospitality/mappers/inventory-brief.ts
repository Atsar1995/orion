import type { ReservationRepository } from "@/lib/hospitality/repositories/ReservationRepository";
import type { InventoryBriefContribution } from "@/lib/hospitality/models/inventory";

/** Maps inventory analytics for Executive Brief (Mission P-007.1). */
export function mapInventoryBriefContribution(
  repository: ReservationRepository,
  organizationId: string,
): InventoryBriefContribution {
  const properties = repository.listProperties(organizationId);
  const allItems = properties.flatMap((property) => repository.listInventoryItems(property.id));
  const unavailable = allItems.filter(
    (entry) =>
      entry.status === "maintenance" ||
      entry.status === "out_of_service" ||
      entry.maintenanceStatus !== "none" ||
      entry.operationalStatus !== "active",
  );

  return {
    totalProperties: properties.length,
    inventoryHealthScore: allItems.length
      ? Math.round(((allItems.length - unavailable.length) / allItems.length) * 100)
      : 100,
    unavailableInventory: unavailable.length,
    totalCapacity: allItems.reduce((sum, entry) => sum + entry.capacity, 0),
    operationalAlerts: unavailable.slice(0, 3).map((entry) => {
      const property = repository.getProperty(entry.propertyId);
      return `${property?.name ?? "Property"} · ${entry.label} unavailable (${entry.status})`;
    }),
  };
}
