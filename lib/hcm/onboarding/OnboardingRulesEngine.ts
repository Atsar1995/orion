import type {
  DocumentRequirementRecord,
  DocumentStatus,
  EmployeeDocumentRecord,
  OnboardingProcessStatus,
  OnboardingTaskRecord,
  ProvisioningTaskRecord,
  TaskStatus,
  VerificationStatus,
} from "@/types/hcm-onboarding";

const PROCESS_TRANSITIONS: Record<
  OnboardingProcessStatus,
  readonly OnboardingProcessStatus[]
> = {
  not_started: ["pre_joining", "cancelled"],
  pre_joining: ["in_progress", "cancelled"],
  in_progress: ["orientation", "cancelled"],
  orientation: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const TASK_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  pending: ["in_progress", "completed", "blocked", "cancelled"],
  in_progress: ["completed", "blocked", "cancelled"],
  blocked: ["in_progress", "cancelled"],
  completed: [],
  cancelled: [],
};

export class OnboardingRulesEngine {
  assertProcessTransition(from: OnboardingProcessStatus, to: OnboardingProcessStatus): void {
    if (from === to) return;
    if (!PROCESS_TRANSITIONS[from].includes(to)) {
      throw new Error("INVALID_ONBOARDING_STATUS_TRANSITION");
    }
  }

  assertTaskTransition(from: TaskStatus, to: TaskStatus): void {
    if (from === to) return;
    if (!TASK_TRANSITIONS[from].includes(to)) {
      throw new Error("INVALID_TASK_STATUS_TRANSITION");
    }
  }

  assertMandatoryDocumentsMet(
    requirements: readonly DocumentRequirementRecord[],
    documents: readonly EmployeeDocumentRecord[],
  ): void {
    const mandatory = requirements.filter((r) => r.mandatory && r.active);
    for (const req of mandatory) {
      const doc = documents.find(
        (d) => d.documentType === req.documentType && d.categoryCode === req.categoryCode,
      );
      if (!doc || doc.status !== "verified") {
        throw new Error("MANDATORY_DOCUMENTS_INCOMPLETE");
      }
    }
  }

  assertVerificationRequired(
    requirement: DocumentRequirementRecord | undefined,
    status: DocumentStatus,
  ): void {
    if (requirement?.verificationRequired && status !== "verified") {
      throw new Error("DOCUMENT_VERIFICATION_REQUIRED");
    }
  }

  isActivationReady(input: {
    readonly processStatus: OnboardingProcessStatus;
    readonly tasks: readonly OnboardingTaskRecord[];
    readonly provisioningTasks: readonly ProvisioningTaskRecord[];
    readonly requirements: readonly DocumentRequirementRecord[];
    readonly documents: readonly EmployeeDocumentRecord[];
    readonly verifications: ReadonlyMap<string, VerificationStatus>;
  }): boolean {
    if (input.processStatus !== "orientation" && input.processStatus !== "in_progress") {
      return false;
    }

    const mandatoryTasks = input.tasks.filter((t) => t.mandatory);
    if (mandatoryTasks.some((t) => t.status !== "completed")) {
      return false;
    }

    const mandatoryProvisioning = input.provisioningTasks;
    if (mandatoryProvisioning.some((t) => t.status !== "completed")) {
      return false;
    }

    const mandatoryDocs = input.requirements.filter((r) => r.mandatory && r.active);
    for (const req of mandatoryDocs) {
      const doc = input.documents.find(
        (d) => d.documentType === req.documentType && d.categoryCode === req.categoryCode,
      );
      if (!doc) return false;
      if (req.verificationRequired) {
        const verificationStatus = input.verifications.get(doc.id);
        if (verificationStatus !== "verified") return false;
      } else if (doc.status !== "uploaded" && doc.status !== "verified") {
        return false;
      }
    }

    return true;
  }
}
