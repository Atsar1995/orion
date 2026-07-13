/**
 * ORION Persistence — platform configuration and dependency wiring.
 */

export {
  PersistenceAdapter,
  createPersistenceConfiguration,
  DEFAULT_PERSISTENCE_CONFIGURATION,
  isPersistenceAdapterImplemented,
} from "@/lib/persistence/config/PersistenceConfiguration";
export type {
  DatabaseConnectionOptions,
  PersistenceConfiguration,
} from "@/lib/persistence/config/PersistenceConfiguration";

export {
  PersistenceAdapterNotImplementedError,
  PersistenceFactory,
} from "@/lib/persistence/config/PersistenceFactory";
export type {
  OrganizationRepository,
  PersistenceRepositories,
  UserRepository,
  WorkspaceRepository,
} from "@/lib/persistence/config/PersistenceFactory";

export {
  createDefaultPersistenceContainer,
  PersistenceContainer,
} from "@/lib/persistence/config/PersistenceContainer";
export type {
  PersistenceContainerDependencies,
  PersistenceServices,
} from "@/lib/persistence/config/PersistenceContainer";
