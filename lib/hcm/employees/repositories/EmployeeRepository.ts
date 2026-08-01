import type {
  EmployeeRecord,
  EmployeeSearchQuery,
} from "@/types/hcm-employee";

/** Employee master repository contract (P-012.2). */
export type EmployeeRepository = {
  readonly domain: "hcm";

  create(employee: EmployeeRecord): EmployeeRecord;
  update(employee: EmployeeRecord): EmployeeRecord;
  findById(organizationId: string, employeeId: string): EmployeeRecord | null;
  findByEmployeeNumber(organizationId: string, employeeNumber: string): EmployeeRecord | null;
  findByIdentityFingerprint(organizationId: string, fingerprint: string): EmployeeRecord | null;
  search(organizationId: string, query?: EmployeeSearchQuery): readonly EmployeeRecord[];
  count(organizationId: string, query?: EmployeeSearchQuery): number;
};

/** Employee profile repository contract (P-012.2). */
export type EmployeeProfileRepository = {
  readonly domain: "hcm";

  getProfile(organizationId: string, employeeId: string): EmployeeRecord | null;
  saveProfile(employee: EmployeeRecord): EmployeeRecord;
};
