import { randomUUID } from "crypto";
import type {
  ConnectorExecutionRecord,
  ConnectorRecord,
  RegisterConnectorInput,
  StartIntegrationInput,
} from "@/types/integration";
import type { IntegrationRepository } from "@/lib/platform/integration/repositories/IntegrationRepository";
import {
  createConnectorId,
  createJobId,
} from "@/lib/platform/integration/repositories/InMemoryIntegrationRepository";
import type { ServiceContext } from "@/types/services";
import { integrationRulesEngine } from "@/lib/platform/integration/IntegrationRulesEngine";
import { publishIntegrationEvent } from "@/lib/platform/integration/integration-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Connector registry and lifecycle management (Mission P-010.7). */
export class ConnectorService {
  constructor(private readonly repository: IntegrationRepository) {}

  list(context: ServiceContext): readonly ConnectorRecord[] {
    return this.repository.listConnectors(context.organizationId);
  }

  get(connectorId: string, context: ServiceContext): ConnectorRecord | null {
    return this.repository.findConnector(context.organizationId, connectorId);
  }

  register(input: RegisterConnectorInput, context: ServiceContext): ConnectorRecord {
    const errors = integrationRulesEngine.validateConnectorRegistration(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const duplicate = this.repository.findConnectorByProvider(context.organizationId, input.providerKey);
    if (duplicate) throw new Error("DUPLICATE_CONNECTOR");

    const connector: ConnectorRecord = {
      id: createConnectorId(),
      organizationId: context.organizationId,
      name: input.name,
      providerKey: input.providerKey,
      integrationType: input.integrationType,
      version: 1,
      status: "draft",
      healthStatus: "unknown",
      credentialRef: input.credentialRef,
      configuration: input.configuration ?? {},
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    this.repository.createConnector(connector);
    this.audit(context, connector.id, "connector_registered", `Registered ${input.name}`);
    return connector;
  }

  activate(connectorId: string, context: ServiceContext): ConnectorRecord {
    return this.updateStatus(connectorId, "active", "healthy", context, "connector_activated");
  }

  deactivate(connectorId: string, context: ServiceContext): ConnectorRecord {
    return this.updateStatus(connectorId, "inactive", "unknown", context, "connector_deactivated");
  }

  getExecutionHistory(connectorId: string, context: ServiceContext): readonly ConnectorExecutionRecord[] {
    return this.repository.listExecutions(context.organizationId, connectorId);
  }

  updateHealth(
    connectorId: string,
    healthStatus: ConnectorRecord["healthStatus"],
    context: ServiceContext,
  ): ConnectorRecord {
    const connector = this.get(connectorId, context);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");

    const updated = this.repository.updateConnector({
      ...connector,
      healthStatus,
      updatedAt: nowIso(),
    });

    publishIntegrationEvent(
      {
        eventType: "ConnectorHealthChanged",
        entityType: "connector",
        entityId: connectorId,
        payload: { healthStatus },
      },
      context,
    );

    return updated;
  }

  private updateStatus(
    connectorId: string,
    status: ConnectorRecord["status"],
    healthStatus: ConnectorRecord["healthStatus"],
    context: ServiceContext,
    action: string,
  ): ConnectorRecord {
    const connector = this.get(connectorId, context);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");

    const updated = this.repository.updateConnector({
      ...connector,
      status,
      healthStatus,
      updatedAt: nowIso(),
    });

    this.audit(context, connectorId, action);
    return updated;
  }

  private audit(context: ServiceContext, connectorId: string, action: string, detail?: string): void {
    this.repository.appendAudit({
      id: createJobId("iaud"),
      organizationId: context.organizationId,
      connectorId,
      action,
      actorId: context.userId ?? "system",
      timestamp: nowIso(),
      detail,
      correlationId: `corr-${randomUUID()}`,
    });
  }
}

/** Primary integration orchestration service (Mission P-010.7). */
export class EnterpriseIntegrationService {
  constructor(
    private readonly repository: IntegrationRepository,
    private readonly connectorService: ConnectorService,
  ) {}

  listConnectors(context: ServiceContext): readonly ConnectorRecord[] {
    return this.connectorService.list(context);
  }

  async start(input: StartIntegrationInput, context: ServiceContext): Promise<ConnectorExecutionRecord> {
    const connector = this.connectorService.get(input.connectorId, context);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");
    if (connector.status !== "active") throw new Error("CONNECTOR_INACTIVE");

    const correlationId = input.correlationId ?? `corr-${randomUUID()}`;
    const execution: ConnectorExecutionRecord = {
      id: createJobId("exec"),
      organizationId: context.organizationId,
      connectorId: input.connectorId,
      status: "running",
      startedAt: nowIso(),
      recordsProcessed: 0,
      correlationId,
    };

    this.repository.appendExecution(execution);

    publishIntegrationEvent(
      {
        eventType: "IntegrationStarted",
        entityType: "connector",
        entityId: input.connectorId,
        correlationId,
      },
      context,
    );

    try {
      const completed: ConnectorExecutionRecord = {
        ...execution,
        status: "completed",
        completedAt: nowIso(),
        recordsProcessed: 1,
      };
      this.repository.appendExecution(completed);

      publishIntegrationEvent(
        {
          eventType: "IntegrationCompleted",
          entityType: "connector",
          entityId: input.connectorId,
          correlationId,
        },
        context,
      );

      return completed;
    } catch (error) {
      const failed: ConnectorExecutionRecord = {
        ...execution,
        status: "failed",
        completedAt: nowIso(),
        errorMessage: error instanceof Error ? error.message : "Integration failed",
      };
      this.repository.appendExecution(failed);

      publishIntegrationEvent(
        {
          eventType: "IntegrationFailed",
          entityType: "connector",
          entityId: input.connectorId,
          correlationId,
          payload: { error: failed.errorMessage ?? "unknown" },
        },
        context,
      );

      throw error;
    }
  }

  getAuditLog(context: ServiceContext, connectorId?: string) {
    return this.repository.listAudit(context.organizationId, connectorId);
  }
}
