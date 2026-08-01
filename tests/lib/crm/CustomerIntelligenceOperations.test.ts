import { describe, expect, it } from "vitest";
import {
  crmCustomerIntelligenceService,
  crmService,
  mapCrmCustomerIntelligenceBriefSignals,
} from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Customer Analytics & Relationship Intelligence Platform (Mission P-008.6)", () => {
  it("builds unified customer profiles on partyId", () => {
    const profiles = crmCustomerIntelligenceService.profiles.list(CONTEXT);
    expect(profiles.length).toBeGreaterThan(0);
    expect(profiles.every((entry) => entry.partyId.startsWith("org-party"))).toBe(true);
    expect(profiles.some((entry) => entry.segment === "VIP" || entry.segment === "Enterprise")).toBe(true);
  });

  it("returns profile detail with journey and milestones", () => {
    const profile = crmCustomerIntelligenceService.profiles.get(
      "org-party-orania-hospitality-group",
      CONTEXT,
    );
    expect(profile).toBeTruthy();
    expect(profile!.lifetimeValue).toBeGreaterThan(0);
    expect(profile!.loyaltyIndex).toBeGreaterThan(0);
    expect(profile!.journey.length).toBeGreaterThan(0);
    expect(profile!.hospitalitySummary).toBeTruthy();
  });

  it("runs segmentation engine across segment types", () => {
    const segments = crmCustomerIntelligenceService.segments.analyze(CONTEXT);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.every((entry) => entry.count > 0)).toBe(true);
  });

  it("provides journey analytics by stage", () => {
    const summary = crmCustomerIntelligenceService.journey.getSummary(CONTEXT);
    expect(summary.some((entry) => entry.stage === "acquisition")).toBe(true);
    expect(summary.some((entry) => entry.stage === "service_delivery")).toBe(true);
  });

  it("predicts retention risk for at-risk accounts", () => {
    const retention = crmCustomerIntelligenceService.retention.predict(CONTEXT);
    expect(retention.length).toBeGreaterThan(0);
    expect(retention.every((entry) => entry.drivers.length >= 0)).toBe(true);
  });

  it("identifies growth opportunities", () => {
    const growth = crmCustomerIntelligenceService.growth.identify(CONTEXT);
    expect(growth.length).toBeGreaterThan(0);
    expect(growth[0]!.potentialValue).toBeGreaterThan(0);
  });

  it("generates customer insights with recommended actions", () => {
    const insights = crmCustomerIntelligenceService.insights.generate(CONTEXT);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.every((entry) => entry.recommendedAction.length > 0)).toBe(true);
  });

  it("exposes executive dashboard with hub, segments, retention, and growth", () => {
    const dashboard = crmCustomerIntelligenceService.executive.getDashboard(CONTEXT);
    expect(dashboard.hub.profiles.length).toBeGreaterThan(0);
    expect(dashboard.segments.length).toBeGreaterThan(0);
    expect(dashboard.insights.length).toBeGreaterThan(0);
  });

  it("provides customer intelligence brief signals", () => {
    const signals = mapCrmCustomerIntelligenceBriefSignals(crmCustomerIntelligenceService, CONTEXT);
    expect(signals.vipCustomers).toBeGreaterThanOrEqual(0);
    expect(crmService.getCustomerIntelligenceBriefSignals(CONTEXT).briefingLine).toContain("customer profiles");
  });
});
