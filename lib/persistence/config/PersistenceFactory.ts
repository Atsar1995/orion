/**
 * ORION Persistence — repository factory.
 */

import type { Organization, User, Workspace } from "@/types/auth";
import {
  InMemoryOrganizationRepository,
  InMemoryUserRepository,
  InMemoryWorkspaceRepository,
} from "@/lib/persistence/memory";
import {
  PersistenceAdapter,
  type PersistenceConfiguration,
} from "@/lib/persistence/config/PersistenceConfiguration";
import type { ExtendedRepository } from "@/lib/persistence/services/shared";

/** Identity repository contracts constructed by the factory. */
export type UserRepository = ExtendedRepository<User>;
export type OrganizationRepository = ExtendedRepository<Organization>;
export type WorkspaceRepository = ExtendedRepository<Workspace>;

/** Repository bundle produced by the persistence factory. */
export interface PersistenceRepositories {
  userRepository: UserRepository;
  organizationRepository: OrganizationRepository;
  workspaceRepository: WorkspaceRepository;
}

/** Raised when a configured adapter has no implementation yet. */
export class PersistenceAdapterNotImplementedError extends Error {
  readonly adapter: PersistenceAdapter;

  constructor(adapter: PersistenceAdapter) {
    super(
      `Persistence adapter '${adapter}' is not yet implemented. Use '${PersistenceAdapter.InMemory}' for development.`,
    );
    this.name = "PersistenceAdapterNotImplementedError";
    this.adapter = adapter;
  }
}

/** Constructs repository adapters from persistence configuration. */
export class PersistenceFactory {
  constructor(private readonly config: PersistenceConfiguration) {}

  /** Returns the active persistence configuration. */
  getConfiguration(): PersistenceConfiguration {
    return this.config;
  }

  createUserRepository(): UserRepository {
    switch (this.config.adapter) {
      case PersistenceAdapter.InMemory:
        return new InMemoryUserRepository();
      case PersistenceAdapter.PostgreSQL:
      case PersistenceAdapter.SQLite:
      case PersistenceAdapter.SqlServer:
        throw new PersistenceAdapterNotImplementedError(this.config.adapter);
    }
  }

  createOrganizationRepository(): OrganizationRepository {
    switch (this.config.adapter) {
      case PersistenceAdapter.InMemory:
        return new InMemoryOrganizationRepository();
      case PersistenceAdapter.PostgreSQL:
      case PersistenceAdapter.SQLite:
      case PersistenceAdapter.SqlServer:
        throw new PersistenceAdapterNotImplementedError(this.config.adapter);
    }
  }

  createWorkspaceRepository(): WorkspaceRepository {
    switch (this.config.adapter) {
      case PersistenceAdapter.InMemory:
        return new InMemoryWorkspaceRepository();
      case PersistenceAdapter.PostgreSQL:
      case PersistenceAdapter.SQLite:
      case PersistenceAdapter.SqlServer:
        throw new PersistenceAdapterNotImplementedError(this.config.adapter);
    }
  }

  createRepositories(): PersistenceRepositories {
    return {
      userRepository: this.createUserRepository(),
      organizationRepository: this.createOrganizationRepository(),
      workspaceRepository: this.createWorkspaceRepository(),
    };
  }
}
