import type { ServiceContext } from "@/types/services";
import type {
  EmployeeDocumentRecord,
  OnboardingProcessRecord,
  OnboardingSearchQuery,
  OnboardingTaskRecord,
  ProvisioningTaskRecord,
  StartOnboardingInput,
  UploadDocumentInput,
  VerifyDocumentInput,
} from "@/types/hcm-onboarding";
import {
  createDocumentId,
  createOnboardingProcessId,
  createOnboardingTaskId,
  createProvisioningTaskId,
  createVerificationId,
} from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { OnboardingRulesEngine } from "@/lib/hcm/onboarding/OnboardingRulesEngine";
import type {
  DocumentRepository,
  OnboardingRepository,
  ProvisioningRepository,
  VerificationRepository,
} from "@/lib/hcm/onboarding/repositories/OnboardingRepository";
import type {
  CandidateRepository,
  OfferRepository,
} from "@/lib/hcm/recruitment/repositories/RecruitmentRepository";

const DEFAULT_ONBOARDING_TASKS: readonly {
  taskCode: string;
  title: string;
  category: OnboardingTaskRecord["category"];
  mandatory: boolean;
}[] = [
  { taskCode: "PRE_JOIN_FORM", title: "Complete pre-joining form", category: "pre_joining", mandatory: true },
  { taskCode: "POLICY_ACK", title: "Acknowledge policies", category: "joining", mandatory: true },
  { taskCode: "ORIENTATION", title: "Attend orientation", category: "orientation", mandatory: true },
];

const DEFAULT_PROVISIONING: readonly {
  provisioningType: ProvisioningTaskRecord["provisioningType"];
  title: string;
}[] = [
  { provisioningType: "it_account", title: "Create IT account" },
  { provisioningType: "equipment", title: "Issue equipment" },
  { provisioningType: "access_badge", title: "Issue access badge" },
];

export class OnboardingService {
  private readonly rules = new OnboardingRulesEngine();

  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly provisioningRepository: ProvisioningRepository,
    private readonly offerRepository: OfferRepository,
    private readonly candidateRepository: CandidateRepository,
  ) {}

  startProcess(input: StartOnboardingInput, context: ServiceContext): OnboardingProcessRecord {
    const organizationId = context.organizationId;
    const offer = this.offerRepository.findById(organizationId, input.offerId);
    if (!offer) throw new Error("OFFER_NOT_FOUND");
    if (offer.status !== "accepted") throw new Error("OFFER_NOT_ACCEPTED");
    if (offer.candidateId !== input.candidateId) {
      throw new Error("CANDIDATE_OFFER_MISMATCH");
    }

    const existing = this.onboardingRepository.findProcessByCandidate(
      organizationId,
      input.candidateId,
    );
    if (existing && existing.status !== "cancelled" && existing.status !== "completed") {
      throw new Error("ONBOARDING_ALREADY_ACTIVE");
    }

    const candidate = this.candidateRepository.findById(organizationId, input.candidateId);
    if (!candidate) throw new Error("CANDIDATE_NOT_FOUND");

    const now = nowIso();
    const process: OnboardingProcessRecord = {
      id: createOnboardingProcessId(),
      organizationId,
      candidateId: input.candidateId,
      offerId: input.offerId,
      joiningDate: input.joiningDate,
      status: "pre_joining",
      checklistStatus: "not_started",
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.onboardingRepository.createProcess(process);

    for (const taskDef of DEFAULT_ONBOARDING_TASKS) {
      this.onboardingRepository.createTask({
        id: createOnboardingTaskId(),
        organizationId,
        processId: saved.id,
        taskCode: taskDef.taskCode,
        title: taskDef.title,
        category: taskDef.category,
        status: "pending",
        mandatory: taskDef.mandatory,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const provDef of DEFAULT_PROVISIONING) {
      this.provisioningRepository.create({
        id: createProvisioningTaskId(),
        organizationId,
        processId: saved.id,
        provisioningType: provDef.provisioningType,
        title: provDef.title,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });
    }

    return saved;
  }

  completeTask(
    processId: string,
    taskCode: string,
    context: ServiceContext,
  ): OnboardingTaskRecord {
    const organizationId = context.organizationId;
    const process = this.onboardingRepository.findProcess(organizationId, processId);
    if (!process) throw new Error("ONBOARDING_PROCESS_NOT_FOUND");

    const tasks = this.onboardingRepository.listTasks(organizationId, processId);
    const task = tasks.find((t) => t.taskCode === taskCode);
    if (!task) throw new Error("ONBOARDING_TASK_NOT_FOUND");

    this.rules.assertTaskTransition(task.status, "completed");

    const now = nowIso();
    const updated: OnboardingTaskRecord = {
      ...task,
      status: "completed",
      completedAt: now,
      updatedAt: now,
    };

    const saved = this.onboardingRepository.updateTask(updated);
    this.refreshChecklistStatus(process, organizationId);
    return saved;
  }

  uploadDocument(input: UploadDocumentInput, context: ServiceContext): EmployeeDocumentRecord {
    const organizationId = context.organizationId;
    const process = this.onboardingRepository.findProcess(organizationId, input.processId);
    if (!process) throw new Error("ONBOARDING_PROCESS_NOT_FOUND");

    const requirements = this.onboardingRepository.listRequirements(organizationId);
    const requirement = requirements.find(
      (r) => r.documentType === input.documentType && r.categoryCode === input.categoryCode,
    );

    const now = nowIso();
    const document: EmployeeDocumentRecord = {
      id: createDocumentId(),
      organizationId,
      candidateId: process.candidateId,
      processId: input.processId,
      documentType: input.documentType,
      categoryCode: input.categoryCode,
      title: input.title,
      status: "uploaded",
      documentRef: input.documentRef,
      uploadedAt: now,
      uploadedBy: context.userId ?? "system",
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.documentRepository.create(document);

    if (requirement?.verificationRequired) {
      this.verificationRepository.save({
        id: createVerificationId(),
        organizationId,
        documentId: saved.id,
        status: "pending",
        auditTrail: [],
      });
    } else {
      this.documentRepository.update({ ...saved, status: "verified" });
    }

    return saved;
  }

  verifyDocument(input: VerifyDocumentInput, context: ServiceContext): EmployeeDocumentRecord {
    const organizationId = context.organizationId;
    const document = this.documentRepository.findById(organizationId, input.documentId);
    if (!document) throw new Error("DOCUMENT_NOT_FOUND");

    const existingVerification = this.verificationRepository.findByDocument(
      organizationId,
      input.documentId,
    );

    const now = nowIso();
    const actor = context.userId ?? "system";
    const verificationStatus = input.approved ? "verified" : "failed";

    this.verificationRepository.save({
      id: existingVerification?.id ?? createVerificationId(),
      organizationId,
      documentId: input.documentId,
      status: verificationStatus,
      verifiedBy: actor,
      verifiedAt: now,
      failureReason: input.approved ? undefined : input.notes,
      auditTrail: [
        ...(existingVerification?.auditTrail ?? []),
        {
          id: createVerificationId(),
          action: input.approved ? "verified" : "rejected",
          actorId: actor,
          timestamp: now,
          notes: input.notes,
        },
      ],
    });

    const updated: EmployeeDocumentRecord = {
      ...document,
      status: input.approved ? "verified" : "rejected",
      updatedAt: now,
    };

    return this.documentRepository.update(updated);
  }

  completeProvisioningTask(
    processId: string,
    provisioningType: ProvisioningTaskRecord["provisioningType"],
    context: ServiceContext,
  ): ProvisioningTaskRecord {
    const organizationId = context.organizationId;
    const tasks = this.provisioningRepository.listByProcess(organizationId, processId);
    const task = tasks.find((t) => t.provisioningType === provisioningType);
    if (!task) throw new Error("PROVISIONING_TASK_NOT_FOUND");

    const now = nowIso();
    const updated: ProvisioningTaskRecord = {
      ...task,
      status: "completed",
      completedAt: now,
      updatedAt: now,
    };

    return this.provisioningRepository.update(updated);
  }

  determineActivationReadiness(processId: string, context: ServiceContext): boolean {
    const organizationId = context.organizationId;
    const process = this.onboardingRepository.findProcess(organizationId, processId);
    if (!process) throw new Error("ONBOARDING_PROCESS_NOT_FOUND");

    const tasks = this.onboardingRepository.listTasks(organizationId, processId);
    const provisioningTasks = this.provisioningRepository.listByProcess(organizationId, processId);
    const requirements = this.onboardingRepository.listRequirements(organizationId);
    const documents = this.documentRepository.listByProcess(organizationId, processId);

    const verifications = new Map<string, "pending" | "verified" | "failed">();
    for (const doc of documents) {
      const verification = this.verificationRepository.findByDocument(organizationId, doc.id);
      if (verification) {
        verifications.set(doc.id, verification.status);
      }
    }

    return this.rules.isActivationReady({
      processStatus: process.status,
      tasks,
      provisioningTasks,
      requirements,
      documents,
      verifications,
    });
  }

  advanceToInProgress(processId: string, context: ServiceContext): OnboardingProcessRecord {
    return this.transitionProcess(processId, "in_progress", context);
  }

  advanceToOrientation(processId: string, context: ServiceContext): OnboardingProcessRecord {
    const organizationId = context.organizationId;
    const existing = this.onboardingRepository.findProcess(organizationId, processId);
    if (!existing) throw new Error("ONBOARDING_PROCESS_NOT_FOUND");
    if (existing.status === "pre_joining") {
      this.transitionProcess(processId, "in_progress", context);
    }
    return this.transitionProcess(processId, "orientation", context);
  }

  completeProcess(processId: string, context: ServiceContext): OnboardingProcessRecord {
    const organizationId = context.organizationId;
    const requirements = this.onboardingRepository.listRequirements(organizationId);
    const documents = this.documentRepository.listByProcess(organizationId, processId);
    this.rules.assertMandatoryDocumentsMet(requirements, documents);

    const ready = this.determineActivationReadiness(processId, context);
    if (!ready) throw new Error("ONBOARDING_NOT_READY");

    const process = this.transitionProcess(processId, "completed", context);
    return this.onboardingRepository.updateProcess({
      ...process,
      checklistStatus: "completed",
      completedAt: nowIso(),
    });
  }

  search(
    query: OnboardingSearchQuery | undefined,
    context: ServiceContext,
  ): readonly OnboardingProcessRecord[] {
    return this.onboardingRepository.searchProcesses(context.organizationId, query);
  }

  private transitionProcess(
    processId: string,
    targetStatus: OnboardingProcessRecord["status"],
    context: ServiceContext,
  ): OnboardingProcessRecord {
    const organizationId = context.organizationId;
    const existing = this.onboardingRepository.findProcess(organizationId, processId);
    if (!existing) throw new Error("ONBOARDING_PROCESS_NOT_FOUND");

    this.rules.assertProcessTransition(existing.status, targetStatus);

    const updated: OnboardingProcessRecord = {
      ...existing,
      status: targetStatus,
      checklistStatus: targetStatus === "completed" ? "completed" : "in_progress",
      updatedAt: nowIso(),
    };

    return this.onboardingRepository.updateProcess(updated);
  }

  private refreshChecklistStatus(
    process: OnboardingProcessRecord,
    organizationId: string,
  ): void {
    const tasks = this.onboardingRepository.listTasks(organizationId, process.id);
    const allComplete = tasks.every((t) => !t.mandatory || t.status === "completed");
    const anyStarted = tasks.some((t) => t.status === "in_progress" || t.status === "completed");

    let checklistStatus = process.checklistStatus;
    if (allComplete) checklistStatus = "completed";
    else if (anyStarted) checklistStatus = "in_progress";

    if (checklistStatus !== process.checklistStatus) {
      this.onboardingRepository.updateProcess({
        ...process,
        checklistStatus,
        updatedAt: nowIso(),
      });
    }
  }
}
