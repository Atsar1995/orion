import { hcmError } from "@/lib/hcm/api/hcm-api-response";

const NOT_FOUND_CODES = new Set([
  "ORG_UNIT_NOT_FOUND",
  "POSITION_NOT_FOUND",
  "EMPLOYEE_NOT_FOUND",
  "EMPLOYMENT_NOT_FOUND",
  "CANDIDATE_NOT_FOUND",
  "APPLICATION_NOT_FOUND",
  "OFFER_NOT_FOUND",
  "ONBOARDING_PROCESS_NOT_FOUND",
  "DOCUMENT_NOT_FOUND",
  "GUEST_NOT_FOUND",
]);

const CONFLICT_CODES = new Set([
  "DUPLICATE_ORG_CODE",
  "DUPLICATE_EMPLOYEE_NUMBER",
  "DUPLICATE_EMPLOYEE_IDENTITY",
  "DUPLICATE_CANDIDATE_NUMBER",
  "DUPLICATE_EMPLOYMENT_NUMBER",
  "ORG_UNIT_ALREADY_INACTIVE",
  "ACTIVE_CHILDREN_EXIST",
]);

/** Maps domain error codes to HTTP status without leaking internals. */
export function resolveHcmErrorStatus(message: string): number {
  if (NOT_FOUND_CODES.has(message)) return 404;
  if (CONFLICT_CODES.has(message)) return 409;
  if (message === "MISSING_PARAMS" || message.startsWith("INVALID_")) return 400;
  if (message === "UNAUTHORIZED") return 401;
  if (message === "FORBIDDEN" || message === "PERMISSION_DENIED") return 403;
  if (message.startsWith("CIRCULAR_")) return 422;
  return 400;
}

export function hcmFromError(error: unknown, fallback = "HCM_ERROR") {
  const message = error instanceof Error ? error.message : fallback;
  return hcmError(message, resolveHcmErrorStatus(message));
}
