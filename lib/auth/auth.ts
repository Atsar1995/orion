/**
 * ORION Identity — authentication service contracts.
 * Placeholder implementations only. No provider or persistence logic.
 */

import type {
  AuthError,
  AuthResult,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginCredentials,
  ResetPasswordInput,
  Session,
} from "@/types/auth";
import { AuthErrorCode } from "@/types/auth";

/** Contract for authentication operations. */
export interface AuthService {
  login(credentials: LoginCredentials): AuthResult<Session>;
  logout(session: Session): AuthResult<{ message: string }>;
  forgotPassword(input: ForgotPasswordInput): AuthResult<{ message: string }>;
  resetPassword(input: ResetPasswordInput): AuthResult<{ message: string }>;
  changePassword(
    session: Session,
    input: ChangePasswordInput,
  ): AuthResult<{ message: string }>;
  validateCredentials(
    credentials: LoginCredentials,
  ): AuthResult<{ valid: boolean }>;
}

const NOT_IMPLEMENTED_ERROR: AuthError = {
  code: AuthErrorCode.NotImplemented,
  message: "Authentication service is not yet implemented.",
};

/** Creates a typed not-implemented failure result. */
export function createNotImplementedResult<T>(): AuthResult<T> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

/**
 * Authenticates a user and returns a session.
 * @placeholder Returns NOT_IMPLEMENTED until Phase 3.
 */
export function login(credentials: LoginCredentials): AuthResult<Session> {
  void credentials;
  return createNotImplementedResult<Session>();
}

/**
 * Ends an authenticated session.
 * @placeholder Returns NOT_IMPLEMENTED until Phase 3.
 */
export function logout(session: Session): AuthResult<{ message: string }> {
  void session;
  return createNotImplementedResult<{ message: string }>();
}

/**
 * Initiates a password recovery flow.
 * @placeholder Returns NOT_IMPLEMENTED until Phase 3.
 */
export function forgotPassword(
  input: ForgotPasswordInput,
): AuthResult<{ message: string }> {
  void input;
  return createNotImplementedResult<{ message: string }>();
}

/**
 * Completes a password reset using a recovery token.
 * @placeholder Returns NOT_IMPLEMENTED until Phase 3.
 */
export function resetPassword(
  input: ResetPasswordInput,
): AuthResult<{ message: string }> {
  void input;
  return createNotImplementedResult<{ message: string }>();
}

/**
 * Changes the password for an authenticated user.
 * @placeholder Returns NOT_IMPLEMENTED until Phase 3.
 */
export function changePassword(
  session: Session,
  input: ChangePasswordInput,
): AuthResult<{ message: string }> {
  void session;
  void input;
  return createNotImplementedResult<{ message: string }>();
}

/**
 * Validates credentials without creating a session.
 * @placeholder Returns NOT_IMPLEMENTED until Phase 3.
 */
export function validateCredentials(
  credentials: LoginCredentials,
): AuthResult<{ valid: boolean }> {
  void credentials;
  return createNotImplementedResult<{ valid: boolean }>();
}

/** Default authentication service contract backed by placeholder functions. */
export const authService: AuthService = {
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  validateCredentials,
};
