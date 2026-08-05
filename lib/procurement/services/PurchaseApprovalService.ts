/**
 * Purchase approval preparation service (Mission P-010.8 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type {
  ApprovalDecisionStatus,
  PurchaseApprovalRecord,
  PurchaseRequisitionRecord,
} from "@/lib/procurement/types/requisition";
import {
  assertProcurementPermission,
  getRequisitionOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

function asApprovalRecord(record: ProcurementAggregateRecord): PurchaseApprovalRecord {
  return record as PurchaseApprovalRecord;
}

/** Approval preparation and decision recording for purchase requisitions. */
export class PurchaseApprovalService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
  ) {}

  getApprovalForRequisition(
    requisitionId: string,
    context: ServiceContext,
  ): PurchaseApprovalRecord | null {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      context.organizationId,
    );

    return this.findApproval(requisitionId, context.organizationId);
  }

  /** Creates a pending approval record when a requisition is submitted. */
  prepareApproval(requisition: PurchaseRequisitionRecord, context: ServiceContext): PurchaseApprovalRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      context.organizationId,
    );

    if (requisition.status !== "submitted") {
      throw new Error("REQUISITION_NOT_SUBMITTED");
    }

    const existing = this.findApproval(requisition.id, context.organizationId);
    if (existing) {
      return existing;
    }

    const timestamp = nowIso();
    const record: PurchaseApprovalRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      requisitionId: requisition.id,
      status: "pending",
      submittedAt: requisition.submittedAt ?? timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return asApprovalRecord(
      this.repository.upsert("purchaseApprovals", record as ProcurementAggregateRecord),
    );
  }

  /** Records an approval decision on the linked approval request. */
  recordDecision(
    requisitionId: string,
    decision: Exclude<ApprovalDecisionStatus, "pending">,
    context: ServiceContext,
    rejectionReason?: string,
  ): PurchaseApprovalRecord {
    const permission =
      decision === "approved"
        ? PROCUREMENT_PERMISSIONS.requisitionApprove
        : PROCUREMENT_PERMISSIONS.requisitionApprove;

    assertProcurementPermission(this.authorization, context, permission, context.organizationId);

    const requisition = getRequisitionOrThrow(this.repository, requisitionId, context);
    if (requisition.status !== "submitted") {
      throw new Error("REQUISITION_NOT_SUBMITTED");
    }

    const approval = this.findApproval(requisitionId, context.organizationId);
    if (!approval) {
      throw new Error("APPROVAL_NOT_FOUND");
    }

    if (approval.status === decision) {
      return approval;
    }

    if (approval.status !== "pending") {
      throw new Error("APPROVAL_ALREADY_DECIDED");
    }

    const timestamp = nowIso();
    return asApprovalRecord(
      this.repository.upsert("purchaseApprovals", {
        ...approval,
        status: decision,
        decidedAt: timestamp,
        decidedBy: context.userId,
        rejectionReason: decision === "rejected" ? rejectionReason?.trim() : undefined,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  private findApproval(
    requisitionId: string,
    organizationId: string,
  ): PurchaseApprovalRecord | null {
    const record = this.repository
      .listByOrganization(organizationId, "purchaseApprovals")
      .map(asApprovalRecord)
      .find((entry) => entry.requisitionId === requisitionId);

    return record ?? null;
  }
}
