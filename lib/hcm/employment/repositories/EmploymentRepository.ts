import type {
  EmploymentAssignment,
  EmploymentHistoryRecord,
  EmploymentRecord,
  EmploymentSearchQuery,
} from "@/types/hcm-employment";

/** Employment repository contract (P-012.3). */
export type EmploymentRepository = {
  readonly domain: "hcm";

  create(employment: EmploymentRecord): EmploymentRecord;
  update(employment: EmploymentRecord): EmploymentRecord;
  findById(organizationId: string, employmentId: string): EmploymentRecord | null;
  findByEmploymentNumber(organizationId: string, employmentNumber: string): EmploymentRecord | null;
  listByEmployee(organizationId: string, employeeId: string): readonly EmploymentRecord[];
  listActivePrimary(organizationId: string, employeeId: string, legalEntityId: string): readonly EmploymentRecord[];
  search(organizationId: string, query?: EmploymentSearchQuery): readonly EmploymentRecord[];
  count(organizationId: string, query?: EmploymentSearchQuery): number;
};

/** Immutable employment history repository (P-012.3). */
export type EmploymentHistoryRepository = {
  readonly domain: "hcm";

  append(entry: EmploymentHistoryRecord): EmploymentHistoryRecord;
  listByEmployment(organizationId: string, employmentId: string): readonly EmploymentHistoryRecord[];
};

/** Employment assignment repository (P-012.3). */
export type AssignmentRepository = {
  readonly domain: "hcm";

  create(assignment: EmploymentAssignment): EmploymentAssignment;
  update(assignment: EmploymentAssignment): EmploymentAssignment;
  listByEmployment(organizationId: string, employmentId: string): readonly EmploymentAssignment[];
  findActiveByEmployment(organizationId: string, employmentId: string, asOfDate?: string): readonly EmploymentAssignment[];
};
