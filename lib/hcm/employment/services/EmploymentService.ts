import type { ServiceContext } from "@/types/services";
import type {
  CreateEmploymentInput,
  EmploymentHistoryRecord,
  EmploymentRecord,
  EmploymentSearchQuery,
  LifecycleActionInput,
  PromotionInput,
  RehireInput,
  TerminationInput,
  TransferInput,
} from "@/types/hcm-employment";
import {
  createAssignmentId,
  createEmploymentId,
  createHistoryId,
} from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { EmploymentRulesEngine } from "@/lib/hcm/employment/EmploymentRulesEngine";
import type {
  AssignmentRepository,
  EmploymentHistoryRepository,
  EmploymentRepository,
} from "@/lib/hcm/employment/repositories/EmploymentRepository";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";

export class EmploymentService {
  private readonly rules = new EmploymentRulesEngine();

  constructor(
    private readonly employmentRepository: EmploymentRepository,
    private readonly historyRepository: EmploymentHistoryRepository,
    private readonly assignmentRepository: AssignmentRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  create(input: CreateEmploymentInput, context: ServiceContext): EmploymentRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");

    const duplicate = this.employmentRepository.findByEmploymentNumber(
      organizationId,
      input.employmentNumber,
    );
    if (duplicate) throw new Error("DUPLICATE_EMPLOYMENT_NUMBER");

    const isPrimary = input.isPrimary ?? true;
    if (isPrimary) {
      this.rules.assertPrimaryUniqueness(
        this.employmentRepository.listActivePrimary(
          organizationId,
          input.employeeId,
          input.legalEntityId,
        ),
      );
    }

    const now = nowIso();
    const actor = context.userId ?? "system";
    const employment: EmploymentRecord = {
      id: createEmploymentId(),
      organizationId,
      employmentNumber: input.employmentNumber,
      employeeId: input.employeeId,
      legalEntityId: input.legalEntityId,
      positionId: input.positionId,
      departmentId: input.departmentId,
      managerPositionId: input.managerPositionId,
      employmentType: input.employmentType,
      contractType: input.contractType,
      jobGrade: input.jobGrade,
      payGradeRef: input.payGradeRef,
      workingPattern: input.workingPattern,
      status: "draft",
      isPrimary,
      contract: input.contract,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      probationEndDate: input.probationEndDate,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      updatedBy: actor,
    };

    const saved = this.employmentRepository.create(employment);
    this.recordHistory(saved, "created", undefined, "draft", input.effectiveFrom, actor);
    return saved;
  }

  activate(employmentId: string, effectiveFrom: string, context: ServiceContext): EmploymentRecord {
    return this.transitionStatus(employmentId, "active", "confirmed", effectiveFrom, context);
  }

  transfer(input: TransferInput, context: ServiceContext): EmploymentRecord {
    const organizationId = context.organizationId;
    const existing = this.requireEmployment(organizationId, input.employmentId);
    this.rules.assertCanMutate(existing);

    const updated: EmploymentRecord = {
      ...existing,
      departmentId: input.departmentId,
      positionId: input.positionId ?? existing.positionId,
      legalEntityId: input.legalEntityId ?? existing.legalEntityId,
      effectiveFrom: input.effectiveFrom,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    const saved = this.employmentRepository.update(updated);
    this.recordHistory(
      saved,
      "transferred",
      existing.status,
      existing.status,
      input.effectiveFrom,
      context.userId ?? "system",
      {
        departmentId: input.departmentId,
        positionId: input.positionId ?? "",
      },
    );
    return saved;
  }

  changeDepartment(
    employmentId: string,
    departmentId: string,
    effectiveFrom: string,
    context: ServiceContext,
  ): EmploymentRecord {
    return this.transfer(
      { employmentId, departmentId, effectiveFrom },
      context,
    );
  }

  changeManager(input: LifecycleActionInput, context: ServiceContext): EmploymentRecord {
    const organizationId = context.organizationId;
    const existing = this.requireEmployment(organizationId, input.employmentId);
    this.rules.assertCanMutate(existing);

    const managerPositionId = input.details?.managerPositionId;
    if (!managerPositionId) throw new Error("MANAGER_POSITION_REQUIRED");

    const updated: EmploymentRecord = {
      ...existing,
      managerPositionId,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    const saved = this.employmentRepository.update(updated);
    this.recordHistory(
      saved,
      "assignment_created",
      existing.status,
      existing.status,
      input.effectiveFrom,
      context.userId ?? "system",
      { managerPositionId },
    );
    return saved;
  }

  promote(input: PromotionInput, context: ServiceContext): EmploymentRecord {
    const organizationId = context.organizationId;
    const existing = this.requireEmployment(organizationId, input.employmentId);
    this.rules.assertCanMutate(existing);

    const updated: EmploymentRecord = {
      ...existing,
      jobGrade: input.jobGrade,
      positionId: input.positionId ?? existing.positionId,
      payGradeRef: input.payGradeRef ?? existing.payGradeRef,
      effectiveFrom: input.effectiveFrom,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    const saved = this.employmentRepository.update(updated);
    this.recordHistory(
      saved,
      "promoted",
      existing.status,
      existing.status,
      input.effectiveFrom,
      context.userId ?? "system",
      { jobGrade: input.jobGrade },
    );
    return saved;
  }

  terminate(input: TerminationInput, context: ServiceContext): EmploymentRecord {
    const organizationId = context.organizationId;
    const existing = this.requireEmployment(organizationId, input.employmentId);
    this.rules.assertCanMutate(existing);

    const targetStatus = input.retire ? "retired" : "terminated";
    this.rules.assertStatusTransition(existing.status, targetStatus);

    const updated: EmploymentRecord = {
      ...existing,
      status: targetStatus,
      terminationReason: input.reason,
      effectiveTo: input.effectiveFrom,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    const saved = this.employmentRepository.update(updated);
    this.recordHistory(
      saved,
      input.retire ? "retired" : "terminated",
      existing.status,
      targetStatus,
      input.effectiveFrom,
      context.userId ?? "system",
    );
    return saved;
  }

  rehire(input: RehireInput, context: ServiceContext): EmploymentRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");

    const prior = this.employmentRepository.listByEmployee(organizationId, input.employeeId);
    const terminated = prior.find((e) => e.status === "terminated" || e.status === "retired");
    if (!terminated) throw new Error("NO_PRIOR_TERMINATED_EMPLOYMENT");

    const employment = this.create(
      {
        employmentNumber: input.employmentNumber,
        employeeId: input.employeeId,
        legalEntityId: input.legalEntityId,
        positionId: input.positionId,
        departmentId: input.departmentId,
        employmentType: input.employmentType,
        contractType: input.contractType,
        contract: input.contract,
        effectiveFrom: input.effectiveFrom,
        isPrimary: true,
      },
      context,
    );

    const activated = this.transitionStatus(
      employment.id,
      "active",
      "rehired",
      input.effectiveFrom,
      context,
    );

    this.assignmentRepository.create({
      id: createAssignmentId(),
      organizationId,
      employmentId: activated.id,
      assignmentType: "primary",
      orgUnitId: input.departmentId ?? "unassigned",
      positionId: input.positionId,
      effectiveFrom: input.effectiveFrom,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    return activated;
  }

  getById(employmentId: string, context: ServiceContext): EmploymentRecord | null {
    return this.employmentRepository.findById(context.organizationId, employmentId);
  }

  search(
    query: EmploymentSearchQuery | undefined,
    context: ServiceContext,
  ): readonly EmploymentRecord[] {
    return this.employmentRepository.search(context.organizationId, query);
  }

  count(query: EmploymentSearchQuery | undefined, context: ServiceContext): number {
    return this.employmentRepository.count(context.organizationId, query);
  }

  listHistory(employmentId: string, context: ServiceContext): readonly EmploymentHistoryRecord[] {
    return this.historyRepository.listByEmployment(context.organizationId, employmentId);
  }

  private transitionStatus(
    employmentId: string,
    targetStatus: EmploymentRecord["status"],
    eventType: EmploymentHistoryRecord["eventType"],
    effectiveDate: string,
    context: ServiceContext,
  ): EmploymentRecord {
    const organizationId = context.organizationId;
    const existing = this.requireEmployment(organizationId, employmentId);
    this.rules.assertStatusTransition(existing.status, targetStatus);

    const updated: EmploymentRecord = {
      ...existing,
      status: targetStatus,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    const saved = this.employmentRepository.update(updated);
    this.recordHistory(
      saved,
      eventType,
      existing.status,
      targetStatus,
      effectiveDate,
      context.userId ?? "system",
    );
    return saved;
  }

  private requireEmployment(organizationId: string, employmentId: string): EmploymentRecord {
    const existing = this.employmentRepository.findById(organizationId, employmentId);
    if (!existing) throw new Error("EMPLOYMENT_NOT_FOUND");
    return existing;
  }

  private recordHistory(
    employment: EmploymentRecord,
    eventType: EmploymentHistoryRecord["eventType"],
    fromStatus: EmploymentHistoryRecord["fromStatus"],
    toStatus: EmploymentHistoryRecord["toStatus"],
    effectiveDate: string,
    actorId: string,
    details?: Readonly<Record<string, string>>,
  ): EmploymentHistoryRecord {
    const entry: EmploymentHistoryRecord = {
      id: createHistoryId(),
      organizationId: employment.organizationId,
      employmentId: employment.id,
      eventType,
      fromStatus,
      toStatus,
      effectiveDate,
      actorId,
      details,
      recordedAt: nowIso(),
    };
    return this.historyRepository.append(entry);
  }
}
