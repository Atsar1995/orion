import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type {
  ConfidenceScoreResult,
  ConfidenceScoringRequest,
  RetrievalConfidence,
  ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";

/** ES-AURORA-007 §4.5 — high confidence validated entity minimum. */
export const CONFIDENCE_HIGH_MIN_VALIDATED = 5 as const;

/** ES-AURORA-007 §4.5 — high confidence average hybrid score threshold (exclusive). */
export const CONFIDENCE_HIGH_MIN_AVERAGE_SCORE = 0.85 as const;

/** ES-AURORA-007 §4.5 — medium confidence minimum result count. */
export const CONFIDENCE_MEDIUM_MIN_COUNT = 3 as const;

/** ES-AURORA-007 §4.5 — medium confidence maximum result count (canonical band). */
export const CONFIDENCE_MEDIUM_MAX_COUNT = 4 as const;

/** ES-AURORA-007 §4.5 — medium confidence average hybrid score threshold (exclusive). */
export const CONFIDENCE_MEDIUM_MIN_AVERAGE_SCORE = 0.75 as const;

/** ES-AURORA-007 §4.5 — low confidence minimum result count. */
export const CONFIDENCE_LOW_MIN_COUNT = 1 as const;

/** ES-AURORA-007 §4.5 — low confidence maximum result count. */
export const CONFIDENCE_LOW_MAX_COUNT = 2 as const;

/** ES-AURORA-007 §4.5 — low confidence average hybrid score threshold (exclusive). */
export const CONFIDENCE_LOW_MIN_AVERAGE_SCORE = 0.7 as const;

export type ConfidenceMetrics = {
  readonly resultCount: number;
  readonly validatedCount: number;
  readonly averageScore: number;
};

export function filterRelevantScoredEntities(
  scoredEntities: readonly ScoredEntity[],
  tenantId?: string,
): readonly ScoredEntity[] {
  if (!tenantId) {
    return scoredEntities;
  }

  return scoredEntities.filter((scored) => scored.entity.tenantId === tenantId);
}

export function computeConfidenceMetrics(scoredEntities: readonly ScoredEntity[]): ConfidenceMetrics {
  if (scoredEntities.length === 0) {
    return {
      resultCount: 0,
      validatedCount: 0,
      averageScore: 0,
    };
  }

  const validatedCount = scoredEntities.filter((scored) => scored.entity.status === "validated").length;
  const totalScore = scoredEntities.reduce((sum, scored) => sum + scored.score, 0);

  return {
    resultCount: scoredEntities.length,
    validatedCount,
    averageScore: Number((totalScore / scoredEntities.length).toFixed(6)),
  };
}

/**
 * Resolve canonical retrieval confidence (ES-AURORA-007 §4.5 · A-004 §6.6).
 *
 * Uses hybrid final scores already produced upstream — validation status is not
 * double-counted via the Gate 9 status multiplier.
 */
export function resolveRetrievalConfidence(metrics: ConfidenceMetrics): RetrievalConfidence {
  const { resultCount, validatedCount, averageScore } = metrics;

  if (resultCount === 0) {
    return "insufficient";
  }

  if (
    validatedCount >= CONFIDENCE_HIGH_MIN_VALIDATED &&
    averageScore > CONFIDENCE_HIGH_MIN_AVERAGE_SCORE
  ) {
    return "high";
  }

  if (
    resultCount >= CONFIDENCE_MEDIUM_MIN_COUNT &&
    resultCount <= CONFIDENCE_MEDIUM_MAX_COUNT &&
    averageScore > CONFIDENCE_MEDIUM_MIN_AVERAGE_SCORE
  ) {
    return "medium";
  }

  /**
   * Engineering assumption: result sets above the canonical 3–4 medium band but below
   * high criteria are treated as medium when average score exceeds 0.75.
   */
  if (resultCount > CONFIDENCE_MEDIUM_MAX_COUNT && averageScore > CONFIDENCE_MEDIUM_MIN_AVERAGE_SCORE) {
    return "medium";
  }

  if (
    resultCount >= CONFIDENCE_LOW_MIN_COUNT &&
    resultCount <= CONFIDENCE_LOW_MAX_COUNT &&
    averageScore > CONFIDENCE_LOW_MIN_AVERAGE_SCORE
  ) {
    return "low";
  }

  return "insufficient";
}

export function buildConfidenceGaps(
  confidence: RetrievalConfidence,
  metrics: ConfidenceMetrics,
  request: ConfidenceScoringRequest,
): readonly string[] {
  const gaps: string[] = [];

  if (confidence === "insufficient" && metrics.resultCount === 0) {
    gaps.push("No relevant knowledge entities retrieved for the requested context.");
  }

  if (confidence === "insufficient" && metrics.resultCount > 0) {
    gaps.push("Retrieved entities did not meet minimum confidence thresholds.");
  }

  if (confidence === "medium") {
    gaps.push("Retrieval coverage is partial; review remaining knowledge gaps.");
  }

  if (confidence === "low") {
    gaps.push("Retrieval confidence is low; proceed with explicit uncertainty.");
  }

  if (metrics.validatedCount < metrics.resultCount) {
    gaps.push("Retrieved set includes provisional knowledge requiring validation.");
  }

  if (request.semanticDegraded) {
    gaps.push("Semantic retrieval degraded; confidence reflects keyword and graph results only.");
  }

  if (request.memoryDegraded) {
    gaps.push("Memory tier unavailable; memory signals were excluded from retrieval.");
  }

  if (request.requestedDomains?.length) {
    gaps.push(`Requested domains: ${request.requestedDomains.join(", ")}`);
  }

  return gaps;
}

export function scoreRetrievalConfidence(request: ConfidenceScoringRequest): ConfidenceScoreResult {
  const relevant = filterRelevantScoredEntities(request.scoredEntities, request.tenantId);
  const metrics = computeConfidenceMetrics(relevant);
  const confidence = resolveRetrievalConfidence(metrics);

  return {
    confidence,
    averageScore: metrics.averageScore,
    resultCount: metrics.resultCount,
    validatedCount: metrics.validatedCount,
    gaps: buildConfidenceGaps(confidence, metrics, request),
  };
}
