/**
 * ORION Platform Services — error factories.
 */

import type { ServiceError } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

type ServiceErrorInput = {
  message: string;
  details?: Record<string, string>;
};

/** Creates a validation service error. */
export function validationError(input: ServiceErrorInput): ServiceError {
  return {
    code: ServiceErrorCode.Validation,
    message: input.message,
    details: input.details,
  };
}

/** Creates a not-implemented service error. */
export function notImplementedError(input: ServiceErrorInput): ServiceError {
  return {
    code: ServiceErrorCode.NotImplemented,
    message: input.message,
    details: input.details,
  };
}

/** Creates a service-unavailable error. */
export function serviceUnavailableError(
  input: ServiceErrorInput,
): ServiceError {
  return {
    code: ServiceErrorCode.ServiceUnavailable,
    message: input.message,
    details: input.details,
  };
}

/** Creates a configuration service error. */
export function configurationError(input: ServiceErrorInput): ServiceError {
  return {
    code: ServiceErrorCode.Configuration,
    message: input.message,
    details: input.details,
  };
}

/** Creates a dependency service error. */
export function dependencyError(input: ServiceErrorInput): ServiceError {
  return {
    code: ServiceErrorCode.Dependency,
    message: input.message,
    details: input.details,
  };
}

/** Creates an unknown service error. */
export function unknownServiceError(input: ServiceErrorInput): ServiceError {
  return {
    code: ServiceErrorCode.Unknown,
    message: input.message,
    details: input.details,
  };
}
