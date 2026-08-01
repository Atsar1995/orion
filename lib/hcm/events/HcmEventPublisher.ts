import type { ServiceContext } from "@/types/services";
import type { EmployeeRecord } from "@/types/hcm-employee";
import type { EmploymentRecord } from "@/types/hcm-employment";
import type { OrgUnitRecord, PositionRecord, ReportingRelationshipRecord } from "@/types/hcm-organization";
import type { ApplicationRecord, CandidateRecord, OfferRecord } from "@/types/hcm-recruitment";
import type {
  EmployeeDocumentRecord,
  OnboardingProcessRecord,
  ProvisioningTaskRecord,
} from "@/types/hcm-onboarding";
import { publishHcmEvent, publishHcmRecruitmentEvent, publishHcmOnboardingEvent } from "@/lib/hcm/hcm-events";

/** Publishes foundation domain events via IIL (outside business services). */
export class HcmEventPublisher {
  organizationCreated(unit: OrgUnitRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: unit.unitType === "department" ? "DepartmentCreated" : "OrganizationCreated",
        entityType: "org_unit",
        entityId: unit.id,
        payload: { code: unit.code, name: unit.name, unitType: unit.unitType },
      },
      context,
    );
  }

  organizationUpdated(unit: OrgUnitRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "OrganizationUpdated",
        entityType: "org_unit",
        entityId: unit.id,
        payload: { code: unit.code, name: unit.name, status: unit.status },
      },
      context,
    );
  }

  orgUnitDeactivated(unit: OrgUnitRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "OrgUnitDeactivated",
        entityType: "org_unit",
        entityId: unit.id,
        payload: { code: unit.code },
      },
      context,
    );
  }

  positionCreated(position: PositionRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "PositionCreated",
        entityType: "position",
        entityId: position.id,
        payload: { code: position.code, title: position.title },
      },
      context,
    );
  }

  positionUpdated(position: PositionRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "PositionUpdated",
        entityType: "position",
        entityId: position.id,
        payload: { code: position.code, title: position.title },
      },
      context,
    );
  }

  reportingRelationshipChanged(record: ReportingRelationshipRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "ReportingRelationshipChanged",
        entityType: "reporting_relationship",
        entityId: record.id,
        payload: {
          subordinatePositionId: record.subordinatePositionId,
          supervisorPositionId: record.supervisorPositionId,
        },
      },
      context,
    );
  }

  employeeCreated(employee: EmployeeRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmployeeCreated",
        entityId: employee.id,
        payload: { employeeNumber: employee.employeeNumber },
      },
      context,
    );
  }

  employeeUpdated(employee: EmployeeRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmployeeUpdated",
        entityId: employee.id,
        payload: { employeeNumber: employee.employeeNumber },
      },
      context,
    );
  }

  employeeActivated(employee: EmployeeRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmployeeActivated",
        entityId: employee.id,
        payload: { employeeNumber: employee.employeeNumber },
      },
      context,
    );
  }

  employeeSuspended(employee: EmployeeRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmployeeSuspended",
        entityId: employee.id,
        payload: { employeeNumber: employee.employeeNumber, status: employee.status },
      },
      context,
    );
  }

  employmentCreated(employment: EmploymentRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmploymentCreated",
        entityId: employment.id,
        employeeId: employment.employeeId,
        payload: { employmentNumber: employment.employmentNumber },
      },
      context,
    );
  }

  employmentTransferred(employment: EmploymentRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmployeeTransferred",
        entityId: employment.id,
        employeeId: employment.employeeId,
        payload: {
          departmentId: employment.departmentId ?? "",
          employmentNumber: employment.employmentNumber,
        },
      },
      context,
    );
  }

  promotionCompleted(employment: EmploymentRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmployeePromoted",
        entityId: employment.id,
        employeeId: employment.employeeId,
        payload: { jobGrade: employment.jobGrade ?? "" },
      },
      context,
    );
  }

  employmentTerminated(employment: EmploymentRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmploymentTerminated",
        entityId: employment.id,
        employeeId: employment.employeeId,
        payload: { status: employment.status },
      },
      context,
    );
  }

  employeeRehired(employment: EmploymentRecord, context: ServiceContext): void {
    publishHcmEvent(
      {
        eventType: "EmployeeRehired",
        entityId: employment.id,
        employeeId: employment.employeeId,
        payload: { employmentNumber: employment.employmentNumber },
      },
      context,
    );
  }

  candidateCreated(candidate: CandidateRecord, context: ServiceContext): void {
    publishHcmRecruitmentEvent(
      {
        eventType: "CandidateCreated",
        entityId: candidate.id,
        payload: { candidateNumber: candidate.candidateNumber, email: candidate.email },
      },
      context,
    );
  }

  applicationSubmitted(application: ApplicationRecord, context: ServiceContext): void {
    publishHcmRecruitmentEvent(
      {
        eventType: "ApplicationSubmitted",
        entityId: application.id,
        payload: { candidateId: application.candidateId, status: application.status },
      },
      context,
    );
  }

  interviewScheduled(application: ApplicationRecord, context: ServiceContext): void {
    publishHcmRecruitmentEvent(
      {
        eventType: "InterviewScheduled",
        entityId: application.id,
        payload: { candidateId: application.candidateId },
      },
      context,
    );
  }

  offerCreated(offer: OfferRecord, context: ServiceContext): void {
    publishHcmRecruitmentEvent(
      {
        eventType: "OfferCreated",
        entityId: offer.id,
        payload: { candidateId: offer.candidateId, applicationId: offer.applicationId },
      },
      context,
    );
  }

  offerAccepted(offer: OfferRecord, context: ServiceContext): void {
    publishHcmRecruitmentEvent(
      {
        eventType: "OfferAccepted",
        entityId: offer.id,
        payload: { candidateId: offer.candidateId, applicationId: offer.applicationId },
      },
      context,
    );
  }

  candidateHired(offer: OfferRecord, context: ServiceContext): void {
    publishHcmRecruitmentEvent(
      {
        eventType: "CandidateHired",
        entityId: offer.candidateId,
        payload: { offerId: offer.id },
      },
      context,
    );
  }

  onboardingStarted(process: OnboardingProcessRecord, context: ServiceContext): void {
    publishHcmOnboardingEvent(
      {
        eventType: "OnboardingStarted",
        entityId: process.id,
        candidateId: process.candidateId,
        payload: { offerId: process.offerId, joiningDate: process.joiningDate },
      },
      context,
    );
  }

  documentUploaded(document: EmployeeDocumentRecord, context: ServiceContext): void {
    publishHcmOnboardingEvent(
      {
        eventType: "DocumentUploaded",
        entityId: document.id,
        candidateId: document.candidateId,
        payload: { processId: document.processId, documentType: document.documentType },
      },
      context,
    );
  }

  documentVerified(document: EmployeeDocumentRecord, context: ServiceContext): void {
    publishHcmOnboardingEvent(
      {
        eventType: "DocumentVerified",
        entityId: document.id,
        candidateId: document.candidateId,
        payload: { processId: document.processId, status: document.status },
      },
      context,
    );
  }

  provisioningCompleted(task: ProvisioningTaskRecord, context: ServiceContext): void {
    publishHcmOnboardingEvent(
      {
        eventType: "ProvisioningCompleted",
        entityId: task.id,
        payload: { processId: task.processId, provisioningType: task.provisioningType },
      },
      context,
    );
  }

  onboardingCompleted(process: OnboardingProcessRecord, context: ServiceContext): void {
    publishHcmOnboardingEvent(
      {
        eventType: "OnboardingCompleted",
        entityId: process.id,
        candidateId: process.candidateId,
        employeeId: process.employeeId,
        payload: { offerId: process.offerId },
      },
      context,
    );
  }
}

export const hcmEventPublisher = new HcmEventPublisher();
