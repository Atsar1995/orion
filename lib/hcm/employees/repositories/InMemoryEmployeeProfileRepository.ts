import type { EmployeeRecord } from "@/types/hcm-employee";
import type { EmployeeProfileRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

export class InMemoryEmployeeProfileRepository implements EmployeeProfileRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  getProfile(organizationId: string, employeeId: string): EmployeeRecord | null {
    const record = this.store.employees.get(employeeId);
    return record?.organizationId === organizationId ? record : null;
  }

  saveProfile(employee: EmployeeRecord): EmployeeRecord {
    this.store.employees.set(employee.id, employee);
    return employee;
  }
}
