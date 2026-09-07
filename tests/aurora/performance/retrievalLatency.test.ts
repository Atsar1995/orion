import {
  assertMaxBelow,
  assertP95Below,
  BENCHMARK_MEASURED_ITERATIONS,
  collectBenchmarkSamples,
  computeLatencyStatistics,
  createPerformanceAdminContext,
  createSeededPerformanceRetrievalStack,
  formatLatencyDiagnostics,
} from "@/tests/aurora/helpers/retrievalPerformanceFixtures";
import {
  createHarnessContext,
  createKnowledgeEntity,
  createPostgresKnowledgeRetrievalStack,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const COLD_RETRIEVAL_P95_MS = 500;
const RETRIEVAL_TIMEOUT_MS = 2_000;
const REPEATED_QUERY = "gate17 perf entity 0 retrieval voice";
const REPEATED_REQUESTS = 16;
const UNIQUE_REQUESTS = 4;

describe("retrievalLatency", () => {
  it("keeps cold uncached preflight hybrid retrieval p95 below 500ms", async () => {
    const stack = await createSeededPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();

    const samples = await collectBenchmarkSamples(async (index) => {
      const result = await stack.retrievalService.preflight(ctx, {
        taskType: "content_generation",
        query: `gate17 cold retrieval voice ${index}`,
      });
      return result.latencyMs;
    });

    const stats = assertP95Below("cold preflight retrieval", samples, COLD_RETRIEVAL_P95_MS);
    expect(stats.count).toBe(BENCHMARK_MEASURED_ITERATIONS);
  });

  it("keeps cold preflight retrieval max below the 2000ms degrade threshold", async () => {
    const stack = await createSeededPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();

    const samples = await collectBenchmarkSamples(async (index) => {
      const result = await stack.retrievalService.preflight(ctx, {
        taskType: "content_generation",
        query: `gate17 timeout sanity voice ${index}`,
      });
      return result.latencyMs;
    });

    assertMaxBelow("cold preflight retrieval", samples, RETRIEVAL_TIMEOUT_MS);
  });

  it("serves warm cached preflight faster than the initial cold retrieval", async () => {
    const stack = await createSeededPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();
    const request = {
      taskType: "content_generation" as const,
      query: "gate17 warm cache retrieval voice",
    };

    const coldResult = await stack.retrievalService.preflight(ctx, request);
    const warmSamples = await collectBenchmarkSamples(async (_index) => {
      const result = await stack.retrievalService.preflight(ctx, request);
      return result.latencyMs;
    });
    const warmStats = computeLatencyStatistics(warmSamples);

    if (process.env.GATE17_PERF_LOG === "1") {
      console.info(formatLatencyDiagnostics("warm cached preflight", warmStats));
      console.info(`cold preflight latencyMs=${coldResult.latencyMs}`);
    }

    expect(warmStats.p95Ms).toBeLessThan(coldResult.latencyMs);
    expect(warmStats.p50Ms).toBeLessThanOrEqual(coldResult.latencyMs);
  });

  it("avoids hybrid search on approximately 80 percent of repeated-query requests", async () => {
    const stack = await createSeededPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();
    const searchSpy = vi.spyOn(stack.hybridSearchEngine, "search");

    await stack.retrievalService.preflight(ctx, {
      taskType: "content_generation",
      query: REPEATED_QUERY,
    });

    for (let index = 1; index < REPEATED_REQUESTS; index += 1) {
      await stack.retrievalService.preflight(ctx, {
        taskType: "content_generation",
        query: REPEATED_QUERY,
      });
    }

    for (let index = 0; index < UNIQUE_REQUESTS; index += 1) {
      await stack.retrievalService.preflight(ctx, {
        taskType: "content_generation",
        query: `gate17 unique repeated-query voice ${index}`,
      });
    }

    const totalRequests = REPEATED_REQUESTS + UNIQUE_REQUESTS;
    const searchCalls = searchSpy.mock.calls.length;
    const cacheHits = totalRequests - searchCalls;

    expect(totalRequests).toBe(20);
    expect(searchCalls).toBe(UNIQUE_REQUESTS + 1);
    expect(cacheHits).toBe(REPEATED_REQUESTS - 1);
    expect(cacheHits / totalRequests).toBeGreaterThanOrEqual(0.75);
  });

  it("reports diagnostic latency statistics when cold retrieval exceeds budget", () => {
    const stats = computeLatencyStatistics([12, 18, 25, 40, 55, 90, 120, 150, 180, 210]);
    const diagnostics = formatLatencyDiagnostics("diagnostic example", stats);

    expect(diagnostics).toContain("p95=");
    expect(diagnostics).toContain("max=");
  });
});

describe.skipIf(!AURORA_LIVE_POSTGRES)("retrievalLatency — live PostgreSQL", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping retrievalLatency live PostgreSQL suite:", error);
    }
  });

  afterAll(async () => {
    if (harness && postgresAvailable) {
      await cleanupPostgresTestHarness(harness);
    }
  });

  it("runs only when live PostgreSQL is reachable", () => {
    expect(postgresAvailable).toBe(true);
  });

  it("keeps live PostgreSQL preflight retrieval p95 below 500ms", async () => {
    if (!harness) {
      throw new Error("PostgreSQL harness was not initialized");
    }

    const stack = createPostgresKnowledgeRetrievalStack(harness);
    const entityId = "knw_c1000000-0000-4000-8000-000000000001";

    await stack.knowledgeRepository.create(
      harness.tenantAId,
      createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
        id: entityId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate17 live postgres retrieval voice",
        content: { note: "live postgres retrieval guidance" },
      }),
    );

    const ctx = createHarnessContext(harness, "A", {
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });

    const samples = await collectBenchmarkSamples(async (index) => {
      const result = await stack.retrievalService.preflight(ctx, {
        taskType: "content_generation",
        query: `gate17 live postgres retrieval voice ${index}`,
      });
      return result.latencyMs;
    });

    assertP95Below("live postgres preflight retrieval", samples, COLD_RETRIEVAL_P95_MS);
  });
});
