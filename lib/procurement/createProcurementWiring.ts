import { ensureProcurementPlatformBacking } from "@/lib/procurement/persistence/ProcurementPlatformBacking";
import {
  createProcurementPersistenceRepositories,
  type ProcurementPersistenceRepositories,
} from "@/lib/procurement/persistence/createProcurementPersistenceRepositories";
import {
  createProcurementRepositories,
  type ProcurementRepositories,
} from "@/lib/procurement/persistence/createProcurementRepositories";
import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import { setProcurementEventPipelineRegistry } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import { ProcurementCanonicalEventPublisher } from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Procurement composition root — PlatformStore-backed dependency injection (Mission P-010.3 · P-010.4 · P-010.5 · P-010.6). */
export type ProcurementWiring = ProcurementRepositories &
  ProcurementPersistenceRepositories & {
    readonly platformStore: PlatformStore;
    readonly backing: ProcurementStoreBacking;
    readonly authorization: ProcurementAuthorizationService;
    readonly canonicalEventPublisher: ProcurementCanonicalEventPublisher;
  };

/** Centralized Procurement dependency wiring — authoritative composition root. */
export function createProcurementWiring(platformStore: PlatformStore): ProcurementWiring {
  const backing = ensureProcurementPlatformBacking(platformStore);
  const connection = platformStore.getDatabaseConnection?.() ?? undefined;
  const persistenceRepositories = createProcurementPersistenceRepositories({
    platformStore,
    connection,
  });
  const repositories = createProcurementRepositories(backing, {
    procurementRepository: persistenceRepositories.procurementRepository,
  });
  const authorization = new ProcurementAuthorizationService();
  const canonicalEventPublisher = new ProcurementCanonicalEventPublisher();

  setProcurementEventPipelineRegistry({
    initialized: true,
    canonicalPublisherReady: true,
    backingOrganizationIds: () => [...backing.organizationFoundations.keys()],
  });

  return {
    platformStore,
    backing,
    authorization,
    canonicalEventPublisher,
    ...persistenceRepositories,
    ...repositories,
  };
}
