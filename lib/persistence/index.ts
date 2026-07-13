/**
 * ORION Persistence Foundation — public API.
 *
 * Contracts and helpers for tenant-aware data access.
 *
 * @see docs/02_Engineering/ES-010-Persistence-Foundation.md
 */

// Repository interfaces
export type {
  ReadRepository,
  Repository,
  TenantRepository,
  WriteRepository,
} from "@/lib/persistence/repository";

// Result helpers
export {
  isFailure,
  isSuccess,
  mapResult,
  success,
  failure,
  unwrapOrNull,
} from "@/lib/persistence/result";

// Tenant context helpers
export {
  createTenantContext,
  isSameOrganization,
  isSameWorkspace,
  validateTenantContext,
} from "@/lib/persistence/tenant-context";
export type { CreateTenantContextInput } from "@/lib/persistence/tenant-context";

// Error factories and guards
export {
  concurrencyError,
  conflictError,
  isConcurrencyError,
  isConflictError,
  isNotFoundError,
  isTenantMismatchError,
  isUnauthorizedError,
  isValidationError,
  notFoundError,
  storageError,
  tenantMismatchError,
  unauthorizedError,
  unknownError,
  validationError,
} from "@/lib/persistence/errors";

// Core types
export { PersistenceErrorCode } from "@/types/persistence";
export type {
  Entity,
  Filter,
  FilterOperator,
  PaginatedResult,
  Pagination,
  RepositoryError,
  RepositoryOptions,
  RepositoryResult,
  Sort,
  SortDirection,
  TenantContext,
} from "@/types/persistence";
