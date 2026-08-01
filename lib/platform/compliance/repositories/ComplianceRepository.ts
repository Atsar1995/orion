import type {
  AuditExportRecord,
  AuditReportingDashboardModel,
  ComplianceDashboardModel,
  ComplianceEventRecord,
  ComplianceExceptionRecord,
  EnterpriseAuditRecord,
  EntityChangeRecord,
  RetentionPolicyRecord,
  SecurityEventRecord,
  AuditSearchQuery,
} from "@/types/enterprise-audit";

/** Compliance repository contract (Mission P-010.6). */
export type ComplianceRepository = {
  readonly domain: string;

  appendAudit(record: EnterpriseAuditRecord): EnterpriseAuditRecord;
  findAudit(organizationId: string, auditId: string): EnterpriseAuditRecord | null;
  listAudits(organizationId: string, query?: AuditSearchQuery): readonly EnterpriseAuditRecord[];
  countAudits(organizationId: string, query?: AuditSearchQuery): number;
  findDuplicateAuditHash(organizationId: string, integrityHash: string): EnterpriseAuditRecord | null;

  appendChange(record: EntityChangeRecord): EntityChangeRecord;
  listEntityHistory(organizationId: string, entityType: string, entityId: string): readonly EntityChangeRecord[];

  appendSecurityEvent(record: SecurityEventRecord): SecurityEventRecord;
  listSecurityEvents(organizationId: string): readonly SecurityEventRecord[];

  appendComplianceEvent(record: ComplianceEventRecord): ComplianceEventRecord;
  listComplianceEvents(organizationId: string): readonly ComplianceEventRecord[];

  upsertRetentionPolicy(policy: RetentionPolicyRecord): RetentionPolicyRecord;
  findRetentionPolicy(organizationId: string, policyId: string): RetentionPolicyRecord | null;
  listRetentionPolicies(organizationId: string): readonly RetentionPolicyRecord[];

  appendException(record: ComplianceExceptionRecord): ComplianceExceptionRecord;
  listExceptions(organizationId: string): readonly ComplianceExceptionRecord[];

  appendExport(record: AuditExportRecord): AuditExportRecord;
  listExports(organizationId: string): readonly AuditExportRecord[];
};
