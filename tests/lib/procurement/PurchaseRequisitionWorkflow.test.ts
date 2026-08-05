import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import { procurementRequisitionService } from "@/lib/procurement";
import { PROCUREMENT_CANONICAL_EVENT_VERSION } from "@/lib/procurement/events";
import { PROCUREMENT_SEED_ORG_ID } from "@/lib/procurement/persistence/createProcurementStore";
import {
  getIntelligenceIntegrationService,
  resetIntelligenceIntegrationForTests,
} from "@/lib/platform/intelligence";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: PROCUREMENT_SEED_ORG_ID,
  workspaceId: "workspace-orania",
  userId: "user-requisition-workflow",
  role: "organization_admin",
};

const OTHER_CONTEXT: ServiceContext = {
  ...CONTEXT,
  organizationId: "org-other",
};

function canonicalEvents(context: ServiceContext = CONTEXT) {
  return getIntelligenceIntegrationService()
    .listEvents(context, 100)
    .filter((entry) => entry.payload.canonicalEventType);
}

function countCanonical(type: string, context: ServiceContext = CONTEXT): number {
  return canonicalEvents(context).filter((entry) => entry.payload.canonicalEventType === type).length;
}

describe("Purchase Requisition Workflow (P-010.8)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
  });

  it("publishes procurement.requisition.created after successful creation", () => {
    const before = countCanonical("procurement.requisition.created");

    const requisition = procurementRequisitionService.createRequisition(
      { title: "Workflow Requisition" },
      CONTEXT,
    );

    const events = canonicalEvents().filter(
      (entry) => entry.payload.requisitionId === requisition.id,
    );
    expect(countCanonical("procurement.requisition.created")).toBe(before + 1);
    expect(events[0]?.payload.eventVersion).toBe(PROCUREMENT_CANONICAL_EVENT_VERSION);
    expect(events[0]?.payload.sourceDomain).toBe("procurement");
    expect(events[0]?.correlationId).toBe(requisition.id);
  });

  it("does not publish when creation rolls back on validation failure", () => {
    const before = countCanonical("procurement.requisition.created");

    expect(() =>
      procurementRequisitionService.createRequisition({ title: "   " }, CONTEXT),
    ).toThrow("INVALID_REQUISITION_TITLE");

    expect(countCanonical("procurement.requisition.created")).toBe(before);
  });

  it("publishes procurement.requisition.approved after approval", () => {
    const requisition = procurementRequisitionService.createRequisition(
      { title: "Approve Workflow" },
      CONTEXT,
    );

    procurementRequisitionService.submitRequisition(requisition.id, CONTEXT);
    procurementRequisitionService.approveRequisition(requisition.id, CONTEXT);

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "procurement.requisition.approved" &&
          entry.payload.requisitionId === requisition.id,
      ),
    ).toBe(true);
  });

  it("does not publish approval event on reject or cancel", () => {
    const rejectReq = procurementRequisitionService.createRequisition(
      { title: "Reject Workflow" },
      CONTEXT,
    );
    procurementRequisitionService.submitRequisition(rejectReq.id, CONTEXT);
    procurementRequisitionService.rejectRequisition(rejectReq.id, CONTEXT, "Not approved");

    const cancelReq = procurementRequisitionService.createRequisition(
      { title: "Cancel Workflow" },
      CONTEXT,
    );
    procurementRequisitionService.cancelRequisition(cancelReq.id, CONTEXT);

    const approvedEvents = canonicalEvents().filter(
      (entry) => entry.payload.canonicalEventType === "procurement.requisition.approved",
    );
    expect(approvedEvents.some((entry) => entry.payload.requisitionId === rejectReq.id)).toBe(false);
    expect(approvedEvents.some((entry) => entry.payload.requisitionId === cancelReq.id)).toBe(false);
  });

  it("isolates canonical requisition events by organization", () => {
    procurementRequisitionService.createRequisition({ title: "Org A Req" }, CONTEXT);
    procurementRequisitionService.createRequisition({ title: "Org B Req" }, OTHER_CONTEXT);

    expect(countCanonical("procurement.requisition.created", CONTEXT)).toBe(1);
    expect(countCanonical("procurement.requisition.created", OTHER_CONTEXT)).toBe(1);
  });

  it("suppresses duplicate canonical publication when approval is repeated", () => {
    const requisition = procurementRequisitionService.createRequisition(
      { title: "Duplicate Approval Guard" },
      CONTEXT,
    );

    procurementRequisitionService.submitRequisition(requisition.id, CONTEXT);
    expect(() =>
      procurementRequisitionService.approveRequisition(requisition.id, CONTEXT),
    ).not.toThrow();
    expect(() =>
      procurementRequisitionService.approveRequisition(requisition.id, CONTEXT),
    ).not.toThrow();

    const approved = canonicalEvents().filter(
      (entry) =>
        entry.payload.canonicalEventType === "procurement.requisition.approved" &&
        entry.payload.requisitionId === requisition.id,
    );
    expect(approved).toHaveLength(1);
  });

  it("wires requisition workflow emission through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());

    const requisition = wiring.purchaseRequisitionService.createRequisition(
      { title: "Wiring Workflow Requisition" },
      CONTEXT,
    );

    expect(
      getIntelligenceIntegrationService()
        .listEvents(CONTEXT, 20)
        .some(
          (entry) =>
            entry.payload.canonicalEventType === "procurement.requisition.created" &&
            entry.payload.requisitionId === requisition.id,
        ),
    ).toBe(true);
  });
});
