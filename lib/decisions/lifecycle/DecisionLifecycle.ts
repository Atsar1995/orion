import type { DecisionStatus, ExecutiveActionType } from "@/types/decisions";

/** Legacy status aliases normalized to Canon lifecycle (Mission P-003). */
export function normalizeDecisionStatus(status: DecisionStatus): DecisionStatus {
  if (status === "new") {
    return "recommended";
  }

  if (status === "snoozed") {
    return "deferred";
  }

  if (status === "dismissed") {
    return "rejected";
  }

  return status;
}

const ACTION_STATUS_MAP: Record<ExecutiveActionType, DecisionStatus> = {
  recommended: "recommended",
  pending_review: "pending_review",
  accepted: "accepted",
  rejected: "rejected",
  delegated: "delegated",
  deferred: "deferred",
  snoozed: "deferred",
  in_progress: "in_progress",
  completed: "completed",
  reopened: "reopened",
  archived: "archived",
};

/** Maps executive action to resulting decision status. */
export function statusFromAction(action: ExecutiveActionType): DecisionStatus {
  return ACTION_STATUS_MAP[action];
}

/** Allowed lifecycle transitions (Mission P-003). */
const VALID_TRANSITIONS: Partial<Record<DecisionStatus, readonly DecisionStatus[]>> = {
  draft: ["recommended", "archived"],
  recommended: ["pending_review", "accepted", "rejected", "delegated", "deferred", "archived"],
  pending_review: ["accepted", "rejected", "delegated", "deferred", "archived"],
  accepted: ["in_progress", "completed", "delegated", "archived"],
  delegated: ["in_progress", "completed", "accepted", "archived"],
  deferred: ["recommended", "pending_review", "accepted", "archived"],
  in_progress: ["completed", "delegated", "reopened", "archived"],
  completed: ["reopened", "archived"],
  reopened: ["in_progress", "accepted", "archived"],
  rejected: ["archived", "reopened"],
  archived: ["reopened"],
  new: ["pending_review", "accepted", "rejected", "delegated", "deferred", "archived"],
  snoozed: ["recommended", "pending_review", "accepted", "archived"],
  dismissed: ["archived", "reopened"],
};

/** Validates whether a lifecycle transition is permitted. */
export function canTransition(from: DecisionStatus, to: DecisionStatus): boolean {
  const normalizedFrom = normalizeDecisionStatus(from);
  const normalizedTo = normalizeDecisionStatus(to);
  const allowed = VALID_TRANSITIONS[normalizedFrom] ?? VALID_TRANSITIONS[from];

  if (!allowed) {
    return normalizedFrom === normalizedTo;
  }

  return allowed.includes(normalizedTo);
}

/** All Canon lifecycle statuses for search filters. */
export const CANON_DECISION_STATUSES: readonly DecisionStatus[] = [
  "draft",
  "recommended",
  "pending_review",
  "accepted",
  "rejected",
  "delegated",
  "deferred",
  "in_progress",
  "completed",
  "reopened",
  "archived",
] as const;
