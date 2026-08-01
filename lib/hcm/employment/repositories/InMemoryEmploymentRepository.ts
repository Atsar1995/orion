import type {
  EmploymentAssignment,
  EmploymentHistoryRecord,
  EmploymentRecord,
  EmploymentSearchQuery,
} from "@/types/hcm-employment";
import type {
  AssignmentRepository,
  EmploymentHistoryRepository,
  EmploymentRepository,
} from "@/lib/hcm/employment/repositories/EmploymentRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

const ACTIVE_PRIMARY_STATUSES: readonly EmploymentRecord["status"][] = [
  "appointed",
  "probation",
  "confirmed",
  "active",
];

function matchesEmploymentQuery(employment: EmploymentRecord, query?: EmploymentSearchQuery): boolean {
  if (!query) return true;
  if (query.employmentNumber && employment.employmentNumber !== query.employmentNumber) return false;
  if (query.employeeId && employment.employeeId !== query.employeeId) return false;
  if (query.departmentId && employment.departmentId !== query.departmentId) return false;
  if (query.managerPositionId && employment.managerPositionId !== query.managerPositionId) return false;
  if (query.positionId && employment.positionId !== query.positionId) return false;
  if (query.status && employment.status !== query.status) return false;
  if (query.employmentType && employment.employmentType !== query.employmentType) return false;
  if (query.legalEntityId && employment.legalEntityId !== query.legalEntityId) return false;
  return true;
}

function inAssignmentRange(
  assignment: EmploymentAssignment,
  asOfDate?: string,
): boolean {
  if (!asOfDate) return !assignment.effectiveTo;
  if (asOfDate < assignment.effectiveFrom) return false;
  if (assignment.effectiveTo && asOfDate > assignment.effectiveTo) return false;
  return true;
}

export class InMemoryEmploymentRepository implements EmploymentRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(employment: EmploymentRecord): EmploymentRecord {
    this.store.employments.set(employment.id, employment);
    return employment;
  }

  update(employment: EmploymentRecord): EmploymentRecord {
    this.store.employments.set(employment.id, employment);
    return employment;
  }

  findById(organizationId: string, employmentId: string): EmploymentRecord | null {
    const record = this.store.employments.get(employmentId);
    return record?.organizationId === organizationId ? record : null;
  }

  findByEmploymentNumber(organizationId: string, employmentNumber: string): EmploymentRecord | null {
    for (const record of this.store.employments.values()) {
      if (record.organizationId === organizationId && record.employmentNumber === employmentNumber) {
        return record;
      }
    }
    return null;
  }

  listByEmployee(organizationId: string, employeeId: string): readonly EmploymentRecord[] {
    return [...this.store.employments.values()]
      .filter((record) => record.organizationId === organizationId && record.employeeId === employeeId)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  }

  listActivePrimary(
    organizationId: string,
    employeeId: string,
    legalEntityId: string,
  ): readonly EmploymentRecord[] {
    return [...this.store.employments.values()].filter(
      (record) =>
        record.organizationId === organizationId &&
        record.employeeId === employeeId &&
        record.legalEntityId === legalEntityId &&
        record.isPrimary &&
        ACTIVE_PRIMARY_STATUSES.includes(record.status),
    );
  }

  search(organizationId: string, query?: EmploymentSearchQuery): readonly EmploymentRecord[] {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 50;
    const filtered = [...this.store.employments.values()]
      .filter((record) => record.organizationId === organizationId && matchesEmploymentQuery(record, query))
      .sort((a, b) => a.employmentNumber.localeCompare(b.employmentNumber));
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  count(organizationId: string, query?: EmploymentSearchQuery): number {
    return [...this.store.employments.values()].filter(
      (record) => record.organizationId === organizationId && matchesEmploymentQuery(record, query),
    ).length;
  }
}

export class InMemoryEmploymentHistoryRepository implements EmploymentHistoryRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  append(entry: EmploymentHistoryRecord): EmploymentHistoryRecord {
    this.store.employmentHistory.push(entry);
    return entry;
  }

  listByEmployment(organizationId: string, employmentId: string): readonly EmploymentHistoryRecord[] {
    return this.store.employmentHistory
      .filter((record) => record.organizationId === organizationId && record.employmentId === employmentId)
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  }
}

export class InMemoryAssignmentRepository implements AssignmentRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(assignment: EmploymentAssignment): EmploymentAssignment {
    this.store.assignments.set(assignment.id, assignment);
    return assignment;
  }

  update(assignment: EmploymentAssignment): EmploymentAssignment {
    this.store.assignments.set(assignment.id, assignment);
    return assignment;
  }

  listByEmployment(organizationId: string, employmentId: string): readonly EmploymentAssignment[] {
    return [...this.store.assignments.values()]
      .filter((record) => record.organizationId === organizationId && record.employmentId === employmentId)
      .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  }

  findActiveByEmployment(
    organizationId: string,
    employmentId: string,
    asOfDate?: string,
  ): readonly EmploymentAssignment[] {
    return this.listByEmployment(organizationId, employmentId).filter((record) =>
      inAssignmentRange(record, asOfDate),
    );
  }
}
