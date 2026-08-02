import "@/lib/hcm/auth";
import "@/lib/platform/security/security-audit";

import { getServerSession } from "@/lib/identity/server-session";
import { resolveHcmRoutePermission } from "@/lib/hcm/auth/hcm-permission-catalog";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import {
  AuthorizationError,
  isAuthorizationError,
} from "@/lib/platform/security/AuthorizationResult";
import { defaultAuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";
import { hcmError } from "@/lib/hcm/api/hcm-api-response";

export type HcmApiContextOptions = {
  readonly permission?: PermissionCode | null;
  readonly resourceOrganizationId?: string;
};

function resolveOptions(input?: Request | HcmApiContextOptions): HcmApiContextOptions {
  if (!input) {
    return {};
  }

  if (input instanceof Request) {
    const url = new URL(input.url);
    return {
      permission: resolveHcmRoutePermission(input.method, url.pathname),
    };
  }

  return input;
}

/** Resolves authenticated and authorized service context for HCM API routes. */
export async function getHcmApiContext(requestOrOptions?: Request | HcmApiContextOptions) {
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

/** Resolves HCM API context and returns an HTTP error response when authorization fails. */
export async function getHcmApiContextForRequest(request: Request) {
  try {
    const resolved = await getHcmApiContext(request);
    return { ...resolved, errorResponse: null as null };
  } catch (error) {
    if (isAuthorizationError(error)) {
      return {
        errorResponse: hcmError(error.code, error.code === "UNAUTHORIZED" ? 401 : 403),
      };
    }
    throw error;
  }
}

export { AuthorizationError as HcmAuthorizationError };
