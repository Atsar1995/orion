import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import type { ScoredEntity } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import {
  createInMemoryKnowledgeRetrievalStack,
  createKnowledgeEntity,
  type InMemoryKnowledgeRetrievalStack,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";
import { expect } from "vitest";

export const PERF_TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
export const PERF_BRAND_A = "770e8400-e29b-41d4-a716-446655440003";

export const BENCHMARK_WARMUP_ITERATIONS = 1 as const;
export const BENCHMARK_MEASURED_ITERATIONS = 20 as const;

const PERF_DATASET_ENTITY_IDS = [
  "knw_10000000-0000-4000-8000-000000000001",
  "knw_20000000-0000-4000-8000-000000000002",
  "knw_30000000-0000-4000-8000-000000000003",
  "knw_40000000-0000-4000-8000-000000000004",
  "knw_50000000-0000-4000-8000-000000000005",
  "knw_60000000-0000-4000-8000-000000000006",
  "knw_70000000-0000-4000-8000-000000000007",
  "knw_80000000-0000-4000-8000-000000000008",
  "knw_90000000-0000-4000-8000-000000000009",
  "knw_a0000000-0000-4000-8000-00000000000a",
] as const;

export type LatencyStatistics = {
  readonly count: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly maxMs: number;
  readonly minMs: number;
  readonly averageMs: number;
};

function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]!;
}

export function computeLatencyStatistics(samples: readonly number[]): LatencyStatistics {
  if (samples.length === 0) {
    return {
      count: 0,
      p50Ms: 0,
      p95Ms: 0,
      maxMs: 0,
      minMs: 0,
      averageMs: 0,
    };
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const sum = sorted.reduce((total, value) => total + value, 0);

  return {
    count: sorted.length,
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    maxMs: sorted[sorted.length - 1]!,
    minMs: sorted[0]!,
    averageMs: Math.round((sum / sorted.length) * 100) / 100,
  };
}

export function formatLatencyDiagnostics(label: string, stats: LatencyStatistics): string {
  return [
    `${label} latency statistics:`,
    `  count=${stats.count}`,
    `  p50=${stats.p50Ms}ms`,
    `  p95=${stats.p95Ms}ms`,
    `  max=${stats.maxMs}ms`,
    `  min=${stats.minMs}ms`,
    `  avg=${stats.averageMs}ms`,
  ].join("\n");
}

export function assertP95Below(
  label: string,
  samples: readonly number[],
  thresholdMs: number,
): LatencyStatistics {
  const stats = computeLatencyStatistics(samples);

  if (stats.p95Ms >= thresholdMs) {
    throw new Error(
      `${label} p95 ${stats.p95Ms}ms exceeded threshold ${thresholdMs}ms\n${formatLatencyDiagnostics(label, stats)}`,
    );
  }

  if (process.env.GATE17_PERF_LOG === "1") {
    console.info(formatLatencyDiagnostics(label, stats));
  }

  return stats;
}

export function assertMaxBelow(
  label: string,
  samples: readonly number[],
  thresholdMs: number,
): LatencyStatistics {
  const stats = computeLatencyStatistics(samples);

  if (stats.maxMs >= thresholdMs) {
    throw new Error(
      `${label} max ${stats.maxMs}ms exceeded threshold ${thresholdMs}ms\n${formatLatencyDiagnostics(label, stats)}`,
    );
  }

  if (process.env.GATE17_PERF_LOG === "1") {
    console.info(formatLatencyDiagnostics(label, stats));
  }

  return stats;
}

export async function measureAsyncDuration(operation: () => Promise<void>): Promise<number> {
  const startedAt = performance.now();
  await operation();
  return Math.max(0, Math.round(performance.now() - startedAt));
}

export async function collectBenchmarkSamples(
  operation: (index: number) => Promise<number>,
  measuredIterations: number = BENCHMARK_MEASURED_ITERATIONS,
  warmupIterations: number = BENCHMARK_WARMUP_ITERATIONS,
): Promise<number[]> {
  for (let index = 0; index < warmupIterations; index += 1) {
    await operation(-(index + 1));
  }

  const samples: number[] = [];
  for (let index = 0; index < measuredIterations; index += 1) {
    samples.push(await operation(index));
  }

  return samples;
}

export function createPerformanceAdminContext(
  overrides: Partial<AuroraRuntimeContext> = {},
): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: PERF_TENANT_A,
    userId: "usr_perf_admin",
    brandId: PERF_BRAND_A,
    roles: ["aurora.admin"],
    auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    ...overrides,
  });
}

export async function seedBoundedRetrievalDataset(
  repository: InMemoryKnowledgeRepository,
  prefix = "gate17 perf",
): Promise<readonly string[]> {
  const entityIds: string[] = [];

  for (let index = 0; index < PERF_DATASET_ENTITY_IDS.length; index += 1) {
    const entityId = PERF_DATASET_ENTITY_IDS[index]!;
    entityIds.push(entityId);
    await repository.create(
      PERF_TENANT_A,
      createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
        id: entityId,
        entityType: index % 2 === 0 ? "brand.profile" : "product.product",
        status: "validated",
        title: `${prefix} entity ${index} retrieval voice`,
        content: { note: `${prefix} guidance ${index}` },
      }),
    );
  }

  return entityIds;
}

export function createPerformanceRetrievalStack(): InMemoryKnowledgeRetrievalStack {
  const repository = new InMemoryKnowledgeRepository();
  return createInMemoryKnowledgeRetrievalStack(repository);
}

export async function createSeededPerformanceRetrievalStack(): Promise<InMemoryKnowledgeRetrievalStack> {
  const repository = new InMemoryKnowledgeRepository();
  await seedBoundedRetrievalDataset(repository);
  return createInMemoryKnowledgeRetrievalStack(repository);
}

export function buildPerformanceScoredEntities(): readonly ScoredEntity[] {
  const entities: KnowledgeEntity[] = [
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b1000000-0000-4000-8000-000000000001",
      entityType: "brand.profile",
      title: "Gate17 context brand alpha",
      content: { note: "brand alpha guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b2000000-0000-4000-8000-000000000002",
      entityType: "brand.profile",
      title: "Gate17 context brand beta",
      content: { note: "brand beta guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b3000000-0000-4000-8000-000000000003",
      entityType: "product.product",
      title: "Gate17 context product gamma",
      content: { note: "product gamma guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b4000000-0000-4000-8000-000000000004",
      entityType: "product.product",
      title: "Gate17 context product delta",
      content: { note: "product delta guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b5000000-0000-4000-8000-000000000005",
      entityType: "seo.keyword",
      title: "Gate17 context keyword epsilon",
      content: { note: "keyword epsilon guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b6000000-0000-4000-8000-000000000006",
      entityType: "seo.keyword",
      title: "Gate17 context keyword zeta",
      content: { note: "keyword zeta guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b7000000-0000-4000-8000-000000000007",
      entityType: "campaign.record",
      title: "Gate17 context campaign eta",
      content: { note: "campaign eta guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b8000000-0000-4000-8000-000000000008",
      entityType: "campaign.lesson",
      title: "Gate17 context campaign theta",
      content: { note: "campaign theta guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_b9000000-0000-4000-8000-000000000009",
      entityType: "content.pattern",
      title: "Gate17 context content iota",
      content: { note: "content iota guidance" },
    }),
    createKnowledgeEntity(PERF_TENANT_A, PERF_BRAND_A, {
      id: "knw_ba000000-0000-4000-8000-00000000000a",
      entityType: "content.topic_cluster",
      title: "Gate17 context content kappa",
      content: { note: "content kappa guidance" },
    }),
  ];

  return entities.map((entity, index) => ({
    entity,
    score: Number((0.99 - index * 0.03).toFixed(2)),
    semanticScore: 0.8,
    keywordScore: 0.7,
  }));
}

export function expectWarmLatencyBelowCold(warmSamples: readonly number[], coldMs: number): LatencyStatistics {
  const warmStats = computeLatencyStatistics(warmSamples);

  expect(warmStats.p95Ms).toBeLessThan(coldMs);
  expect(warmStats.p50Ms).toBeLessThanOrEqual(coldMs);

  return warmStats;
}
