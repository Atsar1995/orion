/**
 * ORION Persistence — dependency container.
 */

import { OrganizationPersistenceService } from "@/lib/persistence/services/OrganizationPersistenceService";
import { UserPersistenceService } from "@/lib/persistence/services/UserPersistenceService";
import { WorkspacePersistenceService } from "@/lib/persistence/services/WorkspacePersistenceService";
import type {
  AuditRepository,
  TransactionManager,
} from "@/lib/persistence/services/shared";
import {
  NoOpAuditRepository,
  NoOpTransactionManager,
} from "@/lib/persistence/services/shared";
import {
  DEFAULT_PERSISTENCE_CONFIGURATION,
  type PersistenceConfiguration,
} from "@/lib/persistence/config/PersistenceConfiguration";
import {
  PersistenceFactory,
  type PersistenceRepositories,
} from "@/lib/persistence/config/PersistenceFactory";

/** Persistence service bundle wired by the container. */
export interface PersistenceServices {
  userPersistenceService: UserPersistenceService;
  organizationPersistenceService: OrganizationPersistenceService;
  workspacePersistenceService: WorkspacePersistenceService;
}

/** Dependencies required to construct a persistence container. */
export interface PersistenceContainerDependencies {
  repositories: PersistenceRepositories;
  auditRepository: AuditRepository;
  transactionManager: TransactionManager;
}

/**
 * Lightweight dependency container for persistence repositories and services.
 * Dependencies are supplied through constructor injection.
 */
export class PersistenceContainer {
  readonly repositories: PersistenceRepositories;
  readonly services: PersistenceServices;

  constructor(dependencies: PersistenceContainerDependencies) {
    this.repositories = dependencies.repositories;
    this.services = {
      userPersistenceService: new UserPersistenceService(
        dependencies.repositories.userRepository,
        dependencies.auditRepository,
        dependencies.transactionManager,
      ),
      organizationPersistenceService: new OrganizationPersistenceService(
        dependencies.repositories.organizationRepository,
        dependencies.auditRepository,
        dependencies.transactionManager,
      ),
      workspacePersistenceService: new WorkspacePersistenceService(
        dependencies.repositories.workspaceRepository,
        dependencies.auditRepository,
        dependencies.transactionManager,
      ),
    };
  }

  /** Builds a container from persistence configuration and platform defaults. */
  static fromConfiguration(
    configuration: PersistenceConfiguration = DEFAULT_PERSISTENCE_CONFIGURATION,
  ): PersistenceContainer {
    const factory = new PersistenceFactory(configuration);

    return new PersistenceContainer({
      repositories: factory.createRepositories(),
      auditRepository: new NoOpAuditRepository(),
      transactionManager: new NoOpTransactionManager(),
    });
  }
}

/** Creates the default in-memory persistence container for development. */
export function createDefaultPersistenceContainer(): PersistenceContainer {
  return PersistenceContainer.fromConfiguration();
}
