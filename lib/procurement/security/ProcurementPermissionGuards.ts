/**
 * Procurement API permission guards (Mission P-010.5 · ADR-009).
 */

import "@/lib/procurement/security";
import "@/lib/platform/security/security-audit";

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/identity/server-session";
import { resolveProcurementRoutePermission } from "@/lib/procurement/security/procurement-permission-catalog";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import {
  AuthorizationError,
  isAuthorizationError,
} from "@/lib/platform/security/AuthorizationResult";
import { defaultAuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";

export type ProcurementApiContextOptions = {
  readonly permission?: PermissionCode | null;
  readonly resourceOrganizationId?: string;
};

function procurementError(error: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

function resolveOptions(input?: Request | ProcurementApiContextOptions): ProcurementApiContextOptions {
  if (!input) {
    return {};
  }

  if (input instanceof Request) {
    const url = new URL(input.url);
    return {
      permission: resolveProcurementRoutePermission(input.method, url.pathname),
    };
  }

  return input;
}

/** Resolves authenticated and authorized service context for Procurement API routes. */
export async function getProcurementApiContext(
  requestOrOptions?: Request | ProcurementApiContextOptions,
) {
  const options = resolveOptions(requestOrOptions);
  const { session } = await getServerSession();
  const authentication = createAuthenticationContext(session);

  const authorized = defaultAuthorizationMiddleware.authorize(authentication, {
    permission: options.permission ?? undefined,
    resourceOrganizationId: options.resourceOrganizationId,
  });

  return {
    context: authorized.context,
    executiveName: authorized.executiveName,
    identity: authorized.identity,
  };
}

/** Resolves Procurement API context and returns an HTTP error response when authorization fails. */
export async function getProcurementApiContextForRequest(request: Request) {
  try {
    const resolved = await getProcurementApiContext(request);
    return { ...resolved, errorResponse: null as null };
  } catch (error) {
    if (isAuthorizationError(error)) {
      return {
        errorResponse: procurementError(
          error.code,
          error.code === "UNAUTHORIZED" ? 401 : 403,
        ),
      };
    }
    throw error;
  }
}

export { AuthorizationError as ProcurementAuthorizationError };
