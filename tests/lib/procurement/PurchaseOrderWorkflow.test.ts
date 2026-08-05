import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  procurementPurchaseOrderService,
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
  userId: "user-po-workflow",
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

function createVendor() {
  return procurementSupplierService.createSupplier(
    { vendorCode: `WF-VND-${Date.now()}`, displayName: "Workflow Vendor" },
    CONTEXT,
  );
}

function createPurchaseOrder(vendorId: string) {
  return procurementPurchaseOrderService.createPurchaseOrder(
    {
      purchaseOrderNumber: `PO-WF-${Date.now()}`,
      vendorId,
      amount: "25000",
      currencyCode: "ZAR",
    },
    CONTEXT,
  );
}

describe("Purchase Order Workflow (P-010.9)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
  });

  it("publishes procurement.purchaseorder.created after successful creation", () => {
    const before = countCanonical("procurement.purchaseorder.created");
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder(vendor.id);

    const events = canonicalEvents().filter(
      (entry) => entry.payload.purchaseOrderId === purchaseOrder.id,
    );
    expect(countCanonical("procurement.purchaseorder.created")).toBe(before + 1);
    expect(events[0]?.payload.eventVersion).toBe(PROCUREMENT_CANONICAL_EVENT_VERSION);
    expect(events[0]?.payload.sourceDomain).toBe("procurement");
    expect(events[0]?.correlationId).toBe(purchaseOrder.id);
  });

  it("does not publish when creation rolls back on validation failure", () => {
    const before = countCanonical("procurement.purchaseorder.created");
    const vendor = createVendor();

    expect(() =>
      procurementPurchaseOrderService.createPurchaseOrder(
        {
          purchaseOrderNumber: "   ",
          vendorId: vendor.id,
        },
        CONTEXT,
      ),
    ).toThrow("INVALID_PURCHASE_ORDER_NUMBER");

    expect(countCanonical("procurement.purchaseorder.created")).toBe(before);
  });

  it("publishes procurement.purchaseorder.approved after approval", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder(vendor.id);

    procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, CONTEXT);
    procurementPurchaseOrderService.approvePurchaseOrder(purchaseOrder.id, CONTEXT);

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "procurement.purchaseorder.approved" &&
          entry.payload.purchaseOrderId === purchaseOrder.id,
      ),
    ).toBe(true);
  });

  it("does not publish approval event on cancel", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder(vendor.id);
    procurementPurchaseOrderService.cancelPurchaseOrder(purchaseOrder.id, CONTEXT);

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "procurement.purchaseorder.approved" &&
          entry.payload.purchaseOrderId === purchaseOrder.id,
      ),
    ).toBe(false);
  });

  it("isolates canonical purchase order events by organization", () => {
    const vendorA = procurementSupplierService.createSupplier(
      { vendorCode: "ORG-A-VND", displayName: "Org A Vendor" },
      CONTEXT,
    );
    const vendorB = procurementSupplierService.createSupplier(
      { vendorCode: "ORG-B-VND", displayName: "Org B Vendor" },
      OTHER_CONTEXT,
    );

    createPurchaseOrder(vendorA.id);
    procurementPurchaseOrderService.createPurchaseOrder(
      { purchaseOrderNumber: "PO-ORG-B", vendorId: vendorB.id },
      OTHER_CONTEXT,
    );

    expect(countCanonical("procurement.purchaseorder.created", CONTEXT)).toBe(1);
    expect(countCanonical("procurement.purchaseorder.created", OTHER_CONTEXT)).toBe(1);
  });

  it("suppresses duplicate canonical publication when approval is repeated", () => {
    const vendor = createVendor();
    const purchaseOrder = createPurchaseOrder(vendor.id);

    procurementPurchaseOrderService.submitPurchaseOrder(purchaseOrder.id, CONTEXT);
    expect(() =>
      procurementPurchaseOrderService.approvePurchaseOrder(purchaseOrder.id, CONTEXT),
    ).not.toThrow();
    expect(() =>
      procurementPurchaseOrderService.approvePurchaseOrder(purchaseOrder.id, CONTEXT),
    ).not.toThrow();

    const approved = canonicalEvents().filter(
      (entry) =>
        entry.payload.canonicalEventType === "procurement.purchaseorder.approved" &&
        entry.payload.purchaseOrderId === purchaseOrder.id,
    );
    expect(approved).toHaveLength(1);
  });

  it("wires purchase order workflow emission through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());
    const vendor = wiring.supplierService.createSupplier(
      { vendorCode: "PO-WIRE-VND", displayName: "PO Wiring Vendor" },
      CONTEXT,
    );

    const purchaseOrder = wiring.purchaseOrderService.createPurchaseOrder(
      { purchaseOrderNumber: "PO-WIRE-001", vendorId: vendor.id },
      CONTEXT,
    );

    expect(
      getIntelligenceIntegrationService()
        .listEvents(CONTEXT, 20)
        .some(
          (entry) =>
            entry.payload.canonicalEventType === "procurement.purchaseorder.created" &&
            entry.payload.purchaseOrderId === purchaseOrder.id,
        ),
    ).toBe(true);
  });
});
