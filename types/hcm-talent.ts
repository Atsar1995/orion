/**
 * HCM Performance, Learning & Talent types (Mission P-012.8).
 */

export type GoalStatus = "draft" | "pending_approval" | "active" | "completed" | "cancelled";

export type ReviewRating = {
  readonly scaleCode: string;
  readonly value: number;
  readonly label?: string;
};

export type CompetencyLevel = "foundational" | "developing" | "proficient" | "advanced" | "expert";

export type LearningStatus = "assigned" | "in_progress" | "completed" | "cancelled" | "expired";

export type CertificationStatus = "active" | "expired" | "revoked" | "pending_renewal";

export type CareerStage = "entry" | "mid" | "senior" | "lead" | "executive";

export type ReviewCycleStatus = "draft" | "active" | "closed";

export type GoalRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly managerId?: string;
  readonly title: string;
  readonly description?: string;
  readonly status: GoalStatus;
  readonly targetDate?: string;
  readonly cycleCode?: string;
  readonly workflowInstanceId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type ObjectiveRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly goalId: string;
  readonly title: string;
  readonly weight?: number;
  readonly progress: number;
  readonly completed: boolean;
  readonly dueDate?: string;
};

export type PerformanceReviewRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly reviewerId: string;
  readonly cycleCode: string;
  readonly status: "draft" | "in_progress" | "pending_approval" | "completed";
  readonly overallRating?: ReviewRating;
  readonly workflowInstanceId?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CompetencyRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly category?: string;
  readonly description?: string;
  readonly frameworkCode: string;
  readonly active: boolean;
};

export type CompetencyAssessmentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly competencyId: string;
  readonly level: CompetencyLevel;
  readonly assessedBy: string;
  readonly assessedAt: string;
  readonly notes?: string;
};

export type DevelopmentPlanRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly title: string;
  readonly status: "draft" | "pending_approval" | "approved" | "in_progress" | "completed";
  readonly competencyIds: readonly string[];
  readonly targetDate?: string;
  readonly workflowInstanceId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type TrainingCourseRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly title: string;
  readonly description?: string;
  readonly durationHours?: number;
  readonly prerequisiteCourseIds?: readonly string[];
  readonly active: boolean;
};

export type LearningProgramRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly title: string;
  readonly courseIds: readonly string[];
  readonly active: boolean;
};

export type EnrollmentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly courseId?: string;
  readonly programId?: string;
  readonly status: LearningStatus;
  readonly assignedAt: string;
  readonly completedAt?: string;
  readonly workflowInstanceId?: string;
  readonly assignedBy: string;
};

export type CertificationRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly certificationCode: string;
  readonly name: string;
  readonly status: CertificationStatus;
  readonly issuedAt: string;
  readonly expiresAt?: string;
  readonly courseId?: string;
  readonly workflowInstanceId?: string;
};

export type CareerPathRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly title: string;
  readonly stage: CareerStage;
  readonly competencyIds: readonly string[];
  readonly active: boolean;
};

export type SuccessionPlanRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly positionId: string;
  readonly incumbentEmployeeId?: string;
  readonly successorEmployeeIds: readonly string[];
  readonly readinessLevel: CompetencyLevel;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type TalentProfileRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly careerStage: CareerStage;
  readonly talentPoolCodes: readonly string[];
  readonly potentialRating?: ReviewRating;
  readonly performanceRating?: ReviewRating;
  readonly readinessForPromotion: boolean;
  readonly updatedAt: string;
};

export type TalentSearchQuery = {
  readonly employeeId?: string;
  readonly managerId?: string;
  readonly goalId?: string;
  readonly competencyId?: string;
  readonly courseId?: string;
  readonly certificationCode?: string;
  readonly careerPathCode?: string;
  readonly status?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type CreateGoalInput = {
  readonly employeeId: string;
  readonly managerId?: string;
  readonly title: string;
  readonly description?: string;
  readonly targetDate?: string;
  readonly cycleCode?: string;
  readonly objectives?: readonly Omit<ObjectiveRecord, "id" | "organizationId" | "goalId" | "progress" | "completed">[];
};

export type CreatePerformanceReviewInput = {
  readonly employeeId: string;
  readonly reviewerId: string;
  readonly cycleCode: string;
};

export type CreateDevelopmentPlanInput = {
  readonly employeeId: string;
  readonly title: string;
  readonly competencyIds: readonly string[];
  readonly targetDate?: string;
};

export type AssignTrainingInput = {
  readonly employeeId: string;
  readonly courseId?: string;
  readonly programId?: string;
};

export type IssueCertificationInput = {
  readonly employeeId: string;
  readonly certificationCode: string;
  readonly name: string;
  readonly expiresAt?: string;
  readonly courseId?: string;
};

export type PublishHcmTalentEventInput = {
  readonly eventType:
    | "GoalCreated"
    | "GoalCompleted"
    | "PerformanceReviewStarted"
    | "PerformanceReviewCompleted"
    | "TrainingAssigned"
    | "TrainingCompleted"
    | "CertificationIssued"
    | "CertificationExpired"
    | "DevelopmentPlanApproved"
    | "SuccessionUpdated";
  readonly entityId: string;
  readonly employeeId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
