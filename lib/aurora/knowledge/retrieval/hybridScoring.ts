import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type { ScoredEntity } from "@/lib/aurora/knowledge/types/RetrievalTypes";

/** Canonical hybrid signal weights (ES-AURORA-007 §4.3). */
export const HYBRID_SEARCH_WEIGHTS = {
  semantic: 0.5,
  keyword: 0.25,
  graph: 0.15,
  memory: 0.1,
} as const;

export const PROVISIONAL_STATUS_MULTIPLIER = 0.7 as const;
export const VALIDATED_STATUS_MULTIPLIER = 1.0 as const;

export type HybridSignalAvailability = {
  readonly semantic: boolean;
  readonly keyword: boolean;
  readonly graph: boolean;
  readonly memory: boolean;
};

export type HybridEntityAccumulator = {
  readonly entity: KnowledgeEntity;
  semanticScore?: number;
  keywordScore?: number;
  graphProximityScore?: number;
  memoryRelevanceScore?: number;
};

export function resolveStatusMultiplier(entity: KnowledgeEntity): number {
  if (entity.status === "provisional") {
    return PROVISIONAL_STATUS_MULTIPLIER;
  }
  return VALIDATED_STATUS_MULTIPLIER;
}

/** Deterministic min-max normalization to [0, 1] within a signal dimension. */
export function normalizeSignalScores(scores: ReadonlyMap<string, number>): Map<string, number> {
  const values = [...scores.values()];
  if (values.length === 0) {
    return new Map();
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) {
    return new Map([...scores.entries()].map(([entityId, value]) => [entityId, value > 0 ? 1 : 0]));
  }

  return new Map(
    [...scores.entries()].map(([entityId, value]) => [entityId, (value - min) / (max - min)]),
  );
}

export function collectSignalScores(
  accumulators: ReadonlyMap<string, HybridEntityAccumulator>,
  selector: (entry: HybridEntityAccumulator) => number | undefined,
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const [entityId, entry] of accumulators.entries()) {
    const value = selector(entry);
    if (value !== undefined) {
      scores.set(entityId, value);
    }
  }
  return scores;
}

export function mergeScoredEntityIntoAccumulator(
  accumulators: Map<string, HybridEntityAccumulator>,
  scored: ScoredEntity,
  signal: keyof Pick<
    HybridEntityAccumulator,
    "semanticScore" | "keywordScore" | "graphProximityScore" | "memoryRelevanceScore"
  >,
): void {
  const existing = accumulators.get(scored.entity.id);
  const rawScore = scored[signal];
  if (rawScore === undefined) {
    if (!existing) {
      accumulators.set(scored.entity.id, { entity: scored.entity });
    }
    return;
  }

  if (!existing) {
    accumulators.set(scored.entity.id, {
      entity: scored.entity,
      [signal]: rawScore,
    });
    return;
  }

  const current = existing[signal];
  accumulators.set(scored.entity.id, {
    ...existing,
    entity: scored.entity,
    [signal]: current === undefined ? rawScore : Math.max(current, rawScore),
  });
}

export function computeHybridScore(
  normalized: {
    readonly semantic?: number;
    readonly keyword?: number;
    readonly graph?: number;
    readonly memory?: number;
  },
  availability: HybridSignalAvailability,
  statusMultiplier: number,
): number {
  const semanticContribution = availability.semantic ? (normalized.semantic ?? 0) : 0;
  const keywordContribution = availability.keyword ? (normalized.keyword ?? 0) : 0;
  const graphContribution = availability.graph ? (normalized.graph ?? 0) : 0;
  const memoryContribution = availability.memory ? (normalized.memory ?? 0) : 0;

  const weighted =
    HYBRID_SEARCH_WEIGHTS.semantic * semanticContribution +
    HYBRID_SEARCH_WEIGHTS.keyword * keywordContribution +
    HYBRID_SEARCH_WEIGHTS.graph * graphContribution +
    HYBRID_SEARCH_WEIGHTS.memory * memoryContribution;

  return Number((weighted * statusMultiplier).toFixed(6));
}

export function buildHybridScoredEntities(
  accumulators: ReadonlyMap<string, HybridEntityAccumulator>,
  availability: HybridSignalAvailability,
): readonly ScoredEntity[] {
  const normalizedSemantic = normalizeSignalScores(
    collectSignalScores(accumulators, (entry) => entry.semanticScore),
  );
  const normalizedKeyword = normalizeSignalScores(
    collectSignalScores(accumulators, (entry) => entry.keywordScore),
  );
  const normalizedGraph = normalizeSignalScores(
    collectSignalScores(accumulators, (entry) => entry.graphProximityScore),
  );
  const normalizedMemory = normalizeSignalScores(
    collectSignalScores(accumulators, (entry) => entry.memoryRelevanceScore),
  );

  return [...accumulators.entries()].map(([entityId, entry]) => {
    const statusMultiplier = resolveStatusMultiplier(entry.entity);
    const score = computeHybridScore(
      {
        semantic: normalizedSemantic.get(entityId),
        keyword: normalizedKeyword.get(entityId),
        graph: normalizedGraph.get(entityId),
        memory: normalizedMemory.get(entityId),
      },
      availability,
      statusMultiplier,
    );

    return {
      entity: entry.entity,
      score,
      semanticScore: entry.semanticScore,
      keywordScore: entry.keywordScore,
      graphProximityScore: entry.graphProximityScore,
      memoryRelevanceScore: entry.memoryRelevanceScore,
      statusMultiplier,
    };
  });
}

export function compareHybridScoredEntities(left: ScoredEntity, right: ScoredEntity): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.entity.id.localeCompare(right.entity.id);
}
