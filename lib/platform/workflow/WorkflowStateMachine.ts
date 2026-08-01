import type { WorkflowStatus } from "@/types/workflow";

/** Allowed workflow lifecycle transitions (Mission P-010.2). */
const VALID_TRANSITIONS: Partial<Record<WorkflowStatus, readonly WorkflowStatus[]>> = {
  draft: ["submitted", "cancelled"],
  submitted: ["pending_approval", "cancelled"],
  pending_approval: ["approved", "rejected", "cancelled", "expired"],
  approved: ["completed", "cancelled"],
  rejected: [],
  cancelled: [],
  expired: [],
  completed: [],
};

/** Validates whether a workflow status transition is permitted. */
export function canTransitionWorkflow(from: WorkflowStatus, to: WorkflowStatus): boolean {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

/** Terminal workflow states. */
export const TERMINAL_WORKFLOW_STATUSES: readonly WorkflowStatus[] = [
  "rejected",
  "cancelled",
  "expired",
  "completed",
] as const;

/** Active workflow states requiring SLA monitoring. */
export const ACTIVE_WORKFLOW_STATUSES: readonly WorkflowStatus[] = [
  "submitted",
  "pending_approval",
] as const;

/** All workflow statuses. */
export const ALL_WORKFLOW_STATUSES: readonly WorkflowStatus[] = [
  "draft",
  "submitted",
  "pending_approval",
  "approved",
  "rejected",
  "cancelled",
  "expired",
  "completed",
] as const;
