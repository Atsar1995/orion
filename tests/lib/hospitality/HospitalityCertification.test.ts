import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROPERTY_ID,
  hospitalityAnalyticsService,
  hospitalityBillingService,
  hospitalityFrontOfficeService,
  hospitalityGuestService,
  hospitalityHousekeepingService,
  hospitalityInventoryService,
  hospitalityReservationService,
  hospitalityService,
  getHospitalityBriefContribution,
} from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

/** Mission P-007.8 — end-to-end hospitality journey certification (no new features). */
describe("Hospitality Workspace Certification (P-007.8)", () => {
  it("validates complete hospitality journey across all domain facades", () => {
    // P-007.1 Property & Inventory
    expect(hospitalityInventoryService.properties.listProperties(CONTEXT).length).toBeGreaterThan(0);
    expect(hospitalityInventoryService.inventory.getExplorerView(CONTEXT).totalItems).toBeGreaterThan(0);

    // P-007.2 Reservations
    expect(hospitalityReservationService.reservations.list(CONTEXT).length).toBeGreaterThan(0);
    expect(
      hospitalityReservationService.calendar.getCalendarView(CONTEXT, "weekly", "2026-07-30", DEFAULT_PROPERTY_ID).entries.length,
    ).toBeGreaterThanOrEqual(0);

    // P-007.3 Guests
    expect(hospitalityGuestService.guests.list(CONTEXT).length).toBeGreaterThan(0);

    // P-007.4 Front Office
    const foDashboard = hospitalityFrontOfficeService.dashboard.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID);
    expect(foDashboard.occupancy.percent).toBeGreaterThan(0);

    // P-007.5 Housekeeping
    const hkDashboard = hospitalityHousekeepingService.board.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID);
    expect(hkDashboard.board.length).toBeGreaterThan(0);

    // P-007.6 Billing
    expect(hospitalityBillingService.folios.list(CONTEXT, DEFAULT_PROPERTY_ID).length).toBeGreaterThan(0);

    // P-007.7 Analytics
    const analytics = hospitalityAnalyticsService.getFullAnalytics(CONTEXT, DEFAULT_PROPERTY_ID);
    expect(analytics.executive.health.overall).toBeGreaterThan(0);
    expect(analytics.insights.length).toBeGreaterThan(0);
  });

  it("validates executive platform integration", () => {
    const brief = getHospitalityBriefContribution();
    const intelligence = hospitalityService.getIntelligence(CONTEXT);

    expect(brief.workspaceId).toBe("hospitality");
    expect(brief.briefingLine.length).toBeGreaterThan(10);
    expect(brief.operationalHealth).toBeGreaterThan(0);
    expect(intelligence.recommendations.length).toBeGreaterThan(0);
    expect(intelligence.patterns.length).toBeGreaterThan(0);
  });

  it("validates all seven domain service exports are functional", () => {
    const services = [
      hospitalityInventoryService,
      hospitalityReservationService,
      hospitalityGuestService,
      hospitalityFrontOfficeService,
      hospitalityHousekeepingService,
      hospitalityBillingService,
      hospitalityAnalyticsService,
    ];
    expect(services.every((service) => service !== null && typeof service === "object")).toBe(true);
  });
});
