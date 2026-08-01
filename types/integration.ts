/**
 * Enterprise Integration Framework types (Mission P-010.7).
 * Organization-scoped, domain-agnostic external system integration.
 */

/** Supported integration transport types (conceptual — no third-party SDKs). */
export type IntegrationType =
  | "rest_api"
  | "graphql_api"
  | "webhook"
  | "file_import"
  | "file_export"
  | "csv"
  | "json"
  | "xml"
  | "streaming";

/** Connector lifecycle states. */
export type ConnectorStatus = "draft" | "active" | "inactive" | "failed" | "deprecated";

/** Integration job states. */
export type IntegrationJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "retry_pending"
  | "cancelled";

/** Connector health states. */
export type ConnectorHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/** Data format for import/export. */
export type IntegrationDataFormat = "csv" | "json" | "xml";

/** Outbound integration events. */
export type IntegrationEventType =
  | "IntegrationStarted"
  | "IntegrationCompleted"
  | "IntegrationFailed"
  | "ImportCompleted"
  | "ExportCompleted"
  | "ConnectorHealthChanged";

/** Inbound integration events. */
export type IntegrationInboundEventType =
  | "IntegrationRequested"
  | "ImportRequested"
  | "ExportRequested";

export type ConnectorRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly providerKey: string;
  readonly integrationType: IntegrationType;
  readonly version: number;
  readonly status: ConnectorStatus;
  readonly healthStatus: ConnectorHealthStatus;
  readonly credentialRef?: string;
  readonly configuration: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConnectorExecutionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly status: IntegrationJobStatus;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly recordsProcessed: number;
  readonly errorMessage?: string;
  readonly correlationId: string;
};

export type WebhookSubscriptionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly targetUrl: string;
  readonly eventTypes: readonly string[];
  readonly secretRef: string;
  readonly enabled: boolean;
  readonly createdAt: string;
};

export type EventSubscriptionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly eventTypes: readonly string[];
  readonly active: boolean;
  readonly createdAt: string;
};

export type DataMappingRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly name: string;
  readonly sourceSchema: string;
  readonly targetSchema: string;
  readonly fieldMappings: Readonly<Record<string, string>>;
  readonly version: number;
  readonly active: boolean;
  readonly updatedAt: string;
};

export type ImportJobRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly format: IntegrationDataFormat;
  readonly status: IntegrationJobStatus;
  readonly scheduledAt?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly recordsTotal: number;
  readonly recordsValid: number;
  readonly recordsInvalid: number;
  readonly previewAvailable: boolean;
  readonly correlationId: string;
  readonly createdAt: string;
};

export type ExportJobRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly format: IntegrationDataFormat;
  readonly status: IntegrationJobStatus;
  readonly scheduledAt?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly recordsExported: number;
  readonly correlationId: string;
  readonly createdAt: string;
};

export type IntegrationScheduleRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly jobType: "import" | "export";
  readonly cronExpression: string;
  readonly active: boolean;
  readonly nextRunAt?: string;
  readonly updatedAt: string;
};

export type IntegrationAuditRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly connectorId: string;
  readonly action: string;
  readonly actorId: string;
  readonly timestamp: string;
  readonly detail?: string;
  readonly correlationId: string;
};

export type RegisterConnectorInput = {
  readonly name: string;
  readonly providerKey: string;
  readonly integrationType: IntegrationType;
  readonly credentialRef?: string;
  readonly configuration?: Readonly<Record<string, string>>;
};

export type StartIntegrationInput = {
  readonly connectorId: string;
  readonly payload?: Readonly<Record<string, string>>;
  readonly correlationId?: string;
};

export type ImportRequestInput = {
  readonly connectorId: string;
  readonly format: IntegrationDataFormat;
  readonly data: readonly Record<string, string>[];
  readonly scheduledAt?: string;
  readonly preview?: boolean;
};

export type ExportRequestInput = {
  readonly connectorId: string;
  readonly format: IntegrationDataFormat;
  readonly filters?: Readonly<Record<string, string>>;
  readonly scheduledAt?: string;
};

export type TransformPayloadInput = {
  readonly mappingId: string;
  readonly payload: Readonly<Record<string, string>>;
};

export type PublishIntegrationEventInput = {
  readonly eventType: IntegrationEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
