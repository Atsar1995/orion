import type {
  PostingValidationStageName,
  PostingValidationStageResult,
} from "@/lib/finance/services/PostingValidationStage";

/** Aggregate result from the posting validation pipeline (P-009.8). */
export type PostingValidationResult = {
  readonly passed: boolean;
  readonly stagesExecuted: readonly PostingValidationStageName[];
  readonly stageResults: readonly PostingValidationStageResult[];
  readonly warnings: readonly PostingValidationStageResult[];
  readonly stoppedAt?: PostingValidationStageName;
  readonly blockingResult?: PostingValidationStageResult;
};
