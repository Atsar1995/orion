import type { ValidationService } from "@/lib/finance/services/ValidationService";
import type {
  FinanceValidationInput,
  FinanceValidationResult,
} from "@/types/finance-validation";
import { FinanceValidationEngine } from "@/lib/finance/validation";

/** Default validation service implementation. */
export class DefaultValidationService implements ValidationService {
  constructor(private readonly engine: FinanceValidationEngine = new FinanceValidationEngine()) {}

  validate(input: FinanceValidationInput): FinanceValidationResult {
    return this.engine.validate(input);
  }

  markProcessed(input: FinanceValidationInput): void {
    this.engine.markIdempotent(input);
  }
}

export const defaultValidationService = new DefaultValidationService();
