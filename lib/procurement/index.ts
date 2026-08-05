export { ProcurementFacade, procurementFacade, getProcurementWorkspaceBootstrap } from "@/lib/procurement/ProcurementFacade";
export { createProcurementWiring, type ProcurementWiring } from "@/lib/procurement/createProcurementWiring";
export {
  PROCUREMENT_SEED_ORG_ID,
  PROCUREMENT_FOUNDATION_VERSION,
  createProcurementStore,
  seedProcurementStore,
  registerOrganizationFoundation,
  isOrganizationRegistered,
} from "@/lib/procurement/persistence/createProcurementStore";
export type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
export { ensureProcurementPlatformBacking, createIsolatedProcurementBacking } from "@/lib/procurement/persistence/ProcurementPlatformBacking";
export { createProcurementRepositories, type ProcurementRepositories } from "@/lib/procurement/persistence/createProcurementRepositories";
export { createProcurementPersistenceRepositories } from "@/lib/procurement/persistence/createProcurementPersistenceRepositories";
export {
  getProcurementEventPipelineRegistry,
  setProcurementEventPipelineRegistry,
} from "@/lib/procurement/services/procurementEventPipelineRegistry";
