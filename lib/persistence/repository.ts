/**
 * ORION Persistence — repository interfaces.
 */

import type {
  Entity,
  PaginatedResult,
  RepositoryOptions,
  RepositoryResult,
  TenantContext,
} from "@/types/persistence";

/** Read operations for a persistable entity type. */
export interface ReadRepository<T extends Entity> {
  findById(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<T | null>>;

  findMany(
    context: TenantContext,
    options?: RepositoryOptions,
  ): Promise<RepositoryResult<PaginatedResult<T>>>;
}

/** Write operations for a persistable entity type. */
export interface WriteRepository<T extends Entity> {
  create(
    entity: T,
    context: TenantContext,
  ): Promise<RepositoryResult<T>>;

  update(
    entity: T,
    context: TenantContext,
  ): Promise<RepositoryResult<T>>;

  delete(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<void>>;
}

/** Tenant-scoped repository contract marker. */
export interface TenantRepository<T extends Entity> {
  readonly entityName: string;
  readonly entityIdType?: T["id"];
  supportsTenant(context: TenantContext): RepositoryResult<true>;
}

/** Full repository contract combining read, write, and tenant awareness. */
export interface Repository<T extends Entity>
  extends ReadRepository<T>,
    WriteRepository<T>,
    TenantRepository<T> {}
