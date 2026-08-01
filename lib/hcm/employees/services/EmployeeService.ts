import type { ServiceContext } from "@/types/services";
import type {
  CreateEmployeeInput,
  EmployeeRecord,
  EmployeeSearchQuery,
  UpdateEmployeeInput,
  UpdateEmployeeProfileInput,
} from "@/types/hcm-employee";
import { createContactId, createEmployeeId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { EmployeeRulesEngine } from "@/lib/hcm/employees/EmployeeRulesEngine";
import type {
  EmployeeProfileRepository,
  EmployeeRepository,
} from "@/lib/hcm/employees/repositories/EmployeeRepository";

export class EmployeeService {
  private readonly rules = new EmployeeRulesEngine();

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly profileRepository: EmployeeProfileRepository,
  ) {}

  create(input: CreateEmployeeInput, context: ServiceContext): EmployeeRecord {
    const organizationId = context.organizationId;
    this.rules.assertValidIdentity({
      employeeNumber: input.employeeNumber,
      identity: input.identity,
    });

    const duplicateNumber = this.employeeRepository.findByEmployeeNumber(
      organizationId,
      input.employeeNumber,
    );
    if (duplicateNumber) throw new Error("DUPLICATE_EMPLOYEE_NUMBER");

    const fingerprint = this.rules.computeIdentityFingerprint({ identity: input.identity });
    const duplicateIdentity = this.employeeRepository.findByIdentityFingerprint(
      organizationId,
      fingerprint,
    );
    if (duplicateIdentity) throw new Error("DUPLICATE_EMPLOYEE_IDENTITY");

    const now = nowIso();
    const employee: EmployeeRecord = {
      id: createEmployeeId(),
      organizationId,
      employeeNumber: input.employeeNumber,
      identity: input.identity,
      profile: input.profile ?? {},
      contacts: (input.contacts ?? []).map((c) => ({ ...c, id: createContactId() })),
      emergencyContacts: (input.emergencyContacts ?? []).map((c) => ({ ...c, id: createContactId() })),
      status: "draft",
      statusEffectiveFrom: now,
      organizationUnitId: input.organizationUnitId,
      businessUnitId: input.businessUnitId,
      departmentId: input.departmentId,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
      updatedBy: context.userId ?? "system",
    };

    return this.employeeRepository.create(employee);
  }

  update(input: UpdateEmployeeInput, context: ServiceContext): EmployeeRecord {
    const organizationId = context.organizationId;
    const existing = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!existing) throw new Error("EMPLOYEE_NOT_FOUND");

    const identity = input.identity
      ? { ...existing.identity, ...input.identity }
      : existing.identity;

    const updated: EmployeeRecord = {
      ...existing,
      identity,
      organizationUnitId: input.organizationUnitId ?? existing.organizationUnitId,
      businessUnitId: input.businessUnitId ?? existing.businessUnitId,
      departmentId: input.departmentId ?? existing.departmentId,
      effectiveTo: input.effectiveTo ?? existing.effectiveTo,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    return this.employeeRepository.update(updated);
  }

  updateProfile(input: UpdateEmployeeProfileInput, context: ServiceContext): EmployeeRecord {
    const organizationId = context.organizationId;
    const existing = this.profileRepository.getProfile(organizationId, input.employeeId);
    if (!existing) throw new Error("EMPLOYEE_NOT_FOUND");

    const updated: EmployeeRecord = {
      ...existing,
      profile: { ...existing.profile, ...input.profile },
      contacts: input.contacts ?? existing.contacts,
      emergencyContacts: input.emergencyContacts ?? existing.emergencyContacts,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    return this.profileRepository.saveProfile(updated);
  }

  activate(employeeId: string, context: ServiceContext): EmployeeRecord {
    return this.transitionStatus(employeeId, "active", context);
  }

  suspend(employeeId: string, context: ServiceContext): EmployeeRecord {
    return this.transitionStatus(employeeId, "inactive", context);
  }

  terminateReference(employeeId: string, context: ServiceContext): EmployeeRecord {
    return this.transitionStatus(employeeId, "archived", context);
  }

  getById(employeeId: string, context: ServiceContext): EmployeeRecord | null {
    return this.employeeRepository.findById(context.organizationId, employeeId);
  }

  search(query: EmployeeSearchQuery | undefined, context: ServiceContext): readonly EmployeeRecord[] {
    return this.employeeRepository.search(context.organizationId, query);
  }

  count(query: EmployeeSearchQuery | undefined, context: ServiceContext): number {
    return this.employeeRepository.count(context.organizationId, query);
  }

  private transitionStatus(
    employeeId: string,
    targetStatus: EmployeeRecord["status"],
    context: ServiceContext,
  ): EmployeeRecord {
    const organizationId = context.organizationId;
    const existing = this.employeeRepository.findById(organizationId, employeeId);
    if (!existing) throw new Error("EMPLOYEE_NOT_FOUND");

    this.rules.assertStatusTransition(existing.status, targetStatus);

    const now = nowIso();
    const updated: EmployeeRecord = {
      ...existing,
      status: targetStatus,
      statusEffectiveFrom: now,
      version: existing.version + 1,
      updatedAt: now,
      updatedBy: context.userId ?? "system",
    };

    return this.employeeRepository.update(updated);
  }
}
