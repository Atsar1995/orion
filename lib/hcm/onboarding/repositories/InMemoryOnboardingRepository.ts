import type {
  DocumentRequirementRecord,
  DocumentVerificationRecord,
  EmployeeDocumentRecord,
  OnboardingProcessRecord,
  OnboardingSearchQuery,
  OnboardingTaskRecord,
  ProvisioningTaskRecord,
} from "@/types/hcm-onboarding";
import type {
  DocumentRepository,
  OnboardingRepository,
  ProvisioningRepository,
  VerificationRepository,
} from "@/lib/hcm/onboarding/repositories/OnboardingRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

function inDateRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function matchesOnboardingQuery(process: OnboardingProcessRecord, query?: OnboardingSearchQuery): boolean {
  if (!query) return true;
  if (query.employeeId && process.employeeId !== query.employeeId) return false;
  if (query.candidateId && process.candidateId !== query.candidateId) return false;
  if (query.onboardingStatus && process.status !== query.onboardingStatus) return false;
  if (!inDateRange(process.joiningDate, query.joiningDateFrom, query.joiningDateTo)) return false;
  return true;
}

export class InMemoryOnboardingRepository implements OnboardingRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  createProcess(process: OnboardingProcessRecord): OnboardingProcessRecord {
    this.store.onboardingProcesses.set(process.id, process);
    return process;
  }

  updateProcess(process: OnboardingProcessRecord): OnboardingProcessRecord {
    this.store.onboardingProcesses.set(process.id, process);
    return process;
  }

  findProcess(organizationId: string, processId: string): OnboardingProcessRecord | null {
    const record = this.store.onboardingProcesses.get(processId);
    return record?.organizationId === organizationId ? record : null;
  }

  findProcessByCandidate(organizationId: string, candidateId: string): OnboardingProcessRecord | null {
    for (const record of this.store.onboardingProcesses.values()) {
      if (record.organizationId === organizationId && record.candidateId === candidateId) {
        return record;
      }
    }
    return null;
  }

  searchProcesses(organizationId: string, query?: OnboardingSearchQuery): readonly OnboardingProcessRecord[] {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 50;
    const filtered = [...this.store.onboardingProcesses.values()]
      .filter((record) => record.organizationId === organizationId && matchesOnboardingQuery(record, query))
      .sort((a, b) => b.joiningDate.localeCompare(a.joiningDate));
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  countProcesses(organizationId: string, query?: OnboardingSearchQuery): number {
    return [...this.store.onboardingProcesses.values()].filter(
      (record) => record.organizationId === organizationId && matchesOnboardingQuery(record, query),
    ).length;
  }

  createTask(task: OnboardingTaskRecord): OnboardingTaskRecord {
    this.store.onboardingTasks.set(task.id, task);
    return task;
  }

  updateTask(task: OnboardingTaskRecord): OnboardingTaskRecord {
    this.store.onboardingTasks.set(task.id, task);
    return task;
  }

  listTasks(organizationId: string, processId: string): readonly OnboardingTaskRecord[] {
    return [...this.store.onboardingTasks.values()]
      .filter((record) => record.organizationId === organizationId && record.processId === processId)
      .sort((a, b) => a.taskCode.localeCompare(b.taskCode));
  }

  listRequirements(organizationId: string): readonly DocumentRequirementRecord[] {
    return [...this.store.documentRequirements.values()]
      .filter((record) => record.organizationId === organizationId && record.active)
      .sort((a, b) => a.documentType.localeCompare(b.documentType));
  }
}

export class InMemoryDocumentRepository implements DocumentRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(document: EmployeeDocumentRecord): EmployeeDocumentRecord {
    this.store.documents.set(document.id, document);
    return document;
  }

  update(document: EmployeeDocumentRecord): EmployeeDocumentRecord {
    this.store.documents.set(document.id, document);
    return document;
  }

  findById(organizationId: string, documentId: string): EmployeeDocumentRecord | null {
    const record = this.store.documents.get(documentId);
    return record?.organizationId === organizationId ? record : null;
  }

  listByProcess(organizationId: string, processId: string): readonly EmployeeDocumentRecord[] {
    return [...this.store.documents.values()]
      .filter((record) => record.organizationId === organizationId && record.processId === processId)
      .sort((a, b) => a.documentType.localeCompare(b.documentType));
  }

  listByEmployee(organizationId: string, employeeId: string): readonly EmployeeDocumentRecord[] {
    return [...this.store.documents.values()]
      .filter((record) => record.organizationId === organizationId && record.employeeId === employeeId)
      .sort((a, b) => a.documentType.localeCompare(b.documentType));
  }
}

export class InMemoryVerificationRepository implements VerificationRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  save(verification: DocumentVerificationRecord): DocumentVerificationRecord {
    this.store.verifications.set(verification.documentId, verification);
    return verification;
  }

  findByDocument(organizationId: string, documentId: string): DocumentVerificationRecord | null {
    const record = this.store.verifications.get(documentId);
    return record?.organizationId === organizationId ? record : null;
  }
}

export class InMemoryProvisioningRepository implements ProvisioningRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(task: ProvisioningTaskRecord): ProvisioningTaskRecord {
    this.store.provisioningTasks.set(task.id, task);
    return task;
  }

  update(task: ProvisioningTaskRecord): ProvisioningTaskRecord {
    this.store.provisioningTasks.set(task.id, task);
    return task;
  }

  listByProcess(organizationId: string, processId: string): readonly ProvisioningTaskRecord[] {
    return [...this.store.provisioningTasks.values()]
      .filter((record) => record.organizationId === organizationId && record.processId === processId)
      .sort((a, b) => a.provisioningType.localeCompare(b.provisioningType));
  }
}
