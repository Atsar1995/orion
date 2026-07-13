/**
 * ORION Persistence — error types and factories.
 */

import type { RepositoryError } from "@/types/persistence";
import { PersistenceErrorCode } from "@/types/persistence";

type PersistenceErrorInput = {
  message: string;
  details?: Record<string, string>;
};

/** Creates a not-found persistence error. */
export function notFoundError(input: PersistenceErrorInput): RepositoryError {
  return {
    code: PersistenceErrorCode.NotFound,
    message: input.message,
    details: input.details,
  };
}

/** Creates a conflict persistence error. */
export function conflictError(input: PersistenceErrorInput): RepositoryError {
  return {
    code: PersistenceErrorCode.Conflict,
    message: input.message,
    details: input.details,
  };
}

/** Creates a validation persistence error. */
export function validationError(input: PersistenceErrorInput): RepositoryError {
  return {
    code: PersistenceErrorCode.Validation,
    message: input.message,
    details: input.details,
  };
}

/** Creates an unauthorized persistence error. */
export function unauthorizedError(
  input: PersistenceErrorInput,
): RepositoryError {
  return {
    code: PersistenceErrorCode.Unauthorized,
    message: input.message,
    details: input.details,
  };
}

/** Creates a tenant mismatch persistence error. */
export function tenantMismatchError(
  input: PersistenceErrorInput,
): RepositoryError {
  return {
    code: PersistenceErrorCode.TenantMismatch,
    message: input.message,
    details: input.details,
  };
}

/** Creates a concurrency persistence error. */
export function concurrencyError(
  input: PersistenceErrorInput,
): RepositoryError {
  return {
    code: PersistenceErrorCode.Concurrency,
    message: input.message,
    details: input.details,
  };
}

/** Creates a storage infrastructure persistence error. */
export function storageError(input: PersistenceErrorInput): RepositoryError {
  return {
    code: PersistenceErrorCode.Storage,
    message: input.message,
    details: input.details,
  };
}

/** Creates an unknown persistence error. */
export function unknownError(input: PersistenceErrorInput): RepositoryError {
  return {
    code: PersistenceErrorCode.Unknown,
    message: input.message,
    details: input.details,
  };
}

/** Type guard for not-found errors. */
export function isNotFoundError(error: RepositoryError): boolean {
  return error.code === PersistenceErrorCode.NotFound;
}

/** Type guard for conflict errors. */
export function isConflictError(error: RepositoryError): boolean {
  return error.code === PersistenceErrorCode.Conflict;
}

/** Type guard for validation errors. */
export function isValidationError(error: RepositoryError): boolean {
  return error.code === PersistenceErrorCode.Validation;
}

/** Type guard for unauthorized errors. */
export function isUnauthorizedError(error: RepositoryError): boolean {
  return error.code === PersistenceErrorCode.Unauthorized;
}

/** Type guard for tenant mismatch errors. */
export function isTenantMismatchError(error: RepositoryError): boolean {
  return error.code === PersistenceErrorCode.TenantMismatch;
}

/** Type guard for concurrency errors. */
export function isConcurrencyError(error: RepositoryError): boolean {
  return error.code === PersistenceErrorCode.Concurrency;
}
