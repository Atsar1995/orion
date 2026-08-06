/**
 * Supplier invoice workflow transition rules (Mission P-010.11).
 */

import type { SupplierInvoiceStatus } from "@/lib/procurement/types/supplier-invoice";

const ALLOWED_TRANSITIONS: Readonly<
  Record<SupplierInvoiceStatus, readonly SupplierInvoiceStatus[]>
> = {
  draft: ["submitted", "cancelled"],
  submitted: ["matched", "rejected"],
  matched: ["approved", "rejected"],
  approved: ["posted"],
  posted: [],
  rejected: [],
  cancelled: [],
};

/** Validates and returns the next supplier invoice status or throws on invalid transition. */
export function assertSupplierInvoiceTransition(
  current: SupplierInvoiceStatus,
  next: SupplierInvoiceStatus,
): SupplierInvoiceStatus {
  if (current === next) {
    return next;
  }

  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new Error("INVALID_SUPPLIER_INVOICE_TRANSITION");
  }

  return next;
}

export function canEditSupplierInvoice(status: SupplierInvoiceStatus): boolean {
  return status === "draft";
}

export function canMatchSupplierInvoice(status: SupplierInvoiceStatus): boolean {
  return status === "submitted";
}

export function canApproveSupplierInvoice(status: SupplierInvoiceStatus): boolean {
  return status === "matched";
}

export function canRejectSupplierInvoice(status: SupplierInvoiceStatus): boolean {
  return status === "submitted" || status === "matched";
}
