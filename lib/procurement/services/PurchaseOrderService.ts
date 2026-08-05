/**
 * Purchase order lifecycle service (Mission P-010.9 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { ProcurementCanonicalEventPublisher } from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import {
  assertPurchaseOrderTransition,
  canAmendPurchaseOrder,
} from "@/lib/procurement/services/purchaseOrderWorkflow";
import type {
  AmendPurchaseOrderInput,
  CreatePurchaseOrderInput,
  PurchaseOrderListFilter,
  PurchaseOrderListView,
  PurchaseOrderRecord,
  UpdatePurchaseOrderInput,
} from "@/lib/procurement/types/purchase-order";
import {
  assertApprovedRequisition,
  assertContractVendorMatch,
  assertProcurementPermission,
  assertUniquePurchaseOrderNumber,
  asPurchaseOrderRecord,
  getPurchaseContractOrThrow,
  getPurchaseOrderOrThrow,
  getVendorOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

/** Purchase order workflow — persist then publish canonical events (ADR-014). */
export class PurchaseOrderService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
    private readonly canonicalPublisher: ProcurementCanonicalEventPublisher,
  ) {}

  listPurchaseOrders(
    context: ServiceContext,
    filter: PurchaseOrderListFilter = {},
  ): PurchaseOrderListView {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      context.organizationId,
    );

    const query = filter.query?.trim().toLowerCase();
    const items = this.repository
      .listByOrganization(context.organizationId, "purchaseOrders")
      .map(asPurchaseOrderRecord)
      .filter((entry) => (filter.status ? entry.status === filter.status : true))
      .filter((entry) => (filter.vendorId ? entry.vendorId === filter.vendorId : true))
      .filter((entry) =>
        query ? entry.purchaseOrderNumber.toLowerCase().includes(query) : true,
      );

    return { total: items.length, items };
  }

  getPurchaseOrder(purchaseOrderId: string, context: ServiceContext): PurchaseOrderRecord | null {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      context.organizationId,
    );

    const record = this.repository.getById(
      context.organizationId,
      "purchaseOrders",
      purchaseOrderId,
    );
    return record ? asPurchaseOrderRecord(record) : null;
  }

  createPurchaseOrder(
    input: CreatePurchaseOrderInput,
    context: ServiceContext,
  ): PurchaseOrderRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      context.organizationId,
    );

    getVendorOrThrow(this.repository, input.vendorId, context);
    assertUniquePurchaseOrderNumber(
      this.repository,
      context.organizationId,
      input.purchaseOrderNumber,
    );

    if (input.requisitionId) {
      const requisition = assertApprovedRequisition(this.repository, input.requisitionId, context);
      if (requisition.vendorId && requisition.vendorId !== input.vendorId) {
        throw new Error("REQUISITION_VENDOR_MISMATCH");
      }
    }

    if (input.contractId) {
      const contract = getPurchaseContractOrThrow(this.repository, input.contractId, context);
      assertContractVendorMatch(contract, input.vendorId);
    }

    const timestamp = nowIso();
    const record: PurchaseOrderRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      purchaseOrderNumber: input.purchaseOrderNumber.trim().toUpperCase(),
      status: "draft",
      vendorId: input.vendorId,
      requisitionId: input.requisitionId,
      contractId: input.contractId,
      amount: input.amount,
      currencyCode: input.currencyCode,
      amendmentVersion: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const created = asPurchaseOrderRecord(
      this.repository.upsert("purchaseOrders", record as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishPurchaseOrderCreated(
      {
        purchaseOrderId: created.id,
        correlationId: created.id,
        requisitionId: created.requisitionId,
        vendorId: created.vendorId,
      },
      context,
    );

    return created;
  }

  updatePurchaseOrder(
    purchaseOrderId: string,
    input: UpdatePurchaseOrderInput,
    context: ServiceContext,
  ): PurchaseOrderRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      context.organizationId,
    );

    const existing = getPurchaseOrderOrThrow(this.repository, purchaseOrderId, context);
    if (existing.status !== "draft") {
      throw new Error("PURCHASE_ORDER_NOT_EDITABLE");
    }

    if (input.contractId) {
      const contract = getPurchaseContractOrThrow(this.repository, input.contractId, context);
      assertContractVendorMatch(contract, existing.vendorId);
    }

    const timestamp = nowIso();
    return asPurchaseOrderRecord(
      this.repository.upsert("purchaseOrders", {
        ...existing,
        amount: input.amount ?? existing.amount,
        currencyCode: input.currencyCode ?? existing.currencyCode,
        contractId: input.contractId ?? existing.contractId,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  submitPurchaseOrder(purchaseOrderId: string, context: ServiceContext): PurchaseOrderRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      context.organizationId,
    );

    const existing = getPurchaseOrderOrThrow(this.repository, purchaseOrderId, context);
    assertPurchaseOrderTransition(existing.status, "submitted");

    const timestamp = nowIso();
    return asPurchaseOrderRecord(
      this.repository.upsert("purchaseOrders", {
        ...existing,
        status: "submitted",
        submittedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  approvePurchaseOrder(purchaseOrderId: string, context: ServiceContext): PurchaseOrderRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderApprove,
      context.organizationId,
    );

    const existing = getPurchaseOrderOrThrow(this.repository, purchaseOrderId, context);
    if (existing.status === "approved") {
      return existing;
    }

    assertPurchaseOrderTransition(existing.status, "approved");

    const timestamp = nowIso();
    const approved = asPurchaseOrderRecord(
      this.repository.upsert("purchaseOrders", {
        ...existing,
        status: "approved",
        approvedAt: timestamp,
        approvedBy: context.userId,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishPurchaseOrderApproved(
      {
        purchaseOrderId: approved.id,
        correlationId: approved.id,
        approvedBy: context.userId,
      },
      context,
    );

    return approved;
  }

  amendPurchaseOrder(
    purchaseOrderId: string,
    input: AmendPurchaseOrderInput,
    context: ServiceContext,
  ): PurchaseOrderRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      context.organizationId,
    );

    const existing = getPurchaseOrderOrThrow(this.repository, purchaseOrderId, context);
    if (!canAmendPurchaseOrder(existing.status)) {
      throw new Error("PURCHASE_ORDER_NOT_AMENDABLE");
    }

    if (input.contractId) {
      const contract = getPurchaseContractOrThrow(this.repository, input.contractId, context);
      assertContractVendorMatch(contract, existing.vendorId);
    }

    const timestamp = nowIso();
    return asPurchaseOrderRecord(
      this.repository.upsert("purchaseOrders", {
        ...existing,
        amount: input.amount ?? existing.amount,
        currencyCode: input.currencyCode ?? existing.currencyCode,
        contractId: input.contractId ?? existing.contractId,
        amendmentVersion: existing.amendmentVersion + 1,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  cancelPurchaseOrder(purchaseOrderId: string, context: ServiceContext): PurchaseOrderRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      context.organizationId,
    );

    const existing = getPurchaseOrderOrThrow(this.repository, purchaseOrderId, context);
    if (existing.status === "cancelled") {
      return existing;
    }

    assertPurchaseOrderTransition(existing.status, "cancelled");

    const timestamp = nowIso();
    return asPurchaseOrderRecord(
      this.repository.upsert("purchaseOrders", {
        ...existing,
        status: "cancelled",
        cancelledAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  closePurchaseOrder(purchaseOrderId: string, context: ServiceContext): PurchaseOrderRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.purchaseOrderApprove,
      context.organizationId,
    );

    const existing = getPurchaseOrderOrThrow(this.repository, purchaseOrderId, context);
    if (existing.status === "closed") {
      return existing;
    }

    assertPurchaseOrderTransition(existing.status, "closed");

    const timestamp = nowIso();
    return asPurchaseOrderRecord(
      this.repository.upsert("purchaseOrders", {
        ...existing,
        status: "closed",
        closedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }
}
