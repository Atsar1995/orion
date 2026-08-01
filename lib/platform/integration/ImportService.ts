import { randomUUID } from "crypto";
import type { ImportJobRecord, ImportRequestInput } from "@/types/integration";
import type { IntegrationRepository } from "@/lib/platform/integration/repositories/IntegrationRepository";
import { createJobId } from "@/lib/platform/integration/repositories/InMemoryIntegrationRepository";
import type { ServiceContext } from "@/types/services";
import { integrationRulesEngine } from "@/lib/platform/integration/IntegrationRulesEngine";
import { publishIntegrationEvent } from "@/lib/platform/integration/integration-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Import framework with validation, preview, and scheduling (Mission P-010.7). */
export class ImportService {
  constructor(private readonly repository: IntegrationRepository) {}

  list(context: ServiceContext): readonly ImportJobRecord[] {
    return this.repository.listImportJobs(context.organizationId);
  }

  get(jobId: string, context: ServiceContext): ImportJobRecord | null {
    return this.repository.findImportJob(context.organizationId, jobId);
  }

  request(input: ImportRequestInput, context: ServiceContext): ImportJobRecord {
    const errors = integrationRulesEngine.validateImportRequest(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const connector = this.repository.findConnector(context.organizationId, input.connectorId);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");
    if (connector.status !== "active") throw new Error("CONNECTOR_INACTIVE");

    const mapping = this.repository.listMappings(context.organizationId, input.connectorId)[0];
    const requiredFields = mapping ? Object.keys(mapping.fieldMappings) : [];
    const validation = integrationRulesEngine.validatePayloadSchema(input.data, requiredFields);

    const correlationId = `corr-${randomUUID()}`;
    const job: ImportJobRecord = {
      id: createJobId("imp"),
      organizationId: context.organizationId,
      connectorId: input.connectorId,
      format: input.format,
      status: input.preview ? "queued" : input.scheduledAt ? "queued" : "running",
      scheduledAt: input.scheduledAt,
      startedAt: input.preview || input.scheduledAt ? undefined : nowIso(),
      recordsTotal: input.data.length,
      recordsValid: validation.valid,
      recordsInvalid: validation.invalid,
      previewAvailable: input.preview ?? false,
      correlationId,
      createdAt: nowIso(),
    };

    this.repository.createImportJob(job);

    if (input.preview) return job;

    const completed = this.repository.updateImportJob({
      ...job,
      status: validation.invalid > 0 && validation.valid === 0 ? "failed" : "completed",
      completedAt: nowIso(),
    });

    if (completed.status === "completed") {
      publishIntegrationEvent(
        {
          eventType: "ImportCompleted",
          entityType: "import_job",
          entityId: completed.id,
          correlationId,
          payload: {
            recordsValid: String(completed.recordsValid),
            recordsInvalid: String(completed.recordsInvalid),
          },
        },
        context,
      );
    }

    return completed;
  }

  rollback(jobId: string, context: ServiceContext): ImportJobRecord {
    const job = this.get(jobId, context);
    if (!job) throw new Error("JOB_NOT_FOUND");
    if (job.status !== "completed") throw new Error("JOB_NOT_ROLLBACK_ELIGIBLE");

    return this.repository.updateImportJob({
      ...job,
      status: "cancelled",
    });
  }
}
