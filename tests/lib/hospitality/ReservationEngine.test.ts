import { describe, expect, it } from "vitest";
import { hospitalityReservationService, DEFAULT_PROPERTY_ID } from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Reservation Management Engine (Mission P-007.2)", () => {
  it("lists reservations with reservation numbers and multi-property scope", () => {
    const result = hospitalityReservationService.reservations.search({}, CONTEXT);
    expect(result.total).toBeGreaterThanOrEqual(7);
    expect(result.items.some((item) => item.reservationNumber.startsWith("ORH-"))).toBe(true);
    expect(result.items.some((item) => item.propertyId !== DEFAULT_PROPERTY_ID)).toBe(true);
  });

  it("returns reservation detail with conflict detection", () => {
    const detail = hospitalityReservationService.reservations.getDetail("res-001", CONTEXT);
    expect(detail?.record.reservationNumber).toBe("ORH-2026-0001");
    expect(detail?.conflicts).toBeDefined();
  });

  it("checks availability for date range", () => {
    const availability = hospitalityReservationService.availability.checkAvailability(
      {
        propertyId: DEFAULT_PROPERTY_ID,
        arrival: "2026-08-10",
        departure: "2026-08-12",
        accommodationTypeId: "acc-rt-standard",
        guestCount: { adults: 2, children: 0, infants: 0 },
      },
      CONTEXT.organizationId,
    );
    expect(availability.availableUnits.length).toBeGreaterThan(0);
  });

  it("provides calendar view with arrivals and departures summary", () => {
    const calendar = hospitalityReservationService.calendar.getCalendarView(
      CONTEXT,
      "weekly",
      "2026-07-30",
    );
    expect(calendar.entries.length).toBeGreaterThan(0);
    expect(calendar.summary.arrivals).toBeGreaterThanOrEqual(0);
    expect(calendar.summary.departures).toBeGreaterThanOrEqual(0);
  });

  it("executes reservation lifecycle actions", () => {
    const created = hospitalityReservationService.reservations.create(
      {
        propertyId: DEFAULT_PROPERTY_ID,
        guestId: "guest-nair",
        accommodationTypeId: "acc-rt-standard",
        source: "telephone",
        arrival: "2026-08-20",
        departure: "2026-08-22",
        guestCount: { adults: 1, children: 0, infants: 0 },
        rate: 4200,
      },
      CONTEXT,
      "Executive",
    );
    expect(created.reservationNumber).toBeTruthy();

    const checkedIn = hospitalityReservationService.reservations.executeAction(
      created.id,
      "check_in",
      CONTEXT,
      "Executive",
    );
    expect(checkedIn.status).toBe("checked_in");

    const cancelled = hospitalityReservationService.reservations.executeAction(
      created.id,
      "check_out",
      CONTEXT,
      "Executive",
    );
    expect(cancelled.status).toBe("checked_out");
  });

  it("searches reservations by number and guest query", () => {
    const byNumber = hospitalityReservationService.reservations.search(
      { reservationNumber: "ORH-2026-0001" },
      CONTEXT,
    );
    expect(byNumber.total).toBe(1);

    const byGuest = hospitalityReservationService.reservations.search({ query: "Mehta" }, CONTEXT);
    expect(byGuest.total).toBeGreaterThan(0);
  });

  it("returns brief signals for executive integration", () => {
    const signals = hospitalityReservationService.reservations.getBriefSignals(CONTEXT);
    expect(signals.todaysArrivals).toBeGreaterThanOrEqual(0);
    expect(signals.bookingPace).toBeTruthy();
    expect(signals.reservationTrend).toContain("reservation");
  });
});
