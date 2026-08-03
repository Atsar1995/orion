/**
 * Finance API permission guards (Mission P-009.14 · ADR-009).
 */

import "@/lib/finance/security";
import "@/lib/platform/security/security-audit";

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/identity/server-session";
import { resolveFinanceRoutePermission } from "@/lib/finance/security/finance-permission-catalog";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import {
  AuthorizationError,
  isAuthorizationError,
} from "@/lib/platform/security/AuthorizationResult";
import { defaultAuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";

export type FinanceApiContextOptions = {
  readonly permission?: PermissionCode | null;
  readonly resourceOrganizationId?: string;
};

function financeError(error: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

function resolveOptions(input?: Request | FinanceApiContextOptions): FinanceApiContextOptions {
  if (!input) {
    return {};
  }

  if (input instanceof Request) {
    const url = new URL(input.url);
    return {
      permission: resolveFinanceRoutePermission(input.method, url.pathname),
    };
  }

  return input;
}

/** Resolves authenticated and authorized service context for Finance API routes. */
export async function getFinanceApiContext(requestOrOptions?: Request | FinanceApiContextOptions) {
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

/** Resolves Finance API context and returns an HTTP error response when authorization fails. */
export async function getFinanceApiContextForRequest(request: Request) {
  try {
    const resolved = await getFinanceApiContext(request);
    return { ...resolved, errorResponse: null as null };
  } catch (error) {
    if (isAuthorizationError(error)) {
      return {
        errorResponse: financeError(error.code, error.code === "UNAUTHORIZED" ? 401 : 403),
      };
    }
    throw error;
  }
}

export { AuthorizationError as FinanceAuthorizationError };
