/**
 * ORION Persistence — core type definitions.
 * @see docs/02_Engineering/ES-010-Persistence-Foundation.md
 */

import type { RoleSlug } from "@/types/auth";

/** Base contract for all persistable domain entities. */
export interface Entity {
  id: string;
}

/** Tenant-scoped execution context propagated through persistence operations. */
export interface TenantContext {
  organizationId: string;
  workspaceId: string;
  userId: string;
  role: RoleSlug;
}

/** Standard result envelope for repository operations. */
export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: RepositoryError };

/** Structured repository error descriptor. */
export interface RepositoryError {
  code: PersistenceErrorCode;
  message: string;
  details?: Record<string, string>;
}

/** Persistence error codes for typed error handling. */
export enum PersistenceErrorCode {
  NotFound = "NOT_FOUND",
  Conflict = "CONFLICT",
  Validation = "VALIDATION",
  Unauthorized = "UNAUTHORIZED",
  TenantMismatch = "TENANT_MISMATCH",
  Concurrency = "CONCURRENCY",
  Storage = "STORAGE",
  Unknown = "UNKNOWN",
}

/** Pagination parameters for list queries. */
export interface Pagination {
  page: number;
  pageSize: number;
}

/** Sort direction for ordered queries. */
export type SortDirection = "asc" | "desc";

/** Sort specification for repository queries. */
export interface Sort<TField extends string = string> {
  field: TField;
  direction: SortDirection;
}

/** Filter operator for repository queries. */
export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "contains";

/** Single filter condition for repository queries. */
export interface Filter<TField extends string = string> {
  field: TField;
  operator: FilterOperator;
  value: string | number | boolean | string[];
}

/** Options applied to repository read operations. */
export interface RepositoryOptions<TField extends string = string> {
  pagination?: Pagination;
  sort?: Sort<TField>[];
  filters?: Filter<TField>[];
}

/** Paginated list result metadata. */
export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
  total: number;
}
