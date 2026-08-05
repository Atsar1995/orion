export type {
  ProcurementAggregateRecord,
  ProcurementEntityRegistryEntry,
  ProcurementOrganizationFoundationRecord,
  ProcurementPersistenceCollection,
  ProcurementStoreBacking,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";
export type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
export {
  createProcurementStore,
  seedProcurementStore,
  isProcurementStoreEmpty,
  resetDefaultProcurementBackingForTests,
  registerOrganizationFoundation,
  isOrganizationRegistered,
  PROCUREMENT_SEED_ORG_ID,
  PROCUREMENT_FOUNDATION_VERSION,
  PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION,
} from "@/lib/procurement/persistence/createProcurementStore";
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
  ensureProcurementPlatformBacking,
  getProcurementBackingFromPlatformStore,
  createIsolatedProcurementBacking,
} from "@/lib/procurement/persistence/ProcurementPlatformBacking";
export { canUsePostgresProcurementPersistence } from "@/lib/procurement/persistence/procurementPostgresPersistence";
export {
  getProcurementBackingCollection,
  listProcurementPersistenceCollections,
  isProcurementPersistenceCollection,
  assertProcurementBackingCollections,
  PROCUREMENT_PERSISTENCE_COLLECTIONS,
  PROCUREMENT_INFRASTRUCTURE_COLLECTION_KEYS,
} from "@/lib/procurement/persistence/procurementBackingCollections";
export { InMemoryProcurementRepository } from "@/lib/procurement/persistence/InMemoryProcurementRepository";
export { PostgresProcurementRepository } from "@/lib/procurement/persistence/PostgresProcurementRepository";
