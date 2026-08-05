import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  procurementGoodsReceiptService,
  procurementPurchaseOrderService,
  procurementReceivingLineService,
  procurementSupplierService,
} from "@/lib/procurement";
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
  userId: "user-gr-workflow",
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

function createVendor(context: ServiceContext = CONTEXT) {
  return procurementSupplierService.createSupplier(
    { vendorCode: `WF-GR-VND-${Date.now()}`, displayName: "GR Workflow Vendor" },
    context,
  );
}

function createApprovedPurchaseOrder(vendorId: string, context: ServiceContext = CONTEXT) {
  const purchaseOrder = procurementPurchaseOrderService.createPurchaseOrder(
    {
      purchaseOrderNumber: `PO-WF-GR-${Date.now()}`,
      vendorId,
      amount: "15000",
      currencyCode: "ZAR",
    },
    context,
  );
  procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, context);
  procurementPurchaseOrderService.approvePurchaseOrder(purchaseOrder.id, context);
  return purchaseOrder;
}

function createReceiptWithLines(purchaseOrderId: string, context: ServiceContext = CONTEXT) {
  return procurementGoodsReceiptService.createGoodsReceipt(
    {
      goodsReceiptNumber: `GR-WF-${Date.now()}`,
      purchaseOrderId,
      lines: [
        { itemCode: "WF-A", orderedQuantity: "10" },
        { itemCode: "WF-B", orderedQuantity: "6" },
      ],
    },
    context,
  );
}

function receiveAllLines(goodsReceiptId: string, context: ServiceContext = CONTEXT) {
  const lines = procurementReceivingLineService.listLines(goodsReceiptId, context);
  procurementGoodsReceiptService.receiveItems(
    goodsReceiptId,
    {
      lines: lines.map((line) => ({
        lineId: line.id,
        receivedQuantity: line.orderedQuantity,
      })),
    },
    context,
  );
}

describe("Goods Receipt Workflow (P-010.10)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
  });

  it("does not publish procurement.goods.received on create or partial receive", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceiptWithLines(purchaseOrder.id);
    const lines = procurementReceivingLineService.listLines(goodsReceipt.id, CONTEXT);

    procurementGoodsReceiptService.startReceiving(goodsReceipt.id, CONTEXT);
    procurementGoodsReceiptService.receiveItems(
      goodsReceipt.id,
      { lines: [{ lineId: lines[0]!.id, receivedQuantity: "5" }] },
      CONTEXT,
    );

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "procurement.goods.received" &&
          entry.payload.goodsReceiptId === goodsReceipt.id,
      ),
    ).toBe(false);
  });

  it("publishes procurement.goods.received after successful completion", () => {
    const before = countCanonical("procurement.goods.received");
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceiptWithLines(purchaseOrder.id);

    procurementGoodsReceiptService.startReceiving(goodsReceipt.id, CONTEXT);
    receiveAllLines(goodsReceipt.id);
    procurementGoodsReceiptService.completeReceipt(goodsReceipt.id, CONTEXT);

    const events = canonicalEvents().filter(
      (entry) => entry.payload.goodsReceiptId === goodsReceipt.id,
    );
    expect(countCanonical("procurement.goods.received")).toBe(before + 1);
    expect(events[0]?.payload.eventVersion).toBe(PROCUREMENT_CANONICAL_EVENT_VERSION);
    expect(events[0]?.payload.sourceDomain).toBe("procurement");
    expect(events[0]?.correlationId).toBe(goodsReceipt.id);
    expect(events[0]?.payload.purchaseOrderId).toBe(purchaseOrder.id);
  });

  it("does not publish when completion rolls back on validation failure", () => {
    const before = countCanonical("procurement.goods.received");
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceiptWithLines(purchaseOrder.id);
    const lines = procurementReceivingLineService.listLines(goodsReceipt.id, CONTEXT);

    procurementGoodsReceiptService.startReceiving(goodsReceipt.id, CONTEXT);
    procurementGoodsReceiptService.receiveItems(
      goodsReceipt.id,
      { lines: [{ lineId: lines[0]!.id, receivedQuantity: "5" }] },
      CONTEXT,
    );

    expect(() =>
      procurementGoodsReceiptService.completeReceipt(goodsReceipt.id, CONTEXT),
    ).toThrow("GOODS_RECEIPT_NOT_FULLY_RECEIVED");

    expect(countCanonical("procurement.goods.received")).toBe(before);
  });

  it("does not publish goods received event on cancel", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceiptWithLines(purchaseOrder.id);

    procurementGoodsReceiptService.startReceiving(goodsReceipt.id, CONTEXT);
    procurementGoodsReceiptService.cancelReceipt(goodsReceipt.id, CONTEXT);

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "procurement.goods.received" &&
          entry.payload.goodsReceiptId === goodsReceipt.id,
      ),
    ).toBe(false);
  });

  it("isolates canonical goods received events by organization", () => {
    const vendorA = createVendor(CONTEXT);
    const vendorB = createVendor(OTHER_CONTEXT);
    const poA = createApprovedPurchaseOrder(vendorA.id, CONTEXT);
    const poB = createApprovedPurchaseOrder(vendorB.id, OTHER_CONTEXT);
    const receiptA = createReceiptWithLines(poA.id, CONTEXT);
    const receiptB = createReceiptWithLines(poB.id, OTHER_CONTEXT);

    procurementGoodsReceiptService.startReceiving(receiptA.id, CONTEXT);
    receiveAllLines(receiptA.id, CONTEXT);
    procurementGoodsReceiptService.completeReceipt(receiptA.id, CONTEXT);

    procurementGoodsReceiptService.startReceiving(receiptB.id, OTHER_CONTEXT);
    receiveAllLines(receiptB.id, OTHER_CONTEXT);
    procurementGoodsReceiptService.completeReceipt(receiptB.id, OTHER_CONTEXT);

    expect(countCanonical("procurement.goods.received", CONTEXT)).toBe(1);
    expect(countCanonical("procurement.goods.received", OTHER_CONTEXT)).toBe(1);
  });

  it("suppresses duplicate canonical publication when completion is repeated", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceiptWithLines(purchaseOrder.id);

    procurementGoodsReceiptService.startReceiving(goodsReceipt.id, CONTEXT);
    receiveAllLines(goodsReceipt.id);
    expect(() =>
      procurementGoodsReceiptService.completeReceipt(goodsReceipt.id, CONTEXT),
    ).not.toThrow();
    expect(() =>
      procurementGoodsReceiptService.completeReceipt(goodsReceipt.id, CONTEXT),
    ).not.toThrow();

    const received = canonicalEvents().filter(
      (entry) =>
        entry.payload.canonicalEventType === "procurement.goods.received" &&
        entry.payload.goodsReceiptId === goodsReceipt.id,
    );
    expect(received).toHaveLength(1);
  });

  it("wires goods receipt workflow emission through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());
    const vendor = wiring.supplierService.createSupplier(
      { vendorCode: "GR-WF-WIRE", displayName: "GR Workflow Wiring Vendor" },
      CONTEXT,
    );
    const purchaseOrder = wiring.purchaseOrderService.createPurchaseOrder(
      { purchaseOrderNumber: "PO-GR-WF-WIRE", vendorId: vendor.id },
      CONTEXT,
    );
    wiring.purchaseOrderService.submitPurchaseOrder(purchaseOrder.id, CONTEXT);
    wiring.purchaseOrderService.approvePurchaseOrder(purchaseOrder.id, CONTEXT);

    const goodsReceipt = wiring.goodsReceiptService.createGoodsReceipt(
      {
        goodsReceiptNumber: "GR-WF-WIRE",
        purchaseOrderId: purchaseOrder.id,
        lines: [{ itemCode: "WIRE-GR", orderedQuantity: "2" }],
      },
      CONTEXT,
    );
    wiring.goodsReceiptService.startReceiving(goodsReceipt.id, CONTEXT);
    const lines = wiring.receivingLineService.listLines(goodsReceipt.id, CONTEXT);
    wiring.goodsReceiptService.receiveItems(
      goodsReceipt.id,
      { lines: [{ lineId: lines[0]!.id, receivedQuantity: "2" }] },
      CONTEXT,
    );
    wiring.goodsReceiptService.completeReceipt(goodsReceipt.id, CONTEXT);

    expect(
      getIntelligenceIntegrationService()
        .listEvents(CONTEXT, 30)
        .some(
          (entry) =>
            entry.payload.canonicalEventType === "procurement.goods.received" &&
            entry.payload.goodsReceiptId === goodsReceipt.id,
        ),
    ).toBe(true);
  });
});
