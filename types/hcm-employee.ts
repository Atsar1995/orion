/**
 * HCM Employee Master types (Mission P-012.2).
 * Employee aggregate is independent from Employment (P-012.3).
 */

import type {
  DateRange,
  EmailAddress,
  GovernmentIdentifier,
  PersonName,
  PhoneNumber,
  PostalAddress,
} from "@/types/hcm-common";

export type EmployeeStatus = "draft" | "active" | "inactive" | "archived";

export type EmployeeIdentity = {
  readonly legalName: PersonName;
  readonly nationality?: string;
  readonly dateOfBirth?: string;
  readonly governmentIdentifiers: readonly GovernmentIdentifier[];
};

export type EmployeeProfile = {
  readonly preferredName?: string;
  readonly photographRef?: string;
  readonly employmentStatusRef?: string;
  readonly biography?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type EmployeeContact = {
  readonly id: string;
  readonly emails: readonly EmailAddress[];
  readonly phones: readonly PhoneNumber[];
  readonly address?: PostalAddress;
};

export type EmergencyContact = {
  readonly id: string;
  readonly name: PersonName;
  readonly relationship: string;
  readonly phones: readonly PhoneNumber[];
  readonly emails: readonly EmailAddress[];
  readonly primary: boolean;
};

export type EmployeeRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeNumber: string;
  readonly identity: EmployeeIdentity;
  readonly profile: EmployeeProfile;
  readonly contacts: readonly EmployeeContact[];
  readonly emergencyContacts: readonly EmergencyContact[];
  readonly status: EmployeeStatus;
  readonly statusEffectiveFrom: string;
  readonly organizationUnitId?: string;
  readonly businessUnitId?: string;
  readonly departmentId?: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type CreateEmployeeInput = {
  readonly employeeNumber: string;
  readonly identity: EmployeeIdentity;
  readonly profile?: Partial<EmployeeProfile>;
  readonly contacts?: readonly Omit<EmployeeContact, "id">[];
  readonly emergencyContacts?: readonly Omit<EmergencyContact, "id">[];
  readonly organizationUnitId?: string;
  readonly businessUnitId?: string;
  readonly departmentId?: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
};

export type UpdateEmployeeInput = {
  readonly employeeId: string;
  readonly identity?: Partial<EmployeeIdentity>;
  readonly organizationUnitId?: string;
  readonly businessUnitId?: string;
  readonly departmentId?: string;
  readonly effectiveTo?: string;
};

export type UpdateEmployeeProfileInput = {
  readonly employeeId: string;
  readonly profile: Partial<EmployeeProfile>;
  readonly contacts?: readonly EmployeeContact[];
  readonly emergencyContacts?: readonly EmergencyContact[];
};

export type EmployeeSearchQuery = {
  readonly employeeNumber?: string;
  readonly name?: string;
  readonly email?: string;
  readonly departmentId?: string;
  readonly businessUnitId?: string;
  readonly organizationUnitId?: string;
  readonly status?: EmployeeStatus;
  readonly page?: number;
  readonly pageSize?: number;
};

export type EmployeeSearchResult = {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly employees: readonly EmployeeRecord[];
};

export type EmployeeValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
};

export type PublishHcmEmployeeEventInput = {
  readonly eventType:
    | "EmployeeCreated"
    | "EmployeeUpdated"
    | "EmployeeActivated"
    | "EmployeeSuspended"
    | "EmployeeDeactivated"
    | "EmployeeArchived";
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
