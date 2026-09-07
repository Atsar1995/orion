import {
  assertP95Below,
  BENCHMARK_MEASURED_ITERATIONS,
  buildPerformanceScoredEntities,
  collectBenchmarkSamples,
  createPerformanceAdminContext,
  createSeededPerformanceRetrievalStack,
} from "@/tests/aurora/helpers/retrievalPerformanceFixtures";
import { describe, expect, it } from "vitest";

const CONTEXT_ASSEMBLY_P95_MS = 200;

describe("contextAssemblyLatency", () => {
  it("keeps assembleContext p95 below 200ms for ten scored entities", async () => {
    const stack = await createSeededPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();
    const scoredEntities = buildPerformanceScoredEntities();

    const samples = await collectBenchmarkSamples(async (_index) => {
      const startedAt = performance.now();
      await stack.retrievalService.assembleContext(ctx, {
        scoredEntities,
        taskType: "content_generation",
      });
      return Math.max(0, Math.round(performance.now() - startedAt));
    });

    const stats = assertP95Below("assembleContext", samples, CONTEXT_ASSEMBLY_P95_MS);
    expect(stats.count).toBe(BENCHMARK_MEASURED_ITERATIONS);
  });

  it("assembles all ten scored entities within the latency budget", async () => {
    const stack = await createSeededPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();
    const scoredEntities = buildPerformanceScoredEntities();

    const contextPackage = await stack.retrievalService.assembleContext(ctx, {
      scoredEntities,
      taskType: "content_generation",
    });

    expect(contextPackage.entities).toHaveLength(10);
    expect(contextPackage.totalTokens).toBeLessThanOrEqual(contextPackage.maxTokens);
  });

  it("keeps repeated assembleContext invocations within the 200ms p95 budget", async () => {
    const stack = await createSeededPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();
    const scoredEntities = buildPerformanceScoredEntities();

    const samples = await collectBenchmarkSamples(async (_index) => {
      const startedAt = performance.now();
      await stack.contextAssembler.assemble(ctx, {
        scoredEntities,
        taskType: "seo_analysis",
      });
      return Math.max(0, Math.round(performance.now() - startedAt));
    });

    assertP95Below("direct contextAssembler.assemble", samples, CONTEXT_ASSEMBLY_P95_MS);
  });
});
