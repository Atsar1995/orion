import type { ModuleInitContext, ModuleInitResult } from "@/lib/aurora/runtime/AuroraModuleRegistry";
import type { AuroraModuleRegistry } from "@/lib/aurora/runtime/AuroraModuleRegistry";

/** Coordinates module initialization order during boot Phase 6. */
export class AuroraInitOrchestrator {
  constructor(private readonly moduleRegistry: AuroraModuleRegistry) {}

  async initialize(ctx: ModuleInitContext): Promise<readonly ModuleInitResult[]> {
    return this.moduleRegistry.initializeAll(ctx);
  }
}
