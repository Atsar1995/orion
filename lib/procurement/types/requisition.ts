/**
 * Purchase Requisition domain types (Mission P-010.8).
 */

import type { ProcurementScopedRecord } from "@/lib/procurement/types/procurement-core";

export type RequisitionStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "cancelled"
  | "closed";

/** Organization-scoped purchase requisition record. */
export type PurchaseRequisitionRecord = ProcurementScopedRecord & {
  readonly title: string;
  readonly description?: string;
  readonly requesterId: string;
  readonly status: RequisitionStatus;
  readonly vendorId?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
  readonly submittedAt?: string;
  readonly approvedAt?: string;
  readonly approvedBy?: string;
  readonly rejectedAt?: string;
  readonly rejectedBy?: string;
  readonly rejectionReason?: string;
  readonly cancelledAt?: string;
  readonly closedAt?: string;
};

export type CreateRequisitionInput = {
  readonly title: string;
  readonly description?: string;
  readonly vendorId?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
};

export type UpdateRequisitionInput = {
  readonly title?: string;
  readonly description?: string;
  readonly vendorId?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
};

export type RequisitionListFilter = {
  readonly status?: RequisitionStatus;
  readonly query?: string;
};

export type RequisitionListView = {
  readonly total: number;
  readonly items: readonly PurchaseRequisitionRecord[];
};

export type ApprovalDecisionStatus = "pending" | "approved" | "rejected";

/** Purchase approval record linked to a requisition. */
export type PurchaseApprovalRecord = ProcurementScopedRecord & {
  readonly requisitionId: string;
  readonly status: ApprovalDecisionStatus;
  readonly submittedAt: string;
  readonly decidedAt?: string;
  readonly decidedBy?: string;
  readonly rejectionReason?: string;
};
