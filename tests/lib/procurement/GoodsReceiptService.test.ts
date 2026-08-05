import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  procurementGoodsReceiptService,
  procurementPurchaseOrderService,
  procurementReceivingLineService,
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
  userId: "user-gr-admin",
  role: "organization_admin",
};

const READ_ONLY_CONTEXT: ServiceContext = {
  ...ADMIN_CONTEXT,
  userId: "user-gr-readonly",
  role: "read_only",
};

function createVendor() {
  return procurementSupplierService.createSupplier(
    { vendorCode: `GR-VND-${Date.now()}`, displayName: "GR Vendor" },
    ADMIN_CONTEXT,
  );
}

function createApprovedPurchaseOrder(vendorId: string) {
  const purchaseOrder = procurementPurchaseOrderService.createPurchaseOrder(
    {
      purchaseOrderNumber: `PO-GR-${Date.now()}`,
      vendorId,
      amount: "10000",
      currencyCode: "ZAR",
    },
    ADMIN_CONTEXT,
  );
  procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);
  procurementPurchaseOrderService.approvePurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);
  return purchaseOrder;
}

function createGoodsReceiptWithLines(purchaseOrderId: string) {
  return procurementGoodsReceiptService.createGoodsReceipt(
    {
      goodsReceiptNumber: `GR-${Date.now()}`,
      purchaseOrderId,
      lines: [
        { itemCode: "ITEM-A", orderedQuantity: "10" },
        { itemCode: "ITEM-B", orderedQuantity: "5" },
      ],
    },
    ADMIN_CONTEXT,
  );
}

function startReceivingFlow(goodsReceiptId: string) {
  procurementGoodsReceiptService.startReceiving(goodsReceiptId, ADMIN_CONTEXT);
}

describe("GoodsReceiptService (P-010.10)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("creates a goods receipt in draft status linked to an approved purchase order", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);

    expect(goodsReceipt.status).toBe("draft");
    expect(goodsReceipt.purchaseOrderId).toBe(purchaseOrder.id);
    expect(goodsReceipt.vendorId).toBe(vendor.id);
  });

  it("lists and retrieves goods receipts", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);

    const list = procurementGoodsReceiptService.listGoodsReceipts(ADMIN_CONTEXT);
    expect(list.total).toBeGreaterThanOrEqual(1);
    expect(
      procurementGoodsReceiptService.getGoodsReceipt(goodsReceipt.id, ADMIN_CONTEXT)?.id,
    ).toBe(goodsReceipt.id);
  });

  it("updates a draft goods receipt", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);

    const updated = procurementGoodsReceiptService.updateGoodsReceipt(
      goodsReceipt.id,
      { goodsReceiptNumber: "GR-UPDATED" },
      ADMIN_CONTEXT,
    );

    expect(updated.goodsReceiptNumber).toBe("GR-UPDATED");
  });

  it("runs start receiving, partial receive, complete, and close workflow", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);
    const lines = procurementReceivingLineService.listLines(goodsReceipt.id, ADMIN_CONTEXT);

    const receiving = procurementGoodsReceiptService.startReceiving(goodsReceipt.id, ADMIN_CONTEXT);
    expect(receiving.status).toBe("receiving");

    const partial = procurementGoodsReceiptService.receiveItems(
      goodsReceipt.id,
      {
        lines: [
          { lineId: lines[0]!.id, receivedQuantity: "4" },
          { lineId: lines[1]!.id, receivedQuantity: "0" },
        ],
      },
      ADMIN_CONTEXT,
    );
    expect(partial.status).toBe("partially_received");

    procurementGoodsReceiptService.receiveItems(
      goodsReceipt.id,
      {
        lines: [
          { lineId: lines[0]!.id, receivedQuantity: "10" },
          { lineId: lines[1]!.id, receivedQuantity: "5" },
        ],
      },
      ADMIN_CONTEXT,
    );

    const completed = procurementGoodsReceiptService.completeReceipt(goodsReceipt.id, ADMIN_CONTEXT);
    expect(completed.status).toBe("received");

    const closed = procurementGoodsReceiptService.closeReceipt(goodsReceipt.id, ADMIN_CONTEXT);
    expect(closed.status).toBe("closed");
  });

  it("supports explicit partial receipt operation", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);
    const lines = procurementReceivingLineService.listLines(goodsReceipt.id, ADMIN_CONTEXT);
    startReceivingFlow(goodsReceipt.id);

    const partial = procurementGoodsReceiptService.partialReceipt(
      goodsReceipt.id,
      { lines: [{ lineId: lines[0]!.id, receivedQuantity: "3" }] },
      ADMIN_CONTEXT,
    );

    expect(partial.status).toBe("partially_received");
  });

  it("cancels a draft goods receipt", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);

    const cancelled = procurementGoodsReceiptService.cancelReceipt(goodsReceipt.id, ADMIN_CONTEXT);
    expect(cancelled.status).toBe("cancelled");
  });

  it("prevents quantity exceeding ordered amount", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);
    const lines = procurementReceivingLineService.listLines(goodsReceipt.id, ADMIN_CONTEXT);
    startReceivingFlow(goodsReceipt.id);

    expect(() =>
      procurementGoodsReceiptService.receiveItems(
        goodsReceipt.id,
        { lines: [{ lineId: lines[0]!.id, receivedQuantity: "11" }] },
        ADMIN_CONTEXT,
      ),
    ).toThrow("QUANTITY_EXCEEDS_ORDERED");
  });

  it("prevents invalid workflow transitions", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);
    startReceivingFlow(goodsReceipt.id);
    procurementGoodsReceiptService.cancelReceipt(goodsReceipt.id, ADMIN_CONTEXT);

    expect(() =>
      procurementGoodsReceiptService.startReceiving(goodsReceipt.id, ADMIN_CONTEXT),
    ).toThrow("INVALID_GOODS_RECEIPT_TRANSITION");
  });

  it("requires an approved purchase order", () => {
    const vendor = createVendor();
    const draftPo = procurementPurchaseOrderService.createPurchaseOrder(
      { purchaseOrderNumber: "PO-DRAFT", vendorId: vendor.id },
      ADMIN_CONTEXT,
    );

    expect(() =>
      procurementGoodsReceiptService.createGoodsReceipt(
        { goodsReceiptNumber: "GR-BAD-PO", purchaseOrderId: draftPo.id },
        ADMIN_CONTEXT,
      ),
    ).toThrow("PURCHASE_ORDER_NOT_APPROVED");
  });

  it("manages receiving lines in draft status", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = procurementGoodsReceiptService.createGoodsReceipt(
      { goodsReceiptNumber: "GR-LINES", purchaseOrderId: purchaseOrder.id },
      ADMIN_CONTEXT,
    );

    const line = procurementReceivingLineService.createLine(
      goodsReceipt.id,
      { itemCode: "ITEM-X", orderedQuantity: "8" },
      ADMIN_CONTEXT,
    );

    expect(line.receivedQuantity).toBe("0");

    const updated = procurementReceivingLineService.updateLine(
      goodsReceipt.id,
      line.id,
      { orderedQuantity: "12" },
      ADMIN_CONTEXT,
    );
    expect(updated.orderedQuantity).toBe("12");
  });

  it("enforces organization isolation on retrieval", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createGoodsReceiptWithLines(purchaseOrder.id);

    expect(
      procurementGoodsReceiptService.getGoodsReceipt(goodsReceipt.id, {
        ...ADMIN_CONTEXT,
        organizationId: ORG_B,
      }),
    ).toBeNull();
  });

  it("denies goods receipt creation for read-only roles", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);

    expect(() =>
      procurementGoodsReceiptService.createGoodsReceipt(
        { goodsReceiptNumber: "GR-RBAC", purchaseOrderId: purchaseOrder.id },
        READ_ONLY_CONTEXT,
      ),
    ).toThrow(AuthorizationError);
  });

  it("wires goods receipt services through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());
    const vendor = wiring.supplierService.createSupplier(
      { vendorCode: "GR-WIRE-VND", displayName: "GR Wiring Vendor" },
      ADMIN_CONTEXT,
    );
    const purchaseOrder = wiring.purchaseOrderService.createPurchaseOrder(
      { purchaseOrderNumber: "PO-GR-WIRE", vendorId: vendor.id },
      ADMIN_CONTEXT,
    );
    wiring.purchaseOrderService.submitPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);
    wiring.purchaseOrderService.approvePurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);

    const goodsReceipt = wiring.goodsReceiptService.createGoodsReceipt(
      {
        goodsReceiptNumber: "GR-WIRE",
        purchaseOrderId: purchaseOrder.id,
        lines: [{ itemCode: "WIRE-ITEM", orderedQuantity: "1" }],
      },
      ADMIN_CONTEXT,
    );

    expect(wiring.goodsReceiptService).toBeDefined();
    expect(wiring.receivingLineService).toBeDefined();
    expect(wiring.backing.goodsReceipts.get(goodsReceipt.id)).toBeDefined();
  });
});
