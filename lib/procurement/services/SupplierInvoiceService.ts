/**
 * Supplier invoice lifecycle service (Mission P-010.11 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { ProcurementCanonicalEventPublisher } from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import {
  assertSupplierInvoiceTransition,
  canApproveSupplierInvoice,
  canEditSupplierInvoice,
  canMatchSupplierInvoice,
  canRejectSupplierInvoice,
} from "@/lib/procurement/services/supplierInvoiceWorkflow";
import {
  assertDuplicateInvoiceForVendor,
  assertThreeWayMatchPreparation,
  assertUniqueInvoiceNumber,
  resolveOptionalGoodsReceipt,
  resolveOptionalPurchaseOrder,
  validateCreateSupplierInvoiceInput,
  validateGoodsReceiptForInvoiceMatch,
  validatePurchaseOrderForInvoiceMatch,
  validateSupplierForInvoice,
  validateUpdateSupplierInvoiceInput,
} from "@/lib/procurement/services/supplierInvoiceValidation";
import type {
  CreateSupplierInvoiceInput,
  SupplierInvoiceListFilter,
  SupplierInvoiceListView,
  SupplierInvoiceRecord,
  UpdateSupplierInvoiceInput,
} from "@/lib/procurement/types/supplier-invoice";
import {
  assertProcurementPermission,
  asSupplierInvoiceRecord,
  getSupplierInvoiceOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

/** Supplier invoice workflow — persist then publish canonical events (ADR-014). */
export class SupplierInvoiceService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
    private readonly canonicalPublisher: ProcurementCanonicalEventPublisher,
  ) {}

  listSupplierInvoices(
    context: ServiceContext,
    filter: SupplierInvoiceListFilter = {},
  ): SupplierInvoiceListView {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceRead,
      context.organizationId,
    );

    const query = filter.query?.trim().toLowerCase();
    const items = this.repository
      .listByOrganization(context.organizationId, "supplierInvoices")
      .map(asSupplierInvoiceRecord)
      .filter((entry) => (filter.status ? entry.status === filter.status : true))
      .filter((entry) => (filter.vendorId ? entry.vendorId === filter.vendorId : true))
      .filter((entry) =>
        filter.purchaseOrderId ? entry.purchaseOrderId === filter.purchaseOrderId : true,
      )
      .filter((entry) =>
        query ? entry.invoiceNumber.toLowerCase().includes(query) : true,
      );

    return { total: items.length, items };
  }

  getSupplierInvoice(invoiceId: string, context: ServiceContext): SupplierInvoiceRecord | null {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceRead,
      context.organizationId,
    );

    const record = this.repository.getById(
      context.organizationId,
      "supplierInvoices",
      invoiceId,
    );
    return record ? asSupplierInvoiceRecord(record) : null;
  }

  createSupplierInvoice(
    input: CreateSupplierInvoiceInput,
    context: ServiceContext,
  ): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceWrite,
      context.organizationId,
    );

    validateCreateSupplierInvoiceInput(input);
    validateSupplierForInvoice(this.repository, input.vendorId, context);
    assertUniqueInvoiceNumber(this.repository, context.organizationId, input.invoiceNumber);
    assertDuplicateInvoiceForVendor(
      this.repository,
      context.organizationId,
      input.vendorId,
      input.invoiceNumber,
    );

    resolveOptionalPurchaseOrder(
      this.repository,
      input.purchaseOrderId,
      input.vendorId,
      input.currencyCode,
      context,
    );
    resolveOptionalGoodsReceipt(
      this.repository,
      input.goodsReceiptId,
      input.vendorId,
      input.purchaseOrderId,
      context,
    );

    const timestamp = nowIso();
    const record: SupplierInvoiceRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      invoiceNumber: input.invoiceNumber.trim().toUpperCase(),
      status: "draft",
      vendorId: input.vendorId,
      purchaseOrderId: input.purchaseOrderId,
      goodsReceiptId: input.goodsReceiptId,
      currencyCode: input.currencyCode.trim().toUpperCase(),
      totalAmount: input.totalAmount,
      lineItems: input.lineItems.map((line) => ({
        itemCode: line.itemCode.trim().toUpperCase(),
        description: line.description?.trim(),
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineAmount: line.lineAmount,
        accountId: line.accountId,
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const created = asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", record as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishInvoiceReceived(
      {
        invoiceId: created.id,
        correlationId: created.id,
        vendorId: created.vendorId,
        purchaseOrderId: created.purchaseOrderId,
      },
      context,
    );

    return created;
  }

  updateSupplierInvoice(
    invoiceId: string,
    input: UpdateSupplierInvoiceInput,
    context: ServiceContext,
  ): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceWrite,
      context.organizationId,
    );

    const existing = getSupplierInvoiceOrThrow(this.repository, invoiceId, context);
    if (!canEditSupplierInvoice(existing.status)) {
      throw new Error("SUPPLIER_INVOICE_NOT_EDITABLE");
    }

    validateUpdateSupplierInvoiceInput(input);

    const nextPurchaseOrderId = input.purchaseOrderId ?? existing.purchaseOrderId;
    const nextCurrency = input.currencyCode ?? existing.currencyCode;

    resolveOptionalPurchaseOrder(
      this.repository,
      nextPurchaseOrderId,
      existing.vendorId,
      nextCurrency,
      context,
    );
    resolveOptionalGoodsReceipt(
      this.repository,
      input.goodsReceiptId ?? existing.goodsReceiptId,
      existing.vendorId,
      nextPurchaseOrderId,
      context,
    );

    const timestamp = nowIso();
    return asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...existing,
        currencyCode: nextCurrency.trim().toUpperCase(),
        totalAmount: input.totalAmount ?? existing.totalAmount,
        lineItems: input.lineItems ?? existing.lineItems,
        purchaseOrderId: nextPurchaseOrderId,
        goodsReceiptId: input.goodsReceiptId ?? existing.goodsReceiptId,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  submitSupplierInvoice(invoiceId: string, context: ServiceContext): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceWrite,
      context.organizationId,
    );

    const existing = getSupplierInvoiceOrThrow(this.repository, invoiceId, context);
    assertSupplierInvoiceTransition(existing.status, "submitted");

    const timestamp = nowIso();
    return asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...existing,
        status: "submitted",
        submittedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  matchPurchaseOrder(
    invoiceId: string,
    purchaseOrderId: string,
    context: ServiceContext,
  ): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceWrite,
      context.organizationId,
    );

    const existing = getSupplierInvoiceOrThrow(this.repository, invoiceId, context);
    if (!canMatchSupplierInvoice(existing.status)) {
      throw new Error("SUPPLIER_INVOICE_NOT_MATCHABLE");
    }

    validatePurchaseOrderForInvoiceMatch(this.repository, purchaseOrderId, existing, context);

    const timestamp = nowIso();
    const matched = asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...existing,
        purchaseOrderId,
        purchaseOrderMatchedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    return this.tryTransitionToMatched(matched, timestamp, context);
  }

  matchGoodsReceipt(
    invoiceId: string,
    goodsReceiptId: string,
    context: ServiceContext,
  ): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceWrite,
      context.organizationId,
    );

    const existing = getSupplierInvoiceOrThrow(this.repository, invoiceId, context);
    if (!canMatchSupplierInvoice(existing.status)) {
      throw new Error("SUPPLIER_INVOICE_NOT_MATCHABLE");
    }

    validateGoodsReceiptForInvoiceMatch(this.repository, goodsReceiptId, existing, context);

    const timestamp = nowIso();
    const matched = asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...existing,
        goodsReceiptId,
        goodsReceiptMatchedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    return this.tryTransitionToMatched(matched, timestamp, context);
  }

  approveSupplierInvoice(invoiceId: string, context: ServiceContext): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceApprove,
      context.organizationId,
    );

    const existing = getSupplierInvoiceOrThrow(this.repository, invoiceId, context);
    if (existing.status === "approved") {
      return existing;
    }

    if (!canApproveSupplierInvoice(existing.status)) {
      throw new Error("SUPPLIER_INVOICE_NOT_APPROVABLE");
    }

    assertThreeWayMatchPreparation(this.repository, existing, context);
    assertSupplierInvoiceTransition(existing.status, "approved");

    const timestamp = nowIso();
    const approved = asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...existing,
        status: "approved",
        approvedAt: timestamp,
        approvedBy: context.userId,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishInvoiceApproved(
      {
        invoiceId: approved.id,
        correlationId: approved.id,
        approvedBy: context.userId,
      },
      context,
    );

    return approved;
  }

  rejectSupplierInvoice(
    invoiceId: string,
    reason: string | undefined,
    context: ServiceContext,
  ): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceReject,
      context.organizationId,
    );

    const existing = getSupplierInvoiceOrThrow(this.repository, invoiceId, context);
    if (existing.status === "rejected") {
      return existing;
    }

    if (!canRejectSupplierInvoice(existing.status)) {
      throw new Error("SUPPLIER_INVOICE_NOT_REJECTABLE");
    }

    assertSupplierInvoiceTransition(existing.status, "rejected");

    const timestamp = nowIso();
    return asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...existing,
        status: "rejected",
        rejectedAt: timestamp,
        rejectedBy: context.userId,
        rejectionReason: reason?.trim(),
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  cancelSupplierInvoice(invoiceId: string, context: ServiceContext): SupplierInvoiceRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.invoiceWrite,
      context.organizationId,
    );

    const existing = getSupplierInvoiceOrThrow(this.repository, invoiceId, context);
    if (existing.status === "cancelled") {
      return existing;
    }

    assertSupplierInvoiceTransition(existing.status, "cancelled");

    const timestamp = nowIso();
    return asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...existing,
        status: "cancelled",
        cancelledAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  private tryTransitionToMatched(
    invoice: SupplierInvoiceRecord,
    timestamp: string,
    context: ServiceContext,
  ): SupplierInvoiceRecord {
    if (invoice.status === "matched") {
      return invoice;
    }

    if (!invoice.purchaseOrderMatchedAt || !invoice.goodsReceiptMatchedAt) {
      return invoice;
    }

    assertThreeWayMatchPreparation(this.repository, invoice, context);
    assertSupplierInvoiceTransition(invoice.status, "matched");

    return asSupplierInvoiceRecord(
      this.repository.upsert("supplierInvoices", {
        ...invoice,
        status: "matched",
        matchedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }
}
