# Enterprise HCM Event Catalogue

**Document ID:** HCM-EVT-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)  
**Transport:** Intelligence Integration Layer (IIL) — `CustomEvent`

---

## Event Envelope

All HCM outbound events publish through IIL with:

| Field | Value |
|-------|-------|
| `eventType` | `CustomEvent` |
| `sourceService` | `hcm-workspace` |
| `sourceWorkspace` | `HCM` |
| `payload.workspace` | `hcm` |
| `payload.hcmEventType` | Domain event name (see tables below) |
| `entityType` | Varies by domain (`org_unit`, `employee`, `attendance`, etc.) |
| `entityId` | Primary entity identifier |
| `actorId` | `context.userId` |
| `correlationId` | Entity ID or explicit correlation |

Subscribe filtering:

```
sourceService = "hcm-workspace"
payload.workspace = "hcm"
payload.hcmEventType = "<EventName>"
```

---

## Publishers

| Publisher | Location | Scope |
|-----------|----------|-------|
| `HcmEventPublisher` | `lib/hcm/events/HcmEventPublisher.ts` | Foundation via event-aware facade |
| `publishHcmEvent` | `lib/hcm/hcm-events.ts` | Organization, employee, employment |
| `publishHcmRecruitmentEvent` | `lib/hcm/hcm-events.ts` | Recruitment |
| `publishHcmOnboardingEvent` | `lib/hcm/hcm-events.ts` | Onboarding |
| `publishHcmTimeEvent` | `lib/hcm/hcm-events.ts` | Time (from time services) |
| `publishHcmPayrollEvent` | `lib/hcm/hcm-events.ts` | Payroll (from payroll services) |
| `publishHcmTalentEvent` | `lib/hcm/hcm-events.ts` | Talent (from talent services) |

Foundation events publish **outside** business services via `createEventAwareFoundationOperations`. Time, payroll, and talent events publish from within domain services.

---

## Subscribers

| Subscriber ID | Event Filter | Handler |
|---------------|--------------|---------|
| `workflow-platform` | `CustomEvent` where `sourceService = hcm-workspace` | `HcmWorkflowOrchestrator.handle` |

Registered via `registerHcmSubscribers()` during facade construction.

---

## Organization Events (P-012.1)

| Event | Publisher Method | Business Meaning | Workflow |
|-------|------------------|------------------|----------|
| `OrganizationCreated` | `organizationCreated` | Root org unit created | — |
| `OrganizationUpdated` | `organizationUpdated` | Org unit metadata changed | — |
| `DepartmentCreated` | `organizationCreated` | Department-type unit created | — |
| `OrgUnitDeactivated` | `orgUnitDeactivated` | Org unit deactivated | — |
| `PositionCreated` | `positionCreated` | Position defined | — |
| `PositionUpdated` | `positionUpdated` | Position changed | — |
| `HierarchyChanged` | — (catalogued) | Hierarchy validation change | — |
| `ReportingRelationshipChanged` | `reportingRelationshipChanged` | Reporting line created/changed | — |

---

## Employee Events (P-012.2)

| Event | Publisher | Business Meaning |
|-------|-----------|------------------|
| `EmployeeCreated` | `employeeCreated` | New employee record (draft) |
| `EmployeeUpdated` | `employeeUpdated` | Employee data changed |
| `EmployeeActivated` | `employeeActivated` | Employee activated for work |
| `EmployeeSuspended` | `employeeSuspended` | Employee suspended |
| `EmployeeDeactivated` | — (catalogued) | Employee deactivated |
| `EmployeeArchived` | — (catalogued) | Employee archived |

---

## Employment Events (P-012.3)

| Event | Publisher | Business Meaning | Workflow |
|-------|-----------|------------------|----------|
| `EmploymentCreated` | `employmentCreated` | Employment relationship created | — |
| `EmploymentConfirmed` | — (catalogued) | Probation/confirmation | — |
| `ProbationCompleted` | — (catalogued) | Probation period completed | — |
| `EmployeeTransferred` | `employmentTransferred` | Transfer effective | `hcm.employment.transfer` |
| `EmployeePromoted` | `promotionCompleted` | Promotion effective | — |
| `EmploymentSuspended` | — (catalogued) | Employment suspended | — |
| `EmploymentTerminated` | `employmentTerminated` | Termination effective | `hcm.employment.termination` |
| `EmployeeRehired` | `employeeRehired` | Rehire processed | — |
| `AssignmentCreated` | — (catalogued) | Assignment record created | — |

---

## Recruitment Events (P-012.4)

| Event | Publisher | Business Meaning | Workflow |
|-------|-----------|------------------|----------|
| `CandidateRegistered` | — (catalogued) | Candidate registered | — |
| `CandidateCreated` | `candidateCreated` | Candidate created | — |
| `ApplicationSubmitted` | `applicationSubmitted` | Application submitted | `hcm.recruitment.application` |
| `InterviewScheduled` | `interviewScheduled` | Interview scheduled | — |
| `OfferCreated` | `offerCreated` | Offer drafted | — |
| `OfferAccepted` | `offerAccepted` | Offer accepted | `hcm.offer.approval` |
| `CandidateHired` | `candidateHired` | Hire completed | — |

---

## Onboarding Events (P-012.5)

| Event | Publisher | Business Meaning | Workflow |
|-------|-----------|------------------|----------|
| `OnboardingStarted` | `onboardingStarted` | Process initiated | `hcm.onboarding.process` |
| `DocumentUploaded` | `documentUploaded` | Document uploaded | — |
| `DocumentVerified` | `documentVerified` | Document verified | — |
| `ProvisioningCompleted` | `provisioningCompleted` | IT/equipment provisioning done | — |
| `OrientationCompleted` | — (catalogued) | Orientation completed | — |
| `OnboardingCompleted` | — (catalogued) | Full onboarding complete | — |

---

## Time Events (P-012.6)

| Event | Trigger | Workflow Template |
|-------|---------|-------------------|
| `AttendanceRecorded` | Attendance captured | — |
| `AttendanceCorrected` | Correction submitted | `hcm.attendance.correction` |
| `ShiftAssigned` | Roster published | — |
| `ShiftChanged` | Assignment changed | `hcm.shift.change` |
| `LeaveRequested` | Leave submitted | `hcm.leave.approval` |
| `LeaveApproved` | Leave approved | — |
| `LeaveRejected` | Leave rejected | — |
| `LeaveCancelled` | Leave cancelled | — |
| `OvertimeSubmitted` | Overtime submitted | `hcm.overtime.approval` |
| `OvertimeApproved` | Overtime approved | — |

---

## Payroll Events (P-012.7)

| Event | Business Meaning |
|-------|------------------|
| `PayrollPeriodOpened` | Payroll period opened |
| `PayrollRunStarted` | Run initiated |
| `PayrollCalculated` | Calculation complete |
| `PayrollReviewed` | Run reviewed |
| `PayrollApproved` | Run approved |
| `PayrollFinalized` | Run finalized |
| `PayrollReversed` | Run reversed |

---

## Talent Events (P-012.8)

| Event | Business Meaning | Workflow |
|-------|------------------|----------|
| `GoalCreated` | Performance goal created | `hcm.goal.approval` |
| `GoalCompleted` | Goal completed | — |
| `PerformanceReviewStarted` | Review cycle started | `hcm.review.approval` |
| `PerformanceReviewCompleted` | Review completed | — |
| `TrainingAssigned` | Training assigned | `hcm.training.approval` |
| `TrainingCompleted` | Training completed | — |
| `CertificationIssued` | Certification issued | `hcm.certification.renewal` |
| `CertificationExpired` | Certification expired | — |
| `DevelopmentPlanApproved` | Development plan approved | `hcm.development.approval` |
| `SuccessionUpdated` | Succession plan updated | — |

---

## Workflow Trigger Map

Defined in `HCM_WORKFLOW_TRIGGERS` (`lib/hcm/workflow/HcmWorkflowOrchestrator.ts`):

| HCM Event | Template Key |
|-----------|--------------|
| `LeaveRequested` | `hcm.leave.approval` |
| `AttendanceCorrected` | `hcm.attendance.correction` |
| `OvertimeSubmitted` | `hcm.overtime.approval` |
| `ShiftChanged` | `hcm.shift.change` |
| `ApplicationSubmitted` | `hcm.recruitment.application` |
| `OfferAccepted` | `hcm.offer.approval` |
| `OnboardingStarted` | `hcm.onboarding.process` |
| `EmployeeTransferred` | `hcm.employment.transfer` |
| `EmploymentTerminated` | `hcm.employment.termination` |
| `GoalCreated` | `hcm.goal.approval` |
| `PerformanceReviewStarted` | `hcm.review.approval` |
| `TrainingAssigned` | `hcm.training.approval` |
| `CertificationIssued` | `hcm.certification.renewal` |

---

## Constants

```typescript
import {
  HCM_ALL_OUTBOUND_EVENTS,
  HCM_ORGANIZATION_OUTBOUND_EVENTS,
  HCM_TIME_OUTBOUND_EVENTS,
  HCM_WORKFLOW_TEMPLATES,
  assertUniqueHcmEventCatalog,
} from "@/lib/hcm";
```

Catalogue uniqueness enforced at module load via `assertUniqueHcmEventCatalog()`.

---

*Supersedes [P-012.6-Event-Catalogue.md](./P-012.6-Event-Catalogue.md) for authoritative reference.*
