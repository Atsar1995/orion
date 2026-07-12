/**
 * ORION Identity — authentication audit event types and helpers.
 * No persistence in this phase.
 */

/** Authentication audit event categories. */
export enum AuditEventType {
  LoginSuccess = "LOGIN_SUCCESS",
  LoginFailure = "LOGIN_FAILURE",
  Logout = "LOGOUT",
  PasswordReset = "PASSWORD_RESET",
  PasswordChanged = "PASSWORD_CHANGED",
  SessionExpired = "SESSION_EXPIRED",
  AccountLocked = "ACCOUNT_LOCKED",
}

/** Recorded authentication audit event. */
export interface AuditEvent {
  type: AuditEventType;
  timestamp: Date;
  userId?: string;
  email?: string;
  organizationId?: string;
  workspaceId?: string;
  ipAddress?: string;
  reason?: string;
  metadata?: Record<string, string>;
}

/** Input for recording an audit event (timestamp is assigned automatically). */
export type RecordAuditEventInput = Omit<AuditEvent, "timestamp">;

/** In-memory audit log for development and testing. Not persisted. */
const auditLog: AuditEvent[] = [];

/** Creates and records an audit event. Returns the recorded event. */
export function recordAuditEvent(input: RecordAuditEventInput): AuditEvent {
  const event: AuditEvent = {
    ...input,
    timestamp: new Date(),
  };

  auditLog.push(event);
  return event;
}

/** Returns a read-only copy of recorded audit events. */
export function getAuditLog(): readonly AuditEvent[] {
  return [...auditLog];
}

/** Clears the in-memory audit log. Intended for tests only. */
export function clearAuditLog(): void {
  auditLog.length = 0;
}

/** Records a successful login event. */
export function recordLoginSuccess(
  input: Omit<RecordAuditEventInput, "type">,
): AuditEvent {
  return recordAuditEvent({ ...input, type: AuditEventType.LoginSuccess });
}

/** Records a failed login event. */
export function recordLoginFailure(
  input: Omit<RecordAuditEventInput, "type">,
): AuditEvent {
  return recordAuditEvent({ ...input, type: AuditEventType.LoginFailure });
}

/** Records a logout event. */
export function recordLogout(
  input: Omit<RecordAuditEventInput, "type">,
): AuditEvent {
  return recordAuditEvent({ ...input, type: AuditEventType.Logout });
}

/** Records a password reset event. */
export function recordPasswordReset(
  input: Omit<RecordAuditEventInput, "type">,
): AuditEvent {
  return recordAuditEvent({ ...input, type: AuditEventType.PasswordReset });
}

/** Records a password changed event. */
export function recordPasswordChanged(
  input: Omit<RecordAuditEventInput, "type">,
): AuditEvent {
  return recordAuditEvent({ ...input, type: AuditEventType.PasswordChanged });
}
