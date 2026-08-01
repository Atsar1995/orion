import type {
  EmploymentLifecycleStatus,
  EmploymentRecord,
} from "@/types/hcm-employment";

const ACTIVE_STATUSES: readonly EmploymentLifecycleStatus[] = [
  "appointed",
  "probation",
  "confirmed",
  "active",
];

const ALLOWED_TRANSITIONS: Record<
  EmploymentLifecycleStatus,
  readonly EmploymentLifecycleStatus[]
> = {
  draft: ["appointed", "active", "archived"],
  appointed: ["probation", "confirmed", "active", "terminated", "archived"],
  probation: ["confirmed", "active", "terminated", "suspended"],
  confirmed: ["active", "suspended", "terminated"],
  active: ["suspended", "terminated", "retired", "leave_of_service"],
  suspended: ["active", "terminated"],
  leave_of_service: ["active", "terminated"],
  terminated: ["archived"],
  retired: ["archived"],
  archived: [],
};

export class EmploymentRulesEngine {
  assertEmployeeLink(employeeId: string, employmentEmployeeId: string): void {
    if (employeeId !== employmentEmployeeId) {
      throw new Error("EMPLOYEE_EMPLOYMENT_MISMATCH");
    }
  }

  assertStatusTransition(from: EmploymentLifecycleStatus, to: EmploymentLifecycleStatus): void {
    if (from === to) return;
    const allowed = ALLOWED_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new Error("INVALID_EMPLOYMENT_STATUS_TRANSITION");
    }
  }

  assertCanMutate(employment: EmploymentRecord): void {
    if (
      employment.status === "terminated" ||
      employment.status === "retired" ||
      employment.status === "archived"
    ) {
      throw new Error("EMPLOYMENT_NOT_MUTABLE");
    }
  }

  assertPrimaryUniqueness(existingPrimary: readonly EmploymentRecord[]): void {
    if (existingPrimary.length > 0) {
      throw new Error("PRIMARY_EMPLOYMENT_EXISTS");
    }
  }

  isActiveStatus(status: EmploymentLifecycleStatus): boolean {
    return ACTIVE_STATUSES.includes(status);
  }
}
