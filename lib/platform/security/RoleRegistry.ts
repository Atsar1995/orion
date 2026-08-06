/**
 * Role registry — role-to-permission assignments (Mission P-015.6 · ADR-009).
 */

import { buildPermissionCode, type PermissionCode } from "@/lib/platform/security/Permission";
import {
  CrmRole,
  FinanceRole,
  HcmRole,
  OrganizationRole,
  PlatformRole,
  ProcurementRole,
  resolveHcmRolesForPlatformRole,
} from "@/lib/platform/security/Role";
import { FINANCE_PERMISSIONS } from "@/lib/finance/security/finance-permission-catalog";
import { CRM_PERMISSIONS } from "@/lib/crm/security/crm-permission-catalog";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { RoleSlug } from "@/types/auth";
import { SystemRole } from "@/lib/auth/roles";

export type RoleAssignment = {
  readonly role:
    | PlatformRole
    | OrganizationRole
    | HcmRole
    | FinanceRole
    | CrmRole
    | ProcurementRole
    | RoleSlug;
  readonly permissions: readonly PermissionCode[];
  readonly inherits?: readonly (
    | PlatformRole
    | OrganizationRole
    | HcmRole
    | FinanceRole
    | CrmRole
    | ProcurementRole
    | RoleSlug
  )[];
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
export { FINANCE_PERMISSIONS };
export { CRM_PERMISSIONS };
export { PROCUREMENT_PERMISSIONS };

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
    permissions: [
      ...Object.values(HCM_PERMISSIONS),
      ...Object.values(FINANCE_PERMISSIONS),
      ...Object.values(CRM_PERMISSIONS),
      ...Object.values(PROCUREMENT_PERMISSIONS),
    ],
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
  {
    role: FinanceRole.FinanceAdministrator,
    permissions: Object.values(FINANCE_PERMISSIONS),
  },
  {
    role: FinanceRole.Controller,
    permissions: [
      FINANCE_PERMISSIONS.journalRead,
      FINANCE_PERMISSIONS.journalPost,
      FINANCE_PERMISSIONS.journalReverse,
      FINANCE_PERMISSIONS.periodRead,
      FINANCE_PERMISSIONS.periodClose,
      FINANCE_PERMISSIONS.coaRead,
      FINANCE_PERMISSIONS.auditRead,
      FINANCE_PERMISSIONS.intelligenceRead,
      FINANCE_PERMISSIONS.paymentRead,
    ],
  },
  {
    role: FinanceRole.Accountant,
    permissions: [
      FINANCE_PERMISSIONS.journalRead,
      FINANCE_PERMISSIONS.journalCreate,
      FINANCE_PERMISSIONS.journalPost,
      FINANCE_PERMISSIONS.coaRead,
      FINANCE_PERMISSIONS.periodRead,
      FINANCE_PERMISSIONS.paymentRead,
    ],
  },
  {
    role: FinanceRole.AccountsPayable,
    permissions: [
      FINANCE_PERMISSIONS.journalRead,
      FINANCE_PERMISSIONS.paymentRead,
      FINANCE_PERMISSIONS.paymentWrite,
      FINANCE_PERMISSIONS.coaRead,
      FINANCE_PERMISSIONS.periodRead,
    ],
  },
  {
    role: FinanceRole.AccountsReceivable,
    permissions: [
      FINANCE_PERMISSIONS.journalRead,
      FINANCE_PERMISSIONS.paymentRead,
      FINANCE_PERMISSIONS.coaRead,
      FINANCE_PERMISSIONS.periodRead,
    ],
  },
  {
    role: FinanceRole.Auditor,
    permissions: [
      FINANCE_PERMISSIONS.journalRead,
      FINANCE_PERMISSIONS.coaRead,
      FINANCE_PERMISSIONS.periodRead,
      FINANCE_PERMISSIONS.auditRead,
      FINANCE_PERMISSIONS.intelligenceRead,
      FINANCE_PERMISSIONS.paymentRead,
    ],
  },
  {
    role: FinanceRole.Executive,
    permissions: [
      FINANCE_PERMISSIONS.intelligenceRead,
      FINANCE_PERMISSIONS.journalRead,
      FINANCE_PERMISSIONS.periodRead,
      FINANCE_PERMISSIONS.coaRead,
    ],
  },
  {
    role: FinanceRole.ReadOnly,
    permissions: [
      FINANCE_PERMISSIONS.journalRead,
      FINANCE_PERMISSIONS.coaRead,
      FINANCE_PERMISSIONS.periodRead,
      FINANCE_PERMISSIONS.intelligenceRead,
      FINANCE_PERMISSIONS.paymentRead,
    ],
  },
  {
    role: CrmRole.CrmAdministrator,
    permissions: Object.values(CRM_PERMISSIONS),
  },
  {
    role: CrmRole.SalesDirector,
    permissions: [
      CRM_PERMISSIONS.accountRead,
      CRM_PERMISSIONS.accountWrite,
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.contactWrite,
      CRM_PERMISSIONS.organizationRead,
      CRM_PERMISSIONS.organizationWrite,
      CRM_PERMISSIONS.leadRead,
      CRM_PERMISSIONS.leadCreate,
      CRM_PERMISSIONS.leadQualify,
      CRM_PERMISSIONS.opportunityRead,
      CRM_PERMISSIONS.opportunityWrite,
      CRM_PERMISSIONS.quoteRead,
      CRM_PERMISSIONS.quoteWrite,
      CRM_PERMISSIONS.salesOrderRead,
      CRM_PERMISSIONS.salesOrderWrite,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.activityWrite,
      CRM_PERMISSIONS.intelligenceRead,
      CRM_PERMISSIONS.auditRead,
    ],
  },
  {
    role: CrmRole.SalesManager,
    permissions: [
      CRM_PERMISSIONS.accountRead,
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.organizationRead,
      CRM_PERMISSIONS.leadRead,
      CRM_PERMISSIONS.leadCreate,
      CRM_PERMISSIONS.leadQualify,
      CRM_PERMISSIONS.opportunityRead,
      CRM_PERMISSIONS.opportunityWrite,
      CRM_PERMISSIONS.quoteRead,
      CRM_PERMISSIONS.quoteWrite,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.activityWrite,
      CRM_PERMISSIONS.intelligenceRead,
    ],
  },
  {
    role: CrmRole.SalesExecutive,
    permissions: [
      CRM_PERMISSIONS.accountRead,
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.organizationRead,
      CRM_PERMISSIONS.leadRead,
      CRM_PERMISSIONS.leadCreate,
      CRM_PERMISSIONS.opportunityRead,
      CRM_PERMISSIONS.opportunityWrite,
      CRM_PERMISSIONS.quoteRead,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.activityWrite,
    ],
  },
  {
    role: CrmRole.AccountManager,
    permissions: [
      CRM_PERMISSIONS.accountRead,
      CRM_PERMISSIONS.accountWrite,
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.contactWrite,
      CRM_PERMISSIONS.organizationRead,
      CRM_PERMISSIONS.organizationWrite,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.activityWrite,
      CRM_PERMISSIONS.intelligenceRead,
      CRM_PERMISSIONS.caseRead,
    ],
  },
  {
    role: CrmRole.CustomerSuccess,
    permissions: [
      CRM_PERMISSIONS.accountRead,
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.contactWrite,
      CRM_PERMISSIONS.caseRead,
      CRM_PERMISSIONS.caseWrite,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.activityWrite,
    ],
  },
  {
    role: CrmRole.SupportAgent,
    permissions: [
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.caseRead,
      CRM_PERMISSIONS.caseWrite,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.activityWrite,
    ],
  },
  {
    role: CrmRole.CrmAuditor,
    permissions: [
      CRM_PERMISSIONS.accountRead,
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.organizationRead,
      CRM_PERMISSIONS.leadRead,
      CRM_PERMISSIONS.opportunityRead,
      CRM_PERMISSIONS.quoteRead,
      CRM_PERMISSIONS.salesOrderRead,
      CRM_PERMISSIONS.caseRead,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.auditRead,
      CRM_PERMISSIONS.intelligenceRead,
    ],
  },
  {
    role: CrmRole.CrmReadOnly,
    permissions: [
      CRM_PERMISSIONS.accountRead,
      CRM_PERMISSIONS.contactRead,
      CRM_PERMISSIONS.organizationRead,
      CRM_PERMISSIONS.leadRead,
      CRM_PERMISSIONS.opportunityRead,
      CRM_PERMISSIONS.quoteRead,
      CRM_PERMISSIONS.salesOrderRead,
      CRM_PERMISSIONS.caseRead,
      CRM_PERMISSIONS.activityRead,
      CRM_PERMISSIONS.intelligenceRead,
    ],
  },
  {
    role: ProcurementRole.ProcurementAdministrator,
    permissions: Object.values(PROCUREMENT_PERMISSIONS),
  },
  {
    role: ProcurementRole.ProcurementDirector,
    permissions: [
      PROCUREMENT_PERMISSIONS.supplierRead,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      PROCUREMENT_PERMISSIONS.vendorApprove,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      PROCUREMENT_PERMISSIONS.requisitionApprove,
      PROCUREMENT_PERMISSIONS.rfqRead,
      PROCUREMENT_PERMISSIONS.rfqWrite,
      PROCUREMENT_PERMISSIONS.quotationRead,
      PROCUREMENT_PERMISSIONS.quotationWrite,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      PROCUREMENT_PERMISSIONS.purchaseOrderApprove,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      PROCUREMENT_PERMISSIONS.invoiceRead,
      PROCUREMENT_PERMISSIONS.invoiceWrite,
      PROCUREMENT_PERMISSIONS.invoiceApprove,
      PROCUREMENT_PERMISSIONS.invoiceReject,
      PROCUREMENT_PERMISSIONS.contractRead,
      PROCUREMENT_PERMISSIONS.contractWrite,
      PROCUREMENT_PERMISSIONS.auditRead,
      PROCUREMENT_PERMISSIONS.intelligenceRead,
    ],
  },
  {
    role: ProcurementRole.ProcurementManager,
    permissions: [
      PROCUREMENT_PERMISSIONS.supplierRead,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      PROCUREMENT_PERMISSIONS.requisitionApprove,
      PROCUREMENT_PERMISSIONS.rfqRead,
      PROCUREMENT_PERMISSIONS.quotationRead,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      PROCUREMENT_PERMISSIONS.purchaseOrderApprove,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      PROCUREMENT_PERMISSIONS.invoiceRead,
      PROCUREMENT_PERMISSIONS.intelligenceRead,
    ],
  },
  {
    role: ProcurementRole.Buyer,
    permissions: [
      PROCUREMENT_PERMISSIONS.supplierRead,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      PROCUREMENT_PERMISSIONS.rfqRead,
      PROCUREMENT_PERMISSIONS.rfqWrite,
      PROCUREMENT_PERMISSIONS.quotationRead,
      PROCUREMENT_PERMISSIONS.quotationWrite,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      PROCUREMENT_PERMISSIONS.contractRead,
    ],
  },
  {
    role: ProcurementRole.PurchasingOfficer,
    permissions: [
      PROCUREMENT_PERMISSIONS.supplierRead,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
      PROCUREMENT_PERMISSIONS.purchaseOrderApprove,
      PROCUREMENT_PERMISSIONS.contractRead,
    ],
  },
  {
    role: ProcurementRole.ReceivingOfficer,
    permissions: [
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
    ],
  },
  {
    role: ProcurementRole.SupplierManager,
    permissions: [
      PROCUREMENT_PERMISSIONS.supplierRead,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      PROCUREMENT_PERMISSIONS.vendorApprove,
      PROCUREMENT_PERMISSIONS.contractRead,
      PROCUREMENT_PERMISSIONS.contractWrite,
    ],
  },
  {
    role: ProcurementRole.ProcurementAuditor,
    permissions: [
      PROCUREMENT_PERMISSIONS.supplierRead,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      PROCUREMENT_PERMISSIONS.rfqRead,
      PROCUREMENT_PERMISSIONS.quotationRead,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      PROCUREMENT_PERMISSIONS.invoiceRead,
      PROCUREMENT_PERMISSIONS.contractRead,
      PROCUREMENT_PERMISSIONS.auditRead,
      PROCUREMENT_PERMISSIONS.intelligenceRead,
    ],
  },
  {
    role: ProcurementRole.ProcurementReadOnly,
    permissions: [
      PROCUREMENT_PERMISSIONS.supplierRead,
      PROCUREMENT_PERMISSIONS.requisitionRead,
      PROCUREMENT_PERMISSIONS.rfqRead,
      PROCUREMENT_PERMISSIONS.quotationRead,
      PROCUREMENT_PERMISSIONS.purchaseOrderRead,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      PROCUREMENT_PERMISSIONS.invoiceRead,
      PROCUREMENT_PERMISSIONS.contractRead,
      PROCUREMENT_PERMISSIONS.intelligenceRead,
    ],
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

  getPermissionsForRole(
    role:
      | PlatformRole
      | OrganizationRole
      | HcmRole
      | FinanceRole
      | CrmRole
      | ProcurementRole
      | RoleSlug,
  ): Set<PermissionCode> {
    return new Set(this.assignments.get(String(role)) ?? []);
  }

  resolveEffectivePermissions(identity: {
    role: RoleSlug;
    organizationRole: OrganizationRole;
    platformRole: PlatformRole;
    hcmRoles: readonly HcmRole[];
    financeRoles: readonly FinanceRole[];
    crmRoles: readonly CrmRole[];
    procurementRoles: readonly ProcurementRole[];
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
    for (const financeRole of identity.financeRoles) {
      for (const code of this.getPermissionsForRole(financeRole)) {
        effective.add(code);
      }
    }
    for (const crmRole of identity.crmRoles) {
      for (const code of this.getPermissionsForRole(crmRole)) {
        effective.add(code);
      }
    }
    for (const procurementRole of identity.procurementRoles) {
      for (const code of this.getPermissionsForRole(procurementRole)) {
        effective.add(code);
      }
    }

    if (identity.role === SystemRole.SuperAdmin) {
      for (const code of Object.values(HCM_PERMISSIONS)) {
        effective.add(code);
      }
      for (const code of Object.values(FINANCE_PERMISSIONS)) {
        effective.add(code);
      }
      for (const code of Object.values(CRM_PERMISSIONS)) {
        effective.add(code);
      }
      for (const code of Object.values(PROCUREMENT_PERMISSIONS)) {
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
