import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  procurementSupplierService,
  procurementVendorContactService,
  procurementVendorScorecardService,
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

describe("SupplierService (P-010.7)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("creates a supplier with draft status and persists to vendors collection", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "ACME-001",
        displayName: "Acme Industrial Supplies",
        email: "procurement@acme.example",
      },
      ADMIN_CONTEXT,
    );

    expect(supplier.id).toBeTruthy();
    expect(supplier.vendorCode).toBe("ACME-001");
    expect(supplier.status).toBe("draft");
    expect(supplier.organizationId).toBe(ORG_A);

    const retrieved = procurementSupplierService.getSupplier(supplier.id, ADMIN_CONTEXT);
    expect(retrieved?.displayName).toBe("Acme Industrial Supplies");
  });

  it("lists and retrieves suppliers for the organization", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "LIST-001",
        displayName: "List Vendor",
      },
      ADMIN_CONTEXT,
    );

    const list = procurementSupplierService.listSuppliers(ADMIN_CONTEXT);
    expect(list.total).toBeGreaterThanOrEqual(1);
    expect(list.items.some((entry) => entry.id === supplier.id)).toBe(true);
  });

  it("updates supplier master data", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "UPD-001",
        displayName: "Before Update",
      },
      ADMIN_CONTEXT,
    );

    const updated = procurementSupplierService.updateSupplier(
      supplier.id,
      { displayName: "After Update", country: "ZA" },
      ADMIN_CONTEXT,
    );

    expect(updated.displayName).toBe("After Update");
    expect(updated.country).toBe("ZA");
  });

  it("runs supplier qualification, activation, and deactivation lifecycle", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "LIFE-001",
        displayName: "Lifecycle Vendor",
      },
      ADMIN_CONTEXT,
    );

    const qualified = procurementSupplierService.qualifySupplier(supplier.id, ADMIN_CONTEXT);
    expect(qualified.status).toBe("qualified");
    expect(qualified.qualifiedBy).toBe(ADMIN_CONTEXT.userId);

    const activated = procurementSupplierService.activateSupplier(supplier.id, ADMIN_CONTEXT);
    expect(activated.status).toBe("active");

    const deactivated = procurementSupplierService.deactivateSupplier(supplier.id, ADMIN_CONTEXT);
    expect(deactivated.status).toBe("inactive");

    const reactivated = procurementSupplierService.activateSupplier(supplier.id, ADMIN_CONTEXT);
    expect(reactivated.status).toBe("active");
  });

  it("rejects duplicate vendor codes within the same organization", () => {
    procurementSupplierService.createSupplier(
      {
        vendorCode: "DUP-001",
        displayName: "First Vendor",
      },
      ADMIN_CONTEXT,
    );

    expect(() =>
      procurementSupplierService.createSupplier(
        {
          vendorCode: "dup-001",
          displayName: "Second Vendor",
        },
        ADMIN_CONTEXT,
      ),
    ).toThrow("DUPLICATE_VENDOR_CODE");
  });

  it("enforces organization isolation on supplier retrieval", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "ISO-001",
        displayName: "Org A Vendor",
      },
      ADMIN_CONTEXT,
    );

    expect(
      procurementSupplierService.getSupplier(supplier.id, {
        ...ADMIN_CONTEXT,
        organizationId: ORG_B,
      }),
    ).toBeNull();
  });

  it("denies supplier creation for read-only roles", () => {
    expect(() =>
      procurementSupplierService.createSupplier(
        {
          vendorCode: "RBAC-001",
          displayName: "Denied Vendor",
        },
        READ_ONLY_CONTEXT,
      ),
    ).toThrow(AuthorizationError);
  });

  it("denies supplier qualification without vendor approve permission", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "RBAC-002",
        displayName: "Buyer Managed Vendor",
      },
      ADMIN_CONTEXT,
    );

    expect(() =>
      procurementSupplierService.qualifySupplier(supplier.id, BUYER_CONTEXT),
    ).toThrow(AuthorizationError);
  });

  it("creates and updates vendor contacts for a supplier", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "CONT-001",
        displayName: "Contact Vendor",
      },
      ADMIN_CONTEXT,
    );

    const contact = procurementVendorContactService.createContact(
      supplier.id,
      {
        firstName: "Sam",
        lastName: "Supplier",
        email: "sam@contact.example",
        isPrimary: true,
      },
      ADMIN_CONTEXT,
    );

    expect(contact.vendorId).toBe(supplier.id);

    const updated = procurementVendorContactService.updateContact(
      supplier.id,
      contact.id,
      { role: "Account Manager" },
      ADMIN_CONTEXT,
    );

    expect(updated.role).toBe("Account Manager");
    expect(procurementVendorContactService.listContacts(supplier.id, ADMIN_CONTEXT)).toHaveLength(1);
  });

  it("creates and updates vendor scorecards for a supplier", () => {
    const supplier = procurementSupplierService.createSupplier(
      {
        vendorCode: "SCORE-001",
        displayName: "Scorecard Vendor",
      },
      ADMIN_CONTEXT,
    );

    const scorecard = procurementVendorScorecardService.createScorecard(
      supplier.id,
      {
        period: "2026-Q3",
        deliveryScore: "92",
        qualityScore: "88",
        overallScore: "90",
      },
      ADMIN_CONTEXT,
    );

    expect(scorecard.vendorId).toBe(supplier.id);

    const updated = procurementVendorScorecardService.updateScorecard(
      supplier.id,
      scorecard.id,
      { overallScore: "91" },
      ADMIN_CONTEXT,
    );

    expect(updated.overallScore).toBe("91");
    expect(procurementVendorScorecardService.listScorecards(supplier.id, ADMIN_CONTEXT)).toHaveLength(
      1,
    );
  });

  it("wires supplier services through createProcurementWiring", () => {
    const wiring = createProcurementWiring(new InMemoryPlatformStore());

    expect(wiring.supplierService).toBeDefined();
    expect(wiring.vendorContactService).toBeDefined();
    expect(wiring.vendorScorecardService).toBeDefined();

    const supplier = wiring.supplierService.createSupplier(
      {
        vendorCode: "WIRE-001",
        displayName: "Wiring Vendor",
      },
      ADMIN_CONTEXT,
    );

    expect(wiring.backing.vendors.get(supplier.id)).toBeDefined();
  });
});
