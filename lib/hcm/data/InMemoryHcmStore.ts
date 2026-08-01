import { randomUUID } from "crypto";
import type { EmployeeRecord } from "@/types/hcm-employee";
import type { EmploymentRecord } from "@/types/hcm-employment";
import type {
  DocumentRequirementRecord,
  DocumentVerificationRecord,
  EmployeeDocumentRecord,
  OnboardingProcessRecord,
  OnboardingSearchQuery,
  OnboardingTaskRecord,
  ProvisioningTaskRecord,
} from "@/types/hcm-onboarding";
import type { OrgUnitRecord, PositionRecord, ReportingRelationshipRecord } from "@/types/hcm-organization";
import type { ApplicationRecord, CandidateRecord, OfferRecord } from "@/types/hcm-recruitment";
import type { EmploymentAssignment, EmploymentHistoryRecord } from "@/types/hcm-employment";
import type {
  AttendanceExceptionRecord,
  AttendanceRecord,
  HolidayCalendarRecord,
  LeaveBalanceRecord,
  LeavePolicyRecord,
  LeaveRequestRecord,
  OvertimeRecord,
  RosterRecord,
  WorkCalendarRecord,
  WorkShiftRecord,
} from "@/types/hcm-time";
import type {
  PayrollAdjustmentRecord,
  PayrollCalendarRecord,
  PayrollComponentRecord,
  PayrollEntryRecord,
  PayrollPeriodRecord,
  PayrollResultRecord,
  PayrollRunRecord,
} from "@/types/hcm-payroll";
import type {
  CareerPathRecord,
  CertificationRecord,
  CompetencyAssessmentRecord,
  CompetencyRecord,
  DevelopmentPlanRecord,
  EnrollmentRecord,
  GoalRecord,
  LearningProgramRecord,
  ObjectiveRecord,
  PerformanceReviewRecord,
  SuccessionPlanRecord,
  TalentProfileRecord,
  TrainingCourseRecord,
} from "@/types/hcm-talent";

/** Shared in-memory HCM store (internal — not exported from public API). */
export class InMemoryHcmStore {
  readonly orgUnits = new Map<string, OrgUnitRecord>();
  readonly positions = new Map<string, PositionRecord>();
  readonly reporting = new Map<string, ReportingRelationshipRecord>();
  readonly employees = new Map<string, EmployeeRecord>();
  readonly employeeFingerprints = new Map<string, string>();
  readonly employments = new Map<string, EmploymentRecord>();
  readonly employmentHistory: EmploymentHistoryRecord[] = [];
  readonly assignments = new Map<string, EmploymentAssignment>();
  readonly candidates = new Map<string, CandidateRecord>();
  readonly applications = new Map<string, ApplicationRecord>();
  readonly offers = new Map<string, OfferRecord>();
  readonly onboardingProcesses = new Map<string, OnboardingProcessRecord>();
  readonly onboardingTasks = new Map<string, OnboardingTaskRecord>();
  readonly documentRequirements = new Map<string, DocumentRequirementRecord>();
  readonly documents = new Map<string, EmployeeDocumentRecord>();
  readonly verifications = new Map<string, DocumentVerificationRecord>();
  readonly provisioningTasks = new Map<string, ProvisioningTaskRecord>();
  readonly attendance = new Map<string, AttendanceRecord>();
  readonly attendanceExceptions = new Map<string, AttendanceExceptionRecord>();
  readonly shifts = new Map<string, WorkShiftRecord>();
  readonly rosters = new Map<string, RosterRecord>();
  readonly leaveRequests = new Map<string, LeaveRequestRecord>();
  readonly leaveBalances = new Map<string, LeaveBalanceRecord>();
  readonly leavePolicies = new Map<string, LeavePolicyRecord>();
  readonly holidayCalendars = new Map<string, HolidayCalendarRecord>();
  readonly workCalendars = new Map<string, WorkCalendarRecord>();
  readonly overtime = new Map<string, OvertimeRecord>();
  readonly payrollCalendars = new Map<string, PayrollCalendarRecord>();
  readonly payrollPeriods = new Map<string, PayrollPeriodRecord>();
  readonly payrollRuns = new Map<string, PayrollRunRecord>();
  readonly payrollEntries = new Map<string, PayrollEntryRecord>();
  readonly payrollComponents = new Map<string, PayrollComponentRecord>();
  readonly payrollAdjustments = new Map<string, PayrollAdjustmentRecord>();
  readonly payrollResults = new Map<string, PayrollResultRecord>();
  readonly goals = new Map<string, GoalRecord>();
  readonly objectives = new Map<string, ObjectiveRecord>();
  readonly performanceReviews = new Map<string, PerformanceReviewRecord>();
  readonly competencies = new Map<string, CompetencyRecord>();
  readonly competencyAssessments = new Map<string, CompetencyAssessmentRecord>();
  readonly developmentPlans = new Map<string, DevelopmentPlanRecord>();
  readonly trainingCourses = new Map<string, TrainingCourseRecord>();
  readonly learningPrograms = new Map<string, LearningProgramRecord>();
  readonly enrollments = new Map<string, EnrollmentRecord>();
  readonly certifications = new Map<string, CertificationRecord>();
  readonly careerPaths = new Map<string, CareerPathRecord>();
  readonly successionPlans = new Map<string, SuccessionPlanRecord>();
  readonly talentProfiles = new Map<string, TalentProfileRecord>();
}

export const defaultHcmStore = new InMemoryHcmStore();

export function createOnboardingProcessId(): string {
  return `onb-${randomUUID()}`;
}

export function createOnboardingTaskId(): string {
  return `onb-task-${randomUUID()}`;
}

export function createDocumentId(): string {
  return `doc-${randomUUID()}`;
}

export function createVerificationId(): string {
  return `vrf-${randomUUID()}`;
}

export function createProvisioningTaskId(): string {
  return `prov-${randomUUID()}`;
}

export function createCandidateId(): string {
  return `cand-${randomUUID()}`;
}

export function createOfferId(): string {
  return `offer-${randomUUID()}`;
}

export function createApplicationId(): string {
  return `app-${randomUUID()}`;
}

export function createRecruitmentRequestId(): string {
  return `req-${randomUUID()}`;
}

export function seedDefaultDocumentRequirements(
  store: InMemoryHcmStore,
  organizationId: string,
): void {
  const defaults: Omit<DocumentRequirementRecord, "id">[] = [
    {
      organizationId,
      documentType: "identity",
      categoryCode: "identity",
      mandatory: true,
      verificationRequired: true,
      active: true,
    },
    {
      organizationId,
      documentType: "contract",
      categoryCode: "employment",
      mandatory: true,
      verificationRequired: true,
      active: true,
    },
    {
      organizationId,
      documentType: "tax",
      categoryCode: "payroll",
      mandatory: true,
      verificationRequired: false,
      active: true,
    },
    {
      organizationId,
      documentType: "bank",
      categoryCode: "payroll",
      mandatory: false,
      verificationRequired: false,
      active: true,
    },
  ];

  for (const req of defaults) {
    const id = `req-doc-${req.documentType}-${organizationId}`;
    store.documentRequirements.set(id, { id, ...req });
  }
}
