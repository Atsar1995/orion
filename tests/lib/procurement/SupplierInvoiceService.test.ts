import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  procurementGoodsReceiptService,
  procurementPurchaseOrderService,
  procurementReceivingLineService,
  procurementSupplierInvoiceService,
  procurementSupplierService,
} from "@/lib/procurement";
import { PROCUREMENT_CANONICAL_EVENT_VERSION } from "@/lib/procurement/events";
import { PROCUREMENT_SEED_ORG_ID } from "@/lib/procurement/persistence/createProcurementStore";
import {
  getIntelligenceIntegrationService,
  resetIntelligenceIntegrationForTests,
} from "@/lib/platform/intelligence";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { ServiceContext } from "@/types/services";

const ORG_A = PROCUREMENT_SEED_ORG_ID;
const ORG_B = "org-other";

const ADMIN_CONTEXT: ServiceContext = {
  organizationId: ORG_A,
  workspaceId: "workspace-orania",
  userId: "user-inv-admin",
  role: "organization_admin",
};

const READ_ONLY_CONTEXT: ServiceContext = {
  ...ADMIN_CONTEXT,
  userId: "user-inv-readonly",
  role: "read_only",
};

function canonicalEvents(context: ServiceContext = ADMIN_CONTEXT) {
  return getIntelligenceIntegrationService()
    .listEvents(context, 100)
    .filter((entry) => entry.payload.canonicalEventType);
}

function countCanonical(type: string, context: ServiceContext = ADMIN_CONTEXT): number {
  return canonicalEvents(context).filter((entry) => entry.payload.canonicalEventType === type)
    .length;
}

function createVendor() {
  return procurementSupplierService.createSupplier(
    { vendorCode: `INV-VND-${Date.now()}`, displayName: "Invoice Vendor" },
    ADMIN_CONTEXT,
  );
}

function createApprovedPurchaseOrder(vendorId: string) {
  const purchaseOrder = procurementPurchaseOrderService.createPurchaseOrder(
    {
      purchaseOrderNumber: `PO-INV-${Date.now()}`,
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

function createReceivedGoodsReceipt(purchaseOrderId: string) {
  const goodsReceipt = procurementGoodsReceiptService.createGoodsReceipt(
    {
      goodsReceiptNumber: `GR-INV-${Date.now()}`,
      purchaseOrderId,
      lines: [
        { itemCode: "ITEM-A", orderedQuantity: "10" },
        { itemCode: "ITEM-B", orderedQuantity: "5" },
      ],
    },
    ADMIN_CONTEXT,
  );
  procurementGoodsReceiptService.startReceiving(goodsReceipt.id, ADMIN_CONTEXT);
  const lines = procurementReceivingLineService.listLines(goodsReceipt.id, ADMIN_CONTEXT);
  procurementGoodsReceiptService.receiveItems(
    goodsReceipt.id,
    {
      lines: lines.map((line) => ({ lineId: line.id, receivedQuantity: line.orderedQuantity })),
    },
    ADMIN_CONTEXT,
  );
  procurementGoodsReceiptService.completeReceipt(goodsReceipt.id, ADMIN_CONTEXT);
  return goodsReceipt;
}

function createInvoiceInput(vendorId: string, purchaseOrderId: string) {
  return {
    invoiceNumber: `INV-${Date.now()}`,
    vendorId,
    purchaseOrderId,
    currencyCode: "ZAR",
    totalAmount: "1500",
    lineItems: [
      { itemCode: "ITEM-A", quantity: "10", unitPrice: "100" },
      { itemCode: "ITEM-B", quantity: "5", unitPrice: "100" },
    ],
  };
}

function runMatchAndApprove(invoiceId: string, purchaseOrderId: string, goodsReceiptId: string) {
  procurementSupplierInvoiceService.submitSupplierInvoice(invoiceId, ADMIN_CONTEXT);
  procurementSupplierInvoiceService.matchPurchaseOrder(invoiceId, purchaseOrderId, ADMIN_CONTEXT);
  procurementSupplierInvoiceService.matchGoodsReceipt(invoiceId, goodsReceiptId, ADMIN_CONTEXT);
  return procurementSupplierInvoiceService.approveSupplierInvoice(invoiceId, ADMIN_CONTEXT);
}

describe("SupplierInvoiceService (P-010.11)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
  });

  it("creates a supplier invoice in draft status", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    expect(invoice.status).toBe("draft");
    expect(invoice.invoiceNumber).toMatch(/^INV-/);
    expect(invoice.vendorId).toBe(vendor.id);
  });

  it("lists and retrieves supplier invoices", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    const list = procurementSupplierInvoiceService.listSupplierInvoices(ADMIN_CONTEXT);
    expect(list.total).toBeGreaterThanOrEqual(1);
    expect(
      procurementSupplierInvoiceService.getSupplierInvoice(invoice.id, ADMIN_CONTEXT)?.id,
    ).toBe(invoice.id);
  });

  it("updates a draft supplier invoice", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    const updated = procurementSupplierInvoiceService.updateSupplierInvoice(
      invoice.id,
      { totalAmount: "2000" },
      ADMIN_CONTEXT,
    );

    expect(updated.totalAmount).toBe("2000");
  });

  it("runs submit, match, approve workflow", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceivedGoodsReceipt(purchaseOrder.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    const approved = runMatchAndApprove(invoice.id, purchaseOrder.id, goodsReceipt.id);

    expect(approved.status).toBe("approved");
    expect(approved.approvedBy).toBe(ADMIN_CONTEXT.userId);
  });

  it("rejects a submitted invoice", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );
    procurementSupplierInvoiceService.submitSupplierInvoice(invoice.id, ADMIN_CONTEXT);

    const rejected = procurementSupplierInvoiceService.rejectSupplierInvoice(
      invoice.id,
      "Pricing mismatch",
      ADMIN_CONTEXT,
    );

    expect(rejected.status).toBe("rejected");
    expect(rejected.rejectionReason).toBe("Pricing mismatch");
  });

  it("cancels a draft invoice", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    const cancelled = procurementSupplierInvoiceService.cancelSupplierInvoice(
      invoice.id,
      ADMIN_CONTEXT,
    );

    expect(cancelled.status).toBe("cancelled");
  });

  it("detects duplicate invoice numbers within organization", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const input = createInvoiceInput(vendor.id, purchaseOrder.id);

    procurementSupplierInvoiceService.createSupplierInvoice(input, ADMIN_CONTEXT);

    expect(() =>
      procurementSupplierInvoiceService.createSupplierInvoice(input, ADMIN_CONTEXT),
    ).toThrow("DUPLICATE_INVOICE_NUMBER");
  });

  it("allows duplicate invoice number when prior invoice was cancelled", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoiceNumber = `INV-CANCEL-${Date.now()}`;
    const input = { ...createInvoiceInput(vendor.id, purchaseOrder.id), invoiceNumber };

    const first = procurementSupplierInvoiceService.createSupplierInvoice(input, ADMIN_CONTEXT);
    procurementSupplierInvoiceService.cancelSupplierInvoice(first.id, ADMIN_CONTEXT);

    expect(() =>
      procurementSupplierInvoiceService.createSupplierInvoice(input, ADMIN_CONTEXT),
    ).toThrow("DUPLICATE_INVOICE_NUMBER");
  });

  it("enforces organization isolation on retrieval", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    expect(
      procurementSupplierInvoiceService.getSupplierInvoice(invoice.id, {
        ...ADMIN_CONTEXT,
        organizationId: ORG_B,
      }),
    ).toBeNull();
  });

  it("denies invoice creation for read-only roles", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);

    expect(() =>
      procurementSupplierInvoiceService.createSupplierInvoice(
        createInvoiceInput(vendor.id, purchaseOrder.id),
        READ_ONLY_CONTEXT,
      ),
    ).toThrow(AuthorizationError);
  });

  it("prevents approval without three-way match", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );
    procurementSupplierInvoiceService.submitSupplierInvoice(invoice.id, ADMIN_CONTEXT);

    expect(() =>
      procurementSupplierInvoiceService.approveSupplierInvoice(invoice.id, ADMIN_CONTEXT),
    ).toThrow("SUPPLIER_INVOICE_NOT_APPROVABLE");
  });

  it("prevents invalid workflow transitions", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );
    procurementSupplierInvoiceService.cancelSupplierInvoice(invoice.id, ADMIN_CONTEXT);

    expect(() =>
      procurementSupplierInvoiceService.submitSupplierInvoice(invoice.id, ADMIN_CONTEXT),
    ).toThrow("INVALID_SUPPLIER_INVOICE_TRANSITION");
  });

  it("publishes procurement.invoice.received after successful creation", () => {
    const before = countCanonical("procurement.invoice.received");
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    const events = canonicalEvents().filter((entry) => entry.payload.invoiceId === invoice.id);
    expect(countCanonical("procurement.invoice.received")).toBe(before + 1);
    expect(events[0]?.payload.eventVersion).toBe(PROCUREMENT_CANONICAL_EVENT_VERSION);
    expect(events[0]?.correlationId).toBe(invoice.id);
  });

  it("does not publish invoice.received when creation fails validation", () => {
    const before = countCanonical("procurement.invoice.received");
    const vendor = createVendor();

    expect(() =>
      procurementSupplierInvoiceService.createSupplierInvoice(
        {
          invoiceNumber: "   ",
          vendorId: vendor.id,
          currencyCode: "ZAR",
          totalAmount: "100",
          lineItems: [{ itemCode: "X", quantity: "1", unitPrice: "100" }],
        },
        ADMIN_CONTEXT,
      ),
    ).toThrow("INVALID_INVOICE_NUMBER");

    expect(countCanonical("procurement.invoice.received")).toBe(before);
  });

  it("publishes procurement.invoice.approved after approval", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceivedGoodsReceipt(purchaseOrder.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );

    const before = countCanonical("procurement.invoice.approved");
    runMatchAndApprove(invoice.id, purchaseOrder.id, goodsReceipt.id);

    const events = canonicalEvents().filter(
      (entry) =>
        entry.payload.canonicalEventType === "procurement.invoice.approved" &&
        entry.payload.invoiceId === invoice.id,
    );
    expect(countCanonical("procurement.invoice.approved")).toBe(before + 1);
    expect(events).toHaveLength(1);
    expect(events[0]?.payload.approvedBy).toBe(ADMIN_CONTEXT.userId);
  });

  it("is idempotent on duplicate approval without duplicate events", () => {
    const vendor = createVendor();
    const purchaseOrder = createApprovedPurchaseOrder(vendor.id);
    const goodsReceipt = createReceivedGoodsReceipt(purchaseOrder.id);
    const invoice = procurementSupplierInvoiceService.createSupplierInvoice(
      createInvoiceInput(vendor.id, purchaseOrder.id),
      ADMIN_CONTEXT,
    );
    runMatchAndApprove(invoice.id, purchaseOrder.id, goodsReceipt.id);

    const before = countCanonical("procurement.invoice.approved");
    const second = procurementSupplierInvoiceService.approveSupplierInvoice(
      invoice.id,
      ADMIN_CONTEXT,
    );

    expect(second.status).toBe("approved");
    expect(countCanonical("procurement.invoice.approved")).toBe(before);
  });

  it("wires supplier invoice service through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());
    const vendor = wiring.supplierService.createSupplier(
      { vendorCode: "INV-WIRE-VND", displayName: "Invoice Wiring Vendor" },
      ADMIN_CONTEXT,
    );
    const purchaseOrder = wiring.purchaseOrderService.createPurchaseOrder(
      { purchaseOrderNumber: "PO-INV-WIRE", vendorId: vendor.id, currencyCode: "ZAR" },
      ADMIN_CONTEXT,
    );
    wiring.purchaseOrderService.submitPurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);
    wiring.purchaseOrderService.approvePurchaseOrder(purchaseOrder.id, ADMIN_CONTEXT);

    const invoice = wiring.supplierInvoiceService.createSupplierInvoice(
      {
        invoiceNumber: "INV-WIRE",
        vendorId: vendor.id,
        purchaseOrderId: purchaseOrder.id,
        currencyCode: "ZAR",
        totalAmount: "500",
        lineItems: [{ itemCode: "WIRE-ITEM", quantity: "1", unitPrice: "500" }],
      },
      ADMIN_CONTEXT,
    );

    expect(wiring.supplierInvoiceService).toBeDefined();
    expect(wiring.backing.supplierInvoices.get(invoice.id)).toBeDefined();
  });
});
