import type { AuditRiskClassification, EntityChangeRecord } from "@/types/enterprise-audit";
import type { ComplianceRepository } from "@/lib/platform/compliance/repositories/ComplianceRepository";
import { createChangeId } from "@/lib/platform/compliance/repositories/InMemoryComplianceRepository";
import type { ServiceContext } from "@/types/services";

function nowIso(): string {
  return new Date().toISOString();
}

/** Entity change history and user activity logging (Mission P-010.6). */
export class EntityHistoryService {
  constructor(private readonly repository: ComplianceRepository) {}

  recordChange(
    input: {
      readonly domainKey: string;
      readonly entityType: string;
      readonly entityId: string;
      readonly field: string;
      readonly previousValue?: string;
      readonly currentValue?: string;
      readonly correlationId?: string;
    },
    context: ServiceContext,
  ): EntityChangeRecord {
    if (!input.field.trim()) throw new Error("INVALID_FIELD");

    const record: EntityChangeRecord = Object.freeze({
      id: createChangeId(),
      organizationId: context.organizationId,
      domainKey: input.domainKey,
      entityType: input.entityType,
      entityId: input.entityId,
      field: input.field,
      previousValue: input.previousValue,
      currentValue: input.currentValue,
      changedBy: context.userId ?? "system",
      changedAt: nowIso(),
      correlationId: input.correlationId ?? `corr-${createChangeId()}`,
    });

    return this.repository.appendChange(record);
  }

  getEntityHistory(
    entityType: string,
    entityId: string,
    context: ServiceContext,
  ): readonly EntityChangeRecord[] {
    return this.repository.listEntityHistory(context.organizationId, entityType, entityId);
  }

  recordSecurityEvent(
    input: {
      readonly eventType: string;
      readonly severity: AuditRiskClassification;
      readonly detail: string;
      readonly sourceService: string;
      readonly userId?: string;
      readonly correlationId?: string;
    },
    context: ServiceContext,
  ) {
    return this.repository.appendSecurityEvent({
      id: `sec-${createChangeId()}`,
      organizationId: context.organizationId,
      eventType: input.eventType,
      userId: input.userId ?? context.userId,
      severity: input.severity,
      detail: input.detail,
      sourceService: input.sourceService,
      timestamp: nowIso(),
      correlationId: input.correlationId ?? `corr-${createChangeId()}`,
    });
  }

  listSecurityEvents(context: ServiceContext) {
    return this.repository.listSecurityEvents(context.organizationId);
  }
}
