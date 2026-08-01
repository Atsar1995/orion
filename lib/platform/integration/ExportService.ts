import { randomUUID } from "crypto";
import type { ExportJobRecord, ExportRequestInput } from "@/types/integration";
import type { IntegrationRepository } from "@/lib/platform/integration/repositories/IntegrationRepository";
import { createJobId } from "@/lib/platform/integration/repositories/InMemoryIntegrationRepository";
import type { ServiceContext } from "@/types/services";
import { publishIntegrationEvent } from "@/lib/platform/integration/integration-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Export framework with scheduling and validation (Mission P-010.7). */
export class ExportService {
  constructor(private readonly repository: IntegrationRepository) {}

  list(context: ServiceContext): readonly ExportJobRecord[] {
    return this.repository.listExportJobs(context.organizationId);
  }

  get(jobId: string, context: ServiceContext): ExportJobRecord | null {
    return this.repository.findExportJob(context.organizationId, jobId);
  }

  request(input: ExportRequestInput, context: ServiceContext): ExportJobRecord {
    const connector = this.repository.findConnector(context.organizationId, input.connectorId);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");
    if (connector.status !== "active") throw new Error("CONNECTOR_INACTIVE");

    const correlationId = `corr-${randomUUID()}`;
    const job: ExportJobRecord = {
      id: createJobId("exp"),
      organizationId: context.organizationId,
      connectorId: input.connectorId,
      format: input.format,
      status: input.scheduledAt ? "queued" : "running",
      scheduledAt: input.scheduledAt,
      startedAt: input.scheduledAt ? undefined : nowIso(),
      recordsExported: 0,
      correlationId,
      createdAt: nowIso(),
    };

    this.repository.createExportJob(job);

    if (input.scheduledAt) return job;

    const completed = this.repository.updateExportJob({
      ...job,
      status: "completed",
      completedAt: nowIso(),
      recordsExported: 1,
    });

    publishIntegrationEvent(
      {
        eventType: "ExportCompleted",
        entityType: "export_job",
        entityId: completed.id,
        correlationId,
        payload: { format: input.format },
      },
      context,
    );

    return completed;
  }
}
