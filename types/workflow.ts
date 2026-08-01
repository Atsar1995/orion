/**
 * Enterprise Workflow & Approval Engine types (Mission P-010.2).
 * Domain-agnostic workflow orchestration — no business-specific rules.
 */

/** Workflow instance lifecycle states. */
export type WorkflowStatus =
  | "draft"
  | "submitted"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired"
  | "completed";

/** Approval task states. */
export type ApprovalTaskStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "delegated"
  | "escalated"
  | "expired";

/** Routing policy for approval stages. */
export type WorkflowRoutingPolicy = "sequential" | "parallel" | "conditional";

/** Approver resolution policy types. */
export type ApproverPolicyType =
  | "single"
  | "role"
  | "department"
  | "branch"
  | "organization"
  | "threshold";

export type ApproverPolicy = {
  readonly type: ApproverPolicyType;
  readonly approverIds?: readonly string[];
  readonly roleSlug?: string;
  readonly departmentId?: string;
  readonly branchId?: string;
  readonly thresholdAmount?: number;
};

export type WorkflowStageDefinition = {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly approverPolicy: ApproverPolicy;
  readonly requiredApprovals: number;
  readonly condition?: string;
  readonly escalationHours?: number;
};

/** Configurable workflow definition template. */
export type WorkflowDefinitionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly domainKey: string;
  readonly version: number;
  readonly routingPolicy: WorkflowRoutingPolicy;
  readonly stages: readonly WorkflowStageDefinition[];
  readonly slaHours?: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Running workflow instance. */
export type WorkflowInstanceRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly definitionId: string;
  readonly definitionVersion: number;
  readonly domainKey: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly status: WorkflowStatus;
  readonly currentStageId?: string;
  readonly submittedBy?: string;
  readonly submittedAt?: string;
  readonly completedAt?: string;
  readonly correlationId: string;
  readonly payload?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Individual approval task within a workflow instance. */
export type ApprovalTaskRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly instanceId: string;
  readonly stageId: string;
  readonly assigneeId?: string;
  readonly assigneeRole?: string;
  readonly status: ApprovalTaskStatus;
  readonly delegatedToId?: string;
  readonly escalatedAt?: string;
  readonly dueAt?: string;
  readonly decidedAt?: string;
  readonly decidedBy?: string;
  readonly comment?: string;
};

/** Immutable workflow history entry. */
export type WorkflowHistoryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly instanceId: string;
  readonly action: string;
  readonly fromStatus?: WorkflowStatus;
  readonly toStatus?: WorkflowStatus;
  readonly actorId: string;
  readonly timestamp: string;
  readonly detail?: string;
};

/** Workflow-produced event types. */
export type WorkflowEventType =
  | "WorkflowStarted"
  | "ApprovalAssigned"
  | "ApprovalCompleted"
  | "ApprovalRejected"
  | "WorkflowCompleted"
  | "WorkflowCancelled"
  | "WorkflowEscalated";

/** Workflow-consumed event types. */
export type WorkflowInboundEventType = "WorkflowRequested" | "ApprovalRequested";

export type PublishWorkflowEventInput = {
  readonly eventType: WorkflowEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

export type CreateWorkflowDefinitionInput = {
  readonly name: string;
  readonly domainKey: string;
  readonly routingPolicy: WorkflowRoutingPolicy;
  readonly stages: readonly WorkflowStageDefinition[];
  readonly slaHours?: number;
};

export type StartWorkflowInput = {
  readonly definitionId: string;
  readonly domainKey: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId: string;
  readonly payload?: Readonly<Record<string, string>>;
};

export type ApprovalDecisionInput = {
  readonly instanceId: string;
  readonly taskId: string;
  readonly comment?: string;
};

export type DelegateApprovalInput = {
  readonly taskId: string;
  readonly delegateToId: string;
  readonly reason: string;
};

export type WorkflowInquiryQuery = {
  readonly status?: WorkflowStatus;
  readonly domainKey?: string;
  readonly entityType?: string;
};
