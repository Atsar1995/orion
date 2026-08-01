import { cookies } from "next/headers";
import { identityService } from "@/lib/identity";
import { SESSION_COOKIE_NAME } from "@/lib/identity/constants";
import type { IdentityProfile } from "@/lib/identity/types";
import type { Session } from "@/types/auth";

export async function getServerSession(): Promise<{
  session: Session | null;
  profile: IdentityProfile | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const session = await identityService.getSessionFromToken(token);

  if (!session) {
    return { session: null, profile: null };
  }

  return {
    session,
    profile: identityService.getProfile(session),
  };
}
