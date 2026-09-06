import { scoreRetrievalConfidence } from "@/lib/aurora/knowledge/retrieval/confidenceScoring";
import type {
  ConfidenceScoreResult,
  ConfidenceScoringRequest,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";

export interface ConfidenceScorer {
  score(request: ConfidenceScoringRequest): ConfidenceScoreResult;
}

/** Deterministic retrieval confidence scorer (ES-AURORA-007 §4.5). */
export class DefaultConfidenceScorer implements ConfidenceScorer {
  score(request: ConfidenceScoringRequest): ConfidenceScoreResult {
    return scoreRetrievalConfidence(request);
  }
}
