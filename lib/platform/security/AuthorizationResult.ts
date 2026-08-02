/**
 * Authorization evaluation result (Mission P-015.6 · ADR-009).
 */

import type { PermissionCode } from "@/lib/platform/security/Permission";

export type AuthorizationDecision = "allow" | "deny";

export type AuthorizationResult = {
  readonly decision: AuthorizationDecision;
  readonly allowed: boolean;
  readonly permission: PermissionCode;
  readonly reason: string;
  readonly audited: boolean;
};

export function allowResult(
  permission: PermissionCode,
  reason = "Permission granted.",
): AuthorizationResult {
  return {
    decision: "allow",
    allowed: true,
    permission,
    reason,
    audited: false,
  };
}

export function denyResult(
  permission: PermissionCode,
  reason: string,
  audited = false,
): AuthorizationResult {
  return {
    decision: "deny",
    allowed: false,
    permission,
    reason,
    audited,
  };
}

/** Thrown when authorization fails at API boundaries. */
export class AuthorizationError extends Error {
  readonly code: "UNAUTHORIZED" | "FORBIDDEN";
  readonly permission?: PermissionCode;

  constructor(code: "UNAUTHORIZED" | "FORBIDDEN", message: string, permission?: PermissionCode) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
    this.permission = permission;
  }
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}
