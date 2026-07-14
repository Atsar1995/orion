/**
 * ORION Platform Services — typed result helpers.
 */

import type { ServiceError, ServiceResult } from "@/types/services";

/** Creates a successful service result. */
export function success<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/** Creates a failed service result. */
export function failure<T>(error: ServiceError): ServiceResult<T> {
  return { success: false, error };
}

/** Returns true when the result is successful. */
export function isSuccess<T>(
  result: ServiceResult<T>,
): result is { success: true; data: T } {
  return result.success === true;
}

/** Returns true when the result is a failure. */
export function isFailure<T>(
  result: ServiceResult<T>,
): result is { success: false; error: ServiceError } {
  return result.success === false;
}

/** Unwraps a successful result or returns null. */
export function unwrapOrNull<T>(result: ServiceResult<T>): T | null {
  return isSuccess(result) ? result.data : null;
}

/** Maps a successful result to a new value. */
export function mapResult<T, U>(
  result: ServiceResult<T>,
  mapper: (data: T) => U,
): ServiceResult<U> {
  if (isFailure(result)) {
    return result;
  }

  return success(mapper(result.data));
}
