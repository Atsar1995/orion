import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import {
  dispatchWorkflowInboundEvent,
  publishWorkflowEvent,
} from "@/lib/platform/workflow/workflow-events";

const HCM_WORKFLOW_TRIGGERS: Readonly<Record<string, string>> = {
  LeaveRequested: HCM_WORKFLOW_TEMPLATES.leaveApproval,
  LeaveApproved: HCM_WORKFLOW_TEMPLATES.leaveApproval,
  AttendanceCorrected: HCM_WORKFLOW_TEMPLATES.attendanceCorrection,
  OvertimeSubmitted: HCM_WORKFLOW_TEMPLATES.overtimeApproval,
  ShiftChanged: HCM_WORKFLOW_TEMPLATES.shiftChange,
  ApplicationSubmitted: HCM_WORKFLOW_TEMPLATES.recruitmentApplication,
  OfferAccepted: HCM_WORKFLOW_TEMPLATES.offerApproval,
  OnboardingStarted: HCM_WORKFLOW_TEMPLATES.onboardingProcess,
  EmployeeTransferred: HCM_WORKFLOW_TEMPLATES.employmentTransfer,
  EmploymentTerminated: HCM_WORKFLOW_TEMPLATES.employmentTermination,
  GoalCreated: HCM_WORKFLOW_TEMPLATES.goalApproval,
  PerformanceReviewStarted: HCM_WORKFLOW_TEMPLATES.reviewApproval,
  TrainingAssigned: HCM_WORKFLOW_TEMPLATES.trainingApproval,
  CertificationIssued: HCM_WORKFLOW_TEMPLATES.certificationRenewal,
};

export type HcmWorkflowDispatchRecord = {
  readonly hcmEventType: string;
  readonly workflowTemplateKey: string;
  readonly entityId: string;
  readonly correlationId: string;
};

/** Orchestrates HCM workflow requests from IIL events — no business rules or persistence. */
export class HcmWorkflowOrchestrator {
  private readonly dispatches: HcmWorkflowDispatchRecord[] = [];

  async handle(event: IntelligenceEvent, context: ServiceContext): Promise<void> {
    const hcmEventType = event.payload.hcmEventType;
    if (!hcmEventType) return;

    const workflowTemplateKey =
      event.payload.workflowTemplateKey ?? HCM_WORKFLOW_TRIGGERS[hcmEventType];
    if (!workflowTemplateKey) return;

    const correlationId = event.correlationId ?? event.entityId;
    const payload = {
      workflowTemplateKey,
      entityId: event.entityId,
      entityType: event.entityType,
      correlationId,
      sourceHcmEventType: hcmEventType,
      sourceService: event.sourceService,
    };

    await dispatchWorkflowInboundEvent("WorkflowRequested", payload, context);

    publishWorkflowEvent(
      {
        eventType: "WorkflowStarted",
        entityType: "workflow_instance",
        entityId: `wf-${correlationId}`,
        correlationId,
        payload,
      },
      context,
    );

    this.dispatches.push({
      hcmEventType,
      workflowTemplateKey,
      entityId: event.entityId,
      correlationId,
    });
  }

  listDispatches(): readonly HcmWorkflowDispatchRecord[] {
    return this.dispatches;
  }

  clearDispatches(): void {
    this.dispatches.length = 0;
  }
}

export const hcmWorkflowOrchestrator = new HcmWorkflowOrchestrator();

export function resolveHcmWorkflowTemplate(hcmEventType: string): string | undefined {
  return HCM_WORKFLOW_TRIGGERS[hcmEventType];
}

export const HCM_WORKFLOW_SUBSCRIPTIONS = [
  HCM_WORKFLOW_TEMPLATES.leaveApproval,
  HCM_WORKFLOW_TEMPLATES.attendanceCorrection,
  HCM_WORKFLOW_TEMPLATES.overtimeApproval,
  HCM_WORKFLOW_TEMPLATES.shiftChange,
  HCM_WORKFLOW_TEMPLATES.offerApproval,
  HCM_WORKFLOW_TEMPLATES.recruitmentApplication,
  HCM_WORKFLOW_TEMPLATES.onboardingProcess,
  HCM_WORKFLOW_TEMPLATES.employmentTransfer,
  HCM_WORKFLOW_TEMPLATES.employmentTermination,
  HCM_WORKFLOW_TEMPLATES.goalApproval,
  HCM_WORKFLOW_TEMPLATES.reviewApproval,
  HCM_WORKFLOW_TEMPLATES.trainingApproval,
  HCM_WORKFLOW_TEMPLATES.certificationRenewal,
] as const;
