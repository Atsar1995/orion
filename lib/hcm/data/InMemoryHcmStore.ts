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
import type { ExpenseRecord } from "@/types/hcm-expense";
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

/** Optional collection overrides for PostgreSQL-backed store construction (P-015.5). */
export type InMemoryHcmStoreOptions = {
  readonly orgUnits?: Map<string, OrgUnitRecord>;
  readonly positions?: Map<string, PositionRecord>;
  readonly reporting?: Map<string, ReportingRelationshipRecord>;
  readonly employees?: Map<string, EmployeeRecord>;
  readonly employeeFingerprints?: Map<string, string>;
  readonly employments?: Map<string, EmploymentRecord>;
  readonly employmentHistory?: EmploymentHistoryRecord[];
  readonly assignments?: Map<string, EmploymentAssignment>;
  readonly candidates?: Map<string, CandidateRecord>;
  readonly applications?: Map<string, ApplicationRecord>;
  readonly offers?: Map<string, OfferRecord>;
  readonly onboardingProcesses?: Map<string, OnboardingProcessRecord>;
  readonly onboardingTasks?: Map<string, OnboardingTaskRecord>;
  readonly documentRequirements?: Map<string, DocumentRequirementRecord>;
  readonly documents?: Map<string, EmployeeDocumentRecord>;
  readonly verifications?: Map<string, DocumentVerificationRecord>;
  readonly provisioningTasks?: Map<string, ProvisioningTaskRecord>;
  readonly attendance?: Map<string, AttendanceRecord>;
  readonly attendanceExceptions?: Map<string, AttendanceExceptionRecord>;
  readonly shifts?: Map<string, WorkShiftRecord>;
  readonly rosters?: Map<string, RosterRecord>;
  readonly leaveRequests?: Map<string, LeaveRequestRecord>;
  readonly leaveBalances?: Map<string, LeaveBalanceRecord>;
  readonly leavePolicies?: Map<string, LeavePolicyRecord>;
  readonly holidayCalendars?: Map<string, HolidayCalendarRecord>;
  readonly workCalendars?: Map<string, WorkCalendarRecord>;
  readonly overtime?: Map<string, OvertimeRecord>;
  readonly payrollCalendars?: Map<string, PayrollCalendarRecord>;
  readonly payrollPeriods?: Map<string, PayrollPeriodRecord>;
  readonly payrollRuns?: Map<string, PayrollRunRecord>;
  readonly payrollEntries?: Map<string, PayrollEntryRecord>;
  readonly payrollComponents?: Map<string, PayrollComponentRecord>;
  readonly payrollAdjustments?: Map<string, PayrollAdjustmentRecord>;
  readonly payrollResults?: Map<string, PayrollResultRecord>;
  readonly expenses?: Map<string, ExpenseRecord>;
  readonly goals?: Map<string, GoalRecord>;
  readonly objectives?: Map<string, ObjectiveRecord>;
  readonly performanceReviews?: Map<string, PerformanceReviewRecord>;
  readonly competencies?: Map<string, CompetencyRecord>;
  readonly competencyAssessments?: Map<string, CompetencyAssessmentRecord>;
  readonly developmentPlans?: Map<string, DevelopmentPlanRecord>;
  readonly trainingCourses?: Map<string, TrainingCourseRecord>;
  readonly learningPrograms?: Map<string, LearningProgramRecord>;
  readonly enrollments?: Map<string, EnrollmentRecord>;
  readonly certifications?: Map<string, CertificationRecord>;
  readonly careerPaths?: Map<string, CareerPathRecord>;
  readonly successionPlans?: Map<string, SuccessionPlanRecord>;
  readonly talentProfiles?: Map<string, TalentProfileRecord>;
};

/** Shared in-memory HCM store (internal — not exported from public API). */
export class InMemoryHcmStore {
  readonly orgUnits: Map<string, OrgUnitRecord>;
  readonly positions: Map<string, PositionRecord>;
  readonly reporting: Map<string, ReportingRelationshipRecord>;
  readonly employees: Map<string, EmployeeRecord>;
  readonly employeeFingerprints: Map<string, string>;
  readonly employments: Map<string, EmploymentRecord>;
  readonly employmentHistory: EmploymentHistoryRecord[];
  readonly assignments: Map<string, EmploymentAssignment>;
  readonly candidates: Map<string, CandidateRecord>;
  readonly applications: Map<string, ApplicationRecord>;
  readonly offers: Map<string, OfferRecord>;
  readonly onboardingProcesses: Map<string, OnboardingProcessRecord>;
  readonly onboardingTasks: Map<string, OnboardingTaskRecord>;
  readonly documentRequirements: Map<string, DocumentRequirementRecord>;
  readonly documents: Map<string, EmployeeDocumentRecord>;
  readonly verifications: Map<string, DocumentVerificationRecord>;
  readonly provisioningTasks: Map<string, ProvisioningTaskRecord>;
  readonly attendance: Map<string, AttendanceRecord>;
  readonly attendanceExceptions: Map<string, AttendanceExceptionRecord>;
  readonly shifts: Map<string, WorkShiftRecord>;
  readonly rosters: Map<string, RosterRecord>;
  readonly leaveRequests: Map<string, LeaveRequestRecord>;
  readonly leaveBalances: Map<string, LeaveBalanceRecord>;
  readonly leavePolicies: Map<string, LeavePolicyRecord>;
  readonly holidayCalendars: Map<string, HolidayCalendarRecord>;
  readonly workCalendars: Map<string, WorkCalendarRecord>;
  readonly overtime: Map<string, OvertimeRecord>;
  readonly payrollCalendars: Map<string, PayrollCalendarRecord>;
  readonly payrollPeriods: Map<string, PayrollPeriodRecord>;
  readonly payrollRuns: Map<string, PayrollRunRecord>;
  readonly payrollEntries: Map<string, PayrollEntryRecord>;
  readonly payrollComponents: Map<string, PayrollComponentRecord>;
  readonly payrollAdjustments: Map<string, PayrollAdjustmentRecord>;
  readonly payrollResults: Map<string, PayrollResultRecord>;
  readonly expenses: Map<string, ExpenseRecord>;
  readonly goals: Map<string, GoalRecord>;
  readonly objectives: Map<string, ObjectiveRecord>;
  readonly performanceReviews: Map<string, PerformanceReviewRecord>;
  readonly competencies: Map<string, CompetencyRecord>;
  readonly competencyAssessments: Map<string, CompetencyAssessmentRecord>;
  readonly developmentPlans: Map<string, DevelopmentPlanRecord>;
  readonly trainingCourses: Map<string, TrainingCourseRecord>;
  readonly learningPrograms: Map<string, LearningProgramRecord>;
  readonly enrollments: Map<string, EnrollmentRecord>;
  readonly certifications: Map<string, CertificationRecord>;
  readonly careerPaths: Map<string, CareerPathRecord>;
  readonly successionPlans: Map<string, SuccessionPlanRecord>;
  readonly talentProfiles: Map<string, TalentProfileRecord>;

  constructor(options: InMemoryHcmStoreOptions = {}) {
    this.orgUnits = options.orgUnits ?? new Map();
    this.positions = options.positions ?? new Map();
    this.reporting = options.reporting ?? new Map();
    this.employees = options.employees ?? new Map();
    this.employeeFingerprints = options.employeeFingerprints ?? new Map();
    this.employments = options.employments ?? new Map();
    this.employmentHistory = options.employmentHistory ?? [];
    this.assignments = options.assignments ?? new Map();
    this.candidates = options.candidates ?? new Map();
    this.applications = options.applications ?? new Map();
    this.offers = options.offers ?? new Map();
    this.onboardingProcesses = options.onboardingProcesses ?? new Map();
    this.onboardingTasks = options.onboardingTasks ?? new Map();
    this.documentRequirements = options.documentRequirements ?? new Map();
    this.documents = options.documents ?? new Map();
    this.verifications = options.verifications ?? new Map();
    this.provisioningTasks = options.provisioningTasks ?? new Map();
    this.attendance = options.attendance ?? new Map();
    this.attendanceExceptions = options.attendanceExceptions ?? new Map();
    this.shifts = options.shifts ?? new Map();
    this.rosters = options.rosters ?? new Map();
    this.leaveRequests = options.leaveRequests ?? new Map();
    this.leaveBalances = options.leaveBalances ?? new Map();
    this.leavePolicies = options.leavePolicies ?? new Map();
    this.holidayCalendars = options.holidayCalendars ?? new Map();
    this.workCalendars = options.workCalendars ?? new Map();
    this.overtime = options.overtime ?? new Map();
    this.payrollCalendars = options.payrollCalendars ?? new Map();
    this.payrollPeriods = options.payrollPeriods ?? new Map();
    this.payrollRuns = options.payrollRuns ?? new Map();
    this.payrollEntries = options.payrollEntries ?? new Map();
    this.payrollComponents = options.payrollComponents ?? new Map();
    this.payrollAdjustments = options.payrollAdjustments ?? new Map();
    this.payrollResults = options.payrollResults ?? new Map();
    this.expenses = options.expenses ?? new Map();
    this.goals = options.goals ?? new Map();
    this.objectives = options.objectives ?? new Map();
    this.performanceReviews = options.performanceReviews ?? new Map();
    this.competencies = options.competencies ?? new Map();
    this.competencyAssessments = options.competencyAssessments ?? new Map();
    this.developmentPlans = options.developmentPlans ?? new Map();
    this.trainingCourses = options.trainingCourses ?? new Map();
    this.learningPrograms = options.learningPrograms ?? new Map();
    this.enrollments = options.enrollments ?? new Map();
    this.certifications = options.certifications ?? new Map();
    this.careerPaths = options.careerPaths ?? new Map();
    this.successionPlans = options.successionPlans ?? new Map();
    this.talentProfiles = options.talentProfiles ?? new Map();
  }
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
