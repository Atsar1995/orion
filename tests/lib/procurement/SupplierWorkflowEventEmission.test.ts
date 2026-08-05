import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import { procurementSupplierService } from "@/lib/procurement";
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
  userId: "user-procurement-workflow",
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

describe("Procurement Supplier Workflow Event Emission (P-010.7)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
  });

  it("publishes procurement.vendor.created after successful supplier creation", () => {
    const before = countCanonical("procurement.vendor.created");

    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "WF-001",
        displayName: "Workflow Supplier",
      },
      CONTEXT,
    );

    const events = canonicalEvents().filter((entry) => entry.payload.vendorId === supplier.id);
    expect(countCanonical("procurement.vendor.created")).toBe(before + 1);
    expect(events[0]?.payload.eventVersion).toBe(PROCUREMENT_CANONICAL_EVENT_VERSION);
    expect(events[0]?.payload.sourceDomain).toBe("procurement");
    expect(events[0]?.correlationId).toBe(supplier.id);
  });

  it("does not publish when supplier creation rolls back on validation failure", () => {
    const before = countCanonical("procurement.vendor.created");

    expect(() =>
      procurementSupplierService.createSupplier(
        {
          vendorCode: "WF-BAD",
          displayName: "   ",
        },
        CONTEXT,
      ),
    ).toThrow("INVALID_VENDOR_NAME");

    expect(countCanonical("procurement.vendor.created")).toBe(before);
  });

  it("publishes procurement.vendor.updated after supplier update", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "WF-UPD",
        displayName: "Update Workflow Supplier",
      },
      CONTEXT,
    );

    procurementSupplierService.updateSupplier(
      supplier.id,
      { displayName: "Updated Supplier Name" },
      CONTEXT,
    );

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "procurement.vendor.updated" &&
          entry.payload.vendorId === supplier.id &&
          entry.payload.changeType === "updated",
      ),
    ).toBe(true);
  });

  it("publishes procurement.vendor.updated after qualification and activation", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "WF-QUAL",
        displayName: "Qualification Workflow Supplier",
      },
      CONTEXT,
    );

    procurementSupplierService.qualifySupplier(supplier.id, CONTEXT);
    procurementSupplierService.activateSupplier(supplier.id, CONTEXT);

    const updatedEvents = canonicalEvents().filter(
      (entry) =>
        entry.payload.canonicalEventType === "procurement.vendor.updated" &&
        entry.payload.vendorId === supplier.id,
    );

    expect(updatedEvents.some((entry) => entry.payload.changeType === "qualified")).toBe(true);
    expect(updatedEvents.some((entry) => entry.payload.changeType === "activated")).toBe(true);
  });

  it("isolates canonical vendor events by organization", () => {
    procurementSupplierService.createSupplier(
      {
        vendorCode: "WF-ORG-A",
        displayName: "Org A Supplier",
      },
      CONTEXT,
    );

    procurementSupplierService.createSupplier(
      {
        vendorCode: "WF-ORG-B",
        displayName: "Org B Supplier",
      },
      OTHER_CONTEXT,
    );

    expect(countCanonical("procurement.vendor.created", CONTEXT)).toBe(1);
    expect(countCanonical("procurement.vendor.created", OTHER_CONTEXT)).toBe(1);
  });

  it("suppresses duplicate canonical publication when qualification is repeated", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "WF-DUP",
        displayName: "Duplicate Guard Supplier",
      },
      CONTEXT,
    );

    expect(() => procurementSupplierService.qualifySupplier(supplier.id, CONTEXT)).not.toThrow();
    expect(() => procurementSupplierService.qualifySupplier(supplier.id, CONTEXT)).not.toThrow();

    const qualified = canonicalEvents().filter(
      (entry) =>
        entry.payload.canonicalEventType === "procurement.vendor.updated" &&
        entry.payload.vendorId === supplier.id &&
        entry.payload.changeType === "qualified",
    );
    expect(qualified).toHaveLength(1);
  });

  it("wires supplier workflow emission through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());

    const supplier = wiring.supplierService.createSupplier(
      {
        vendorCode: "WF-WIRE",
        displayName: "Wiring Workflow Supplier",
      },
      CONTEXT,
    );

    expect(
      getIntelligenceIntegrationService()
        .listEvents(CONTEXT, 20)
        .some(
          (entry) =>
            entry.payload.canonicalEventType === "procurement.vendor.created" &&
            entry.payload.vendorId === supplier.id,
        ),
    ).toBe(true);
  });
});
