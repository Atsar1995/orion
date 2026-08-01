import { DataErrorCode, type DataError } from "@/lib/data/types";

export function dataValidationError(message: string, source?: string): DataError {
  return {
    code: DataErrorCode.ValidationFailed,
    message,
    source,
    retryable: false,
  };
}

export function dataServiceUnavailableError(source?: string): DataError {
  return {
    code: DataErrorCode.ServiceUnavailable,
    message: "Data service is temporarily unavailable.",
    source,
    retryable: true,
  };
}

export function dataProviderFailedError(source: string, message: string): DataError {
  return {
    code: DataErrorCode.ProviderFailed,
    message,
    source,
    retryable: true,
  };
}

export function dataNotFoundError(entity: string, id: string): DataError {
  return {
    code: DataErrorCode.NotFound,
    message: `${entity} not found: ${id}`,
    retryable: false,
  };
}

export function dataUnknownError(message: string, source?: string): DataError {
  return {
    code: DataErrorCode.Unknown,
    message,
    source,
    retryable: true,
  };
}
