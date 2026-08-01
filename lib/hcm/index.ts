import type { ServiceContext } from "@/types/services";
import {
  HCM_ALL_CAPABILITIES,
  HCM_ALL_MISSIONS,
  HCM_BASE_PATH,
  HCM_IIL_SERVICE_ID,
  HCM_MISSION_EMPLOYEE,
  HCM_MISSION_EMPLOYMENT,
  HCM_MISSION_ONBOARDING,
  HCM_MISSION_ORGANIZATION,
  HCM_MISSION_PAYROLL,
  HCM_MISSION_RECRUITMENT,
  HCM_MISSION_TALENT,
  HCM_MISSION_TIME,
  HCM_MODULE_KEY,
  HCM_WORKSPACE_ID,
} from "@/lib/hcm/constants";
import { createEventAwareFoundationOperations } from "@/lib/hcm/events/createEventAwareFoundationOperations";
import { hcmEventPublisher } from "@/lib/hcm/events/HcmEventPublisher";
import { registerHcmSubscribers } from "@/lib/hcm/events/register-hcm-subscribers";
import type { HcmFoundationOperations } from "@/lib/hcm/HcmFoundationOperations";
import { createHcmWiring, type HcmWiring } from "@/lib/hcm/createHcmWiring";
import type { AttendanceService } from "@/lib/hcm/time/services/AttendanceService";
import type { CalendarService } from "@/lib/hcm/time/services/CalendarService";
import type { LeaveService } from "@/lib/hcm/time/services/LeaveService";
import type { OvertimeService } from "@/lib/hcm/time/services/OvertimeService";
import type { RosterService } from "@/lib/hcm/time/services/RosterService";
import type { ShiftService } from "@/lib/hcm/time/services/ShiftService";
import type { PayrollAdjustmentService } from "@/lib/hcm/payroll/services/PayrollAdjustmentService";
import type { PayrollCalculationService } from "@/lib/hcm/payroll/services/PayrollCalculationService";
import type { PayrollPeriodService } from "@/lib/hcm/payroll/services/PayrollPeriodService";
import type { PayrollService } from "@/lib/hcm/payroll/services/PayrollService";
import type { PayrollValidationService } from "@/lib/hcm/payroll/services/PayrollValidationService";
import type { CertificationService } from "@/lib/hcm/talent/services/CertificationService";
import type { LearningService } from "@/lib/hcm/talent/services/LearningService";
import type { PerformanceService } from "@/lib/hcm/talent/services/PerformanceService";
import type { TalentService } from "@/lib/hcm/talent/services/TalentService";

export type HcmDomainStatus = {
  readonly missions: readonly string[];
  readonly organizationImplemented: boolean;
  readonly employeeMasterImplemented: boolean;
  readonly employmentLifecycleImplemented: boolean;
  readonly recruitmentImplemented: boolean;
  readonly onboardingImplemented: boolean;
  readonly attendanceImplemented: boolean;
  readonly leaveManagementImplemented: boolean;
  readonly rosteringImplemented: boolean;
  readonly payrollFoundationImplemented: boolean;
  readonly performanceImplemented: boolean;
  readonly learningImplemented: boolean;
  readonly talentManagementImplemented: boolean;
  readonly timeApiRoutesImplemented: boolean;
  readonly foundationApiRoutesImplemented: boolean;
  readonly workflowIntegrated: boolean;
  readonly eventsIntegrated: boolean;
  readonly readyForEnterpriseHcmCertification: boolean;
};

/**
 * Single public entry point for all HCM domain operations (P-012.1 – P-012.8).
 * Repositories, stores, and rules engines are not exposed.
 */
export class HcmFacade implements HcmFoundationOperations {
  readonly attendance: AttendanceService;
  readonly leave: LeaveService;
  readonly roster: RosterService;
  readonly calendar: CalendarService;
  readonly shifts: ShiftService;
  readonly overtime: OvertimeService;
  readonly payroll: PayrollService;
  readonly payrollPeriods: PayrollPeriodService;
  readonly payrollCalculation: PayrollCalculationService;
  readonly payrollAdjustments: PayrollAdjustmentService;
  readonly payrollValidation: PayrollValidationService;
  readonly performance: PerformanceService;
  readonly learning: LearningService;
  readonly certification: CertificationService;
  readonly talent: TalentService;

  createOrgUnit!: HcmFoundationOperations["createOrgUnit"];
  updateOrgUnit!: HcmFoundationOperations["updateOrgUnit"];
  deactivateOrgUnit!: HcmFoundationOperations["deactivateOrgUnit"];
  createPosition!: HcmFoundationOperations["createPosition"];
  updatePosition!: HcmFoundationOperations["updatePosition"];
  validateHierarchy!: HcmFoundationOperations["validateHierarchy"];
  createReportingRelationship!: HcmFoundationOperations["createReportingRelationship"];
  createEmployee!: HcmFoundationOperations["createEmployee"];
  updateEmployee!: HcmFoundationOperations["updateEmployee"];
  activateEmployee!: HcmFoundationOperations["activateEmployee"];
  suspendEmployee!: HcmFoundationOperations["suspendEmployee"];
  createEmployment!: HcmFoundationOperations["createEmployment"];
  transferEmployee!: HcmFoundationOperations["transferEmployee"];
  promoteEmployee!: HcmFoundationOperations["promoteEmployee"];
  terminateEmployment!: HcmFoundationOperations["terminateEmployment"];
  rehireEmployee!: HcmFoundationOperations["rehireEmployee"];
  createCandidate!: HcmFoundationOperations["createCandidate"];
  submitApplication!: HcmFoundationOperations["submitApplication"];
  createApplication!: HcmFoundationOperations["createApplication"];
  advanceApplication!: HcmFoundationOperations["advanceApplication"];
  scheduleInterview!: HcmFoundationOperations["scheduleInterview"];
  createOffer!: HcmFoundationOperations["createOffer"];
  hireCandidate!: HcmFoundationOperations["hireCandidate"];
  startOnboarding!: HcmFoundationOperations["startOnboarding"];
  uploadDocument!: HcmFoundationOperations["uploadDocument"];
  verifyDocument!: HcmFoundationOperations["verifyDocument"];
  completeTask!: HcmFoundationOperations["completeTask"];
  completeProvisioning!: HcmFoundationOperations["completeProvisioning"];
  determineActivationReadiness!: HcmFoundationOperations["determineActivationReadiness"];
  listOrgUnits!: HcmFoundationOperations["listOrgUnits"];
  listPositions!: HcmFoundationOperations["listPositions"];
  searchEmployees!: HcmFoundationOperations["searchEmployees"];
  countEmployees!: HcmFoundationOperations["countEmployees"];
  getEmployee!: HcmFoundationOperations["getEmployee"];
  searchEmployment!: HcmFoundationOperations["searchEmployment"];
  countEmployment!: HcmFoundationOperations["countEmployment"];
  getEmployment!: HcmFoundationOperations["getEmployment"];
  getCandidate!: HcmFoundationOperations["getCandidate"];
  getApplication!: HcmFoundationOperations["getApplication"];
  searchOnboarding!: HcmFoundationOperations["searchOnboarding"];

  constructor(wiring: HcmWiring = createHcmWiring()) {
    this.attendance = wiring.attendance;
    this.leave = wiring.leave;
    this.roster = wiring.roster;
    this.calendar = wiring.calendar;
    this.shifts = wiring.shifts;
    this.overtime = wiring.overtime;
    this.payroll = wiring.payroll;
    this.payrollPeriods = wiring.payrollPeriods;
    this.payrollCalculation = wiring.payrollCalculation;
    this.payrollAdjustments = wiring.payrollAdjustments;
    this.payrollValidation = wiring.payrollValidation;
    this.performance = wiring.performance;
    this.learning = wiring.learning;
    this.certification = wiring.certification;
    this.talent = wiring.talent;

    Object.assign(
      this,
      createEventAwareFoundationOperations(wiring.foundation, hcmEventPublisher),
    );
    registerHcmSubscribers(wiring.intelligence);
  }

  getDomainStatus(): HcmDomainStatus {
    return {
      missions: HCM_ALL_MISSIONS,
      organizationImplemented: true,
      employeeMasterImplemented: true,
      employmentLifecycleImplemented: true,
      recruitmentImplemented: true,
      onboardingImplemented: true,
      attendanceImplemented: true,
      leaveManagementImplemented: true,
      rosteringImplemented: true,
      payrollFoundationImplemented: true,
      performanceImplemented: true,
      learningImplemented: true,
      talentManagementImplemented: true,
      timeApiRoutesImplemented: true,
      foundationApiRoutesImplemented: true,
      workflowIntegrated: true,
      eventsIntegrated: true,
      readyForEnterpriseHcmCertification: false,
    };
  }

  getWorkspaceBootstrap(context: ServiceContext) {
    return {
      organizationId: context.organizationId,
      moduleKey: HCM_MODULE_KEY,
      workspaceId: HCM_WORKSPACE_ID,
      iilServiceId: HCM_IIL_SERVICE_ID,
      basePath: HCM_BASE_PATH,
      capabilities: HCM_ALL_CAPABILITIES,
      missions: HCM_ALL_MISSIONS,
      foundationMissions: [
        HCM_MISSION_ORGANIZATION,
        HCM_MISSION_EMPLOYEE,
        HCM_MISSION_EMPLOYMENT,
        HCM_MISSION_RECRUITMENT,
        HCM_MISSION_ONBOARDING,
      ],
      operationalMissions: [HCM_MISSION_TIME, HCM_MISSION_PAYROLL, HCM_MISSION_TALENT],
    };
  }
}

export const hcmFacade = new HcmFacade();

export {
  HCM_ALL_CAPABILITIES,
  HCM_ALL_MISSIONS,
  HCM_BASE_PATH,
  HCM_FOUNDATION_CAPABILITIES,
  HCM_IIL_SERVICE_ID,
  HCM_MISSION_EMPLOYEE,
  HCM_MISSION_EMPLOYMENT,
  HCM_MISSION_ONBOARDING,
  HCM_MISSION_ORGANIZATION,
  HCM_MISSION_PAYROLL,
  HCM_MISSION_RECRUITMENT,
  HCM_MISSION_TALENT,
  HCM_MISSION_TIME,
  HCM_MODULE_KEY,
  HCM_PAYROLL_CAPABILITIES,
  HCM_TALENT_CAPABILITIES,
  HCM_TIME_CAPABILITIES,
  HCM_WORKFLOW_TEMPLATES,
  HCM_WORKSPACE_ID,
} from "@/lib/hcm/constants";

export {
  publishHcmEvent,
  publishHcmTimeEvent,
  publishHcmPayrollEvent,
  publishHcmTalentEvent,
  publishHcmRecruitmentEvent,
  publishHcmOnboardingEvent,
  HCM_ORGANIZATION_OUTBOUND_EVENTS,
  HCM_EMPLOYEE_OUTBOUND_EVENTS,
  HCM_EMPLOYMENT_OUTBOUND_EVENTS,
  HCM_RECRUITMENT_OUTBOUND_EVENTS,
  HCM_ONBOARDING_OUTBOUND_EVENTS,
  HCM_TIME_OUTBOUND_EVENTS,
  HCM_PAYROLL_OUTBOUND_EVENTS,
  HCM_TALENT_OUTBOUND_EVENTS,
} from "@/lib/hcm/hcm-events";

export { HCM_ALL_OUTBOUND_EVENTS, assertUniqueHcmEventCatalog } from "@/lib/hcm/events/hcm-event-catalog";
export { registerHcmSubscribers, getHcmSubscriberRegistrationCount } from "@/lib/hcm/events/register-hcm-subscribers";
export {
  HCM_WORKFLOW_SUBSCRIPTIONS,
  hcmWorkflowOrchestrator,
  resolveHcmWorkflowTemplate,
} from "@/lib/hcm/workflow/HcmWorkflowOrchestrator";
