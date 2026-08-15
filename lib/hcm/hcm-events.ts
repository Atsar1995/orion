import type { PublishHcmEmploymentEventInput } from "@/types/hcm-employment";
import type { PublishHcmEmployeeEventInput } from "@/types/hcm-employee";
import type { PublishHcmOnboardingEventInput } from "@/types/hcm-onboarding";
import type { PublishHcmOrganizationEventInput } from "@/types/hcm-organization";
import type { PublishHcmPayrollEventInput } from "@/types/hcm-payroll";
import type { PublishHcmRecruitmentEventInput } from "@/types/hcm-recruitment";
import type { PublishHcmTalentEventInput } from "@/types/hcm-talent";
import type { PublishHcmTimeEventInput } from "@/types/hcm-time";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";

type HcmEventInput =
  | PublishHcmOrganizationEventInput
  | PublishHcmEmployeeEventInput
  | PublishHcmEmploymentEventInput
  | PublishHcmRecruitmentEventInput
  | PublishHcmOnboardingEventInput
  | PublishHcmTimeEventInput
  | PublishHcmPayrollEventInput
  | PublishHcmTalentEventInput;

function buildHcmPayload(
  organizationId: string,
  eventType: string,
  entityId: string,
  employeeId?: string,
  extra?: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  const payload: Record<string, string> = {
    workspace: "hcm",
    hcmEventType: eventType,
    idempotencyKey: [
      organizationId,
      HCM_IIL_SERVICE_ID,
      eventType,
      entityId,
      "1",
    ].join(":"),
    ...(extra ?? {}),
  };

  if (employeeId) {
    payload.employeeId = employeeId;
  }

  return payload;
}

/**
 * Builds a deterministic idempotency key for HCM time-domain events.
 *
 * The generic IIL fallback is intentionally not changed. Roster publishing
 * can legitimately emit multiple events with the same roster entityId, so
 * ShiftAssigned/ShiftChanged need assignment-level identity.
 */
function buildHcmTimeIdempotencyKey(
  organizationId: string,
  eventType: PublishHcmTimeEventInput["eventType"],
  entityId: string,
  employeeId?: string,
  payload?: Readonly<Record<string, string>>,
): string {
  const discriminator =
    eventType === "ShiftAssigned" || eventType === "ShiftChanged"
      ? [
          employeeId ?? "",
          payload?.shiftId ?? "",
          payload?.rosterDate ?? "",
        ].join(":")
      : employeeId ?? "1";

  return [
    organizationId,
    HCM_IIL_SERVICE_ID,
    eventType,
    entityId,
    discriminator,
  ].join(":");
}

/** Publishes HCM domain events via IIL (P-012.x). */
export function publishHcmEvent(input: HcmEventInput, context: ServiceContext): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();
  const entityType =
    "entityType" in input && input.entityType ? input.entityType : "employee";
  const entityId = input.entityId;
  const employeeId = "employeeId" in input ? input.employeeId : undefined;

  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType,
      entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? entityId,
      payload: buildHcmPayload(context.organizationId, input.eventType, entityId, employeeId, input.payload),
    },
    context,
  );
}

/** Publishes HCM time domain events (P-012.6). */
export function publishHcmTimeEvent(input: PublishHcmTimeEventInput, context: ServiceContext): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();
  const entityId = input.entityId;

  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType: "attendance",
      entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? entityId,
      payload: {
        ...buildHcmPayload(context.organizationId, input.eventType, entityId, input.employeeId, input.payload),
        idempotencyKey: buildHcmTimeIdempotencyKey(
          context.organizationId,
          input.eventType,
          entityId,
          input.employeeId,
          input.payload,
        ),
      },
    },
    context,
  );
}

/** Publishes HCM payroll domain events (P-012.7). */
export function publishHcmPayrollEvent(
  input: PublishHcmPayrollEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();
  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType: "payroll",
      entityId: input.entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.entityId,
      payload: buildHcmPayload(context.organizationId, input.eventType, input.entityId, input.employeeId, input.payload),
    },
    context,
  );
}

/** Publishes HCM talent domain events (P-012.8). */
export function publishHcmTalentEvent(
  input: PublishHcmTalentEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();
  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType: "talent",
      entityId: input.entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.entityId,
      payload: buildHcmPayload(context.organizationId, input.eventType, input.entityId, input.employeeId, input.payload),
    },
    context,
  );
}

/** Publishes HCM recruitment domain events (P-012.4). */
export function publishHcmRecruitmentEvent(
  input: PublishHcmRecruitmentEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();
  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType: "candidate",
      entityId: input.entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.entityId,
      payload: buildHcmPayload(context.organizationId, input.eventType, input.entityId, undefined, input.payload),
    },
    context,
  );
}

/** Publishes HCM onboarding domain events (P-012.5). */
export function publishHcmOnboardingEvent(
  input: PublishHcmOnboardingEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();
  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType: "onboarding_process",
      entityId: input.entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.entityId,
      payload: buildHcmPayload(context.organizationId, input.eventType, input.entityId, input.employeeId, {
        ...(input.payload ?? {}),
        ...(input.candidateId ? { candidateId: input.candidateId } : {}),
      }),
    },
    context,
  );
}

export const HCM_ORGANIZATION_OUTBOUND_EVENTS = [
  "OrganizationCreated",
  "OrganizationUpdated",
  "DepartmentCreated",
  "OrgUnitDeactivated",
  "PositionCreated",
  "PositionUpdated",
  "HierarchyChanged",
  "ReportingRelationshipChanged",
] as const;

export const HCM_EMPLOYEE_OUTBOUND_EVENTS = [
  "EmployeeCreated",
  "EmployeeUpdated",
  "EmployeeActivated",
  "EmployeeSuspended",
  "EmployeeDeactivated",
  "EmployeeArchived",
] as const;

export const HCM_RECRUITMENT_OUTBOUND_EVENTS = [
  "CandidateRegistered",
  "CandidateCreated",
  "ApplicationSubmitted",
  "InterviewScheduled",
  "OfferCreated",
  "OfferAccepted",
  "CandidateHired",
] as const;

export const HCM_ONBOARDING_OUTBOUND_EVENTS = [
  "OnboardingStarted",
  "DocumentUploaded",
  "DocumentVerified",
  "ProvisioningCompleted",
  "OrientationCompleted",
  "OnboardingCompleted",
] as const;

export const HCM_CANONICAL_FINANCE_OUTBOUND_EVENTS = [
  "hcm.workforce.cost.recorded",
  "hcm.expense.approved",
] as const;

export const HCM_PAYROLL_OUTBOUND_EVENTS = [
  "PayrollPeriodOpened",
  "PayrollRunStarted",
  "PayrollCalculated",
  "PayrollReviewed",
  "PayrollApproved",
  "PayrollFinalized",
  "PayrollReversed",
] as const;

export const HCM_TALENT_OUTBOUND_EVENTS = [
  "GoalCreated",
  "GoalCompleted",
  "PerformanceReviewStarted",
  "PerformanceReviewCompleted",
  "TrainingAssigned",
  "TrainingCompleted",
  "CertificationIssued",
  "CertificationExpired",
  "DevelopmentPlanApproved",
  "SuccessionUpdated",
] as const;

export const HCM_TIME_OUTBOUND_EVENTS = [
  "AttendanceRecorded",
  "AttendanceCorrected",
  "ShiftAssigned",
  "ShiftChanged",
  "LeaveRequested",
  "LeaveApproved",
  "LeaveRejected",
  "LeaveCancelled",
  "OvertimeSubmitted",
  "OvertimeApproved",
] as const;

export const HCM_EMPLOYMENT_OUTBOUND_EVENTS = [
  "EmploymentCreated",
  "EmploymentConfirmed",
  "ProbationCompleted",
  "EmployeeTransferred",
  "EmployeePromoted",
  "EmploymentSuspended",
  "EmploymentTerminated",
  "EmployeeRehired",
  "AssignmentCreated",
] as const;
