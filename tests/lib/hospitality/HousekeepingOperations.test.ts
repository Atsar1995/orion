import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROPERTY_ID,
  hospitalityFrontOfficeService,
  hospitalityHousekeepingService,
} from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Housekeeping & Maintenance Operations Platform (Mission P-007.5)", () => {
  it("returns housekeeping dashboard with board, queue, and summary", () => {
    const dashboard = hospitalityHousekeepingService.board.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(dashboard.board.length).toBeGreaterThan(0);
    expect(dashboard.summary.readyRooms).toBeGreaterThanOrEqual(0);
    expect(dashboard.summary.awaitingCleaning).toBeGreaterThanOrEqual(0);
    expect(dashboard.queue.length).toBeGreaterThanOrEqual(0);
  });

  it("returns maintenance dashboard with backlog and work orders", () => {
    const maintenance = hospitalityHousekeepingService.maintenance.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(maintenance.workOrders.length).toBeGreaterThan(0);
    expect(maintenance.backlog).toBeGreaterThan(0);
    expect(maintenance.critical).toBeGreaterThanOrEqual(1);
  });

  it("assigns, completes, and inspects cleaning task", () => {
    const pending = hospitalityHousekeepingService.repository
      .listHousekeepingTaskRecords(CONTEXT.organizationId, DEFAULT_PROPERTY_ID)
      .find((entry) => entry.status === "pending");
    expect(pending).toBeTruthy();

    const assigned = hospitalityHousekeepingService.cleaning.assign(
      { taskId: pending!.id, assignedTo: "Housekeeping Team C" },
      CONTEXT,
      "Executive",
    );
    expect(assigned.status).toBe("assigned");

    const started = hospitalityHousekeepingService.cleaning.start(pending!.id, CONTEXT);
    expect(started.status).toBe("in_progress");

    const completed = hospitalityHousekeepingService.cleaning.complete(pending!.id, CONTEXT, "Executive");
    expect(completed.status).toBe("completed");

    const inspected = hospitalityHousekeepingService.cleaning.inspect(pending!.id, CONTEXT, "Supervisor", true);
    expect(inspected.status).toBe("inspected");
  });

  it("creates maintenance work order and resolves it", () => {
    const created = hospitalityHousekeepingService.maintenance.create(
      {
        propertyId: DEFAULT_PROPERTY_ID,
        inventoryItemId: "inv-room-101",
        title: "Test fixture repair",
        description: "Loose bathroom fixture reported during inspection.",
        priority: "medium",
        type: "corrective",
      },
      CONTEXT,
      "Executive",
    );
    expect(created.status).toBe("open");

    const resolved = hospitalityHousekeepingService.maintenance.resolve(created.id, CONTEXT, "Executive");
    expect(resolved.status).toBe("resolved");
    expect(resolved.resolvedAt).toBeTruthy();
  });

  it("auto-creates cleaning task on guest checkout", () => {
    const inHouse = hospitalityFrontOfficeService.dashboard
      .getDashboard(CONTEXT, DEFAULT_PROPERTY_ID)
      .queues.inHouse.find((item) => item.reservationId === "res-003");
    if (!inHouse) return;

    const stay = hospitalityFrontOfficeService.repository.getStayRecord(inHouse.stayId);
    if (!stay?.inventoryItemId) return;

    const before = hospitalityHousekeepingService.repository.getActiveTaskForInventory(stay.inventoryItemId);

    hospitalityFrontOfficeService.checkOut.execute(
      { stayId: inHouse.stayId, expressCheckout: true },
      CONTEXT,
      "Executive",
    );

    const after = hospitalityHousekeepingService.repository.getActiveTaskForInventory(stay.inventoryItemId);
    expect(after?.cleaningType).toBe("checkout");
    if (before) expect(after?.id).toBe(before.id);
  });

  it("exposes brief signals for executive integration", () => {
    const signals = hospitalityHousekeepingService.getBriefSignals(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(signals.readyRooms).toBeGreaterThanOrEqual(0);
    expect(signals.awaitingCleaning).toBeGreaterThanOrEqual(0);
    expect(signals.assetHealthScore).toBeGreaterThan(0);
    expect(signals.cleaningProgressPercent).toBeGreaterThanOrEqual(0);
  });

  it("lists assets, linen, and lost & found records", () => {
    const assets = hospitalityHousekeepingService.maintenance.listAssets(CONTEXT, DEFAULT_PROPERTY_ID);
    const linen = hospitalityHousekeepingService.listLinen(CONTEXT, DEFAULT_PROPERTY_ID);
    const lostAndFound = hospitalityHousekeepingService.listLostAndFound(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(assets.length).toBeGreaterThan(0);
    expect(linen.length).toBeGreaterThan(0);
    expect(lostAndFound.length).toBeGreaterThan(0);
  });
});
