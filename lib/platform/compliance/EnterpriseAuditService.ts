import type {
  AuditSearchQuery,
  AuditSearchResult,
  EnterpriseAuditRecord,
  RecordAuditInput,
} from "@/types/enterprise-audit";
import type { ComplianceRepository } from "@/lib/platform/compliance/repositories/ComplianceRepository";
import {
  computeAuditDedupHash,
  computeIntegrityHash,
  createAuditId,
} from "@/lib/platform/compliance/repositories/InMemoryComplianceRepository";
import type { ServiceContext } from "@/types/services";
import { complianceRulesEngine } from "@/lib/platform/compliance/ComplianceRulesEngine";
import { publishComplianceEvent } from "@/lib/platform/compliance/compliance-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Primary enterprise audit service (Mission P-010.6). */
export class EnterpriseAuditService {
  constructor(private readonly repository: ComplianceRepository) {}

  record(input: RecordAuditInput, context: ServiceContext): EnterpriseAuditRecord {
    const errors = complianceRulesEngine.validateAuditInput(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const correlationError = complianceRulesEngine.validateCorrelationId(input.correlationId);
    if (correlationError) throw new Error(correlationError.code);

    const correlationId = input.correlationId ?? `corr-${createAuditId()}`;
    const dedupHash = computeAuditDedupHash({
      organizationId: context.organizationId,
      domainKey: input.domainKey,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      userId: context.userId ?? "system",
      sourceService: input.sourceService,
      correlationId,
      previousState: input.previousState,
      currentState: input.currentState,
      riskClassification: input.riskClassification ?? "low",
    });
    const duplicate = this.repository.findDuplicateAuditHash(context.organizationId, dedupHash);
    if (duplicate) throw new Error("DUPLICATE_AUDIT");

    const draft: Omit<EnterpriseAuditRecord, "id" | "integrityHash"> = {
      organizationId: context.organizationId,
      domainKey: input.domainKey,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      userId: context.userId ?? "system",
      timestamp: nowIso(),
      previousState: input.previousState,
      currentState: input.currentState,
      sourceService: input.sourceService,
      correlationId,
      ipAddress: input.ipAddress,
      clientInfo: input.clientInfo,
      riskClassification: input.riskClassification ?? "low",
    };

    const integrityHash = computeIntegrityHash(draft);
    const record: EnterpriseAuditRecord = Object.freeze({
      id: createAuditId(),
      ...draft,
      integrityHash,
    });

    this.repository.appendAudit(record);

    publishComplianceEvent(
      {
        eventType: "AuditRecorded",
        entityType: input.entityType,
        entityId: input.entityId,
        correlationId,
        payload: { action: input.action, auditId: record.id },
      },
      context,
    );

    return record;
  }

  get(auditId: string, context: ServiceContext): EnterpriseAuditRecord | null {
    const record = this.repository.findAudit(context.organizationId, auditId);
    if (!record) return null;
    const accessError = complianceRulesEngine.validateOrganizationAccess(record, context);
    if (accessError) throw new Error(accessError.code);
    return record;
  }

  search(context: ServiceContext, query: AuditSearchQuery = {}): AuditSearchResult {
    const errors = complianceRulesEngine.validateSearchQuery(query);
    if (errors.length > 0) throw new Error(errors[0].code);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const records = this.repository.listAudits(context.organizationId, query);
    const total = this.repository.countAudits(context.organizationId, query);

    return {
      total,
      page,
      pageSize,
      records,
    };
  }

  validateIntegrity(auditId: string, context: ServiceContext): boolean {
    const record = this.get(auditId, context);
    if (!record) return false;
    const { integrityHash, id: _id, ...rest } = record;
    return computeIntegrityHash(rest) === integrityHash;
  }
}
