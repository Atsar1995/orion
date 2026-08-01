import type { PlatformEntity } from "@/lib/data/models/entities";
import type { DataResult } from "@/lib/data/types";
import type { Filter, PaginatedResult, Pagination, Sort, TenantContext } from "@/types/persistence";

/** Shared read contract for platform data repositories (Mission S1C). */
export interface DataReadRepository<T extends PlatformEntity> {
  findById(id: string, context: TenantContext): Promise<DataResult<T | null>>;
  findMany(
    context: TenantContext,
    options?: { filter?: Filter; sort?: Sort; pagination?: Pagination },
  ): Promise<DataResult<PaginatedResult<T>>>;
}

/** Shared write contract for platform data repositories (Mission S1C). */
export interface DataWriteRepository<T extends PlatformEntity> {
  create(entity: T, context: TenantContext): Promise<DataResult<T>>;
  update(entity: T, context: TenantContext): Promise<DataResult<T>>;
  delete(id: string, context: TenantContext): Promise<DataResult<void>>;
}

/** Full platform data repository contract. */
export interface DataRepository<T extends PlatformEntity>
  extends DataReadRepository<T>,
    DataWriteRepository<T> {
  readonly entityName: string;
}
