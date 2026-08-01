import { randomUUID } from "crypto";
import type {
  ApproverPolicy,
  WorkflowRoutingPolicy,
  WorkflowStageDefinition,
} from "@/types/workflow";
import type { ServiceContext } from "@/types/services";
import type { OrganizationPlatformRepository } from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
import { defaultOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";

export type ResolvedApprover = {
  readonly assigneeId: string;
  readonly assigneeRole?: string;
};

/** Resolves approvers from policy definitions (Strategy pattern). */
export class ApproverResolutionStrategy {
  constructor(
    private readonly orgRepository: OrganizationPlatformRepository = defaultOrganizationPlatformRepository,
  ) {}

  resolve(
    policy: ApproverPolicy,
    context: ServiceContext,
    payload?: Readonly<Record<string, string>>,
  ): ResolvedApprover[] {
    switch (policy.type) {
      case "single":
        return (policy.approverIds ?? []).map((id) => ({ assigneeId: id }));
      case "role":
        return this.resolveByRole(context.organizationId, policy.roleSlug ?? "");
      case "department":
        return this.resolveByDepartment(context.organizationId, policy.departmentId ?? "");
      case "branch":
        return this.resolveByBranch(context.organizationId, policy.branchId ?? "");
      case "organization":
        return this.resolveOrganizationAdmins(context.organizationId);
      case "threshold":
        return this.resolveThreshold(context, policy, payload);
      default:
        return [];
    }
  }

  private resolveByRole(organizationId: string, roleSlug: string): ResolvedApprover[] {
    const users = this.orgRepository.listUsers(organizationId);
    return users
      .filter((user) => user.role === roleSlug)
      .map((user) => ({ assigneeId: user.id, assigneeRole: roleSlug }));
  }

  private resolveByDepartment(organizationId: string, departmentId: string): ResolvedApprover[] {
    const users = this.orgRepository.listUsers(organizationId);
    return users
      .filter((user) => user.departmentId === departmentId)
      .map((user) => ({ assigneeId: user.id, assigneeRole: "department_member" }));
  }

  private resolveByBranch(organizationId: string, branchId: string): ResolvedApprover[] {
    const users = this.orgRepository.listUsers(organizationId);
    return users
      .filter((user) => user.businessUnitId === branchId)
      .map((user) => ({ assigneeId: user.id, assigneeRole: "branch_member" }));
  }

  private resolveOrganizationAdmins(organizationId: string): ResolvedApprover[] {
    const users = this.orgRepository.listUsers(organizationId);
    return users
      .filter((user) => user.role === "organization_admin" || user.role === "super_admin" || user.role === "administrator")
      .map((user) => ({ assigneeId: user.id, assigneeRole: user.role }));
  }

  private resolveThreshold(
    context: ServiceContext,
    policy: ApproverPolicy,
    payload?: Readonly<Record<string, string>>,
  ): ResolvedApprover[] {
    const amount = Number(payload?.amount ?? 0);
    if (amount >= (policy.thresholdAmount ?? 0)) {
      return this.resolveByRole(context.organizationId, policy.roleSlug ?? "manager");
    }
    return [{ assigneeId: context.userId ?? "system", assigneeRole: "auto_approved" }];
  }
}

/** Routing policy strategies for sequential, parallel, and conditional stages. */
export class StageRoutingStrategy {
  getNextStage(
    definitionStages: readonly WorkflowStageDefinition[],
    currentStageId: string | undefined,
    routingPolicy: WorkflowRoutingPolicy,
  ): WorkflowStageDefinition | null {
    const sorted = [...definitionStages].sort((a, b) => a.order - b.order);

    if (!currentStageId) {
      return sorted[0] ?? null;
    }

    const currentIndex = sorted.findIndex((stage) => stage.id === currentStageId);
    if (currentIndex < 0) return null;

    if (routingPolicy === "conditional") {
      const current = sorted[currentIndex];
      if (current?.condition) {
        const match = current.condition.match(/goto:(\S+)/);
        if (match) {
          return sorted.find((stage) => stage.id === match[1]) ?? null;
        }
      }
    }

    if (routingPolicy === "parallel") {
      return sorted[currentIndex] ?? null;
    }

    return sorted[currentIndex + 1] ?? null;
  }

  isStageComplete(
    stage: WorkflowStageDefinition,
    approvedCount: number,
    routingPolicy: import("@/types/workflow").WorkflowRoutingPolicy,
  ): boolean {
    if (routingPolicy === "parallel") {
      return approvedCount >= stage.requiredApprovals;
    }
    return approvedCount >= 1;
  }
}

export function createApprovalTaskId(): string {
  return `wf-task-${randomUUID()}`;
}

export const approverResolutionStrategy = new ApproverResolutionStrategy();
export const stageRoutingStrategy = new StageRoutingStrategy();
