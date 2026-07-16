/**
 * ORION Platform Audit — in-memory audit service.
 */

import type {
  AuditOutcome,
  AuditRecord,
  PlatformEvent,
  ServiceContext,
  ServiceHealth,
  ServiceMetadata,
  ServiceResult,
} from "@/types/services";
import { ServiceHealth as ServiceHealthState } from "@/types/services";
import type {
  AuditService as AuditServiceContract,
  EventSubscriber,
  HealthCheckService,
} from "@/lib/platform/contracts";
import { validationError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";
import { validatePlatformServiceContext } from "@/lib/platform/shared";
import {
  AuditStore,
  type AuditSeverity,
} from "@/lib/platform/audit/AuditStore";

const AUDIT_SERVICE_METADATA: ServiceMetadata = {
  serviceName: "AuditService",
  version: "1.0.0",
  description: "In-memory platform audit service",
};

/** Platform event types captured by the audit service. */
const AUDIT_EVENT_TYPES = [
  "session.expired",
  "permission.changed",
  "config.changed",
  "persistence.failure",
  "entity.tenant_violation",
  "auth.login.success",
  "auth.login.failure",
  "auth.logout",
  "auth.password.reset",
  "auth.password.changed",
  "auth.account.locked",
  "auth.access.denied",
  "authorization.denied",
  "security.alert",
] as const;

const AUDIT_SEVERITIES: readonly AuditSeverity[] = [
  "info",
  "warning",
  "error",
  "critical",
];

let auditSequence = 0;

/** Creates a unique audit record identifier. */
export function createAuditId(): string {
  auditSequence += 1;
  return `audit-${auditSequence}`;
}

/** Returns true when an event is eligible for audit capture. */
export function isAuditEligibleEvent(event: PlatformEvent): boolean {
  return AUDIT_EVENT_TYPES.includes(
    event.type as (typeof AUDIT_EVENT_TYPES)[number],
  );
}

/** Resolves audit severity from event metadata or event type conventions. */
export function resolveAuditSeverity(event: PlatformEvent): AuditSeverity {
  const explicit = event.metadata?.severity ?? event.payload.severity;

  if (explicit && isAuditSeverity(explicit)) {
    return explicit;
  }

  if (
    event.type.includes("failure") ||
    event.type.includes("denied") ||
    event.type.includes("violation")
  ) {
    return "error";
  }

  if (event.type.includes("permission") || event.type === "config.changed") {
    return "warning";
  }

  if (event.type.startsWith("security.")) {
    return "critical";
  }

  return "info";
}

/** Converts a platform event into an audit record. */
export function platformEventToAuditRecord(event: PlatformEvent): AuditRecord {
  const outcome = resolveAuditOutcome(event);

  return {
    id: event.eventId,
    type: event.type,
    timestamp: event.timestamp,
    actorUserId: event.tenantContext.userId,
    organizationId: event.tenantContext.organizationId,
    workspaceId: event.tenantContext.workspaceId,
    action: event.payload.action ?? event.metadata?.action ?? event.type,
    outcome,
    targetEntityType:
      event.payload.targetEntityType ?? event.metadata?.targetEntityType,
    targetEntityId: event.payload.targetEntityId ?? event.metadata?.targetEntityId,
    ipAddress: event.payload.ipAddress ?? event.metadata?.ipAddress,
    metadata: {
      ...event.metadata,
      severity: resolveAuditSeverity(event),
      source: event.source,
      correlationId: event.correlationId,
    },
  };
}

/** In-memory implementation of the platform audit service contract. */
export class InMemoryAuditService
  implements AuditServiceContract, HealthCheckService
{
  readonly metadata = AUDIT_SERVICE_METADATA;

  private readonly subscriptionIds: string[] = [];
  private initialized = false;

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    private readonly store: AuditStore = new AuditStore(),
  ) {}

  /** Registers platform event subscriptions for audit capture. */
  async initialize(context: ServiceContext): Promise<ServiceResult<void>> {
    if (this.initialized) {
      return success(undefined);
    }

    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    for (const eventType of AUDIT_EVENT_TYPES) {
      const subscriptionResult = await this.eventSubscriber.subscribe(
        eventType,
        (event) => this.handlePlatformEvent(event),
        context,
      );

      if (!subscriptionResult.success) {
        return subscriptionResult;
      }

      this.subscriptionIds.push(subscriptionResult.data);
    }

    this.initialized = true;
    return success(undefined);
  }

  async record(
    audit: Omit<AuditRecord, "id" | "timestamp">,
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const alignmentResult = this.validateAuditTenantAlignment(audit, context);

    if (!alignmentResult.success) {
      return alignmentResult;
    }

    if (!audit.type.trim()) {
      return failure(
        validationError({
          message: "AuditRecord.type is required.",
        }),
      );
    }

    if (!audit.action.trim()) {
      return failure(
        validationError({
          message: "AuditRecord.action is required.",
        }),
      );
    }

    const record: AuditRecord = {
      id: createAuditId(),
      timestamp: new Date(),
      ...audit,
      type: audit.type.trim(),
      action: audit.action.trim(),
    };

    this.store.append(record);

    return success(record);
  }

  async findAll(context: ServiceContext): Promise<ServiceResult<AuditRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return success(this.store.findAll(context));
  }

  async findByOrganization(
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return success(this.store.findByOrganization(context));
  }

  async findByWorkspace(
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return success(this.store.findByWorkspace(context));
  }

  async findByActor(
    actorUserId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>> {
    return this.findByUser(actorUserId, context);
  }

  async findByUser(
    userId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (!userId.trim()) {
      return failure(
        validationError({
          message: "User id is required.",
        }),
      );
    }

    return success(this.store.findByUser(userId.trim(), context));
  }

  async findBySeverity(
    severity: AuditSeverity,
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (!isAuditSeverity(severity)) {
      return failure(
        validationError({
          message: "A valid audit severity is required.",
        }),
      );
    }

    return success(this.store.findBySeverity(severity, context));
  }

  async count(context: ServiceContext): Promise<ServiceResult<number>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return success(this.store.count(context));
  }

  /** Clears stored audit records. Intended for development and testing only. */
  clear(): void {
    this.store.clear();
  }

  async checkHealth(): Promise<ServiceResult<ServiceHealth>> {
    return success(ServiceHealthState.Healthy);
  }

  private async handlePlatformEvent(
    event: PlatformEvent,
  ): Promise<ServiceResult<void>> {
    if (!isAuditEligibleEvent(event)) {
      return success(undefined);
    }

    const contextResult = validatePlatformServiceContext(event.tenantContext);

    if (!contextResult.success) {
      return contextResult;
    }

    this.store.append(platformEventToAuditRecord(event));

    return success(undefined);
  }

  private validateAuditTenantAlignment(
    audit: Omit<AuditRecord, "id" | "timestamp">,
    context: ServiceContext,
  ): ServiceResult<Omit<AuditRecord, "id" | "timestamp">> {
    if (
      audit.organizationId !== context.organizationId ||
      audit.workspaceId !== context.workspaceId
    ) {
      return failure(
        validationError({
          message: "AuditRecord tenant scope does not match the active service context.",
          details: {
            expectedOrganizationId: context.organizationId,
            expectedWorkspaceId: context.workspaceId,
            actualOrganizationId: audit.organizationId,
            actualWorkspaceId: audit.workspaceId,
          },
        }),
      );
    }

    return success(audit);
  }
}

function resolveAuditOutcome(event: PlatformEvent): AuditOutcome {
  const explicit = event.payload.outcome ?? event.metadata?.outcome;

  if (explicit === "failure") {
    return "failure";
  }

  if (
    event.type.includes("failure") ||
    event.type.includes("denied") ||
    event.type.includes("violation")
  ) {
    return "failure";
  }

  return "success";
}

function isAuditSeverity(value: string): value is AuditSeverity {
  return AUDIT_SEVERITIES.includes(value as AuditSeverity);
}
