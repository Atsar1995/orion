/**
 * ORION Identity Engine — public API.
 *
 * Re-exports types, contracts, and helper utilities for authentication,
 * authorization, sessions, roles, and audit logging.
 *
 * @see docs/02_Engineering/ES-009-Identity-Authentication-Foundation.md
 */

// Authentication contracts
export {
  authService,
  changePassword,
  createNotImplementedResult,
  forgotPassword,
  login,
  logout,
  resetPassword,
  validateCredentials,
} from "@/lib/auth/auth";
export type { AuthService } from "@/lib/auth/auth";

// Audit logging
export {
  AuditEventType,
  clearAuditLog,
  getAuditLog,
  recordAuditEvent,
  recordLoginFailure,
  recordLoginSuccess,
  recordLogout,
  recordPasswordChanged,
  recordPasswordReset,
} from "@/lib/auth/audit";
export type { AuditEvent, RecordAuditEventInput } from "@/lib/auth/audit";

// Permissions
export {
  canAccess,
  canAccessModule,
  getAccessibleModules,
  hasAnyRole,
  hasPermission,
  hasRole,
  isPrivilegedRole,
  isValidRole,
  parsePermissionKey,
  permissionKey,
  permissionsMatch,
} from "@/lib/auth/permissions";

// Roles
export {
  SystemRole,
  getRoleLabel,
  isAdministrator,
  isFounder,
  isGuest,
  isManager,
  isServiceAccount,
  isStaff,
  toSystemRole,
  userIsAdministrator,
  userIsFounder,
  userIsGuest,
  userIsManager,
  userIsStaff,
} from "@/lib/auth/roles";

// Sessions
export {
  DEFAULT_SESSION_DURATION_MS,
  createSession,
  destroySession,
  getActiveWorkspaceId,
  getSessionOrganizationId,
  getSessionRemainingMs,
  getSessionUserId,
  isSessionActive,
  isSessionExpired,
} from "@/lib/auth/session";
export type { CreateSessionInput } from "@/lib/auth/session";

// Core types
export {
  AuthErrorCode,
  OrganizationStatus,
  UserStatus,
} from "@/types/auth";
export type {
  AuthError,
  AuthResult,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginCredentials,
  Organization,
  Permission,
  ResetPasswordInput,
  Role,
  RoleSlug,
  Session,
  User,
  Workspace,
} from "@/types/auth";
