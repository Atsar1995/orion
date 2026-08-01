import type { BusinessEventIntakeInput } from "@/types/finance-event-pipeline";
import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
import type { BusinessEventIntakeRepository } from "@/lib/finance/repositories/FinancialEventRepository";
import type { FinancialEventRepository } from "@/lib/finance/repositories/FinancialEventRepository";

export type PipelineValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly retryable: boolean;
};

const REQUIRED_FIELDS: (keyof BusinessEventIntakeInput)[] = [
  "businessEventType",
  "sourceService",
  "sourceEntityType",
  "sourceEntityId",
  "correlationId",
  "idempotencyKey",
];

/** Pipeline validation rules (Mission P-009.6). */
export class PipelineRulesEngine {
  constructor(
    private readonly financialEventRepository: FinancialEventRepository,
    private readonly intakeRepository: BusinessEventIntakeRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
  ) {}

  validateIntake(input: BusinessEventIntakeInput, organizationId: string): PipelineValidationIssue[] {
    const issues: PipelineValidationIssue[] = [];

    if (!organizationId.trim()) {
      issues.push({
        code: "ORGANIZATION_REQUIRED",
        message: "Organization identifier is required",
        field: "organizationId",
        retryable: false,
      });
    }

    for (const field of REQUIRED_FIELDS) {
      const value = input[field];
      if (typeof value === "string" && !value.trim()) {
        issues.push({
          code: "REQUIRED_FIELD",
          message: `${field} is required`,
          field,
          retryable: false,
        });
      }
    }

    if (!input.sourceEntityType.trim() || !input.sourceEntityId.trim()) {
      issues.push({
        code: "REFERENCE_INTEGRITY",
        message: "Source entity type and identifier are required",
        retryable: false,
      });
    }

    issues.push(...this.validateDuplicate(input, organizationId));

    return issues;
  }

  validateDuplicate(input: BusinessEventIntakeInput, organizationId: string): PipelineValidationIssue[] {
    if (this.financialEventRepository.findByIdempotencyKey(organizationId, input.idempotencyKey)) {
      return [
        {
          code: "DUPLICATE_EVENT",
          message: "Financial event with this idempotency key already exists",
          field: "idempotencyKey",
          retryable: false,
        },
      ];
    }

    if (this.intakeRepository.findByIdempotencyKey(organizationId, input.idempotencyKey)) {
      return [
        {
          code: "DUPLICATE_INTAKE",
          message: "Business event with this idempotency key is already being processed",
          field: "idempotencyKey",
          retryable: false,
        },
      ];
    }

    if (this.idempotencyRepository.exists(organizationId, input.idempotencyKey)) {
      return [
        {
          code: "DUPLICATE_IDEMPOTENCY",
          message: "Idempotency key was already processed",
          field: "idempotencyKey",
          retryable: false,
        },
      ];
    }

    return [];
  }

  classifyError(error: unknown): { code: string; message: string; retryable: boolean } {
    const message = error instanceof Error ? error.message : "PIPELINE_ERROR";

    if (message.startsWith("NO_TRANSFORMER_REGISTERED")) {
      return { code: "TRANSFORMATION_FAILURE", message, retryable: false };
    }

    if (message.includes("POLICY") || message.includes("VALIDATION") || message.includes("DUPLICATE")) {
      return { code: message.split(":")[0] ?? "VALIDATION_FAILURE", message, retryable: false };
    }

    return { code: "PIPELINE_ERROR", message, retryable: true };
  }
}
