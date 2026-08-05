export type {
  CrmAggregateRecord,
  CrmEntityRegistryEntry,
  CrmOrganizationFoundationRecord,
  CrmPersistenceCollection,
  CrmStoreBacking,
} from "@/lib/crm/persistence/CrmStoreBacking";
export type { CrmPersistenceRepository } from "@/lib/crm/persistence/CrmPersistenceRepository";
export {
  createCrmStore,
  seedCrmStore,
  isCrmStoreEmpty,
  resetDefaultCrmBackingForTests,
  registerOrganizationFoundation,
  isOrganizationRegistered,
  CRM_SEED_ORG_ID,
} from "@/lib/crm/persistence/createCrmStore";
export {
  createCrmRepositories,
  type CrmRepositories,
  type CreateCrmRepositoriesOptions,
} from "@/lib/crm/persistence/createCrmRepositories";
export {
  createCrmPersistenceRepositories,
  type CrmPersistenceRepositories,
  type CreateCrmPersistenceRepositoriesOptions,
} from "@/lib/crm/persistence/createCrmPersistenceRepositories";
export {
  ensureCrmPlatformBacking,
  getCrmBackingFromPlatformStore,
  createIsolatedCrmBacking,
} from "@/lib/crm/persistence/CrmPlatformBacking";
export { canUsePostgresCrmPersistence } from "@/lib/crm/persistence/crmPostgresPersistence";
export { getCrmBackingCollection } from "@/lib/crm/persistence/crmBackingCollections";
export { InMemoryCrmRepository as InMemoryCrmPersistenceRepository } from "@/lib/crm/persistence/InMemoryCrmRepository";
