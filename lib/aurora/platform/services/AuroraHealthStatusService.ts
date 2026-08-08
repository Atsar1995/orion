import { AURORA_PLATFORM_VERSION } from "@/lib/aurora/constants";
import type { AuroraRepositories } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { CircuitBreakerRegistry } from "@/lib/aurora/infrastructure/CircuitBreakerRegistry";
import type { QueueManager } from "@/lib/aurora/infrastructure/QueueManager";
import type { AuroraModuleRegistry } from "@/lib/aurora/runtime/AuroraModuleRegistry";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import type { AuroraHealthReport, HealthStatus } from "@/types/aurora-platform";

export interface AuroraHealthStatusService {
  getPlatformHealth(): Promise<AuroraHealthReport>;
  getModuleHealth(moduleKey: string): Promise<HealthStatus>;
}

export class DefaultAuroraHealthStatusService implements AuroraHealthStatusService {
  private readonly startedAt = Date.now();

  constructor(
    private readonly lifecycle: () => PlatformLifecycleState,
    private readonly degradedReasons: () => readonly string[],
    private readonly repositories: AuroraRepositories,
    private readonly queueManager: QueueManager,
    private readonly circuitBreakerRegistry: CircuitBreakerRegistry,
    private readonly moduleRegistry: AuroraModuleRegistry,
    private readonly platformStore: PlatformStore,
  ) {}

  async getPlatformHealth(): Promise<AuroraHealthReport> {
    const moduleHealth = await this.moduleRegistry.healthCheckAll();
    const breakerHealth = await this.circuitBreakerRegistry.healthCheck();
    const queueHealth = await this.queueManager.healthCheck();
    const storeHealth = this.platformStore.getHealth();

    const infrastructure: Record<string, HealthStatus> = {
      postgresql: {
        status:
          storeHealth.status === "healthy"
            ? "healthy"
            : storeHealth.status === "degraded"
              ? "degraded"
              : "unhealthy",
        message: storeHealth.message,
        checkedAt: new Date().toISOString(),
      },
      redis: {
        status: "healthy",
        message: "Redis connectivity delegated to queue manager in A-007.",
        checkedAt: new Date().toISOString(),
      },
      circuitBreakers: breakerHealth,
      queues: queueHealth,
    };

    const queues = {
      "aurora:platform:tasks": await this.queueManager.getQueueHealth("aurora:platform:tasks"),
      "aurora:schedule:tasks": await this.queueManager.getQueueHealth("aurora:schedule:tasks"),
    } satisfies AuroraHealthReport["queues"];

    return {
      lifecycle: this.lifecycle(),
      modules: moduleHealth,
      infrastructure,
      queues,
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
      degradedReasons: [...this.degradedReasons()],
      version: AURORA_PLATFORM_VERSION,
    };
  }

  async getModuleHealth(moduleKey: string): Promise<HealthStatus> {
    const moduleRuntime = this.moduleRegistry.getModule(moduleKey);
    if (!moduleRuntime) {
      return {
        status: "unhealthy",
        message: `Module not found: ${moduleKey}`,
        checkedAt: new Date().toISOString(),
      };
    }
    return moduleRuntime.healthCheck();
  }
}
