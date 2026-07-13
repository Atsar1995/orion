/**
 * ORION Persistence — typed result helpers.
 */

import type { RepositoryError, RepositoryResult } from "@/types/persistence";

/** Creates a successful repository result. */
export function success<T>(data: T): RepositoryResult<T> {
  return { success: true, data };
}

/** Creates a failed repository result. */
export function failure<T>(error: RepositoryError): RepositoryResult<T> {
  return { success: false, error };
}

/** Returns true when the result is successful. */
export function isSuccess<T>(
  result: RepositoryResult<T>,
): result is { success: true; data: T } {
  return result.success === true;
}

/** Returns true when the result is a failure. */
export function isFailure<T>(
  result: RepositoryResult<T>,
): result is { success: false; error: RepositoryError } {
  return result.success === false;
}

/** Unwraps a successful result or returns null. */
export function unwrapOrNull<T>(result: RepositoryResult<T>): T | null {
  return isSuccess(result) ? result.data : null;
}

/** Maps a successful result to a new value. */
export function mapResult<T, U>(
  result: RepositoryResult<T>,
  mapper: (data: T) => U,
): RepositoryResult<U> {
  if (isFailure(result)) {
    return result;
  }

  return success(mapper(result.data));
}
