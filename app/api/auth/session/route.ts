import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { identityService } from "@/lib/identity";
import { SESSION_COOKIE_NAME } from "@/lib/identity/constants";
import { serializeSession } from "@/lib/identity/session-serialization";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const session = await identityService.getSessionFromToken(token);

  if (!session) {
    return NextResponse.json(
      { success: false, error: { message: "No active session." } },
      { status: 401 },
    );
  }

  const profile = identityService.getProfile(session);

  return NextResponse.json({
    success: true,
    data: {
      session: serializeSession(session),
      profile,
    },
  });
}
