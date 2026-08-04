/**
 * CRM API permission guards (Mission P-008.12 · ADR-009).
 */

import "@/lib/crm/security";
import "@/lib/platform/security/security-audit";

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/identity/server-session";
import { resolveCrmRoutePermission } from "@/lib/crm/security/crm-permission-catalog";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import {
  AuthorizationError,
  isAuthorizationError,
} from "@/lib/platform/security/AuthorizationResult";
import { defaultAuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";

export type CrmApiContextOptions = {
  readonly permission?: PermissionCode | null;
  readonly resourceOrganizationId?: string;
};

function crmError(error: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

function resolveOptions(input?: Request | CrmApiContextOptions): CrmApiContextOptions {
  if (!input) {
    return {};
  }

  if (input instanceof Request) {
    const url = new URL(input.url);
    return {
      permission: resolveCrmRoutePermission(input.method, url.pathname),
    };
  }

  return input;
}

/** Resolves authenticated and authorized service context for CRM API routes. */
export async function getCrmApiContext(requestOrOptions?: Request | CrmApiContextOptions) {
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

/** Resolves CRM API context and returns an HTTP error response when authorization fails. */
export async function getCrmApiContextForRequest(request: Request) {
  try {
    const resolved = await getCrmApiContext(request);
    return { ...resolved, errorResponse: null as null };
  } catch (error) {
    if (isAuthorizationError(error)) {
      return {
        errorResponse: crmError(error.code, error.code === "UNAUTHORIZED" ? 401 : 403),
      };
    }
    throw error;
  }
}

export { AuthorizationError as CrmAuthorizationError };
