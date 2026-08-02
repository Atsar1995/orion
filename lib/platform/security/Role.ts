/**
 * Enterprise role model (Mission P-015.6 · ADR-008 · ADR-009).
 */

import type { RoleSlug } from "@/types/auth";
import { SystemRole } from "@/lib/auth/roles";

/** Platform-level operational roles. */
export enum PlatformRole {
  SystemAdministrator = "system_administrator",
  PlatformAdministrator = "platform_administrator",
  SupportEngineer = "support_engineer",
  Developer = "developer",
  Auditor = "auditor",
}

/** Organization tenant roles. */
export enum OrganizationRole {
  OrganizationOwner = "organization_owner",
  OrganizationAdministrator = "organization_administrator",
  DepartmentManager = "department_manager",
  Supervisor = "supervisor",
  Employee = "employee",
  Guest = "guest",
}

/** HCM domain role profiles (permission bundles — not separate auth identities). */
export enum HcmRole {
  HrAdministrator = "hr_administrator",
  HrManager = "hr_manager",
  Recruiter = "recruiter",
  PayrollAdministrator = "payroll_administrator",
  PayrollManager = "payroll_manager",
  LearningManager = "learning_manager",
}

export type EnterpriseRole =
  | PlatformRole
  | OrganizationRole
  | HcmRole
  | RoleSlug;

/** Maps session {@link RoleSlug} to enterprise organization role profile. */
export function resolveOrganizationRole(role: RoleSlug): OrganizationRole {
  switch (role) {
    case SystemRole.SuperAdmin:
    case SystemRole.ServiceAccount:
      return OrganizationRole.OrganizationOwner;
    case SystemRole.OrganizationAdmin:
    case SystemRole.Administrator:
      return OrganizationRole.OrganizationAdministrator;
    case SystemRole.Executive:
    case SystemRole.Founder:
      return OrganizationRole.OrganizationOwner;
    case SystemRole.Manager:
      return OrganizationRole.DepartmentManager;
    case SystemRole.Analyst:
    case SystemRole.Staff:
      return OrganizationRole.Employee;
    case SystemRole.ReadOnly:
    case SystemRole.Guest:
      return OrganizationRole.Guest;
    default:
      return OrganizationRole.Employee;
  }
}

/** Maps session {@link RoleSlug} to platform role profile. */
export function resolvePlatformRole(role: RoleSlug): PlatformRole {
  switch (role) {
    case SystemRole.SuperAdmin:
      return PlatformRole.SystemAdministrator;
    case SystemRole.ServiceAccount:
      return PlatformRole.SupportEngineer;
    case SystemRole.OrganizationAdmin:
    case SystemRole.Administrator:
      return PlatformRole.PlatformAdministrator;
    case SystemRole.ReadOnly:
      return PlatformRole.Auditor;
    default:
      return PlatformRole.Developer;
  }
}

/** HCM domain profiles granted by platform role (GA baseline). */
export function resolveHcmRolesForPlatformRole(role: RoleSlug): readonly HcmRole[] {
  switch (role) {
    case SystemRole.SuperAdmin:
    case SystemRole.OrganizationAdmin:
    case SystemRole.Administrator:
      return [
        HcmRole.HrAdministrator,
        HcmRole.HrManager,
        HcmRole.Recruiter,
        HcmRole.PayrollAdministrator,
        HcmRole.PayrollManager,
        HcmRole.LearningManager,
      ];
    case SystemRole.Executive:
    case SystemRole.Founder:
      return [HcmRole.HrManager, HcmRole.PayrollManager, HcmRole.LearningManager];
    case SystemRole.Manager:
      return [HcmRole.HrManager, HcmRole.LearningManager];
    case SystemRole.Analyst:
    case SystemRole.Staff:
      return [HcmRole.Recruiter];
    default:
      return [];
  }
}
