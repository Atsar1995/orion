import type { ServiceContext } from "@/types/services";
import type {
  CreateOrgUnitInput,
  CreatePositionInput,
  CreateReportingRelationshipInput,
  OrgUnitInquiryQuery,
  OrgUnitRecord,
  PositionInquiryQuery,
  PositionRecord,
  ReportingRelationshipRecord,
} from "@/types/hcm-organization";
import type {
  CreateEmployeeInput,
  EmployeeRecord,
  EmployeeSearchQuery,
  UpdateEmployeeInput,
} from "@/types/hcm-employee";
import type {
  CreateEmploymentInput,
  EmploymentRecord,
  EmploymentSearchQuery,
  PromotionInput,
  RehireInput,
  TerminationInput,
  TransferInput,
} from "@/types/hcm-employment";
import type {
  ApplicationRecord,
  CandidateRecord,
  OfferRecord,
} from "@/types/hcm-recruitment";
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
import type { HcmFoundationFacade } from "@/lib/hcm/HcmFoundationFacade";
import type {
  CreateApplicationInput,
  CreateOfferInput,
  RegisterCandidateInput,
} from "@/lib/hcm/recruitment/services/RecruitmentService";

/** Thin foundation operation surface on HcmFacade (P-012.1 – P-012.5). */
export function createFoundationOperations(foundation: HcmFoundationFacade) {
  return {
    createOrgUnit(input: CreateOrgUnitInput, context: ServiceContext): OrgUnitRecord {
      return foundation.organization.createOrgUnit(input, context);
    },

    updateOrgUnit(
      unitId: string,
      input: Partial<CreateOrgUnitInput>,
      context: ServiceContext,
    ): OrgUnitRecord {
      return foundation.organization.updateOrgUnit(unitId, input, context);
    },

    deactivateOrgUnit(unitId: string, context: ServiceContext): OrgUnitRecord {
      return foundation.organization.deactivateOrgUnit(unitId, context);
    },

    createPosition(input: CreatePositionInput, context: ServiceContext): PositionRecord {
      return foundation.organization.createPosition(input, context);
    },

    updatePosition(
      positionId: string,
      input: Partial<CreatePositionInput>,
      context: ServiceContext,
    ): PositionRecord {
      return foundation.organization.updatePosition(positionId, input, context);
    },

    validateHierarchy(context: ServiceContext): readonly ReportingRelationshipRecord[] {
      return foundation.organization.listReportingRelationships(context);
    },

    createReportingRelationship(
      input: CreateReportingRelationshipInput,
      context: ServiceContext,
    ): ReportingRelationshipRecord {
      return foundation.organization.createReportingRelationship(input, context);
    },

    createEmployee(input: CreateEmployeeInput, context: ServiceContext): EmployeeRecord {
      return foundation.employee.create(input, context);
    },

    updateEmployee(input: UpdateEmployeeInput, context: ServiceContext): EmployeeRecord {
      return foundation.employee.update(input, context);
    },

    activateEmployee(employeeId: string, context: ServiceContext): EmployeeRecord {
      return foundation.employee.activate(employeeId, context);
    },

    suspendEmployee(employeeId: string, context: ServiceContext): EmployeeRecord {
      return foundation.employee.suspend(employeeId, context);
    },

    createEmployment(input: CreateEmploymentInput, context: ServiceContext): EmploymentRecord {
      return foundation.employment.create(input, context);
    },

    transferEmployee(input: TransferInput, context: ServiceContext): EmploymentRecord {
      return foundation.employment.transfer(input, context);
    },

    promoteEmployee(input: PromotionInput, context: ServiceContext): EmploymentRecord {
      return foundation.employment.promote(input, context);
    },

    terminateEmployment(input: TerminationInput, context: ServiceContext): EmploymentRecord {
      return foundation.employment.terminate(input, context);
    },

    rehireEmployee(input: RehireInput, context: ServiceContext): EmploymentRecord {
      return foundation.employment.rehire(input, context);
    },

    createCandidate(input: RegisterCandidateInput, context: ServiceContext): CandidateRecord {
      return foundation.recruitment.registerCandidate(input, context);
    },

    submitApplication(applicationId: string, context: ServiceContext): ApplicationRecord {
      return foundation.recruitment.submitApplication(applicationId, context);
    },

    createApplication(input: CreateApplicationInput, context: ServiceContext): ApplicationRecord {
      return foundation.recruitment.createApplication(input, context);
    },

    advanceApplication(applicationId: string, context: ServiceContext): ApplicationRecord {
      return foundation.recruitment.startScreening(applicationId, context);
    },

    scheduleInterview(applicationId: string, context: ServiceContext): ApplicationRecord {
      return foundation.recruitment.scheduleInterview({ applicationId }, context);
    },

    createOffer(input: CreateOfferInput, context: ServiceContext): OfferRecord {
      return foundation.recruitment.createOffer(input, context);
    },

    hireCandidate(offerId: string, context: ServiceContext): OfferRecord {
      const existing = foundation.recruitment.getOffer(offerId, context);
      if (existing) {
        const candidate = foundation.recruitment.getCandidate(existing.candidateId, context);
        if (candidate?.status === "registered") {
          foundation.recruitment.activateCandidate(existing.candidateId, context);
        }
      }
      if (existing?.status === "draft") {
        foundation.recruitment.submitOfferForApproval(offerId, context);
      }
      return foundation.recruitment.acceptOffer(offerId, context);
    },

    startOnboarding(input: StartOnboardingInput, context: ServiceContext): OnboardingProcessRecord {
      return foundation.onboarding.startProcess(input, context);
    },

    uploadDocument(input: UploadDocumentInput, context: ServiceContext): EmployeeDocumentRecord {
      return foundation.onboarding.uploadDocument(input, context);
    },

    verifyDocument(input: VerifyDocumentInput, context: ServiceContext): EmployeeDocumentRecord {
      return foundation.onboarding.verifyDocument(input, context);
    },

    completeTask(
      processId: string,
      taskCode: string,
      context: ServiceContext,
    ): OnboardingTaskRecord {
      return foundation.onboarding.completeTask(processId, taskCode, context);
    },

    completeProvisioning(
      processId: string,
      provisioningType: ProvisioningTaskRecord["provisioningType"],
      context: ServiceContext,
    ): ProvisioningTaskRecord {
      return foundation.onboarding.completeProvisioningTask(processId, provisioningType, context);
    },

    determineActivationReadiness(processId: string, context: ServiceContext): boolean {
      return foundation.onboarding.determineActivationReadiness(processId, context);
    },

    listOrgUnits(
      query: OrgUnitInquiryQuery | undefined,
      context: ServiceContext,
    ): readonly OrgUnitRecord[] {
      return foundation.organization.listOrgUnits(query, context);
    },

    listPositions(
      query: PositionInquiryQuery | undefined,
      context: ServiceContext,
    ): readonly PositionRecord[] {
      return foundation.organization.listPositions(query, context);
    },

    searchEmployees(
      query: EmployeeSearchQuery | undefined,
      context: ServiceContext,
    ): readonly EmployeeRecord[] {
      return foundation.employee.search(query, context);
    },

    countEmployees(query: EmployeeSearchQuery | undefined, context: ServiceContext): number {
      return foundation.employee.count(query, context);
    },

    getEmployee(employeeId: string, context: ServiceContext): EmployeeRecord | null {
      return foundation.employee.getById(employeeId, context);
    },

    searchEmployment(
      query: EmploymentSearchQuery | undefined,
      context: ServiceContext,
    ): readonly EmploymentRecord[] {
      return foundation.employment.search(query, context);
    },

    countEmployment(query: EmploymentSearchQuery | undefined, context: ServiceContext): number {
      return foundation.employment.count(query, context);
    },

    getEmployment(employmentId: string, context: ServiceContext): EmploymentRecord | null {
      return foundation.employment.getById(employmentId, context);
    },

    getCandidate(candidateId: string, context: ServiceContext): CandidateRecord | null {
      return foundation.recruitment.getCandidate(candidateId, context);
    },

    getApplication(applicationId: string, context: ServiceContext): ApplicationRecord | null {
      return foundation.recruitment.getApplication(applicationId, context);
    },

    searchOnboarding(
      query: OnboardingSearchQuery | undefined,
      context: ServiceContext,
    ): readonly OnboardingProcessRecord[] {
      return foundation.onboarding.search(query, context);
    },
  };
}

export type HcmFoundationOperations = ReturnType<typeof createFoundationOperations>;
