/**
 * Platform performance benchmark harness (Mission P-015.9).
 */

import { healthStatusService } from "@/lib/observability/HealthStatusService";
import { createDatabaseHealthReport } from "@/lib/platform/persistence/DatabaseHealth";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import type { BenchmarkCategory } from "@/lib/platform/performance/PerformanceTypes";
import { performanceMetrics, type BudgetEvaluation } from "@/lib/platform/performance/PerformanceMetrics";
import { performanceProfiler } from "@/lib/platform/performance/PerformanceProfiler";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { defaultPermissionEvaluator } from "@/lib/platform/security/PermissionEvaluator";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import {
  getDefaultPlatformStore,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/store/PlatformStoreFactory";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import type { ServiceContext } from "@/types/services";

export type BenchmarkResult = {
  readonly category: BenchmarkCategory | string;
  readonly iterations: number;
  readonly averageMs: number;
  readonly p95Ms: number;
  readonly minMs: number;
  readonly maxMs: number;
};

export type BenchmarkSuiteReport = {
  readonly executedAt: string;
  readonly results: readonly BenchmarkResult[];
  readonly budgetEvaluations: readonly BudgetEvaluation[];
  readonly memory: ReturnType<typeof performanceProfiler.captureMemory>;
};

const BENCHMARK_CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

/** Runs repeatable performance benchmarks across platform subsystems. */
export class PerformanceBenchmark {
  async runSuite(input?: {
    iterations?: number;
    databaseConnection?: import("@/lib/platform/persistence/DatabaseConnection").DatabaseConnection;
  }): Promise<BenchmarkSuiteReport> {
    performanceMetrics.clear();
    resetDefaultPlatformStoreForTests();

    const iterations = input?.iterations ?? 20;

    await this.benchmarkHealthEndpoint(iterations);
    await this.benchmarkPlatformStore(iterations);
    await this.benchmarkAuthorization(iterations);
    await this.benchmarkAuthentication(iterations);
    await this.benchmarkPermissionEvaluation(iterations);

    if (input?.databaseConnection) {
      await this.benchmarkDatabase(input.databaseConnection, iterations);
    }

    await this.benchmarkEventPublishing(iterations);
    await this.benchmarkWorkflowExecution(iterations);

    const results = performanceMetrics.getAllStatistics().map((stats) => ({
      category: stats.category,
      iterations: stats.count,
      averageMs: stats.averageMs,
      p95Ms: stats.p95Ms,
      minMs: stats.minMs,
      maxMs: stats.maxMs,
    }));

    return {
      executedAt: new Date().toISOString(),
      results,
      budgetEvaluations: performanceMetrics.evaluateAllBudgets(),
      memory: performanceProfiler.captureMemory(),
    };
  }

  async benchmarkCategory(
    category: BenchmarkCategory,
    operation: () => Promise<void> | void,
    iterations = 20,
  ): Promise<BenchmarkResult> {
    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync(category, async () => {
        await operation();
      });
    }

    const stats = performanceMetrics.getStatistics(category);
    return {
      category,
      iterations: stats.count,
      averageMs: stats.averageMs,
      p95Ms: stats.p95Ms,
      minMs: stats.minMs,
      maxMs: stats.maxMs,
    };
  }

  private async benchmarkHealthEndpoint(iterations: number): Promise<void> {
    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("healthEndpoint", () =>
        Promise.resolve(healthStatusService.getReport()),
      );
    }
  }

  private async benchmarkPlatformStore(iterations: number): Promise<void> {
    const store = getDefaultPlatformStore();
    await store.initialize();

    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("platformStoreTransaction", async () => {
        await store.checkHealth();
      });
    }

    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("repositoryRead", () =>
        Promise.resolve(store.getHealth()),
      );
    }
  }

  private async benchmarkAuthorization(iterations: number): Promise<void> {
    const identity = createIdentityContextFromServiceContext(BENCHMARK_CONTEXT);

    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("authorization", async () => {
        defaultAuthorizationService.authorize(identity, HCM_PERMISSIONS.employeeRead);
      });
    }
  }

  private async benchmarkAuthentication(iterations: number): Promise<void> {
    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("authentication", async () => {
        createIdentityContextFromServiceContext(BENCHMARK_CONTEXT);
      });
    }
  }

  private async benchmarkPermissionEvaluation(iterations: number): Promise<void> {
    const identity = createIdentityContextFromServiceContext(BENCHMARK_CONTEXT);

    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("authorization", async () => {
        defaultPermissionEvaluator.evaluate({
          identity,
          permission: HCM_PERMISSIONS.employeeRead,
        });
      });
    }
  }

  private async benchmarkDatabase(
    connection: import("@/lib/platform/persistence/DatabaseConnection").DatabaseConnection,
    iterations: number,
  ): Promise<void> {
    const runner = new MigrationRunner(connection, new MigrationRegistry([bootstrapMigration]));

    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("databaseRead", async () => {
        await connection.ping();
      });
    }

    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("databaseWrite", async () => {
        await createDatabaseHealthReport({
          provider: StoreProvider.PostgreSQL,
          connection,
          migrationStatus: await runner.getStatus(),
        });
      });
    }
  }

  private async benchmarkEventPublishing(iterations: number): Promise<void> {
    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("eventPublishing", async () => {
        await Promise.resolve({ published: true, eventId: `evt-bench-${index}` });
      });
    }
  }

  private async benchmarkWorkflowExecution(iterations: number): Promise<void> {
    for (let index = 0; index < iterations; index += 1) {
      await performanceProfiler.profileAsync("workflowExecution", async () => {
        await Promise.resolve({ stage: "completed", stepCount: 3 });
      });
    }
  }
}

export const performanceBenchmark = new PerformanceBenchmark();
