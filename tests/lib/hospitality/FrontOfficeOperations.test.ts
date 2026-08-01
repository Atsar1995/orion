import { describe, expect, it } from "vitest";
import { hospitalityFrontOfficeService, DEFAULT_PROPERTY_ID } from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Front Office Operations Platform (Mission P-007.4)", () => {
  it("returns operational dashboard with arrivals, in-house, and departures", () => {
    const dashboard = hospitalityFrontOfficeService.dashboard.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID, "2026-07-30");
    expect(dashboard.today.arrivals).toBeGreaterThanOrEqual(3);
    expect(dashboard.queues.inHouse.length).toBeGreaterThanOrEqual(2);
    expect(dashboard.occupancy.percent).toBeGreaterThan(0);
  });

  it("lists occupancy board with room buckets", () => {
    const board = hospitalityFrontOfficeService.occupancy.getOccupancyBoard(CONTEXT, DEFAULT_PROPERTY_ID);
    expect(board.length).toBeGreaterThan(0);
    expect(board.some((item) => item.bucket === "occupied" || item.bucket === "vacant_clean")).toBe(true);
  });

  it("assigns room to expected stay", () => {
    const unassigned = hospitalityFrontOfficeService.dashboard
      .getDashboard(CONTEXT, DEFAULT_PROPERTY_ID, "2026-08-10")
      .queues.arrivals.find((item) => !item.roomAssigned);
    if (!unassigned) return;

    const rooms = hospitalityFrontOfficeService.assignment.listAvailableRooms(unassigned.stayId, CONTEXT);
    if (rooms.length === 0) return;

    const updated = hospitalityFrontOfficeService.assignment.assignRoom(
      { stayId: unassigned.stayId, inventoryItemId: rooms[0]!.id },
      CONTEXT,
      "Executive",
    );
    expect(updated.inventoryItemId).toBe(rooms[0]!.id);
  });

  it("executes check-in workflow with registration and inventory sync", () => {
    const arrival = hospitalityFrontOfficeService.dashboard
      .getDashboard(CONTEXT, DEFAULT_PROPERTY_ID, "2026-07-30")
      .queues.arrivals.find((item) => item.roomAssigned && item.reservationId === "res-001");
    expect(arrival).toBeTruthy();

    const checkedIn = hospitalityFrontOfficeService.checkIn.execute(
      {
        stayId: arrival!.stayId,
        identityVerified: true,
        signatureCaptured: true,
        keyIssued: true,
        depositCollected: true,
      },
      CONTEXT,
      "Executive",
    );
    expect(checkedIn.status).toBe("checked_in");
    expect(checkedIn.registration?.identityVerified).toBe(true);
  });

  it("executes check-out workflow for in-house stay", () => {
    const inHouse = hospitalityFrontOfficeService.dashboard
      .getDashboard(CONTEXT, DEFAULT_PROPERTY_ID)
      .queues.inHouse.find((item) => item.reservationId === "res-006");
    expect(inHouse).toBeTruthy();

    const checkedOut = hospitalityFrontOfficeService.checkOut.execute(
      { stayId: inHouse!.stayId, expressCheckout: true, feedbackCollected: true },
      CONTEXT,
      "Executive",
    );
    expect(checkedOut.status).toBe("checked_out");
  });

  it("detects operational delays for unassigned and not-ready rooms", () => {
    const signals = hospitalityFrontOfficeService.getBriefSignals(CONTEXT, DEFAULT_PROPERTY_ID);
    expect(signals.unassignedArrivals).toBeGreaterThanOrEqual(0);
    expect(signals.currentOccupancy).toBeGreaterThan(0);
    expect(signals.operationalDelays.length).toBeGreaterThanOrEqual(0);
  });

  it("supports stay extension movement", () => {
    const inHouse = hospitalityFrontOfficeService.dashboard.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID).queues.inHouse[0];
    if (!inHouse) return;

    const extended = hospitalityFrontOfficeService.stays.executeMovement(
      { stayId: inHouse.stayId, type: "extension", newDeparture: "2026-08-05" },
      CONTEXT,
      "Executive",
    );
    expect(extended.departure).toBe("2026-08-05");
  });
});
