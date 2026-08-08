import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import type { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { AuroraLogger } from "@/lib/aurora/platform/services/AuroraLoggingService";
import type { HealthStatus } from "@/types/aurora-platform";

export type ModuleInitContext = {
  readonly wiring: AuroraWiring;
  readonly config: AuroraRuntimeConfiguration;
  readonly logger: AuroraLogger;
};

export type ModuleInitResult = {
  readonly success: boolean;
  readonly degraded?: boolean;
  readonly reason?: string;
};

export interface AuroraModuleRuntime {
  readonly moduleKey: string;
  readonly dependencies: readonly string[];
  initialize(ctx: ModuleInitContext): Promise<ModuleInitResult>;
  healthCheck(): Promise<HealthStatus>;
  shutdown(): Promise<void>;
}

export class AuroraModuleRegistry {
  private readonly modules = new Map<string, AuroraModuleRuntime>();

  register(module: AuroraModuleRuntime): void {
    if (this.modules.has(module.moduleKey)) {
      throw new Error(`Module already registered: ${module.moduleKey}`);
    }
    this.modules.set(module.moduleKey, module);
  }

  async initializeAll(ctx: ModuleInitContext): Promise<readonly ModuleInitResult[]> {
    const results: ModuleInitResult[] = [];
    for (const moduleRuntime of this.modules.values()) {
      for (const dependency of moduleRuntime.dependencies) {
        if (!this.modules.has(dependency)) {
          throw new Error(`Missing module dependency: ${dependency}`);
        }
      }
      results.push(await moduleRuntime.initialize(ctx));
    }
    return results;
  }

  async shutdownAll(): Promise<void> {
    for (const moduleRuntime of this.modules.values()) {
      await moduleRuntime.shutdown();
    }
  }

  async healthCheckAll(): Promise<Readonly<Record<string, HealthStatus>>> {
    const results: Record<string, HealthStatus> = {};
    for (const moduleRuntime of this.modules.values()) {
      results[moduleRuntime.moduleKey] = await moduleRuntime.healthCheck();
    }
    return results;
  }

  getModule(key: string): AuroraModuleRuntime | undefined {
    return this.modules.get(key);
  }
}
