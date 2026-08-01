import { createHash, randomUUID } from "crypto";
import type {
  AuditExportRecord,
  AuditSearchQuery,
  ComplianceEventRecord,
  ComplianceExceptionRecord,
  EnterpriseAuditRecord,
  EntityChangeRecord,
  RetentionPolicyRecord,
  SecurityEventRecord,
} from "@/types/enterprise-audit";
import type { ComplianceRepository } from "@/lib/platform/compliance/repositories/ComplianceRepository";
import { seedComplianceData } from "@/lib/platform/compliance/data/seed-compliance";

/** In-memory compliance repository with append-only audit storage (Mission P-010.6). */
export class InMemoryComplianceRepository implements ComplianceRepository {
  readonly domain = "platform" as const;

  private readonly audits: EnterpriseAuditRecord[] = [];
  private readonly auditHashes = new Set<string>();
  private readonly changes: EntityChangeRecord[] = [];
  private readonly securityEvents: SecurityEventRecord[] = [];
  private readonly complianceEvents: ComplianceEventRecord[] = [];
  private readonly retentionPolicies = new Map<string, RetentionPolicyRecord>();
  private readonly exceptions: ComplianceExceptionRecord[] = [];
  private readonly exports: AuditExportRecord[] = [];

  constructor(seedOrganizationId = "org-orania") {
    const seed = seedComplianceData(seedOrganizationId);
    for (const audit of seed.audits) {
      this.audits.push(audit);
      this.auditHashes.add(`${audit.organizationId}:${audit.integrityHash}`);
      this.auditHashes.add(`${audit.organizationId}:${computeAuditDedupHash(audit)}`);
    }
    this.securityEvents.push(...seed.securityEvents);
    this.complianceEvents.push(...seed.complianceEvents);
    for (const policy of seed.retentionPolicies) {
      this.retentionPolicies.set(policy.id, policy);
    }
  }

  appendAudit(record: EnterpriseAuditRecord): EnterpriseAuditRecord {
    this.audits.push(Object.freeze({ ...record }));
    this.auditHashes.add(`${record.organizationId}:${record.integrityHash}`);
    this.auditHashes.add(`${record.organizationId}:${computeAuditDedupHash(record)}`);
    return record;
  }

  findAudit(organizationId: string, auditId: string): EnterpriseAuditRecord | null {
    return this.audits.find((record) => record.organizationId === organizationId && record.id === auditId) ?? null;
  }

  private filterAudits(organizationId: string, query: AuditSearchQuery = {}): EnterpriseAuditRecord[] {
    let results = this.audits.filter((record) => record.organizationId === organizationId);

    if (query.domainKey) results = results.filter((r) => r.domainKey === query.domainKey);
    if (query.entityType) results = results.filter((r) => r.entityType === query.entityType);
    if (query.entityId) results = results.filter((r) => r.entityId === query.entityId);
    if (query.userId) results = results.filter((r) => r.userId === query.userId);
    if (query.action) results = results.filter((r) => r.action === query.action);
    if (query.riskClassification) results = results.filter((r) => r.riskClassification === query.riskClassification);
    if (query.correlationId) results = results.filter((r) => r.correlationId === query.correlationId);
    if (query.dateFrom) results = results.filter((r) => r.timestamp >= query.dateFrom!);
    if (query.dateTo) results = results.filter((r) => r.timestamp <= query.dateTo!);

    return results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  listAudits(organizationId: string, query: AuditSearchQuery = {}): readonly EnterpriseAuditRecord[] {
    const results = this.filterAudits(organizationId, query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }

  countAudits(organizationId: string, query: AuditSearchQuery = {}): number {
    return this.filterAudits(organizationId, query).length;
  }

  findDuplicateAuditHash(organizationId: string, hash: string): EnterpriseAuditRecord | null {
    if (!this.auditHashes.has(`${organizationId}:${hash}`)) return null;
    return (
      this.audits.find((r) => r.organizationId === organizationId && r.integrityHash === hash) ??
      this.audits.find((r) => r.organizationId === organizationId && computeAuditDedupHash(r) === hash) ??
      null
    );
  }

  appendChange(record: EntityChangeRecord): EntityChangeRecord {
    this.changes.push(Object.freeze({ ...record }));
    return record;
  }

  listEntityHistory(organizationId: string, entityType: string, entityId: string): readonly EntityChangeRecord[] {
    return this.changes
      .filter(
        (record) =>
          record.organizationId === organizationId &&
          record.entityType === entityType &&
          record.entityId === entityId,
      )
      .sort((a, b) => b.changedAt.localeCompare(a.changedAt));
  }

  appendSecurityEvent(record: SecurityEventRecord): SecurityEventRecord {
    this.securityEvents.push(Object.freeze({ ...record }));
    return record;
  }

  listSecurityEvents(organizationId: string): readonly SecurityEventRecord[] {
    return this.securityEvents.filter((record) => record.organizationId === organizationId);
  }

  appendComplianceEvent(record: ComplianceEventRecord): ComplianceEventRecord {
    this.complianceEvents.push(Object.freeze({ ...record }));
    return record;
  }

  listComplianceEvents(organizationId: string): readonly ComplianceEventRecord[] {
    return this.complianceEvents.filter((record) => record.organizationId === organizationId);
  }

  upsertRetentionPolicy(policy: RetentionPolicyRecord): RetentionPolicyRecord {
    this.retentionPolicies.set(policy.id, policy);
    return policy;
  }

  findRetentionPolicy(organizationId: string, policyId: string): RetentionPolicyRecord | null {
    const record = this.retentionPolicies.get(policyId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listRetentionPolicies(organizationId: string): readonly RetentionPolicyRecord[] {
    return [...this.retentionPolicies.values()].filter((policy) => policy.organizationId === organizationId);
  }

  appendException(record: ComplianceExceptionRecord): ComplianceExceptionRecord {
    this.exceptions.push(Object.freeze({ ...record }));
    return record;
  }

  listExceptions(organizationId: string): readonly ComplianceExceptionRecord[] {
    return this.exceptions.filter((record) => record.organizationId === organizationId);
  }

  appendExport(record: AuditExportRecord): AuditExportRecord {
    this.exports.push(Object.freeze({ ...record }));
    return record;
  }

  listExports(organizationId: string): readonly AuditExportRecord[] {
    return this.exports.filter((record) => record.organizationId === organizationId);
  }

}

export const defaultComplianceRepository = new InMemoryComplianceRepository();

export function createAuditId(): string {
  return `aud-${randomUUID()}`;
}

export function createChangeId(): string {
  return `chg-${randomUUID()}`;
}

export function computeIntegrityHash(record: Omit<EnterpriseAuditRecord, "id" | "integrityHash">): string {
  const payload = [
    record.organizationId,
    record.domainKey,
    record.entityType,
    record.entityId,
    record.action,
    record.userId,
    record.timestamp,
    record.sourceService,
    record.correlationId,
    record.previousState ?? "",
    record.currentState ?? "",
  ].join("|");
  return createHash("sha256").update(payload).digest("hex");
}

/** Content fingerprint for duplicate audit detection (excludes timestamp). */
export function computeAuditDedupHash(
  record: Omit<EnterpriseAuditRecord, "id" | "integrityHash" | "timestamp">,
): string {
  const payload = [
    record.organizationId,
    record.domainKey,
    record.entityType,
    record.entityId,
    record.action,
    record.userId,
    record.sourceService,
    record.correlationId,
    record.previousState ?? "",
    record.currentState ?? "",
    record.riskClassification ?? "low",
  ].join("|");
  return createHash("sha256").update(payload).digest("hex");
}
