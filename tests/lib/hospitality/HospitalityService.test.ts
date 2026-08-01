import { describe, expect, it } from "vitest";
import { hospitalityService } from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("HospitalityService (Mission P-007)", () => {
  it("returns dashboard view model with KPIs and operations", () => {
    const dashboard = hospitalityService.getDashboard(CONTEXT);

    expect(dashboard.summary).toContain("occupancy");
    expect(dashboard.kpis.length).toBeGreaterThan(0);
    expect(dashboard.arrivalsDepartures.length).toBeGreaterThan(0);
    expect(dashboard.quickActions.some((action) => action.href.startsWith("/hospitality"))).toBe(true);
  });

  it("lists reservations with guest and room metadata", () => {
    const reservations = hospitalityService.listReservations(CONTEXT);

    expect(reservations.length).toBeGreaterThan(0);
    expect(reservations[0]?.guestName).toBeTruthy();
    expect(reservations[0]?.roomType).toBeTruthy();
  });

  it("loads reservation and guest detail within organization scope", () => {
    const reservation = hospitalityService.getReservation("res-001", CONTEXT);
    const guest = hospitalityService.getGuest("guest-mehta", CONTEXT);

    expect(reservation).not.toBeNull();
    expect(reservation!.engine.record.id).toBe("res-001");
    expect(guest?.guest.name).toBeTruthy();
    expect(guest?.stays.length).toBeGreaterThan(0);
  });

  it("returns room inventory and property structure", () => {
    const rooms = hospitalityService.listRooms(CONTEXT);
    const structure = hospitalityService.getPropertyStructure(CONTEXT);

    expect(rooms.length).toBeGreaterThan(0);
    expect(structure?.property.name).toContain("ORANIA");
    expect(structure?.buildings.length).toBeGreaterThan(0);
  });

  it("returns housekeeping board and billing folios", () => {
    const board = hospitalityService.getHousekeepingBoard(CONTEXT);
    const folios = hospitalityService.listBilling(CONTEXT);

    expect(board.length).toBeGreaterThan(0);
    expect(folios.length).toBeGreaterThan(0);
  });

  it("returns operations snapshot and intelligence recommendations", () => {
    const ops = hospitalityService.getOperations(CONTEXT);
    const intelligence = hospitalityService.getIntelligence(CONTEXT);

    expect(ops.occupancyPercent).toBeGreaterThan(0);
    expect(intelligence.recommendations.length).toBeGreaterThan(0);
    expect(intelligence.alerts.length).toBeGreaterThan(0);
  });

  it("creates reservation and transitions check-in/out lifecycle", () => {
    const created = hospitalityService.createReservation(
      {
        guestId: "guest-mehta",
        roomTypeId: "rt-standard",
        channel: "direct",
        status: "confirmed",
        checkIn: "2026-08-01T14:00:00.000Z",
        checkOut: "2026-08-03T11:00:00.000Z",
        adults: 2,
        children: 0,
        rate: 4200,
        isVip: false,
      },
      CONTEXT,
      "Executive",
    );

    const checkedIn = hospitalityService.checkIn(created.id, CONTEXT, "Executive");
    expect(checkedIn.status).toBe("checked_in");

    const checkedOut = hospitalityService.checkOut(created.id, CONTEXT, "Executive");
    expect(checkedOut.status).toBe("checked_out");
  });
});
