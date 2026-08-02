/**
 * Identity provider contract — local credentials only for GA (Mission P-015.6 · ADR-008).
 */

import type { AuthResult, LoginCredentials, Session } from "@/types/auth";
import type { AuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";

/** Technology-neutral identity provider abstraction (local GA · SSO post-GA). */
export interface IdentityProvider {
  authenticate(credentials: LoginCredentials): Promise<AuthResult<Session>>;
  resolveSession(token: string | null): Promise<AuthenticationContext>;
  revokeSession(token: string | null): Promise<void>;
}

/** Wraps existing ORION identity service for platform security layer. */
export class LocalIdentityProvider implements IdentityProvider {
  constructor(
    private readonly deps: {
      login: (credentials: LoginCredentials) => Promise<AuthResult<Session>>;
      getSessionFromToken: (token: string | null) => Promise<Session | null>;
      logout: (token: string | null) => Promise<void>;
    },
  ) {}

  async authenticate(credentials: LoginCredentials): Promise<AuthResult<Session>> {
    return this.deps.login(credentials);
  }

  async resolveSession(token: string | null): Promise<AuthenticationContext> {
    const session = await this.deps.getSessionFromToken(token);
    return createAuthenticationContext(session);
  }

  async revokeSession(token: string | null): Promise<void> {
    await this.deps.logout(token);
  }
}
