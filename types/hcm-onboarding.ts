/**
 * HCM Onboarding & Employee Documents types (Mission P-012.5).
 */

export type DocumentStatus = "pending" | "uploaded" | "verified" | "rejected" | "expired";

export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked" | "cancelled";

export type VerificationStatus = "pending" | "verified" | "failed";

export type DocumentType =
  | "identity"
  | "contract"
  | "qualification"
  | "tax"
  | "bank"
  | "policy_acknowledgement"
  | "other";

export type ChecklistStatus = "not_started" | "in_progress" | "completed" | "blocked";

export type JoiningDate = string;

export type OnboardingProcessStatus =
  | "not_started"
  | "pre_joining"
  | "in_progress"
  | "orientation"
  | "completed"
  | "cancelled";

export type OnboardingProcessRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly candidateId: string;
  readonly offerId: string;
  readonly employeeId?: string;
  readonly employmentId?: string;
  readonly joiningDate: JoiningDate;
  readonly status: OnboardingProcessStatus;
  readonly checklistStatus: ChecklistStatus;
  readonly workflowInstanceId?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OnboardingTaskRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly processId: string;
  readonly taskCode: string;
  readonly title: string;
  readonly category: "pre_joining" | "joining" | "orientation" | "probation" | "provisioning";
  readonly status: TaskStatus;
  readonly mandatory: boolean;
  readonly assigneeRole?: string;
  readonly workflowTaskId?: string;
  readonly dueDate?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DocumentCategory = {
  readonly code: string;
  readonly label: string;
  readonly documentType: DocumentType;
};

export type DocumentRequirementRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly documentType: DocumentType;
  readonly categoryCode: string;
  readonly mandatory: boolean;
  readonly verificationRequired: boolean;
  readonly active: boolean;
};

export type EmployeeDocumentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId?: string;
  readonly candidateId?: string;
  readonly processId: string;
  readonly documentType: DocumentType;
  readonly categoryCode: string;
  readonly title: string;
  readonly status: DocumentStatus;
  readonly documentRef?: string;
  readonly uploadedAt?: string;
  readonly uploadedBy?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DocumentVerificationRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly documentId: string;
  readonly status: VerificationStatus;
  readonly verifiedBy?: string;
  readonly verifiedAt?: string;
  readonly failureReason?: string;
  readonly auditTrail: readonly VerificationAuditEntry[];
};

export type VerificationAuditEntry = {
  readonly id: string;
  readonly action: string;
  readonly actorId: string;
  readonly timestamp: string;
  readonly notes?: string;
};

export type ProvisioningTaskRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly processId: string;
  readonly provisioningType: "it_account" | "equipment" | "access_badge" | "manager_assignment";
  readonly title: string;
  readonly status: TaskStatus;
  readonly workflowInstanceId?: string;
  readonly completedAt?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type StartOnboardingInput = {
  readonly candidateId: string;
  readonly offerId: string;
  readonly joiningDate: JoiningDate;
  readonly employeeNumber?: string;
  readonly policyCode?: string;
};

export type UploadDocumentInput = {
  readonly processId: string;
  readonly documentType: DocumentType;
  readonly categoryCode: string;
  readonly title: string;
  readonly documentRef: string;
};

export type VerifyDocumentInput = {
  readonly documentId: string;
  readonly approved: boolean;
  readonly notes?: string;
};

export type OnboardingSearchQuery = {
  readonly employeeId?: string;
  readonly candidateId?: string;
  readonly joiningDateFrom?: string;
  readonly joiningDateTo?: string;
  readonly documentType?: DocumentType;
  readonly verificationStatus?: VerificationStatus;
  readonly onboardingStatus?: OnboardingProcessStatus;
  readonly page?: number;
  readonly pageSize?: number;
};

export type OnboardingSearchResult = {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly processes: readonly OnboardingProcessRecord[];
};

export type PublishHcmOnboardingEventInput = {
  readonly eventType:
    | "OnboardingStarted"
    | "DocumentUploaded"
    | "DocumentVerified"
    | "ProvisioningCompleted"
    | "OrientationCompleted"
    | "EmployeeActivated"
    | "OnboardingCompleted";
  readonly entityId: string;
  readonly employeeId?: string;
  readonly candidateId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
