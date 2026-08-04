import { describe, expect, it } from "vitest";
import { FinanceRole, HcmRole, OrganizationRole, PlatformRole, CrmRole } from "@/lib/platform/security/Role";
import { CRM_PERMISSIONS, HCM_PERMISSIONS, defaultRoleRegistry } from "@/lib/platform/security/RoleRegistry";
import { SystemRole } from "@/lib/auth/roles";

describe("RoleRegistry", () => {
  it("grants full HCM permissions to organization administrator profile", () => {
    const permissions = defaultRoleRegistry.getPermissionsForRole(OrganizationRole.OrganizationAdministrator);
    expect(permissions.has(HCM_PERMISSIONS.employeeWrite)).toBe(true);
    expect(permissions.has(HCM_PERMISSIONS.payrollWrite)).toBe(true);
  });

  it("grants limited permissions to employee profile", () => {
    const permissions = defaultRoleRegistry.getPermissionsForRole(OrganizationRole.Employee);
    expect(permissions.has(HCM_PERMISSIONS.employeeRead)).toBe(true);
    expect(permissions.has(HCM_PERMISSIONS.employeeWrite)).toBe(false);
  });

  it("composes platform, organization, and HCM role permissions", () => {
    const effective = defaultRoleRegistry.resolveEffectivePermissions({
      role: SystemRole.OrganizationAdmin,
      platformRole: PlatformRole.PlatformAdministrator,
      organizationRole: OrganizationRole.OrganizationAdministrator,
      hcmRoles: [HcmRole.HrAdministrator, HcmRole.PayrollManager],
      financeRoles: [FinanceRole.FinanceAdministrator],
      crmRoles: [],
    });

    expect(effective.has(HCM_PERMISSIONS.recruitmentWrite)).toBe(true);
    expect(effective.has(HCM_PERMISSIONS.timeApprove)).toBe(true);
  });

  it("grants super admin full HCM and platform permissions", () => {
    const effective = defaultRoleRegistry.resolveEffectivePermissions({
      role: SystemRole.SuperAdmin,
      platformRole: PlatformRole.SystemAdministrator,
      organizationRole: OrganizationRole.OrganizationOwner,
      hcmRoles: [],
      financeRoles: [FinanceRole.FinanceAdministrator],
      crmRoles: [CrmRole.CrmAdministrator],
    });

    expect(effective.has(HCM_PERMISSIONS.orgWrite)).toBe(true);
  });

  it("grants CRM permissions to CRM administrator profile", () => {
    const permissions = defaultRoleRegistry.getPermissionsForRole(CrmRole.CrmAdministrator);
    expect(permissions.has(CRM_PERMISSIONS.leadCreate)).toBe(true);
    expect(permissions.has(CRM_PERMISSIONS.eventReplay)).toBe(true);
  });
});
