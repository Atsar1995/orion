import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieOptions, identityService } from "@/lib/identity";
import { SESSION_COOKIE_NAME } from "@/lib/identity/constants";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

  const result = await identityService.logout(token);

  const response = NextResponse.json({
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : result.error,
  });

  const cookieOptions = getSessionCookieOptions(0);
  response.cookies.set({
    ...cookieOptions,
    value: "",
  });

  return response;
}
