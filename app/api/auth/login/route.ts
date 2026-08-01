import { NextResponse } from "next/server";
import { getSessionCookieOptions, identityService } from "@/lib/identity";
import { serializeSession } from "@/lib/identity/session-serialization";
import { platformLogger } from "@/lib/data/logging/PlatformLogger";
import { isValidEmail, isValidPassword, sanitizeTextInput } from "@/lib/security/sanitize";
import type { LoginCredentials } from "@/types/auth";

export async function POST(request: Request) {
  let body: Partial<LoginCredentials>;

  try {
    body = (await request.json()) as Partial<LoginCredentials>;
  } catch {
    platformLogger.validationFailure("Invalid login request body", "auth.login");
    return NextResponse.json(
      { success: false, error: { message: "Invalid request body." } },
      { status: 400 },
    );
  }

  const email = sanitizeTextInput(body.email ?? "", 320);
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: { message: "Email and password are required." } },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    platformLogger.validationFailure("Invalid email format", "auth.login");
    return NextResponse.json(
      { success: false, error: { message: "Invalid email format." } },
      { status: 400 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid password." } },
      { status: 400 },
    );
  }

  const result = await identityService.login({ email, password });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 },
    );
  }

  const cookieOptions = getSessionCookieOptions();
  const response = NextResponse.json({
    success: true,
    data: { session: serializeSession(result.data.session) },
  });

  response.cookies.set({
    ...cookieOptions,
    value: result.data.token,
  });

  return response;
}
