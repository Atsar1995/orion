import { describe, expect, it } from "vitest";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Guest Intelligence & Relationship Platform (Mission P-007.3)", () => {
  it("lists enriched guest profiles with loyalty and satisfaction", () => {
    const result = hospitalityGuestService.guests.search({}, CONTEXT);
    expect(result.total).toBeGreaterThanOrEqual(6);
    expect(result.items.some((item) => item.isVip)).toBe(true);
    expect(result.items.some((item) => item.satisfactionScore !== undefined)).toBe(true);
  });

  it("returns guest detail with timeline, analytics, and relationships", () => {
    const detail = hospitalityGuestService.guests.getDetail("guest-mehta", CONTEXT);
    expect(detail?.record.fullName).toBe("Rajesh Mehta");
    expect(detail?.record.relationships.length).toBeGreaterThan(0);
    expect(detail?.timeline.length).toBeGreaterThan(0);
    expect(detail?.analytics.lifetimeValue).toBeTruthy();
    expect(detail?.stayHistory.length).toBeGreaterThan(0);
  });

  it("searches guests by name, email, and reservation number", () => {
    const byName = hospitalityGuestService.guests.search({ query: "Mehta" }, CONTEXT);
    expect(byName.total).toBeGreaterThan(0);

    const byEmail = hospitalityGuestService.guests.search({ email: "rajesh.mehta@example.com" }, CONTEXT);
    expect(byEmail.total).toBe(1);

    const byReservation = hospitalityGuestService.guests.search({ reservationNumber: "ORH-2026-0001" }, CONTEXT);
    expect(byReservation.total).toBe(1);
    expect(byReservation.items[0]?.fullName).toContain("Mehta");
  });

  it("detects duplicate guest profiles", () => {
    const duplicates = hospitalityGuestService.guests.findDuplicates(CONTEXT);
    expect(duplicates.some((pair) => pair.primary.fullName.includes("Mehta"))).toBe(true);
    expect(duplicates[0]?.score).toBeGreaterThanOrEqual(35);
  });

  it("creates and modifies guest profiles", () => {
    const created = hospitalityGuestService.guests.create(
      {
        fullName: "Test Guest",
        email: "test.guest@example.com",
        phone: "+91 90000 00000",
        loyaltyTier: "standard",
      },
      CONTEXT,
      "Executive",
    );
    expect(created.id).toBeTruthy();
    expect(created.fullName).toBe("Test Guest");

    const updated = hospitalityGuestService.guests.modify(
      created.id,
      { loyaltyTier: "gold", isVip: true },
      CONTEXT,
      "Executive",
    );
    expect(updated.loyaltyTier).toBe("gold");
    expect(updated.isVip).toBe(true);
  });

  it("merges duplicate guest profiles", () => {
    const primary = hospitalityGuestService.guests.create(
      { fullName: "Merge Primary", email: "merge.primary@example.com", phone: "+91 91111 11111" },
      CONTEXT,
      "Executive",
    );
    const duplicate = hospitalityGuestService.guests.create(
      { fullName: "Merge Duplicate", email: "merge.primary@example.com", phone: "+91 91111 11111" },
      CONTEXT,
      "Executive",
    );

    const merged = hospitalityGuestService.guests.merge(
      { primaryGuestId: primary.id, duplicateGuestId: duplicate.id },
      CONTEXT,
      "Executive",
    );
    expect(merged.stayCount).toBeGreaterThanOrEqual(0);
    expect(hospitalityGuestService.guests.getDetail(duplicate.id, CONTEXT)).toBeNull();
  });

  it("manages preferences and consent", () => {
    const preferences = hospitalityGuestService.preferences.list("guest-chen", CONTEXT);
    expect(preferences.length).toBeGreaterThan(0);

    const consents = hospitalityGuestService.consent.list("guest-chen", CONTEXT);
    expect(consents.some((entry) => entry.type === "data_processing")).toBe(true);
  });

  it("provides communication timeline", () => {
    const timeline = hospitalityGuestService.timeline.getTimeline("guest-mehta", CONTEXT);
    expect(timeline?.entries.length).toBeGreaterThan(0);
    expect(timeline?.entries.some((entry) => entry.type === "special_occasion")).toBe(true);
  });

  it("returns brief signals for executive integration", () => {
    const signals = hospitalityGuestService.guests.getBriefSignals(CONTEXT);
    expect(signals.repeatGuests).toBeGreaterThan(0);
    expect(signals.satisfactionTrend).toBeTruthy();
    expect(signals.guestRetentionOpportunity).toBeTruthy();
  });
});
