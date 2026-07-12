/**
 * ORION Identity — core type definitions.
 * @see docs/02_Engineering/ES-009-Identity-Authentication-Foundation.md
 */

/** Lifecycle state for a user account. */
export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
  Locked = "locked",
}

/** Lifecycle state for an organization tenant. */
export enum OrganizationStatus {
  Active = "active",
  Inactive = "inactive",
}

/** System role slug identifiers aligned with {@link SystemRole} in lib/auth/roles.ts. */
export type RoleSlug =
  | "founder"
  | "administrator"
  | "manager"
  | "staff"
  | "guest"
  | "service_account";

/** Authenticated platform user scoped to an organization and workspace. */
export interface User {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  organizationId: string;
  workspaceId: string;
  role: RoleSlug;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

/** Multi-tenant organization (tenant boundary). */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
}

/** Business environment within an organization. */
export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  modules: string[];
}

/** Named role definition. */
export interface Role {
  id: string;
  name: string;
  slug: RoleSlug;
}

/** Module-scoped authorization grant. */
export interface Permission {
  module: string;
  action: string;
}

/** Authenticated session bound to a user and active workspace. */
export interface Session {
  user: User;
  expiresAt: Date;
  activeWorkspace: Workspace;
}

/** Credentials submitted during sign-in. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Input for initiating a password recovery flow. */
export interface ForgotPasswordInput {
  email: string;
}

/** Input for completing a password reset. */
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/** Input for changing a password while authenticated. */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Standard authentication operation result. */
export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: AuthError };

/** Authentication error descriptor. */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/** Authentication error codes for typed error handling. */
export enum AuthErrorCode {
  NotImplemented = "NOT_IMPLEMENTED",
  InvalidCredentials = "INVALID_CREDENTIALS",
  AccountLocked = "ACCOUNT_LOCKED",
  AccountInactive = "ACCOUNT_INACTIVE",
  SessionExpired = "SESSION_EXPIRED",
  ValidationFailed = "VALIDATION_FAILED",
}
