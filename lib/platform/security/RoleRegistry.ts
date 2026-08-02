/**
 * Role registry — role-to-permission assignments (Mission P-015.6 · ADR-009).
 */

import { buildPermissionCode, type PermissionCode } from "@/lib/platform/security/Permission";
import {
  HcmRole,
  OrganizationRole,
  PlatformRole,
  resolveHcmRolesForPlatformRole,
} from "@/lib/platform/security/Role";
import type { RoleSlug } from "@/types/auth";
import { SystemRole } from "@/lib/auth/roles";

export type RoleAssignment = {
  readonly role: PlatformRole | OrganizationRole | HcmRole | RoleSlug;
  readonly permissions: readonly PermissionCode[];
  readonly inherits?: readonly (PlatformRole | OrganizationRole | HcmRole | RoleSlug)[];
};

const HCM_PERMISSIONS = {
  employeeRead: buildPermissionCode("hcm", "employee", "read"),
  employeeWrite: buildPermissionCode("hcm", "employee", "write"),
  orgRead: buildPermissionCode("hcm", "organization", "read"),
  orgWrite: buildPermissionCode("hcm", "organization", "write"),
  employmentRead: buildPermissionCode("hcm", "employment", "read"),
  employmentWrite: buildPermissionCode("hcm", "employment", "write"),
  recruitmentRead: buildPermissionCode("hcm", "recruitment", "read"),
  recruitmentWrite: buildPermissionCode("hcm", "recruitment", "write"),
  onboardingRead: buildPermissionCode("hcm", "onboarding", "read"),
  onboardingWrite: buildPermissionCode("hcm", "onboarding", "write"),
  timeRead: buildPermissionCode("hcm", "time", "read"),
  timeWrite: buildPermissionCode("hcm", "time", "write"),
  timeApprove: buildPermissionCode("hcm", "time", "approve"),
  payrollRead: buildPermissionCode("hcm", "payroll", "read"),
  payrollWrite: buildPermissionCode("hcm", "payroll", "write"),
  talentRead: buildPermissionCode("hcm", "talent", "read"),
  talentWrite: buildPermissionCode("hcm", "talent", "write"),
} as const;

export { HCM_PERMISSIONS };

const ROLE_ASSIGNMENTS: readonly RoleAssignment[] = [
  {
    role: PlatformRole.SystemAdministrator,
    permissions: [buildPermissionCode("platform", "system", "admin")],
  },
  {
    role: PlatformRole.PlatformAdministrator,
    permissions: [
      buildPermissionCode("platform", "users", "write"),
      buildPermissionCode("platform", "organizations", "write"),
      buildPermissionCode("platform", "security", "read"),
    ],
  },
  {
    role: PlatformRole.Auditor,
    permissions: [
      buildPermissionCode("platform", "audit", "read"),
      buildPermissionCode("platform", "security", "read"),
    ],
  },
  {
    role: OrganizationRole.OrganizationAdministrator,
    permissions: Object.values(HCM_PERMISSIONS),
  },
  {
    role: OrganizationRole.DepartmentManager,
    permissions: [
      HCM_PERMISSIONS.employeeRead,
      HCM_PERMISSIONS.employmentRead,
      HCM_PERMISSIONS.timeRead,
      HCM_PERMISSIONS.timeWrite,
      HCM_PERMISSIONS.timeApprove,
      HCM_PERMISSIONS.talentRead,
    ],
  },
  {
    role: OrganizationRole.Employee,
    permissions: [
      HCM_PERMISSIONS.employeeRead,
      HCM_PERMISSIONS.timeRead,
      HCM_PERMISSIONS.timeWrite,
      HCM_PERMISSIONS.talentRead,
    ],
  },
  {
    role: OrganizationRole.Guest,
    permissions: [HCM_PERMISSIONS.employeeRead, HCM_PERMISSIONS.timeRead],
  },
  {
    role: HcmRole.HrAdministrator,
    permissions: [
      HCM_PERMISSIONS.employeeRead,
      HCM_PERMISSIONS.employeeWrite,
      HCM_PERMISSIONS.orgRead,
      HCM_PERMISSIONS.orgWrite,
      HCM_PERMISSIONS.employmentRead,
      HCM_PERMISSIONS.employmentWrite,
      HCM_PERMISSIONS.recruitmentRead,
      HCM_PERMISSIONS.recruitmentWrite,
      HCM_PERMISSIONS.onboardingRead,
      HCM_PERMISSIONS.onboardingWrite,
    ],
  },
  {
    role: HcmRole.HrManager,
    permissions: [
      HCM_PERMISSIONS.employeeRead,
      HCM_PERMISSIONS.employeeWrite,
      HCM_PERMISSIONS.orgRead,
      HCM_PERMISSIONS.employmentRead,
      HCM_PERMISSIONS.recruitmentRead,
      HCM_PERMISSIONS.onboardingRead,
    ],
  },
  {
    role: HcmRole.Recruiter,
    permissions: [
      HCM_PERMISSIONS.recruitmentRead,
      HCM_PERMISSIONS.recruitmentWrite,
      HCM_PERMISSIONS.onboardingRead,
    ],
  },
  {
    role: HcmRole.PayrollAdministrator,
    permissions: [HCM_PERMISSIONS.payrollRead, HCM_PERMISSIONS.payrollWrite, HCM_PERMISSIONS.timeRead],
  },
  {
    role: HcmRole.PayrollManager,
    permissions: [HCM_PERMISSIONS.payrollRead, HCM_PERMISSIONS.timeRead, HCM_PERMISSIONS.timeApprove],
  },
  {
    role: HcmRole.LearningManager,
    permissions: [HCM_PERMISSIONS.talentRead, HCM_PERMISSIONS.talentWrite],
  },
];

/** Role registry with inheritance resolution for platform and domain roles. */
export class RoleRegistry {
  private readonly assignments = new Map<string, Set<PermissionCode>>();

  constructor(assignments: readonly RoleAssignment[] = ROLE_ASSIGNMENTS) {
    for (const assignment of assignments) {
      this.assignments.set(String(assignment.role), new Set(assignment.permissions));
    }
  }

  getPermissionsForRole(role: PlatformRole | OrganizationRole | HcmRole | RoleSlug): Set<PermissionCode> {
    return new Set(this.assignments.get(String(role)) ?? []);
  }

  resolveEffectivePermissions(identity: {
    role: RoleSlug;
    organizationRole: OrganizationRole;
    platformRole: PlatformRole;
    hcmRoles: readonly HcmRole[];
  }): Set<PermissionCode> {
    const effective = new Set<PermissionCode>();

    for (const code of this.getPermissionsForRole(identity.role)) {
      effective.add(code);
    }
    for (const code of this.getPermissionsForRole(identity.platformRole)) {
      effective.add(code);
    }
    for (const code of this.getPermissionsForRole(identity.organizationRole)) {
      effective.add(code);
    }
    for (const hcmRole of identity.hcmRoles) {
      for (const code of this.getPermissionsForRole(hcmRole)) {
        effective.add(code);
      }
    }

    if (identity.role === SystemRole.SuperAdmin) {
      for (const code of Object.values(HCM_PERMISSIONS)) {
        effective.add(code);
      }
      effective.add(buildPermissionCode("platform", "system", "admin"));
    }

    return effective;
  }
}

export const defaultRoleRegistry = new RoleRegistry();

export function resolveHcmRoles(role: RoleSlug): readonly HcmRole[] {
  return resolveHcmRolesForPlatformRole(role);
}
