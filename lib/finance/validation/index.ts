import type {
  FinanceValidationInput,
  FinanceValidationResult,
  FinanceValidationStage,
} from "@/types/finance-validation";
import {
  FINANCE_VALIDATION_STAGE_ORDER,
  validateAccountingPeriod,
  validateAuthorization,
  validateCurrency,
  validateDuplicateDetection,
  validateIdempotency,
  validateOrganization,
  validateReferenceIntegrity,
} from "@/lib/finance/validation/stages";
import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
import { defaultIdempotencyRepository } from "@/lib/finance/repositories/InMemoryIdempotencyRepository";

/** Finance validation engine — structural checks only (Mission P-009.1). */
export class FinanceValidationEngine {
  constructor(
    private readonly idempotencyRepository: IdempotencyRepository = defaultIdempotencyRepository,
  ) {}

  validate(input: FinanceValidationInput): FinanceValidationResult {
    const stagesExecuted: FinanceValidationStage[] = [];
    const issues = [];

    for (const stage of FINANCE_VALIDATION_STAGE_ORDER) {
      stagesExecuted.push(stage);

      const stageIssues = this.runStage(stage, input);
      issues.push(...stageIssues);

      if (stageIssues.length > 0) {
        break;
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      stagesExecuted,
    };
  }

  markIdempotent(input: FinanceValidationInput): void {
    if (!input.idempotencyKey?.trim()) {
      return;
    }

    this.idempotencyRepository.markProcessed(input.context.organizationId, input.idempotencyKey, {
      correlationId: input.correlationId ?? "",
      sourceEntityId: input.sourceEntityId ?? "",
    });
  }

  private runStage(stage: FinanceValidationStage, input: FinanceValidationInput) {
    switch (stage) {
      case "organization":
        return validateOrganization(input);
      case "authorization":
        return validateAuthorization(input);
      case "currency":
        return validateCurrency(input);
      case "accounting_period":
        return validateAccountingPeriod(input);
      case "reference_integrity":
        return validateReferenceIntegrity(input);
      case "duplicate_detection":
        return validateDuplicateDetection(input, this.idempotencyRepository);
      case "idempotency":
        return validateIdempotency(input);
      default:
        return [];
    }
  }
}

export const financeValidationEngine = new FinanceValidationEngine();
