export { ProcurementFacade, procurementFacade, getProcurementWorkspaceBootstrap } from "@/lib/procurement/ProcurementFacade";
export { createProcurementWiring, type ProcurementWiring } from "@/lib/procurement/createProcurementWiring";
export {
  PROCUREMENT_SEED_ORG_ID,
  PROCUREMENT_FOUNDATION_VERSION,
  PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION,
  createProcurementStore,
  seedProcurementStore,
  registerOrganizationFoundation,
  isOrganizationRegistered,
} from "@/lib/procurement/persistence/createProcurementStore";
export type {
  ProcurementStoreBacking,
  ProcurementPersistenceCollection,
  ProcurementAggregateRecord,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";
export type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
export {
  ensureProcurementPlatformBacking,
  createIsolatedProcurementBacking,
} from "@/lib/procurement/persistence/ProcurementPlatformBacking";
export {
  createProcurementRepositories,
  type ProcurementRepositories,
  type CreateProcurementRepositoriesOptions,
} from "@/lib/procurement/persistence/createProcurementRepositories";
export {
  createProcurementPersistenceRepositories,
  type ProcurementPersistenceRepositories,
  type CreateProcurementPersistenceRepositoriesOptions,
} from "@/lib/procurement/persistence/createProcurementPersistenceRepositories";
export {
  getProcurementBackingCollection,
  listProcurementPersistenceCollections,
  isProcurementPersistenceCollection,
  assertProcurementBackingCollections,
  PROCUREMENT_PERSISTENCE_COLLECTIONS,
} from "@/lib/procurement/persistence/procurementBackingCollections";
export { InMemoryProcurementRepository } from "@/lib/procurement/persistence/InMemoryProcurementRepository";
export { PostgresProcurementRepository } from "@/lib/procurement/persistence/PostgresProcurementRepository";
export { canUsePostgresProcurementPersistence } from "@/lib/procurement/persistence/procurementPostgresPersistence";
export {
  getProcurementEventPipelineRegistry,
  setProcurementEventPipelineRegistry,
} from "@/lib/procurement/services/procurementEventPipelineRegistry";
export {
  PROCUREMENT_CANONICAL_EVENT_VERSION,
  PROCUREMENT_CANONICAL_OUTBOUND_EVENTS,
  PROCUREMENT_CANONICAL_ENTITY_TYPES,
  PROCUREMENT_ALL_OUTBOUND_EVENTS,
  assertUniqueProcurementEventCatalog,
  ProcurementCanonicalEventPublisher,
  defaultProcurementCanonicalEventPublisher,
  buildProcurementCanonicalIdempotencyKey,
} from "@/lib/procurement/events";
export type {
  ProcurementCanonicalEventType,
  ProcurementOutboundEventType,
} from "@/lib/procurement/events";
export {
  PROCUREMENT_PERMISSIONS,
  resolveProcurementRoutePermission,
  listProcurementRouteRules,
  ProcurementAuthorizationService,
  defaultProcurementAuthorizationService,
  getProcurementApiContext,
  getProcurementApiContextForRequest,
  ProcurementAuthorizationError,
} from "@/lib/procurement/security";
export type {
  ProcurementPermissionCode,
  ProcurementRoutePermissionRule,
  ProcurementApiContextOptions,
} from "@/lib/procurement/security";
