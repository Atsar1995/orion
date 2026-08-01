import {
  OrganizationRepository,
  UserRepository,
  defaultOrganizationRepository,
  defaultUserRepository,
} from "@/lib/identity/repositories";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  getSessionSecret,
} from "@/lib/identity/constants";
import { createSessionId, hashPassword } from "@/lib/identity/data/demo-users";
import {
  payloadToSession,
  signSessionToken,
  verifySessionToken,
} from "@/lib/identity/session-token";
import type { IdentityProfile, SessionTokenPayload } from "@/lib/identity/types";
import {
  recordLoginFailure,
  recordLoginSuccess,
  recordLogout,
  recordAuditEvent,
  AuditEventType,
} from "@/lib/auth/audit";
import { createSession, isSessionActive } from "@/lib/auth/session";
import type { AuthResult, LoginCredentials, Session, User } from "@/types/auth";
import { AuthErrorCode, UserStatus } from "@/types/auth";

/** Shared ORION Identity Service — authentication isolated from workspaces (Mission S1A). */
export class IdentityService {
  constructor(
    private readonly users: UserRepository = defaultUserRepository,
    private readonly organizations: OrganizationRepository = defaultOrganizationRepository,
  ) {}

  async login(credentials: LoginCredentials): Promise<
    AuthResult<{ session: Session; token: string }>
  > {
    const user = this.users.findByEmail(credentials.email);

    if (!user || user.passwordHash !== hashPassword(credentials.password)) {
      recordLoginFailure({ email: credentials.email, reason: "invalid_credentials" });
      return {
        success: false,
        error: {
          code: AuthErrorCode.InvalidCredentials,
          message: "Invalid email or password.",
        },
      };
    }

    if (user.status !== UserStatus.Active) {
      recordLoginFailure({ email: user.email, userId: user.id, reason: "account_inactive" });
      return {
        success: false,
        error: {
          code: AuthErrorCode.AccountInactive,
          message: "This account is not active.",
        },
      };
    }

    const workspace = this.organizations.getWorkspace(user.workspaceId);

    if (!workspace) {
      return {
        success: false,
        error: {
          code: AuthErrorCode.ValidationFailed,
          message: "Workspace is unavailable.",
        },
      };
    }

    const session = this.buildSession(user, workspace);
    const token = await this.createTokenForUser(user);

    recordLoginSuccess({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      workspaceId: user.workspaceId,
    });

    return { success: true, data: { session, token } };
  }

  async logout(token: string | null): Promise<AuthResult<{ message: string }>> {
    if (token) {
      const payload = await verifySessionToken(token, getSessionSecret());

      if (payload) {
        recordLogout({
          userId: payload.sub,
          email: payload.email,
          organizationId: payload.organizationId,
          workspaceId: payload.workspaceId,
        });
      }
    }

    return { success: true, data: { message: "Signed out successfully." } };
  }

  async getSessionFromToken(token: string | null): Promise<Session | null> {
    if (!token) {
      return null;
    }

    const payload = await verifySessionToken(token, getSessionSecret());

    if (!payload) {
      return null;
    }

    const workspace = this.organizations.getWorkspace(payload.workspaceId);

    if (!workspace) {
      return null;
    }

    const session = payloadToSession(payload, workspace);

    if (!isSessionActive(session)) {
      recordAuditEvent({
        type: AuditEventType.SessionExpired,
        userId: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId,
        workspaceId: payload.workspaceId,
      });
      return null;
    }

    return session;
  }

  getProfile(session: Session): IdentityProfile | null {
    const organization = this.organizations.getById(session.user.organizationId);

    if (!organization) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      organizationId: session.user.organizationId,
      workspaceId: session.user.workspaceId,
      organization,
      workspace: session.activeWorkspace,
    };
  }

  private buildSession(
    user: IdentityUserRecord,
    workspace: Session["activeWorkspace"],
  ): Session {
    return createSession({
      user: this.toUser(user),
      activeWorkspace: workspace,
      durationMs: SESSION_MAX_AGE_SECONDS * 1000,
    });
  }

  private async createTokenForUser(user: IdentityUserRecord): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload: SessionTokenPayload = {
      sid: createSessionId(),
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      workspaceId: user.workspaceId,
      permissions: user.permissions,
      iat: now,
      exp: now + SESSION_MAX_AGE_SECONDS,
    };

    return signSessionToken(payload, getSessionSecret());
  }

  private toUser(record: IdentityUserRecord): User {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      status: record.status,
      organizationId: record.organizationId,
      workspaceId: record.workspaceId,
      role: record.role,
      permissions: record.permissions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

type IdentityUserRecord = import("@/lib/identity/types").IdentityUserRecord;

export const identityService = new IdentityService();

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
