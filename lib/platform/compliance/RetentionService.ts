import { randomUUID } from "crypto";
import type { RetentionPolicyRecord } from "@/types/enterprise-audit";
import type { ComplianceRepository } from "@/lib/platform/compliance/repositories/ComplianceRepository";
import type { ServiceContext } from "@/types/services";
import { complianceRulesEngine } from "@/lib/platform/compliance/ComplianceRulesEngine";
import { publishComplianceEvent } from "@/lib/platform/compliance/compliance-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Retention policy framework (Mission P-010.6). */
export class RetentionService {
  constructor(private readonly repository: ComplianceRepository) {}

  listPolicies(context: ServiceContext): readonly RetentionPolicyRecord[] {
    return this.repository.listRetentionPolicies(context.organizationId);
  }

  getPolicy(policyId: string, context: ServiceContext): RetentionPolicyRecord | null {
    return this.repository.findRetentionPolicy(context.organizationId, policyId);
  }

  upsertPolicy(
    input: {
      readonly domainKey: string;
      readonly entityType: string;
      readonly retentionDays: number;
      readonly archiveAfterDays?: number;
      readonly active?: boolean;
    },
    context: ServiceContext,
  ): RetentionPolicyRecord {
    if (context.role !== "super_admin" && context.role !== "organization_admin" && context.role !== "administrator") {
      throw new Error("PERMISSION_DENIED");
    }

    const draft = {
      organizationId: context.organizationId,
      domainKey: input.domainKey,
      entityType: input.entityType,
      retentionDays: input.retentionDays,
      archiveAfterDays: input.archiveAfterDays,
      active: input.active ?? true,
    };

    const errors = complianceRulesEngine.validateRetentionPolicy(draft);
    if (errors.length > 0) throw new Error(errors[0].code);

    const existing = this.repository
      .listRetentionPolicies(context.organizationId)
      .find((policy) => policy.domainKey === input.domainKey && policy.entityType === input.entityType);

    const policy: RetentionPolicyRecord = {
      id: existing?.id ?? `ret-${randomUUID()}`,
      ...draft,
      updatedAt: nowIso(),
    };

    return this.repository.upsertRetentionPolicy(policy);
  }

  evaluateExpired(
    context: ServiceContext,
    entityCreatedAt: string,
    domainKey: string,
    entityType: string,
  ): { expired: boolean; policy?: RetentionPolicyRecord } {
    const policy = this.repository
      .listRetentionPolicies(context.organizationId)
      .find((entry) => entry.active && entry.domainKey === domainKey && entry.entityType === entityType);

    if (!policy) return { expired: false };

    const created = new Date(entityCreatedAt).getTime();
    const expiry = created + policy.retentionDays * 24 * 60 * 60 * 1000;
    const expired = Date.now() >= expiry;

    if (expired) {
      publishComplianceEvent(
        {
          eventType: "RetentionExpired",
          entityType,
          entityId: `${domainKey}:${entityType}`,
          payload: { policyId: policy.id, retentionDays: String(policy.retentionDays) },
        },
        context,
      );
    }

    return { expired, policy };
  }
}
