import type {
  ComplianceEventRecord,
  EnterpriseAuditRecord,
  RetentionPolicyRecord,
  SecurityEventRecord,
} from "@/types/enterprise-audit";
import { computeIntegrityHash } from "@/lib/platform/compliance/repositories/InMemoryComplianceRepository";

const NOW = "2026-06-15T08:00:00.000Z";
const ORG = "org-orania";

function audit(
  id: string,
  domainKey: string,
  entityType: string,
  entityId: string,
  action: EnterpriseAuditRecord["action"],
  userId: string,
  risk: EnterpriseAuditRecord["riskClassification"],
  sourceService: string,
): EnterpriseAuditRecord {
  const draft = {
    organizationId: ORG,
    domainKey,
    entityType,
    entityId,
    action,
    userId,
    timestamp: NOW,
    sourceService,
    correlationId: `corr-${id}`,
    riskClassification: risk,
  };
  return {
    id,
    ...draft,
    integrityHash: computeIntegrityHash(draft),
  };
}

/** Seed compliance data for org-orania (Mission P-010.6). */
export function seedComplianceData(organizationId: string): {
  audits: EnterpriseAuditRecord[];
  securityEvents: SecurityEventRecord[];
  complianceEvents: ComplianceEventRecord[];
  retentionPolicies: RetentionPolicyRecord[];
} {
  const audits: EnterpriseAuditRecord[] = [
    audit("aud-001", "platform", "user", "user-executive", "login", "user-executive", "low", "identity-service"),
    audit("aud-002", "platform", "document", "doc-contract-001", "document_accessed", "user-executive", "medium", "document-service"),
    audit("aud-003", "finance", "journal_entry", "je-2026-001", "financial_posting", "user-manager", "high", "finance-journal"),
    audit("aud-004", "platform", "role", "role-manager", "permission_granted", "user-org-admin", "high", "organization-platform"),
    audit("aud-005", "platform", "workflow_instance", "wf-inst-001", "workflow_completed", "user-manager", "medium", "workflow-platform"),
  ].map((record) => ({ ...record, organizationId }));

  const securityEvents: SecurityEventRecord[] = [
    {
      id: "sec-001",
      organizationId,
      eventType: "auth.login.success",
      userId: "user-executive",
      severity: "low",
      detail: "Successful executive login",
      sourceService: "identity-service",
      timestamp: NOW,
      correlationId: "corr-sec-001",
    },
    {
      id: "sec-002",
      organizationId,
      eventType: "authorization.denied",
      userId: "user-analyst",
      severity: "medium",
      detail: "Access denied to finance posting endpoint",
      sourceService: "identity-service",
      timestamp: NOW,
      correlationId: "corr-sec-002",
    },
  ];

  const complianceEvents: ComplianceEventRecord[] = [
    {
      id: "comp-001",
      organizationId,
      category: "financial",
      policyReference: "FIN-RET-001",
      evidenceReference: "je-2026-001",
      description: "Journal posting within open fiscal period",
      violation: false,
      recordedAt: NOW,
      recordedBy: "system",
      correlationId: "corr-comp-001",
    },
    {
      id: "comp-002",
      organizationId,
      category: "security",
      policyReference: "SEC-ACCESS-001",
      description: "Repeated authorization denial for analyst role",
      violation: true,
      recordedAt: NOW,
      recordedBy: "compliance-service",
      correlationId: "corr-comp-002",
    },
  ];

  const retentionPolicies: RetentionPolicyRecord[] = [
    {
      id: "ret-audit",
      organizationId,
      domainKey: "platform",
      entityType: "audit_record",
      retentionDays: 2555,
      archiveAfterDays: 365,
      active: true,
      updatedAt: NOW,
    },
    {
      id: "ret-document",
      organizationId,
      domainKey: "platform",
      entityType: "document",
      retentionDays: 1825,
      archiveAfterDays: 730,
      active: true,
      updatedAt: NOW,
    },
    {
      id: "ret-finance",
      organizationId,
      domainKey: "finance",
      entityType: "journal_entry",
      retentionDays: 3650,
      active: true,
      updatedAt: NOW,
    },
  ];

  return { audits, securityEvents, complianceEvents, retentionPolicies };
}

export const SEED_ORG_ID = ORG;
