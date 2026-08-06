import { describe, expect, it } from "vitest";
import {
  assertSupplierInvoiceTransition,
  canApproveSupplierInvoice,
  canEditSupplierInvoice,
  canMatchSupplierInvoice,
  canRejectSupplierInvoice,
} from "@/lib/procurement/services/supplierInvoiceWorkflow";

describe("Supplier Invoice Workflow (P-010.11)", () => {
  it("allows draft to submitted and cancelled", () => {
    expect(assertSupplierInvoiceTransition("draft", "submitted")).toBe("submitted");
    expect(assertSupplierInvoiceTransition("draft", "cancelled")).toBe("cancelled");
  });

  it("allows submitted to matched and rejected", () => {
    expect(assertSupplierInvoiceTransition("submitted", "matched")).toBe("matched");
    expect(assertSupplierInvoiceTransition("submitted", "rejected")).toBe("rejected");
  });

  it("allows matched to approved and rejected", () => {
    expect(assertSupplierInvoiceTransition("matched", "approved")).toBe("approved");
    expect(assertSupplierInvoiceTransition("matched", "rejected")).toBe("rejected");
  });

  it("allows approved to posted", () => {
    expect(assertSupplierInvoiceTransition("approved", "posted")).toBe("posted");
  });

  it("rejects invalid transitions", () => {
    expect(() => assertSupplierInvoiceTransition("draft", "approved")).toThrow(
      "INVALID_SUPPLIER_INVOICE_TRANSITION",
    );
    expect(() => assertSupplierInvoiceTransition("approved", "submitted")).toThrow(
      "INVALID_SUPPLIER_INVOICE_TRANSITION",
    );
    expect(() => assertSupplierInvoiceTransition("cancelled", "submitted")).toThrow(
      "INVALID_SUPPLIER_INVOICE_TRANSITION",
    );
  });

  it("exposes edit, match, approve, and reject guards", () => {
    expect(canEditSupplierInvoice("draft")).toBe(true);
    expect(canEditSupplierInvoice("submitted")).toBe(false);
    expect(canMatchSupplierInvoice("submitted")).toBe(true);
    expect(canMatchSupplierInvoice("draft")).toBe(false);
    expect(canApproveSupplierInvoice("matched")).toBe(true);
    expect(canApproveSupplierInvoice("submitted")).toBe(false);
    expect(canRejectSupplierInvoice("submitted")).toBe(true);
    expect(canRejectSupplierInvoice("matched")).toBe(true);
    expect(canRejectSupplierInvoice("approved")).toBe(false);
  });
});
