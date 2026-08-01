import type { WorkflowDefinitionRecord } from "@/types/workflow";

const ORG_ID = "org-orania";

function stage(
  id: string,
  name: string,
  order: number,
  policy: WorkflowDefinitionRecord["stages"][number]["approverPolicy"],
  requiredApprovals = 1,
  escalationHours?: number,
): WorkflowDefinitionRecord["stages"][number] {
  return { id, name, order, approverPolicy: policy, requiredApprovals, escalationHours };
}

/** Seed workflow definitions for org-orania (Mission P-010.2). */
export function seedWorkflowDefinitions(organizationId: string): WorkflowDefinitionRecord[] {
  const now = "2026-07-01T00:00:00.000Z";

  return [
    {
      id: "wf-def-generic-approval",
      organizationId,
      name: "Generic Approval Workflow",
      domainKey: "platform",
      version: 1,
      routingPolicy: "sequential",
      slaHours: 72,
      active: true,
      stages: [
        stage("stage-manager", "Manager Approval", 1, { type: "role", roleSlug: "manager" }),
        stage("stage-executive", "Executive Approval", 2, { type: "role", roleSlug: "executive" }),
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "wf-def-finance-threshold",
      organizationId,
      name: "Finance Threshold Approval",
      domainKey: "finance",
      version: 1,
      routingPolicy: "parallel",
      slaHours: 48,
      active: true,
      stages: [
        stage(
          "stage-finance-review",
          "Finance Review",
          1,
          { type: "threshold", thresholdAmount: 50_000, roleSlug: "manager" },
          2,
          24,
        ),
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "wf-def-department-approval",
      organizationId,
      name: "Department Approval",
      domainKey: "platform",
      version: 1,
      routingPolicy: "sequential",
      slaHours: 96,
      active: true,
      stages: [
        stage("stage-dept-head", "Department Head", 1, {
          type: "department",
          departmentId: "dept-finance",
        }),
        stage("stage-org-admin", "Organization Admin", 2, { type: "organization" }),
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export const SEED_ORG_ID = ORG_ID;
