import {
  assertP95Below,
  BENCHMARK_MEASURED_ITERATIONS,
  collectBenchmarkSamples,
  createPerformanceAdminContext,
  createPerformanceRetrievalStack,
} from "@/tests/aurora/helpers/retrievalPerformanceFixtures";
import { describe, expect, it } from "vitest";

const SINGLE_EMBED_P95_MS = 100;
const BATCH_EMBED_P95_MS = 500;
const BATCH_SIZE = 10;

function buildBatchTexts(prefix: string): readonly string[] {
  return Array.from({ length: BATCH_SIZE }, (_, index) => `${prefix} embedding text ${index}`);
}

describe("embeddingBatch", () => {
  it("keeps single embedQuery p95 below 100ms", async () => {
    const stack = createPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();

    const samples = await collectBenchmarkSamples(async (index) => {
      const startedAt = performance.now();
      await stack.embeddingService.embedQuery(ctx, `gate17 single embed query ${index}`);
      return Math.max(0, Math.round(performance.now() - startedAt));
    });

    const stats = assertP95Below("single embedQuery", samples, SINGLE_EMBED_P95_MS);
    expect(stats.count).toBe(BENCHMARK_MEASURED_ITERATIONS);
  });

  it("keeps embedBatch(10) p95 below 500ms", async () => {
    const stack = createPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();

    const samples = await collectBenchmarkSamples(async (index) => {
      const startedAt = performance.now();
      await stack.embeddingService.embedBatch(ctx, buildBatchTexts(`gate17 batch ${index}`));
      return Math.max(0, Math.round(performance.now() - startedAt));
    });

    const stats = assertP95Below("embedBatch(10)", samples, BATCH_EMBED_P95_MS);
    expect(stats.count).toBe(BENCHMARK_MEASURED_ITERATIONS);
  });

  it("returns ten vectors from embedBatch", async () => {
    const stack = createPerformanceRetrievalStack();
    const ctx = createPerformanceAdminContext();
    const vectors = await stack.embeddingService.embedBatch(ctx, buildBatchTexts("gate17 shape check"));

    expect(vectors).toHaveLength(BATCH_SIZE);
    expect(vectors.every((vector) => vector.length > 0)).toBe(true);
  });
});
