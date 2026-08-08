import {
  AURORA_DEFAULT_LOCALE,
  AURORA_DEFAULT_TIMEZONE,
} from "@/lib/aurora/constants";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";

export type AuroraRole =
  | "aurora.admin"
  | "aurora.editor"
  | "aurora.approver"
  | "aurora.viewer"
  | "aurora.agent.service";

export type { PlatformLifecycleState };

export function createAuroraRuntimeContext(
  input: Partial<AuroraRuntimeContext> & Pick<AuroraRuntimeContext, "tenantId" | "userId">,
  platformState: PlatformLifecycleState = "ready",
): AuroraRuntimeContext {
  return {
    tenantId: input.tenantId,
    userId: input.userId,
    roles: input.roles ?? ["aurora.admin"],
    brandId: input.brandId ?? "",
    businessId: input.businessId ?? input.tenantId,
    locale: input.locale ?? AURORA_DEFAULT_LOCALE,
    timezone: input.timezone ?? AURORA_DEFAULT_TIMEZONE,
    requestId: input.requestId ?? crypto.randomUUID(),
    correlationId: input.correlationId ?? crypto.randomUUID(),
    sessionId: input.sessionId,
    platformState,
    featureFlags: input.featureFlags ?? {},
  };
}
