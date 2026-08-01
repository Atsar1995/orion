import { randomUUID } from "crypto";
import type {
  AuditExportRecord,
  AuditReportingDashboardModel,
  AuditSearchQuery,
} from "@/types/enterprise-audit";
import type { ComplianceRepository } from "@/lib/platform/compliance/repositories/ComplianceRepository";
import type { ServiceContext } from "@/types/services";
import { publishComplianceEvent } from "@/lib/platform/compliance/compliance-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Audit reporting and export framework (Mission P-010.6). */
export class ReportingService {
  constructor(private readonly repository: ComplianceRepository) {}

  getDashboard(context: ServiceContext, periodLabel = "Current Period"): AuditReportingDashboardModel {
    const records = this.repository.listAudits(context.organizationId, { pageSize: 1000 });

    const byDomain: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const byRisk = { low: 0, medium: 0, high: 0, critical: 0 };
    const userCounts = new Map<string, number>();

    for (const record of records) {
      byDomain[record.domainKey] = (byDomain[record.domainKey] ?? 0) + 1;
      byAction[record.action] = (byAction[record.action] ?? 0) + 1;
      byRisk[record.riskClassification] += 1;
      userCounts.set(record.userId, (userCounts.get(record.userId) ?? 0) + 1);
    }

    const topUsers = [...userCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    return {
      organizationId: context.organizationId,
      periodLabel,
      totalEvents: records.length,
      byDomain,
      byAction,
      byRisk,
      topUsers,
    };
  }

  exportAudits(
    context: ServiceContext,
    query: AuditSearchQuery = {},
    format: "json" | "csv" = "json",
  ): AuditExportRecord {
    const records = this.repository.listAudits(context.organizationId, { ...query, pageSize: 1000 });
    const correlationId = `export-${randomUUID()}`;

    const exportRecord: AuditExportRecord = Object.freeze({
      id: `exp-${randomUUID()}`,
      organizationId: context.organizationId,
      exportedBy: context.userId ?? "system",
      recordCount: records.length,
      format,
      exportedAt: nowIso(),
      correlationId,
    });

    this.repository.appendExport(exportRecord);

    publishComplianceEvent(
      {
        eventType: "AuditExportGenerated",
        entityType: "audit_export",
        entityId: exportRecord.id,
        correlationId,
        payload: { format, recordCount: String(records.length) },
      },
      context,
    );

    return exportRecord;
  }

  listExports(context: ServiceContext): readonly AuditExportRecord[] {
    return this.repository.listExports(context.organizationId);
  }
}
