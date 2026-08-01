import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { dataPlatformFacade, type DataPlatformFacade } from "@/lib/platform/data";
import type { RegisterMasterEntityInput } from "@/types/enterprise-data";
import type { CanonicalEntityType } from "@/types/enterprise-data";
import type { EnqueueSyncInput } from "@/types/enterprise-data-synchronization";
import type { ValidateEntityInput } from "@/types/enterprise-data-validation";
import type { ServiceContext } from "@/types/services";

const initializedServices = new WeakSet<IntelligenceIntegrationService>();

/** Registers data platform inbound event handlers (P-011.1, P-011.4, P-011.5). */
export function registerDataSubscribers(service: IntelligenceIntegrationService): void {
  if (initializedServices.has(service)) return;
  initializedServices.add(service);

  service.subscribe(
    {
      subscriberId: "data-platform",
      eventTypes: ["CustomEvent"],
      priority: 55,
    },
    async (event, context) => {
      const payload = event.payload;

      if (payload.masterDataInboundType === "EntityRegistrationRequested") {
        if (payload.entityType && payload.businessKey && payload.displayName) {
          await handleEntityRegistrationRequested(
            {
              entityType: payload.entityType as CanonicalEntityType,
              businessKey: payload.businessKey,
              displayName: payload.displayName,
              domainKey: payload.domainKey ?? event.sourceWorkspace.toLowerCase(),
              ownerId: payload.ownerId,
            },
            context,
          );
        }
        return;
      }

      if (payload.validationInboundType === "ValidationRequested") {
        await handleValidationRequested(
          {
            entityType: payload.entityType as CanonicalEntityType,
            entityId: payload.entityId,
            domainKey: payload.domainKey ?? "platform",
            payload: { businessKey: payload.businessKey ?? "", displayName: payload.displayName ?? "" },
            operation: (payload.operation as ValidateEntityInput["operation"]) ?? "create",
            correlationId: event.correlationId,
          },
          context,
        );
        return;
      }

      if (payload.synchronizationInboundType || payload.masterDataEventType) {
        await handleSynchronizationInbound(event, context);
      }
    },
  );
}

export async function handleEntityRegistrationRequested(
  input: RegisterMasterEntityInput,
  context: ServiceContext,
  facade: DataPlatformFacade = dataPlatformFacade,
): Promise<void> {
  facade.registry.register(input, context);
}

export async function handleValidationRequested(
  input: ValidateEntityInput,
  context: ServiceContext,
  facade: DataPlatformFacade = dataPlatformFacade,
): Promise<void> {
  facade.validation.validate(input, context);
}

export async function handleSynchronizationInbound(
  event: { payload: Record<string, string>; correlationId: string; entityType?: string; entityId?: string },
  context: ServiceContext,
): Promise<void> {
  const payload = event.payload;
  const inboundType =
    payload.synchronizationInboundType ??
    mapMasterDataEventToSync(payload.masterDataEventType);

  if (!inboundType) return;

  const syncInput = buildSyncInput(inboundType, payload, event);
  if (syncInput) {
    dataPlatformFacade.synchronization.enqueue(syncInput, context);
  }
}

function mapMasterDataEventToSync(masterDataEventType?: string): string | null {
  const mapping: Record<string, string> = {
    MasterEntityRegistered: "EntityCreated",
    MasterEntityUpdated: "EntityUpdated",
    MasterEntityActivated: "EntityActivated",
    MasterEntityDeactivated: "EntityDeactivated",
  };
  return masterDataEventType ? (mapping[masterDataEventType] ?? null) : null;
}

function buildSyncInput(
  inboundType: string,
  payload: Record<string, string>,
  event: { correlationId: string; entityType?: string; entityId?: string },
): EnqueueSyncInput | null {
  const entityEventMap: Record<string, EnqueueSyncInput["changeEventType"]> = {
    MasterEntityUpdated: "EntityUpdated",
    ReferenceUpdated: "ReferenceUpdated",
    MetadataUpdated: "MetadataUpdated",
    ValidationPassed: "EntityUpdated",
    EntityCreated: "EntityCreated",
    EntityUpdated: "EntityUpdated",
    EntityActivated: "EntityActivated",
    EntityDeactivated: "EntityDeactivated",
  };

  const changeEventType = entityEventMap[inboundType];
  if (!changeEventType) return null;

  const syncType =
    inboundType === "ReferenceUpdated"
      ? "reference_data"
      : inboundType === "MetadataUpdated"
        ? "metadata"
        : inboundType === "ValidationPassed"
          ? "master_data"
          : "master_data";

  return {
    syncType,
    changeEventType,
    entityType: payload.entityType ?? event.entityType,
    entityId: payload.entityId ?? event.entityId,
    incomingVersion: payload.version ? Number(payload.version) : undefined,
    correlationId: event.correlationId,
    payload: {
      ...payload,
      validationPassed: inboundType === "ValidationPassed" ? "true" : payload.validationPassed,
    },
  };
}
