import type { ModuleInitContext, ModuleInitResult } from "@/lib/aurora/runtime/AuroraModuleRegistry";
import type { AuroraModuleRuntime } from "@/lib/aurora/runtime/AuroraModuleRegistry";
import type { AuroraWiringConfig } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { HealthStatus } from "@/types/aurora-platform";

export class AdminModuleRuntime implements AuroraModuleRuntime {
  readonly moduleKey = "admin";
  readonly dependencies: readonly string[] = [];

  async initialize(ctx: ModuleInitContext): Promise<ModuleInitResult> {
    const config = ctx.config as AuroraWiringConfig;
    if (config.forceAdminInitFailure) {
      return { success: false, reason: "Admin module initialization failed." };
    }
    if (!ctx.wiring.tenantService || !ctx.wiring.brandService) {
      return { success: false, reason: "Admin services not wired." };
    }
    return { success: true };
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: "healthy",
      message: "Admin module operational.",
      checkedAt: new Date().toISOString(),
    };
  }

  async shutdown(): Promise<void> {
    // No resources to release in A-007
  }
}
