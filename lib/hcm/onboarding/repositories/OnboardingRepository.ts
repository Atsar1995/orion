import type {
  DocumentRequirementRecord,
  DocumentVerificationRecord,
  EmployeeDocumentRecord,
  OnboardingProcessRecord,
  OnboardingSearchQuery,
  OnboardingTaskRecord,
  ProvisioningTaskRecord,
} from "@/types/hcm-onboarding";

/** Onboarding process repository (P-012.5). */
export type OnboardingRepository = {
  readonly domain: "hcm";
  createProcess(process: OnboardingProcessRecord): OnboardingProcessRecord;
  updateProcess(process: OnboardingProcessRecord): OnboardingProcessRecord;
  findProcess(organizationId: string, processId: string): OnboardingProcessRecord | null;
  findProcessByCandidate(organizationId: string, candidateId: string): OnboardingProcessRecord | null;
  searchProcesses(organizationId: string, query?: OnboardingSearchQuery): readonly OnboardingProcessRecord[];
  countProcesses(organizationId: string, query?: OnboardingSearchQuery): number;
  createTask(task: OnboardingTaskRecord): OnboardingTaskRecord;
  updateTask(task: OnboardingTaskRecord): OnboardingTaskRecord;
  listTasks(organizationId: string, processId: string): readonly OnboardingTaskRecord[];
  listRequirements(organizationId: string): readonly DocumentRequirementRecord[];
};

/** Employee document repository (P-012.5). */
export type DocumentRepository = {
  readonly domain: "hcm";
  create(document: EmployeeDocumentRecord): EmployeeDocumentRecord;
  update(document: EmployeeDocumentRecord): EmployeeDocumentRecord;
  findById(organizationId: string, documentId: string): EmployeeDocumentRecord | null;
  listByProcess(organizationId: string, processId: string): readonly EmployeeDocumentRecord[];
  listByEmployee(organizationId: string, employeeId: string): readonly EmployeeDocumentRecord[];
};

/** Document verification repository (P-012.5). */
export type VerificationRepository = {
  readonly domain: "hcm";
  save(verification: DocumentVerificationRecord): DocumentVerificationRecord;
  findByDocument(organizationId: string, documentId: string): DocumentVerificationRecord | null;
};

/** Provisioning task repository (P-012.5). */
export type ProvisioningRepository = {
  readonly domain: "hcm";
  create(task: ProvisioningTaskRecord): ProvisioningTaskRecord;
  update(task: ProvisioningTaskRecord): ProvisioningTaskRecord;
  listByProcess(organizationId: string, processId: string): readonly ProvisioningTaskRecord[];
};
