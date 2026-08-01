import type { EmployeeRecord, EmployeeSearchQuery } from "@/types/hcm-employee";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

function computeIdentityFingerprint(employee: Pick<EmployeeRecord, "identity">): string {
  const ids = employee.identity.governmentIdentifiers
    .map((id) => `${id.type}:${id.value}`)
    .sort()
    .join("|");
  const name = `${employee.identity.legalName.givenName}|${employee.identity.legalName.familyName}`;
  return `${name}::${ids}`.toLowerCase();
}

function fingerprintKey(organizationId: string, fingerprint: string): string {
  return `${organizationId}::${fingerprint}`;
}

export function indexEmployeeFingerprints(store: InMemoryHcmStore): void {
  for (const employee of store.employees.values()) {
    const fingerprint = computeIdentityFingerprint(employee);
    store.employeeFingerprints.set(fingerprintKey(employee.organizationId, fingerprint), employee.id);
  }
}

function matchesQuery(employee: EmployeeRecord, query?: EmployeeSearchQuery): boolean {
  if (!query) return true;
  if (query.employeeNumber && employee.employeeNumber !== query.employeeNumber) return false;
  if (query.status && employee.status !== query.status) return false;
  if (query.departmentId && employee.departmentId !== query.departmentId) return false;
  if (query.businessUnitId && employee.businessUnitId !== query.businessUnitId) return false;
  if (query.organizationUnitId && employee.organizationUnitId !== query.organizationUnitId) return false;
  if (query.name) {
    const term = query.name.toLowerCase();
    const fullName = `${employee.identity.legalName.givenName} ${employee.identity.legalName.familyName}`.toLowerCase();
    if (!fullName.includes(term) && !employee.employeeNumber.toLowerCase().includes(term)) return false;
  }
  if (query.email) {
    const term = query.email.toLowerCase();
    const hasEmail = employee.contacts.some((contact) =>
      contact.emails.some((email) => email.value.toLowerCase().includes(term)),
    );
    if (!hasEmail) return false;
  }
  return true;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(employee: EmployeeRecord): EmployeeRecord {
    this.store.employees.set(employee.id, employee);
    const fingerprint = computeIdentityFingerprint(employee);
    this.store.employeeFingerprints.set(fingerprintKey(employee.organizationId, fingerprint), employee.id);
    return employee;
  }

  update(employee: EmployeeRecord): EmployeeRecord {
    this.store.employees.set(employee.id, employee);
    const fingerprint = computeIdentityFingerprint(employee);
    this.store.employeeFingerprints.set(fingerprintKey(employee.organizationId, fingerprint), employee.id);
    return employee;
  }

  findById(organizationId: string, employeeId: string): EmployeeRecord | null {
    const record = this.store.employees.get(employeeId);
    return record?.organizationId === organizationId ? record : null;
  }

  findByEmployeeNumber(organizationId: string, employeeNumber: string): EmployeeRecord | null {
    for (const record of this.store.employees.values()) {
      if (record.organizationId === organizationId && record.employeeNumber === employeeNumber) {
        return record;
      }
    }
    return null;
  }

  findByIdentityFingerprint(organizationId: string, fingerprint: string): EmployeeRecord | null {
    const employeeId = this.store.employeeFingerprints.get(fingerprintKey(organizationId, fingerprint));
    if (!employeeId) return null;
    return this.findById(organizationId, employeeId);
  }

  search(organizationId: string, query?: EmployeeSearchQuery): readonly EmployeeRecord[] {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 50;
    const filtered = [...this.store.employees.values()]
      .filter((record) => record.organizationId === organizationId && matchesQuery(record, query))
      .sort((a, b) => a.employeeNumber.localeCompare(b.employeeNumber));
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  count(organizationId: string, query?: EmployeeSearchQuery): number {
    return [...this.store.employees.values()].filter(
      (record) => record.organizationId === organizationId && matchesQuery(record, query),
    ).length;
  }
}
