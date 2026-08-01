/**
 * ORION Identity — authentication service contracts.
 * Delegates to the shared Identity Service (Mission S1A).
 */

import { identityService } from "@/lib/identity";
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
  login(credentials: LoginCredentials): Promise<AuthResult<Session>>;
  logout(token: string | null): Promise<AuthResult<{ message: string }>>;
  forgotPassword(input: ForgotPasswordInput): Promise<AuthResult<{ message: string }>>;
  resetPassword(input: ResetPasswordInput): Promise<AuthResult<{ message: string }>>;
  changePassword(
    session: Session,
    input: ChangePasswordInput,
  ): Promise<AuthResult<{ message: string }>>;
  validateCredentials(
    credentials: LoginCredentials,
  ): Promise<AuthResult<{ valid: boolean }>>;
}

const NOT_IMPLEMENTED_ERROR: AuthError = {
  code: AuthErrorCode.NotImplemented,
  message: "Authentication service is not yet implemented.",
};

export function createNotImplementedResult<T>(): AuthResult<T> {
  return { success: false, error: NOT_IMPLEMENTED_ERROR };
}

export async function login(credentials: LoginCredentials): Promise<AuthResult<Session>> {
  const result = await identityService.login(credentials);

  if (!result.success) {
    return result;
  }

  return { success: true, data: result.data.session };
}

export async function logout(token: string | null): Promise<AuthResult<{ message: string }>> {
  return identityService.logout(token);
}

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<AuthResult<{ message: string }>> {
  void input;
  return createNotImplementedResult<{ message: string }>();
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<AuthResult<{ message: string }>> {
  void input;
  return createNotImplementedResult<{ message: string }>();
}

export async function changePassword(
  session: Session,
  input: ChangePasswordInput,
): Promise<AuthResult<{ message: string }>> {
  void session;
  void input;
  return createNotImplementedResult<{ message: string }>();
}

export async function validateCredentials(
  credentials: LoginCredentials,
): Promise<AuthResult<{ valid: boolean }>> {
  const result = await identityService.login(credentials);

  if (!result.success) {
    if (result.error.code === AuthErrorCode.InvalidCredentials) {
      return { success: true, data: { valid: false } };
    }

    return result as AuthResult<{ valid: boolean }>;
  }

  return { success: true, data: { valid: true } };
}

export const authService: AuthService = {
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  validateCredentials,
};
