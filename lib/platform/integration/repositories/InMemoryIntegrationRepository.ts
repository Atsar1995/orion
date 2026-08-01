import { randomUUID } from "crypto";
import type {
  ConnectorExecutionRecord,
  ConnectorRecord,
  DataMappingRecord,
  EventSubscriptionRecord,
  ExportJobRecord,
  ImportJobRecord,
  IntegrationAuditRecord,
  IntegrationScheduleRecord,
  WebhookSubscriptionRecord,
} from "@/types/integration";
import type { IntegrationRepository } from "@/lib/platform/integration/repositories/IntegrationRepository";
import { seedIntegrationPlatform } from "@/lib/platform/integration/data/seed-integration";

/** In-memory integration repository (Mission P-010.7). */
export class InMemoryIntegrationRepository implements IntegrationRepository {
  readonly domain = "platform" as const;

  private readonly connectors = new Map<string, ConnectorRecord>();
  private readonly executions: ConnectorExecutionRecord[] = [];
  private readonly webhooks = new Map<string, WebhookSubscriptionRecord>();
  private readonly subscriptions = new Map<string, EventSubscriptionRecord>();
  private readonly mappings = new Map<string, DataMappingRecord>();
  private readonly importJobs = new Map<string, ImportJobRecord>();
  private readonly exportJobs = new Map<string, ExportJobRecord>();
  private readonly schedules = new Map<string, IntegrationScheduleRecord>();
  private readonly auditLog: IntegrationAuditRecord[] = [];

  constructor(seedOrganizationId = "org-orania") {
    const seed = seedIntegrationPlatform(seedOrganizationId);
    for (const connector of seed.connectors) this.connectors.set(connector.id, connector);
    for (const mapping of seed.mappings) this.mappings.set(mapping.id, mapping);
    for (const webhook of seed.webhooks) this.webhooks.set(webhook.id, webhook);
  }

  createConnector(connector: ConnectorRecord): ConnectorRecord {
    this.connectors.set(connector.id, connector);
    return connector;
  }

  updateConnector(connector: ConnectorRecord): ConnectorRecord {
    this.connectors.set(connector.id, connector);
    return connector;
  }

  findConnector(organizationId: string, connectorId: string): ConnectorRecord | null {
    const record = this.connectors.get(connectorId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findConnectorByProvider(organizationId: string, providerKey: string): ConnectorRecord | null {
    return (
      [...this.connectors.values()].find(
        (c) => c.organizationId === organizationId && c.providerKey === providerKey && c.status !== "deprecated",
      ) ?? null
    );
  }

  listConnectors(organizationId: string): readonly ConnectorRecord[] {
    return [...this.connectors.values()].filter((c) => c.organizationId === organizationId);
  }

  appendExecution(execution: ConnectorExecutionRecord): ConnectorExecutionRecord {
    this.executions.unshift(execution);
    return execution;
  }

  listExecutions(organizationId: string, connectorId?: string): readonly ConnectorExecutionRecord[] {
    return this.executions.filter(
      (e) => e.organizationId === organizationId && (!connectorId || e.connectorId === connectorId),
    );
  }

  createWebhook(subscription: WebhookSubscriptionRecord): WebhookSubscriptionRecord {
    this.webhooks.set(subscription.id, subscription);
    return subscription;
  }

  listWebhooks(organizationId: string, connectorId?: string): readonly WebhookSubscriptionRecord[] {
    return [...this.webhooks.values()].filter(
      (w) => w.organizationId === organizationId && (!connectorId || w.connectorId === connectorId),
    );
  }

  createSubscription(subscription: EventSubscriptionRecord): EventSubscriptionRecord {
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  listSubscriptions(organizationId: string, connectorId?: string): readonly EventSubscriptionRecord[] {
    return [...this.subscriptions.values()].filter(
      (s) => s.organizationId === organizationId && (!connectorId || s.connectorId === connectorId),
    );
  }

  createMapping(mapping: DataMappingRecord): DataMappingRecord {
    this.mappings.set(mapping.id, mapping);
    return mapping;
  }

  updateMapping(mapping: DataMappingRecord): DataMappingRecord {
    this.mappings.set(mapping.id, mapping);
    return mapping;
  }

  findMapping(organizationId: string, mappingId: string): DataMappingRecord | null {
    const record = this.mappings.get(mappingId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listMappings(organizationId: string, connectorId?: string): readonly DataMappingRecord[] {
    return [...this.mappings.values()].filter(
      (m) => m.organizationId === organizationId && (!connectorId || m.connectorId === connectorId),
    );
  }

  createImportJob(job: ImportJobRecord): ImportJobRecord {
    this.importJobs.set(job.id, job);
    return job;
  }

  updateImportJob(job: ImportJobRecord): ImportJobRecord {
    this.importJobs.set(job.id, job);
    return job;
  }

  findImportJob(organizationId: string, jobId: string): ImportJobRecord | null {
    const record = this.importJobs.get(jobId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listImportJobs(organizationId: string): readonly ImportJobRecord[] {
    return [...this.importJobs.values()]
      .filter((j) => j.organizationId === organizationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createExportJob(job: ExportJobRecord): ExportJobRecord {
    this.exportJobs.set(job.id, job);
    return job;
  }

  updateExportJob(job: ExportJobRecord): ExportJobRecord {
    this.exportJobs.set(job.id, job);
    return job;
  }

  findExportJob(organizationId: string, jobId: string): ExportJobRecord | null {
    const record = this.exportJobs.get(jobId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listExportJobs(organizationId: string): readonly ExportJobRecord[] {
    return [...this.exportJobs.values()]
      .filter((j) => j.organizationId === organizationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  upsertSchedule(schedule: IntegrationScheduleRecord): IntegrationScheduleRecord {
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  listSchedules(organizationId: string): readonly IntegrationScheduleRecord[] {
    return [...this.schedules.values()].filter((s) => s.organizationId === organizationId);
  }

  appendAudit(entry: IntegrationAuditRecord): IntegrationAuditRecord {
    this.auditLog.unshift(Object.freeze({ ...entry }));
    return entry;
  }

  listAudit(organizationId: string, connectorId?: string): readonly IntegrationAuditRecord[] {
    return this.auditLog.filter(
      (e) => e.organizationId === organizationId && (!connectorId || e.connectorId === connectorId),
    );
  }
}

export const defaultIntegrationRepository = new InMemoryIntegrationRepository();

export function createConnectorId(): string {
  return `conn-${randomUUID()}`;
}

export function createJobId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}
