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

/** Integration repository contract (Mission P-010.7). */
export type IntegrationRepository = {
  readonly domain: string;

  createConnector(connector: ConnectorRecord): ConnectorRecord;
  updateConnector(connector: ConnectorRecord): ConnectorRecord;
  findConnector(organizationId: string, connectorId: string): ConnectorRecord | null;
  findConnectorByProvider(organizationId: string, providerKey: string): ConnectorRecord | null;
  listConnectors(organizationId: string): readonly ConnectorRecord[];

  appendExecution(execution: ConnectorExecutionRecord): ConnectorExecutionRecord;
  listExecutions(organizationId: string, connectorId?: string): readonly ConnectorExecutionRecord[];

  createWebhook(subscription: WebhookSubscriptionRecord): WebhookSubscriptionRecord;
  listWebhooks(organizationId: string, connectorId?: string): readonly WebhookSubscriptionRecord[];

  createSubscription(subscription: EventSubscriptionRecord): EventSubscriptionRecord;
  listSubscriptions(organizationId: string, connectorId?: string): readonly EventSubscriptionRecord[];

  createMapping(mapping: DataMappingRecord): DataMappingRecord;
  updateMapping(mapping: DataMappingRecord): DataMappingRecord;
  findMapping(organizationId: string, mappingId: string): DataMappingRecord | null;
  listMappings(organizationId: string, connectorId?: string): readonly DataMappingRecord[];

  createImportJob(job: ImportJobRecord): ImportJobRecord;
  updateImportJob(job: ImportJobRecord): ImportJobRecord;
  findImportJob(organizationId: string, jobId: string): ImportJobRecord | null;
  listImportJobs(organizationId: string): readonly ImportJobRecord[];

  createExportJob(job: ExportJobRecord): ExportJobRecord;
  updateExportJob(job: ExportJobRecord): ExportJobRecord;
  findExportJob(organizationId: string, jobId: string): ExportJobRecord | null;
  listExportJobs(organizationId: string): readonly ExportJobRecord[];

  upsertSchedule(schedule: IntegrationScheduleRecord): IntegrationScheduleRecord;
  listSchedules(organizationId: string): readonly IntegrationScheduleRecord[];

  appendAudit(entry: IntegrationAuditRecord): IntegrationAuditRecord;
  listAudit(organizationId: string, connectorId?: string): readonly IntegrationAuditRecord[];
};
