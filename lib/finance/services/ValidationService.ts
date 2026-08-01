import type {
  FinanceValidationInput,
  FinanceValidationResult,
} from "@/types/finance-validation";

/** Validation service contract (Mission P-009.1). */
export type ValidationService = {
  validate(input: FinanceValidationInput): FinanceValidationResult;
  markProcessed(input: FinanceValidationInput): void;
};
