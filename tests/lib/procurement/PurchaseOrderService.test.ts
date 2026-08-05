import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  procurementPurchaseContractService,
  procurementPurchaseOrderService,
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

function createVendor() {
  return procurementSupplierService.createSupplier(
    { vendorCode: `VND-${Date.now()}`, displayName: "PO Vendor" },
    ADMIN_CONTEXT,
  );
}

function createApprovedRequisition(vendorId: string) {
  const requisition = procurementRequisitionService.createRequisition(
    { title: "Approved Req", vendorId },
    ADMIN_CONTEXT,
  );
  procurementRequisitionService.submitRequisition(requisition.id, ADMIN_CONTEXT);
  procurementRequisitionService.approveRequisition(requisition.id, ADMIN_CONTEXT);
  return requisition;
}

function createPurchaseOrder(overrides: { vendorId: string; requisitionId?: string; contractId?: string }) {
  return procurementPurchaseOrderService.createPurchaseOrder(
    {
      purchaseOrderNumber: `PO-${Date.now()}`,
      vendorId: overrides.vendorId,
      requisitionId: overrides.requisitionId,
      contractId: overrides.contractId,
      amount: "50000",
      currencyCode: "ZAR",
    },
    ADMIN_CONTEXT,
  );
}

describe("PurchaseOrderService (P-010.9)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("creates a purchase order in draft status", () => {
    const vendor = createVendor();
    const requisition = createApprovedRequisition(vendor.id);
    const purchaseOrder = createPurchaseOrder({
      vendorId: vendor.id,
      requisitionId: requisition.id,
    });

    expect(purchaseOrder.status).toBe("draft");
    expect(purchaseOrder.requisitionId).toBe(requisition.id);
    expect(purchaseOrder.amendmentVersion).toBe(1);
  });

  it("lists and retrieves purchase orders", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder({ vendorId: vendor.id });

    const list = procurementPurchaseOrderService.listPurchaseOrders(ADMIN_CONTEXT);
    expect(list.total).toBeGreaterThanOrEqual(1);
    expect(
      procurementPurchaseOrderService.getPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT)?.id,
    ).toBe(purchaseOrder.id);
  });

  it("runs submit, approve, and close workflow", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder({ vendorId: vendor.id });

    const submitted = procurementPurchaseOrderService.submitPurchaseOrder(
      purchaseOrder.id,
      ADMIN_CONTEXT,
    );
    expect(submitted.status).toBe("submitted");

    const approved = procurementPurchaseOrderService.approvePurchaseOrder(
      purchaseOrder.id,
      ADMIN_CONTEXT,
    );
    expect(approved.status).toBe("approved");

    const closed = procurementPurchaseOrderService.closePurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);
    expect(closed.status).toBe("closed");
  });

  it("amends a purchase order before closure", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder({ vendorId: vendor.id });
    procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);

    const amended = procurementPurchaseOrderService.amendPurchaseOrder(
      purchaseOrder.id,
      { amount: "75000", amendmentNote: "Scope increase" },
      ADMIN_CONTEXT,
    );

    expect(amended.amount).toBe("75000");
    expect(amended.amendmentVersion).toBe(2);
  });

  it("cancels a draft purchase order", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder({ vendorId: vendor.id });

    const cancelled = procurementPurchaseOrderService.cancelPurchaseOrder(
      purchaseOrder.id,
      ADMIN_CONTEXT,
    );
    expect(cancelled.status).toBe("cancelled");
  });

  it("prevents invalid workflow transitions", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder({ vendorId: vendor.id });
    procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);
    procurementPurchaseOrderService.approvePurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);

    expect(() =>
      procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT),
    ).toThrow("INVALID_PURCHASE_ORDER_TRANSITION");

    expect(() =>
      procurementPurchaseOrderService.amendPurchaseOrder(
        purchaseOrder.id,
        { amount: "90000" },
        ADMIN_CONTEXT,
      ),
    ).not.toThrow();

    procurementPurchaseOrderService.closePurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);

    expect(() =>
      procurementPurchaseOrderService.amendPurchaseOrder(
        purchaseOrder.id,
        { amount: "100000" },
        ADMIN_CONTEXT,
      ),
    ).toThrow("PURCHASE_ORDER_NOT_AMENDABLE");
  });

  it("links purchase orders to purchase contracts", () => {
    const vendor = createVendor();
    const contract = procurementPurchaseContractService.createContract(
      {
        contractNumber: "CTR-001",
        title: "Framework Agreement",
        vendorId: vendor.id,
        amount: "100000",
        currencyCode: "ZAR",
      },
      ADMIN_CONTEXT,
    );

    const purchaseOrder = createPurchaseOrder({
      vendorId: vendor.id,
      contractId: contract.id,
    });

    expect(purchaseOrder.contractId).toBe(contract.id);

    expect(() =>
      procurementPurchaseOrderService.createPurchaseOrder(
        {
          purchaseOrderNumber: "PO-BAD-CTR",
          vendorId: vendor.id,
          contractId: "missing-contract",
        },
        ADMIN_CONTEXT,
      ),
    ).toThrow("CONTRACT_NOT_FOUND");
  });

  it("requires approved requisitions when requisitionId is supplied", () => {
    const vendor = createVendor();
    const draftReq = procurementRequisitionService.createRequisition(
      { title: "Draft Req", vendorId: vendor.id },
      ADMIN_CONTEXT,
    );

    expect(() =>
      procurementPurchaseOrderService.createPurchaseOrder(
        {
          purchaseOrderNumber: "PO-BAD-REQ",
          vendorId: vendor.id,
          requisitionId: draftReq.id,
        },
        ADMIN_CONTEXT,
      ),
    ).toThrow("REQUISITION_NOT_APPROVED");
  });

  it("enforces organization isolation on retrieval", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder({ vendorId: vendor.id });

    expect(
      procurementPurchaseOrderService.getPurchaseOrder(purchaseOrder.id, {
        ...ADMIN_CONTEXT,
        organizationId: ORG_B,
      }),
    ).toBeNull();
  });

  it("denies purchase order creation for read-only roles", () => {
    const vendor = createVendor();

    expect(() =>
      procurementPurchaseOrderService.createPurchaseOrder(
        {
          purchaseOrderNumber: "PO-RBAC",
          vendorId: vendor.id,
        },
        READ_ONLY_CONTEXT,
      ),
    ).toThrow(AuthorizationError);
  });

  it("denies approval for buyer roles without approve permission", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder({ vendorId: vendor.id });
    procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);

    expect(() =>
      procurementPurchaseOrderService.approvePurchaseOrder(purchaseOrder.id, BUYER_CONTEXT),
    ).toThrow(AuthorizationError);
  });

  it("creates and updates purchase contracts", () => {
    const vendor = createVendor();

    const contract = procurementPurchaseContractService.createContract(
      {
        contractNumber: "CTR-UPD",
        title: "Supply Agreement",
        vendorId: vendor.id,
      },
      ADMIN_CONTEXT,
    );

    const updated = procurementPurchaseContractService.updateContract(
      contract.id,
      { title: "Updated Supply Agreement", status: "active" },
      ADMIN_CONTEXT,
    );

    expect(updated.title).toBe("Updated Supply Agreement");
    expect(updated.status).toBe("active");
  });

  it("wires purchase order services through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());
    const vendor = wiring.supplierService.createSupplier(
      { vendorCode: "WIRE-VND", displayName: "Wiring Vendor" },
      ADMIN_CONTEXT,
    );

    const purchaseOrder = wiring.purchaseOrderService.createPurchaseOrder(
      { purchaseOrderNumber: "PO-WIRE", vendorId: vendor.id },
      ADMIN_CONTEXT,
    );

    expect(wiring.purchaseOrderService).toBeDefined();
    expect(wiring.purchaseContractService).toBeDefined();
    expect(wiring.backing.purchaseOrders.get(purchaseOrder.id)).toBeDefined();
  });
});
