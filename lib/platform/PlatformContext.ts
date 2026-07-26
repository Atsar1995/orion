import type { ServiceContext } from "@/types/services";

/** Context passed to platform modules for tenant-scoped operations. */
export type PlatformContext = {
  readonly organizationId: string;
  readonly workspaceId?: string;
  readonly userId: string;
  readonly requestId: string;
  readonly locale: string;
  readonly timezone: string;
};

/** Converts a service context to the EP-001 platform context shape. */
export type PlatformContextMapper = (context: ServiceContext) => PlatformContext;

/** EP-001 platform context contract — no runtime implementation in EP-001. */
export interface PlatformContextProvider {
  getContext(): PlatformContext;
}
