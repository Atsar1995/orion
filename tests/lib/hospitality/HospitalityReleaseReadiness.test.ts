import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  HOSPITALITY_BASE_PATH,
  HOSPITALITY_NAV,
  HOSPITALITY_ROUTE_PERMISSIONS,
  hospitalityService,
  hospitalityInventoryService,
  hospitalityReservationService,
  hospitalityGuestService,
  hospitalityFrontOfficeService,
  hospitalityHousekeepingService,
  hospitalityBillingService,
  hospitalityAnalyticsService,
  getHospitalityBriefContribution,
} from "@/lib/hospitality";

const APP_ROOT = join(process.cwd(), "app", "(platform)", "hospitality");
const API_ROOT = join(process.cwd(), "app", "api", "hospitality");

/** Mission P-007 through P-007.8 — structural release readiness checks for Hospitality Workspace. */
describe("Hospitality Workspace release readiness (P-007 through P-007.8)", () => {
  it("defines eleven sub-nav routes with RBAC metadata", () => {
    expect(HOSPITALITY_NAV).toHaveLength(11);
    expect(HOSPITALITY_NAV.map((item) => item.href)).toEqual([
      HOSPITALITY_BASE_PATH,
      "/hospitality/reservations",
      "/hospitality/guests",
      "/hospitality/properties",
      "/hospitality/inventory",
      "/hospitality/rooms",
      "/hospitality/front-office",
      "/hospitality/housekeeping",
      "/hospitality/billing",
      "/hospitality/operations",
      "/hospitality/reports",
    ]);
    expect(HOSPITALITY_NAV.every((item) => item.permission?.action === "read")).toBe(true);
    expect(HOSPITALITY_ROUTE_PERMISSIONS.properties.action).toBe("read");
    expect(HOSPITALITY_ROUTE_PERMISSIONS.inventory.action).toBe("read");
  });

  it("ships page modules for all active hospitality routes", () => {
    const routes = [
      "page.tsx",
      "properties/page.tsx",
      "properties/[propertyId]/page.tsx",
      "inventory/page.tsx",
      "reservations/page.tsx",
      "reservations/calendar/page.tsx",
      "reservations/[reservationId]/page.tsx",
      "guests/page.tsx",
      "guests/[guestId]/page.tsx",
      "rooms/page.tsx",
      "front-office/page.tsx",
      "housekeeping/page.tsx",
      "billing/page.tsx",
      "operations/page.tsx",
      "reports/page.tsx",
      "layout.tsx",
    ];

    for (const route of routes) {
      expect(existsSync(join(APP_ROOT, route))).toBe(true);
    }
  });

  it("ships API routes for hospitality and inventory modules", () => {
    const routes = [
      "properties/route.ts",
      "properties/[id]/route.ts",
      "inventory/route.ts",
      "inventory/search/route.ts",
      "inventory/availability/route.ts",
      "inventory/bulk/route.ts",
      "amenities/route.ts",
      "analytics/properties/route.ts",
      "reservations/route.ts",
      "reservations/search/route.ts",
      "reservations/calendar/route.ts",
      "reservations/availability/route.ts",
      "reservations/[id]/route.ts",
      "guests/route.ts",
      "guests/search/route.ts",
      "guests/merge/route.ts",
      "guests/duplicates/route.ts",
      "guests/[id]/route.ts",
      "guests/[id]/timeline/route.ts",
      "guests/[id]/preferences/route.ts",
      "guests/[id]/relationships/route.ts",
      "guests/[id]/consent/route.ts",
      "rooms/route.ts",
      "housekeeping/route.ts",
      "billing/route.ts",
      "billing/folios/route.ts",
      "billing/folios/[id]/route.ts",
      "billing/charges/route.ts",
      "billing/payments/route.ts",
      "billing/invoices/route.ts",
      "billing/revenue/route.ts",
      "analytics/route.ts",
      "analytics/kpis/route.ts",
      "analytics/forecasts/route.ts",
      "analytics/insights/route.ts",
      "analytics/executive/route.ts",
      "operations/route.ts",
      "intelligence/route.ts",
      "front-office/route.ts",
      "front-office/check-in/route.ts",
      "front-office/check-out/route.ts",
      "front-office/assign-room/route.ts",
      "front-office/occupancy/route.ts",
      "front-office/stays/[id]/route.ts",
      "housekeeping/tasks/route.ts",
      "housekeeping/tasks/[id]/assign/route.ts",
      "housekeeping/tasks/[id]/complete/route.ts",
      "housekeeping/tasks/[id]/inspect/route.ts",
      "housekeeping/maintenance/route.ts",
      "housekeeping/maintenance/[id]/route.ts",
    ];

    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("exposes analytics surface on hospitalityAnalyticsService", () => {
    expect(typeof hospitalityAnalyticsService.getFullAnalytics).toBe("function");
    expect(typeof hospitalityAnalyticsService.kpis.getKpis).toBe("function");
    expect(typeof hospitalityAnalyticsService.forecasts.getForecasts).toBe("function");
    expect(typeof hospitalityAnalyticsService.insights.generate).toBe("function");
    expect(typeof hospitalityAnalyticsService.executive.getDashboard).toBe("function");
    expect(typeof hospitalityAnalyticsService.getBriefSignals).toBe("function");
  });

  it("exposes billing surface on hospitalityBillingService", () => {
    expect(typeof hospitalityBillingService.dashboard.getDashboard).toBe("function");
    expect(typeof hospitalityBillingService.folios.create).toBe("function");
    expect(typeof hospitalityBillingService.charges.post).toBe("function");
    expect(typeof hospitalityBillingService.payments.process).toBe("function");
    expect(typeof hospitalityBillingService.invoices.generate).toBe("function");
    expect(typeof hospitalityBillingService.getBriefSignals).toBe("function");
  });

  it("exposes housekeeping surface on hospitalityHousekeepingService", () => {
    expect(typeof hospitalityHousekeepingService.board.getDashboard).toBe("function");
    expect(typeof hospitalityHousekeepingService.cleaning.createTask).toBe("function");
    expect(typeof hospitalityHousekeepingService.cleaning.complete).toBe("function");
    expect(typeof hospitalityHousekeepingService.maintenance.create).toBe("function");
    expect(typeof hospitalityHousekeepingService.getBriefSignals).toBe("function");
  });

  it("exposes front office surface on hospitalityFrontOfficeService", () => {
    expect(typeof hospitalityFrontOfficeService.dashboard.getDashboard).toBe("function");
    expect(typeof hospitalityFrontOfficeService.checkIn.execute).toBe("function");
    expect(typeof hospitalityFrontOfficeService.checkOut.execute).toBe("function");
    expect(typeof hospitalityFrontOfficeService.assignment.assignRoom).toBe("function");
    expect(typeof hospitalityFrontOfficeService.getBriefSignals).toBe("function");
  });

  it("exposes guest intelligence surface on hospitalityGuestService", () => {
    expect(typeof hospitalityGuestService.guests.create).toBe("function");
    expect(typeof hospitalityGuestService.guests.search).toBe("function");
    expect(typeof hospitalityGuestService.guests.merge).toBe("function");
    expect(typeof hospitalityGuestService.timeline.getTimeline).toBe("function");
    expect(typeof hospitalityGuestService.guests.getBriefSignals).toBe("function");
  });

  it("exposes reservation engine surface on hospitalityReservationService", () => {
    expect(typeof hospitalityReservationService.reservations.create).toBe("function");
    expect(typeof hospitalityReservationService.reservations.search).toBe("function");
    expect(typeof hospitalityReservationService.availability.checkAvailability).toBe("function");
    expect(typeof hospitalityReservationService.calendar.getCalendarView).toBe("function");
    expect(typeof hospitalityReservationService.reservations.getBriefSignals).toBe("function");
  });

  it("exposes inventory service surface on hospitalityInventoryService", () => {
    expect(typeof hospitalityInventoryService.properties.listProperties).toBe("function");
    expect(typeof hospitalityInventoryService.properties.getPropertyDetail).toBe("function");
    expect(typeof hospitalityInventoryService.properties.createProperty).toBe("function");
    expect(typeof hospitalityInventoryService.inventory.searchInventory).toBe("function");
    expect(typeof hospitalityInventoryService.inventory.getExplorerView).toBe("function");
    expect(typeof hospitalityInventoryService.accommodation.listAccommodationTypes).toBe("function");
    expect(typeof hospitalityInventoryService.amenities.listAmenities).toBe("function");
    expect(typeof hospitalityInventoryService.analytics.getAnalytics).toBe("function");
  });

  it("returns brief contribution with inventory portfolio signals", () => {
    const contribution = getHospitalityBriefContribution();

    expect(contribution.workspaceId).toBe("hospitality");
    expect(contribution.briefingLine).toContain("forecast occupancy");
    expect(contribution.operationalHealth).toBeGreaterThan(0);
    expect(contribution.forecastOccupancy).toBeGreaterThan(0);
    expect(contribution.totalProperties).toBe(2);
    expect(contribution.inventoryHealthScore).toBeGreaterThan(0);
    expect(contribution.unavailableInventory).toBeGreaterThanOrEqual(0);
    expect(contribution.todaysArrivals).toBeGreaterThanOrEqual(0);
    expect(contribution.bookingPace).toBeTruthy();
    expect(contribution.repeatGuests).toBeGreaterThanOrEqual(0);
    expect(contribution.guestSatisfactionTrend).toBeTruthy();
    expect(contribution.frontOfficeOccupancy).toBeGreaterThan(0);
  });

  it("loads module view models without throwing", () => {
    const context = {
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-executive",
      role: "executive" as const,
    };

    expect(hospitalityService.getDashboard(context).summary).toBeTruthy();
    expect(hospitalityInventoryService.properties.listProperties(context).length).toBe(2);
    expect(hospitalityInventoryService.inventory.getExplorerView(context).totalItems).toBeGreaterThan(0);
    expect(hospitalityInventoryService.analytics.getAnalytics(context).totalInventory).toBeGreaterThan(0);
  });
});
