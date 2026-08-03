import { PostingValidationService } from "@/lib/finance/services/PostingValidationService";
import type { PostingValidationInput } from "@/lib/finance/services/PostingValidationService";
import type { PostingValidationResult } from "@/lib/finance/services/PostingValidationResult";
import {
  isPostingValidationBlocking,
  POSTING_VALIDATION_STAGE_ORDER,
  type PostingValidationStageResult,
} from "@/lib/finance/services/PostingValidationStage";

/** Orchestrates posting validation stages in P-009.3 order (P-009.8). */
export class PostingValidationPipeline {
  constructor(private readonly validationService: PostingValidationService) {}

  /** Runs all stages sequentially — short-circuits on FAIL or STOP. */
  validate(input: PostingValidationInput): PostingValidationResult {
    const stageResults: PostingValidationStageResult[] = [];
    const warnings: PostingValidationStageResult[] = [];
    const stagesExecuted: (typeof POSTING_VALIDATION_STAGE_ORDER)[number][] = [];

    for (const stage of POSTING_VALIDATION_STAGE_ORDER) {
      const result = this.validationService.validateStage(stage, input);
      stageResults.push(result);
      stagesExecuted.push(stage);

      if (isPostingValidationBlocking(result.outcome)) {
        return {
          passed: false,
          stagesExecuted,
          stageResults,
          warnings,
          stoppedAt: stage,
          blockingResult: result,
        };
      }

      if (result.outcome === "warning") {
        warnings.push(result);
      }
    }

    return {
      passed: true,
      stagesExecuted,
      stageResults,
      warnings,
    };
  }
}
