import type { EmployeeRecord, EmployeeStatus } from "@/types/hcm-employee";

export class EmployeeRulesEngine {
  assertValidIdentity(employee: Pick<EmployeeRecord, "identity" | "employeeNumber">): void {
    if (!employee.employeeNumber.trim()) throw new Error("INVALID_EMPLOYEE_NUMBER");
    if (!employee.identity.legalName.givenName.trim()) throw new Error("INVALID_IDENTITY");
    if (!employee.identity.legalName.familyName.trim()) throw new Error("INVALID_IDENTITY");
  }

  assertStatusTransition(from: EmployeeStatus, to: EmployeeStatus): void {
    const allowed: Record<EmployeeStatus, readonly EmployeeStatus[]> = {
      draft: ["active", "archived"],
      active: ["inactive", "archived"],
      inactive: ["active", "archived"],
      archived: [],
    };
    if (!allowed[from].includes(to)) {
      throw new Error("INVALID_EMPLOYEE_STATUS_TRANSITION");
    }
  }

  computeIdentityFingerprint(employee: Pick<EmployeeRecord, "identity">): string {
    const ids = employee.identity.governmentIdentifiers
      .map((id) => `${id.type}:${id.value}`)
      .sort()
      .join("|");
    const name = `${employee.identity.legalName.givenName}|${employee.identity.legalName.familyName}`;
    return `${name}::${ids}`.toLowerCase();
  }
}
