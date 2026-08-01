import type {
  ApprovalTaskRecord,
  CreateWorkflowDefinitionInput,
  WorkflowDefinitionRecord,
  WorkflowStageDefinition,
  WorkflowStatus,
} from "@/types/workflow";
import type { ServiceContext } from "@/types/services";
import { canTransitionWorkflow } from "@/lib/platform/workflow/WorkflowStateMachine";

export type WorkflowValidationError = {
  readonly code: string;
  readonly message: string;
};

/** Domain-agnostic workflow validation (Mission P-010.2). */
export class WorkflowRulesEngine {
  validateDefinition(
    input: CreateWorkflowDefinitionInput,
    organizationId: string,
    existing: readonly WorkflowDefinitionRecord[],
  ): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    if (!input.name.trim()) {
      errors.push({ code: "INVALID_NAME", message: "Workflow name is required." });
    }

    if (!input.domainKey.trim()) {
      errors.push({ code: "INVALID_DOMAIN", message: "Domain key is required." });
    }

    if (input.stages.length === 0) {
      errors.push({ code: "NO_STAGES", message: "At least one approval stage is required." });
    }

    const stageIds = new Set<string>();
    for (const stage of input.stages) {
      if (stageIds.has(stage.id)) {
        errors.push({ code: "DUPLICATE_STAGE", message: `Duplicate stage id: ${stage.id}` });
      }
      stageIds.add(stage.id);
      errors.push(...this.validateStage(stage));
    }

    errors.push(...this.detectCircularRouting(input.stages, input.routingPolicy));

    const duplicate = existing.find(
      (def) =>
        def.organizationId === organizationId &&
        def.name === input.name &&
        def.domainKey === input.domainKey &&
        def.active,
    );
    if (duplicate) {
      errors.push({
        code: "DUPLICATE_DEFINITION",
        message: `Active workflow definition already exists: ${input.name}`,
      });
    }

    return errors;
  }

  validateStage(stage: WorkflowStageDefinition): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    if (!stage.name.trim()) {
      errors.push({ code: "INVALID_STAGE_NAME", message: "Stage name is required." });
    }

    errors.push(...this.validateApproverPolicy(stage.approverPolicy));

    if (stage.requiredApprovals < 1) {
      errors.push({
        code: "INVALID_REQUIRED_APPROVALS",
        message: "Required approvals must be at least 1.",
      });
    }

    return errors;
  }

  validateApproverPolicy(policy: WorkflowStageDefinition["approverPolicy"]): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    switch (policy.type) {
      case "single":
        if (!policy.approverIds?.length) {
          errors.push({ code: "MISSING_APPROVER", message: "Single approver requires approverIds." });
        }
        break;
      case "role":
        if (!policy.roleSlug?.trim()) {
          errors.push({ code: "MISSING_ROLE", message: "Role-based approval requires roleSlug." });
        }
        break;
      case "department":
        if (!policy.departmentId?.trim()) {
          errors.push({ code: "MISSING_DEPARTMENT", message: "Department approval requires departmentId." });
        }
        break;
      case "branch":
        if (!policy.branchId?.trim()) {
          errors.push({ code: "MISSING_BRANCH", message: "Branch approval requires branchId." });
        }
        break;
      case "organization":
        break;
      case "threshold":
        if (policy.thresholdAmount === undefined || policy.thresholdAmount <= 0) {
          errors.push({
            code: "INVALID_THRESHOLD",
            message: "Threshold approval requires a positive thresholdAmount.",
          });
        }
        break;
      default:
        errors.push({ code: "UNKNOWN_POLICY", message: "Unknown approver policy type." });
    }

    return errors;
  }

  detectCircularRouting(
    stages: readonly WorkflowStageDefinition[],
    routingPolicy: CreateWorkflowDefinitionInput["routingPolicy"],
  ): WorkflowValidationError[] {
    if (routingPolicy !== "conditional") return [];

    const errors: WorkflowValidationError[] = [];
    const stageMap = new Map(stages.map((stage) => [stage.id, stage]));

    for (const stage of stages) {
      if (!stage.condition) continue;
      const match = stage.condition.match(/goto:(\S+)/);
      if (match) {
        const targetId = match[1];
        if (targetId === stage.id) {
          errors.push({
            code: "CIRCULAR_WORKFLOW",
            message: `Stage ${stage.id} routes to itself.`,
          });
        }
        if (!stageMap.has(targetId)) {
          errors.push({
            code: "INVALID_CONDITION_TARGET",
            message: `Stage ${stage.id} references unknown target ${targetId}.`,
          });
        }
      }
    }

    return errors;
  }

  validateTransition(from: WorkflowStatus, to: WorkflowStatus): WorkflowValidationError | null {
    if (!canTransitionWorkflow(from, to)) {
      return {
        code: "INVALID_TRANSITION",
        message: `Cannot transition workflow from ${from} to ${to}.`,
      };
    }
    return null;
  }

  validateOrganizationAccess(
    record: { readonly organizationId: string },
    context: ServiceContext,
  ): WorkflowValidationError | null {
    if (record.organizationId !== context.organizationId && context.role !== "super_admin") {
      return { code: "ORGANIZATION_ISOLATION", message: "Organization access denied." };
    }
    return null;
  }

  validateDelegation(
    task: ApprovalTaskRecord,
    delegateToId: string,
    actorId: string,
  ): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    if (task.status !== "pending") {
      errors.push({ code: "TASK_NOT_PENDING", message: "Only pending tasks can be delegated." });
    }

    if (delegateToId === actorId) {
      errors.push({ code: "SELF_DELEGATION", message: "Cannot delegate to yourself." });
    }

    if (!delegateToId.trim()) {
      errors.push({ code: "INVALID_DELEGATE", message: "Delegate target is required." });
    }

    return errors;
  }

  validateEscalation(task: ApprovalTaskRecord): WorkflowValidationError | null {
    if (task.status !== "pending" && task.status !== "delegated") {
      return { code: "TASK_NOT_ESCALATABLE", message: "Task is not eligible for escalation." };
    }
    return null;
  }

  validateApprovalAuthorization(
    task: ApprovalTaskRecord,
    context: ServiceContext,
  ): WorkflowValidationError | null {
    const actorId = context.userId ?? "";
    const isAssignee = task.assigneeId === actorId || task.delegatedToId === actorId;
    const isAdmin =
      context.role === "super_admin" ||
      context.role === "organization_admin" ||
      context.role === "administrator";

    if (!isAssignee && !isAdmin) {
      return { code: "UNAUTHORIZED_APPROVER", message: "Actor is not authorized to approve this task." };
    }

    return null;
  }
}

export const workflowRulesEngine = new WorkflowRulesEngine();
