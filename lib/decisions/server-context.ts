import { getServerSession } from "@/lib/identity/server-session";
import type { ServiceContext } from "@/types/services";

const DEFAULT_CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

/** Builds platform service context from authenticated session. */
export async function getDecisionServiceContext(): Promise<{
  context: ServiceContext;
  executiveName: string;
}> {
  const { session } = await getServerSession();

  if (!session) {
    return { context: DEFAULT_CONTEXT, executiveName: "Executive" };
  }

  return {
    context: {
      organizationId: session.user.organizationId,
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      role: session.user.role,
    },
    executiveName: session.user.name,
  };
}
