import { randomUUID } from "crypto";
import type {
  ComplianceCategory,
  ComplianceEventRecord,
  ComplianceExceptionRecord,
} from "@/types/enterprise-audit";
import type { ComplianceRepository } from "@/lib/platform/compliance/repositories/ComplianceRepository";
import type { ServiceContext } from "@/types/services";
import { complianceRulesEngine } from "@/lib/platform/compliance/ComplianceRulesEngine";
import { publishComplianceEvent } from "@/lib/platform/compliance/compliance-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Compliance event registry and governance (Mission P-010.6). */
export class ComplianceService {
  constructor(private readonly repository: ComplianceRepository) {}

  listEvents(context: ServiceContext): readonly ComplianceEventRecord[] {
    return this.repository.listComplianceEvents(context.organizationId);
  }

  recordEvent(
    input: {
      readonly category: ComplianceCategory;
      readonly policyReference: string;
      readonly description: string;
      readonly violation: boolean;
      readonly evidenceReference?: string;
      readonly correlationId?: string;
    },
    context: ServiceContext,
  ): ComplianceEventRecord {
    const categoryError = complianceRulesEngine.validateCategory(input.category);
    if (categoryError) throw new Error(categoryError.code);
    if (!input.policyReference.trim()) throw new Error("INVALID_POLICY_REFERENCE");

    const record: ComplianceEventRecord = Object.freeze({
      id: `comp-${randomUUID()}`,
      organizationId: context.organizationId,
      category: input.category,
      policyReference: input.policyReference,
      evidenceReference: input.evidenceReference,
      description: input.description,
      violation: input.violation,
      recordedAt: nowIso(),
      recordedBy: context.userId ?? "system",
      correlationId: input.correlationId ?? `corr-${randomUUID()}`,
    });

    this.repository.appendComplianceEvent(record);

    if (input.violation) {
      publishComplianceEvent(
        {
          eventType: "ComplianceViolationDetected",
          entityType: "compliance_event",
          entityId: record.id,
          correlationId: record.correlationId,
          payload: { category: input.category, policyReference: input.policyReference },
        },
        context,
      );
    }

    return record;
  }

  recordException(
    input: {
      readonly category: ComplianceCategory;
      readonly policyReference: string;
      readonly reason: string;
      readonly expiresAt?: string;
    },
    context: ServiceContext,
  ): ComplianceExceptionRecord {
    if (context.role !== "super_admin" && context.role !== "organization_admin" && context.role !== "administrator") {
      throw new Error("PERMISSION_DENIED");
    }

    const record: ComplianceExceptionRecord = Object.freeze({
      id: `exc-${randomUUID()}`,
      organizationId: context.organizationId,
      category: input.category,
      policyReference: input.policyReference,
      reason: input.reason,
      approvedBy: context.userId ?? "system",
      expiresAt: input.expiresAt,
      recordedAt: nowIso(),
    });

    return this.repository.appendException(record);
  }

  listExceptions(context: ServiceContext): readonly ComplianceExceptionRecord[] {
    return this.repository.listExceptions(context.organizationId);
  }

  getDashboard(context: ServiceContext) {
    const events = this.listEvents(context);
    const violations = events.filter((event) => event.violation);
    const securityEvents = this.repository.listSecurityEvents(context.organizationId);

    const riskBreakdown: Record<import("@/types/enterprise-audit").AuditRiskClassification, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    const audits = this.repository.listAudits(context.organizationId);
    for (const audit of audits) {
      riskBreakdown[audit.riskClassification] += 1;
    }

    return {
      organizationId: context.organizationId,
      totalAuditRecords: audits.length,
      violationsDetected: violations.length,
      securityEvents: securityEvents.length,
      retentionPolicies: this.repository.listRetentionPolicies(context.organizationId).length,
      exceptionsActive: this.repository.listExceptions(context.organizationId).length,
      recentViolations: violations.slice(0, 5),
      riskBreakdown,
    };
  }
}
