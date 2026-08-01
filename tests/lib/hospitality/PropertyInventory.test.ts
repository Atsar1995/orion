import { describe, expect, it } from "vitest";
import { hospitalityInventoryService, SECOND_PROPERTY_ID, DEFAULT_PROPERTY_ID } from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Hospitality Property & Inventory (Mission P-007.1)", () => {
  it("lists multi-property portfolio", () => {
    const portfolio = hospitalityInventoryService.properties.getPortfolio(CONTEXT);
    const properties = hospitalityInventoryService.properties.listProperties(CONTEXT);

    expect(portfolio?.propertyCount).toBe(2);
    expect(properties).toHaveLength(2);
    expect(properties.some((entry) => entry.id === DEFAULT_PROPERTY_ID)).toBe(true);
    expect(properties.some((entry) => entry.id === SECOND_PROPERTY_ID)).toBe(true);
  });

  it("returns property detail with zones, location, and accommodation types", () => {
    const detail = hospitalityInventoryService.properties.getPropertyDetail(DEFAULT_PROPERTY_ID, CONTEXT);

    expect(detail?.property.name).toContain("ORANIA");
    expect(detail?.zones.length).toBeGreaterThan(0);
    expect(detail?.location?.city).toBe("Udaipur");
    expect(detail?.accommodationTypes.length).toBeGreaterThan(0);
  });

  it("searches inventory across portfolio with filters", () => {
    const all = hospitalityInventoryService.inventory.searchInventory({}, CONTEXT);
    const villas = hospitalityInventoryService.inventory.searchInventory({ kind: "villa" }, CONTEXT);
    const accessible = hospitalityInventoryService.inventory.searchInventory({ accessibleOnly: true }, CONTEXT);

    expect(all.length).toBeGreaterThan(0);
    expect(villas.every((entry) => entry.kind === "villa")).toBe(true);
    expect(accessible.every((entry) => entry.accessible)).toBe(true);
  });

  it("returns inventory analytics for executive reporting", () => {
    const analytics = hospitalityInventoryService.analytics.getAnalytics(CONTEXT);

    expect(analytics.totalProperties).toBe(2);
    expect(analytics.totalInventory).toBeGreaterThan(0);
    expect(analytics.inventoryHealthScore).toBeGreaterThan(0);
    expect(analytics.recommendations.length).toBeGreaterThan(0);
  });

  it("creates property and inventory with validation errors", () => {
    const created = hospitalityInventoryService.properties.createProperty(
      {
        name: "Test Boutique",
        slug: "test-boutique-p0071",
        type: "boutique",
        address: "Test Lane",
        timeZone: "Asia/Kolkata",
        city: "Udaipur",
        region: "Rajasthan",
        country: "India",
      },
      CONTEXT,
    );

    expect(created.slug).toBe("test-boutique-p0071");

    expect(() =>
      hospitalityInventoryService.properties.createProperty(
        {
          name: "Duplicate",
          slug: "test-boutique-p0071",
          type: "hotel",
          address: "X",
          timeZone: "Asia/Kolkata",
        },
        CONTEXT,
      ),
    ).toThrow("DUPLICATE_PROPERTY");

    const item = hospitalityInventoryService.inventory.createInventoryItem(
      {
        propertyId: created.id,
        accommodationTypeId: "acc-homestay-room",
        kind: "room",
        label: "T-101",
        capacity: 2,
      },
      CONTEXT,
    );

    expect(item.label).toBe("T-101");

    expect(() =>
      hospitalityInventoryService.inventory.createInventoryItem(
        {
          propertyId: created.id,
          accommodationTypeId: "acc-homestay-room",
          kind: "room",
          label: "T-101",
          capacity: 2,
        },
        CONTEXT,
      ),
    ).toThrow("DUPLICATE_ROOM_NUMBER");
  });

  it("lists amenity catalog and availability queries", () => {
    const amenities = hospitalityInventoryService.amenities.listAmenities(CONTEXT);
    const availability = hospitalityInventoryService.search.queryAvailability(
      DEFAULT_PROPERTY_ID,
      "2026-07-30",
      CONTEXT,
    );

    expect(amenities.length).toBeGreaterThan(0);
    expect(availability.length).toBeGreaterThan(0);
  });
});
