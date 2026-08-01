/**
 * HCM Employment Lifecycle types (Mission P-012.3).
 * Employment aggregate is independent from Employee identity.
 */

import type { DateRange } from "@/types/hcm-common";

export type EmploymentNumber = string;

export type EmploymentType =
  | "permanent"
  | "fixed_term"
  | "contractor"
  | "intern"
  | "temporary";

export type ContractType = "full_time" | "part_time" | "casual";

export type JobGrade = string;

export type PayGradeReference = string;

export type WorkingPattern = string;

export type EffectiveDateRange = DateRange;

export type TerminationReason = {
  readonly code: string;
  readonly description: string;
  readonly voluntary: boolean;
};

export type EmploymentLifecycleStatus =
  | "draft"
  | "appointed"
  | "probation"
  | "confirmed"
  | "active"
  | "suspended"
  | "leave_of_service"
  | "terminated"
  | "retired"
  | "archived";

export type EmploymentEventType =
  | "created"
  | "confirmed"
  | "probation_completed"
  | "transferred"
  | "promoted"
  | "demoted"
  | "suspended"
  | "terminated"
  | "retired"
  | "rehired"
  | "assignment_created"
  | "contract_renewed";

export type EmploymentContract = {
  readonly contractNumber?: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly renewalDate?: string;
};

export type EmploymentStatus = {
  readonly code: EmploymentLifecycleStatus;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
};

export type EmploymentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employmentNumber: EmploymentNumber;
  readonly employeeId: string;
  readonly legalEntityId: string;
  readonly positionId?: string;
  readonly departmentId?: string;
  readonly managerPositionId?: string;
  readonly employmentType: EmploymentType;
  readonly contractType: ContractType;
  readonly jobGrade?: JobGrade;
  readonly payGradeRef?: PayGradeReference;
  readonly workingPattern?: WorkingPattern;
  readonly status: EmploymentLifecycleStatus;
  readonly isPrimary: boolean;
  readonly contract: EmploymentContract;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly probationEndDate?: string;
  readonly terminationReason?: TerminationReason;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type EmploymentAssignment = {
  readonly id: string;
  readonly organizationId: string;
  readonly employmentId: string;
  readonly assignmentType: "primary" | "secondment" | "acting";
  readonly orgUnitId: string;
  readonly positionId?: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type EmploymentHistoryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employmentId: string;
  readonly eventType: EmploymentEventType;
  readonly fromStatus?: EmploymentLifecycleStatus;
  readonly toStatus?: EmploymentLifecycleStatus;
  readonly effectiveDate: string;
  readonly actorId: string;
  readonly details?: Readonly<Record<string, string>>;
  readonly recordedAt: string;
};

export type EmploymentEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly employmentId: string;
  readonly eventType: EmploymentEventType;
  readonly effectiveDate: string;
  readonly payload?: Readonly<Record<string, string>>;
};

export type CreateEmploymentInput = {
  readonly employmentNumber: EmploymentNumber;
  readonly employeeId: string;
  readonly legalEntityId: string;
  readonly positionId?: string;
  readonly departmentId?: string;
  readonly managerPositionId?: string;
  readonly employmentType: EmploymentType;
  readonly contractType: ContractType;
  readonly jobGrade?: JobGrade;
  readonly payGradeRef?: PayGradeReference;
  readonly workingPattern?: WorkingPattern;
  readonly isPrimary?: boolean;
  readonly contract: EmploymentContract;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly probationEndDate?: string;
};

export type EmploymentSearchQuery = {
  readonly employmentNumber?: string;
  readonly employeeId?: string;
  readonly departmentId?: string;
  readonly managerPositionId?: string;
  readonly positionId?: string;
  readonly status?: EmploymentLifecycleStatus;
  readonly employmentType?: EmploymentType;
  readonly legalEntityId?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type EmploymentSearchResult = {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly employments: readonly EmploymentRecord[];
};

export type TransferInput = {
  readonly employmentId: string;
  readonly departmentId: string;
  readonly positionId?: string;
  readonly legalEntityId?: string;
  readonly effectiveFrom: string;
};

export type PromotionInput = {
  readonly employmentId: string;
  readonly jobGrade: JobGrade;
  readonly positionId?: string;
  readonly payGradeRef?: PayGradeReference;
  readonly effectiveFrom: string;
};

export type TerminationInput = {
  readonly employmentId: string;
  readonly reason: TerminationReason;
  readonly effectiveFrom: string;
  readonly retire?: boolean;
};

export type RehireInput = {
  readonly employeeId: string;
  readonly employmentNumber: EmploymentNumber;
  readonly legalEntityId: string;
  readonly employmentType: EmploymentType;
  readonly contractType: ContractType;
  readonly contract: EmploymentContract;
  readonly effectiveFrom: string;
  readonly positionId?: string;
  readonly departmentId?: string;
};

export type CreateAssignmentInput = {
  readonly employmentId: string;
  readonly assignmentType: EmploymentAssignment["assignmentType"];
  readonly orgUnitId: string;
  readonly positionId?: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
};

export type LifecycleActionInput = {
  readonly employmentId: string;
  readonly effectiveFrom: string;
  readonly details?: Readonly<Record<string, string>>;
};

export type PublishHcmEmploymentEventInput = {
  readonly eventType:
    | "EmploymentCreated"
    | "EmploymentConfirmed"
    | "ProbationCompleted"
    | "EmployeeTransferred"
    | "EmployeePromoted"
    | "EmploymentSuspended"
    | "EmploymentTerminated"
    | "EmployeeRehired"
    | "AssignmentCreated";
  readonly entityId: string;
  readonly employeeId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
