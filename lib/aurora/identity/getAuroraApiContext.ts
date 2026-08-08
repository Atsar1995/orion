import type { AuroraIdentityBridge } from "@/lib/aurora/identity/AuroraIdentityBridge";
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { getServerSession } from "@/lib/identity/server-session";

export type GetAuroraApiContextOptions = {
  readonly brandId?: string;
};

/**
 * Build AuroraRuntimeContext from the current ORION HTTP session (ES-AURORA-006 Appendix F).
 * Authentication remains ORION-owned — this helper only maps session → Aurora context.
 */
export async function getAuroraApiContext(
  bridge: AuroraIdentityBridge,
  options: GetAuroraApiContextOptions = {},
): Promise<AuroraRuntimeContext> {
  const { session } = await getServerSession();
  if (!session) {
    throw new AuroraError(AURORA_ERR_0403, "Unauthenticated.", 403);
  }

  return bridge.buildContext(session, options.brandId);
}
