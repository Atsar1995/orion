/**
 * Purchase requisition lifecycle service (Mission P-010.8 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { ProcurementCanonicalEventPublisher } from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type { PurchaseApprovalService } from "@/lib/procurement/services/PurchaseApprovalService";
import { assertRequisitionTransition } from "@/lib/procurement/services/requisitionWorkflow";
import type {
  CreateRequisitionInput,
  PurchaseRequisitionRecord,
  RequisitionListFilter,
  RequisitionListView,
  UpdateRequisitionInput,
} from "@/lib/procurement/types/requisition";
import {
  assertProcurementPermission,
  asRequisitionRecord,
  getRequisitionOrThrow,
  getVendorOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

/** Purchase requisition workflow — persist then publish canonical events (ADR-014). */
export class PurchaseRequisitionService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
    private readonly canonicalPublisher: ProcurementCanonicalEventPublisher,
    private readonly approvalService: PurchaseApprovalService,
  ) {}

  listRequisitions(
    context: ServiceContext,
    filter: RequisitionListFilter = {},
  ): RequisitionListView {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      context.organizationId,
    );

    const query = filter.query?.trim().toLowerCase();
    const items = this.repository
      .listByOrganization(context.organizationId, "requisitions")
      .map(asRequisitionRecord)
      .filter((entry) => (filter.status ? entry.status === filter.status : true))
      .filter((entry) =>
        query ? entry.title.toLowerCase().includes(query) : true,
      );

    return { total: items.length, items };
  }

  getRequisition(requisitionId: string, context: ServiceContext): PurchaseRequisitionRecord | null {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      context.organizationId,
    );

    const record = this.repository.getById(
      context.organizationId,
      "requisitions",
      requisitionId,
    );
    return record ? asRequisitionRecord(record) : null;
  }

  createRequisition(
    input: CreateRequisitionInput,
    context: ServiceContext,
  ): PurchaseRequisitionRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      context.organizationId,
    );

    if (!input.title.trim()) {
      throw new Error("INVALID_REQUISITION_TITLE");
    }

    if (input.vendorId) {
      getVendorOrThrow(this.repository, input.vendorId, context);
    }

    const timestamp = nowIso();
    const record: PurchaseRequisitionRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      title: input.title.trim(),
      description: input.description?.trim(),
      requesterId: context.userId ?? "system",
      status: "draft",
      vendorId: input.vendorId,
      amount: input.amount,
      currencyCode: input.currencyCode,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const created = asRequisitionRecord(
      this.repository.upsert("requisitions", record as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishRequisitionCreated(
      {
        requisitionId: created.id,
        correlationId: created.id,
        requesterId: created.requesterId,
      },
      context,
    );

    return created;
  }

  updateRequisition(
    requisitionId: string,
    input: UpdateRequisitionInput,
    context: ServiceContext,
  ): PurchaseRequisitionRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      context.organizationId,
    );

    const existing = getRequisitionOrThrow(this.repository, requisitionId, context);
    if (existing.status !== "draft") {
      throw new Error("REQUISITION_NOT_EDITABLE");
    }

    if (input.vendorId) {
      getVendorOrThrow(this.repository, input.vendorId, context);
    }

    const timestamp = nowIso();
    return asRequisitionRecord(
      this.repository.upsert("requisitions", {
        ...existing,
        title: input.title?.trim() ?? existing.title,
        description: input.description?.trim() ?? existing.description,
        vendorId: input.vendorId ?? existing.vendorId,
        amount: input.amount ?? existing.amount,
        currencyCode: input.currencyCode ?? existing.currencyCode,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  submitRequisition(requisitionId: string, context: ServiceContext): PurchaseRequisitionRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      context.organizationId,
    );

    const existing = getRequisitionOrThrow(this.repository, requisitionId, context);
    assertRequisitionTransition(existing.status, "submitted");

    const timestamp = nowIso();
    const submitted = asRequisitionRecord(
      this.repository.upsert("requisitions", {
        ...existing,
        status: "submitted",
        submittedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.approvalService.prepareApproval(submitted, context);
    return submitted;
  }

  approveRequisition(requisitionId: string, context: ServiceContext): PurchaseRequisitionRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionApprove,
      context.organizationId,
    );

    const existing = getRequisitionOrThrow(this.repository, requisitionId, context);
    if (existing.status === "approved") {
      return existing;
    }

    assertRequisitionTransition(existing.status, "approved");
    this.approvalService.recordDecision(requisitionId, "approved", context);

    const timestamp = nowIso();
    const approved = asRequisitionRecord(
      this.repository.upsert("requisitions", {
        ...existing,
        status: "approved",
        approvedAt: timestamp,
        approvedBy: context.userId,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishRequisitionApproved(
      {
        requisitionId: approved.id,
        correlationId: approved.id,
        approvedBy: context.userId,
      },
      context,
    );

    return approved;
  }

  rejectRequisition(
    requisitionId: string,
    context: ServiceContext,
    reason?: string,
  ): PurchaseRequisitionRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionApprove,
      context.organizationId,
    );

    const existing = getRequisitionOrThrow(this.repository, requisitionId, context);
    if (existing.status === "rejected") {
      return existing;
    }

    assertRequisitionTransition(existing.status, "rejected");
    this.approvalService.recordDecision(requisitionId, "rejected", context, reason);

    const timestamp = nowIso();
    return asRequisitionRecord(
      this.repository.upsert("requisitions", {
        ...existing,
        status: "rejected",
        rejectedAt: timestamp,
        rejectedBy: context.userId,
        rejectionReason: reason?.trim(),
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  cancelRequisition(requisitionId: string, context: ServiceContext): PurchaseRequisitionRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      context.organizationId,
    );

    const existing = getRequisitionOrThrow(this.repository, requisitionId, context);
    if (existing.status === "cancelled") {
      return existing;
    }

    assertRequisitionTransition(existing.status, "cancelled");

    const timestamp = nowIso();
    return asRequisitionRecord(
      this.repository.upsert("requisitions", {
        ...existing,
        status: "cancelled",
        cancelledAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  closeRequisition(requisitionId: string, context: ServiceContext): PurchaseRequisitionRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionApprove,
      context.organizationId,
    );

    const existing = getRequisitionOrThrow(this.repository, requisitionId, context);
    if (existing.status === "closed") {
      return existing;
    }

    assertRequisitionTransition(existing.status, "closed");

    const timestamp = nowIso();
    return asRequisitionRecord(
      this.repository.upsert("requisitions", {
        ...existing,
        status: "closed",
        closedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }
}
