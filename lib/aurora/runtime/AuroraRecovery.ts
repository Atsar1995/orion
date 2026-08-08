import type { QueueManager } from "@/lib/aurora/infrastructure/QueueManager";
import type { SchedulerService } from "@/lib/aurora/infrastructure/SchedulerService";
import { AuroraRuntime } from "@/lib/aurora/runtime/AuroraRuntime";
import type { AuroraWiringConfig } from "@/lib/aurora/wiring/AuroraWiring";
import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import type { RecoveryVerificationResult } from "@/types/aurora-platform";

export class AuroraRecovery {
  static async verifyWarmRestart(
    config: AuroraWiringConfig,
    seed: (wiring: AuroraWiring) => Promise<void>,
    verify: (wiring: AuroraWiring) => Promise<void>,
  ): Promise<RecoveryVerificationResult> {
    const runtime = new AuroraRuntime(config);
    await runtime.boot();
    await seed(runtime.getWiring());
    await runtime.shutdown({ reason: "restart" });
    await runtime.boot();
    await verify(runtime.getWiring());
    return { success: true, message: "Warm restart verified." };
  }

  static async recoverRedisConnection(queueManager: QueueManager): Promise<void> {
    await queueManager.healthCheck();
  }

  static async recoverMissedSchedules(scheduler: SchedulerService): Promise<number> {
    await scheduler.start();
    return 0;
  }
}
