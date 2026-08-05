import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  procurementApprovalService,
  procurementRequisitionService,
  procurementSupplierService,
} from "@/lib/procurement";
import { PROCUREMENT_SEED_ORG_ID } from "@/lib/procurement/persistence/createProcurementStore";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { ServiceContext } from "@/types/services";

const ORG_A = PROCUREMENT_SEED_ORG_ID;
const ORG_B = "org-other";

const ADMIN_CONTEXT: ServiceContext = {
  organizationId: ORG_A,
  workspaceId: "workspace-orania",
  userId: "user-procurement-admin",
  role: "organization_admin",
};

const READ_ONLY_CONTEXT: ServiceContext = {
  ...ADMIN_CONTEXT,
  userId: "user-procurement-readonly",
  role: "read_only",
};

const BUYER_CONTEXT: ServiceContext = {
  ...ADMIN_CONTEXT,
  userId: "user-procurement-buyer",
  role: "staff",
};

function createRequisition(title = "Office Supplies") {
  return procurementRequisitionService.createRequisition({ title }, ADMIN_CONTEXT);
}

describe("PurchaseRequisitionService (P-010.8)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("creates a requisition in draft status", () => {
    const requisition = createRequisition("Draft Requisition");

    expect(requisition.status).toBe("draft");
    expect(requisition.requesterId).toBe(ADMIN_CONTEXT.userId);
    expect(requisition.organizationId).toBe(ORG_A);
  });

  it("lists and retrieves requisitions", () => {
    const requisition = createRequisition("Listed Requisition");

    const list = procurementRequisitionService.listRequisitions(ADMIN_CONTEXT);
    expect(list.total).toBeGreaterThanOrEqual(1);
    expect(procurementRequisitionService.getRequisition(requisition.id, ADMIN_CONTEXT)?.title).toBe(
      "Listed Requisition",
    );
  });

  it("updates a draft requisition", () => {
    const requisition = createRequisition("Before Update");

    const updated = procurementRequisitionService.updateRequisition(
      requisition.id,
      { title: "After Update", amount: "15000", currencyCode: "ZAR" },
      ADMIN_CONTEXT,
    );

    expect(updated.title).toBe("After Update");
    expect(updated.amount).toBe("15000");
  });

  it("runs submit, approve, and close workflow", () => {
    const requisition = createRequisition("Workflow Requisition");

    const submitted = procurementRequisitionService.submitRequisition(requisition.id, ADMIN_CONTEXT);
    expect(submitted.status).toBe("submitted");
    expect(procurementApprovalService.getApprovalForRequisition(requisition.id, ADMIN_CONTEXT)?.status).toBe(
      "pending",
    );

    const approved = procurementRequisitionService.approveRequisition(requisition.id, ADMIN_CONTEXT);
    expect(approved.status).toBe("approved");

    const closed = procurementRequisitionService.closeRequisition(requisition.id, ADMIN_CONTEXT);
    expect(closed.status).toBe("closed");
  });

  it("rejects a submitted requisition", () => {
    const requisition = createRequisition("Reject Requisition");
    procurementRequisitionService.submitRequisition(requisition.id, ADMIN_CONTEXT);

    const rejected = procurementRequisitionService.rejectRequisition(
      requisition.id,
      ADMIN_CONTEXT,
      "Budget exceeded",
    );

    expect(rejected.status).toBe("rejected");
    expect(rejected.rejectionReason).toBe("Budget exceeded");
  });

  it("cancels a draft requisition", () => {
    const requisition = createRequisition("Cancel Requisition");

    const cancelled = procurementRequisitionService.cancelRequisition(requisition.id, ADMIN_CONTEXT);
    expect(cancelled.status).toBe("cancelled");
  });

  it("prevents invalid workflow transitions", () => {
    const requisition = createRequisition("Invalid Transition");
    procurementRequisitionService.submitRequisition(requisition.id, ADMIN_CONTEXT);
    procurementRequisitionService.approveRequisition(requisition.id, ADMIN_CONTEXT);

    expect(() =>
      procurementRequisitionService.submitRequisition(requisition.id, ADMIN_CONTEXT),
    ).toThrow("INVALID_REQUISITION_TRANSITION");

    expect(() =>
      procurementRequisitionService.updateRequisition(
        requisition.id,
        { title: "Late Edit" },
        ADMIN_CONTEXT,
      ),
    ).toThrow("REQUISITION_NOT_EDITABLE");
  });

  it("validates vendor reference on create when vendorId is supplied", () => {
    const supplier = procurementSupplierService.createSupplier(
      { vendorCode: "REQ-VND", displayName: "Req Vendor" },
      ADMIN_CONTEXT,
    );

    const requisition = procurementRequisitionService.createRequisition(
      { title: "Vendor Linked Req", vendorId: supplier.id },
      ADMIN_CONTEXT,
    );

    expect(requisition.vendorId).toBe(supplier.id);

    expect(() =>
      procurementRequisitionService.createRequisition(
        { title: "Bad Vendor Req", vendorId: "missing-vendor" },
        ADMIN_CONTEXT,
      ),
    ).toThrow("VENDOR_NOT_FOUND");
  });

  it("enforces organization isolation on retrieval", () => {
    const requisition = createRequisition("Org A Requisition");

    expect(
      procurementRequisitionService.getRequisition(requisition.id, {
        ...ADMIN_CONTEXT,
        organizationId: ORG_B,
      }),
    ).toBeNull();
  });

  it("denies requisition creation for read-only roles", () => {
    expect(() =>
      procurementRequisitionService.createRequisition(
        { title: "Denied Requisition" },
        READ_ONLY_CONTEXT,
      ),
    ).toThrow(AuthorizationError);
  });

  it("denies approval for buyer roles without approve permission", () => {
    const requisition = createRequisition("Buyer Approval Test");
    procurementRequisitionService.submitRequisition(requisition.id, ADMIN_CONTEXT);

    expect(() =>
      procurementRequisitionService.approveRequisition(requisition.id, BUYER_CONTEXT),
    ).toThrow(AuthorizationError);
  });

  it("wires requisition services through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());

    expect(wiring.purchaseRequisitionService).toBeDefined();
    expect(wiring.purchaseApprovalService).toBeDefined();

    const requisition = wiring.purchaseRequisitionService.createRequisition(
      { title: "Wiring Requisition" },
      ADMIN_CONTEXT,
    );

    expect(wiring.backing.requisitions.get(requisition.id)).toBeDefined();
  });
});
