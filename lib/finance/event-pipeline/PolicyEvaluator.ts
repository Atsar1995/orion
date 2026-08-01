import { FINANCE_AUTHORIZED_EVENT_SOURCES } from "@/lib/finance/constants";
import type { FiscalPeriodService } from "@/lib/finance/fiscal-period/FiscalPeriodService";
import type {
  BusinessEventIntakeInput,
  PipelinePolicyRule,
} from "@/types/finance-event-pipeline";

export type PolicyEvaluationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
};

const ISO_CURRENCY = /^[A-Z]{3}$/;

/** Policy evaluation framework for financial event pipeline (Mission P-009.6). */
export class PolicyEvaluator {
  private readonly rules: PipelinePolicyRule[] = [];

  constructor(private readonly fiscalPeriodService?: FiscalPeriodService) {
    this.rules.push(
      {
        code: "AUTHORIZED_SOURCE",
        message: "Event source is not authorized for Finance intake",
        evaluate: (input) =>
          (FINANCE_AUTHORIZED_EVENT_SOURCES as readonly string[]).includes(input.sourceService) ||
          input.sourceService === "finance-workspace",
      },
      {
        code: "CORRELATION_REQUIRED",
        message: "Correlation ID is required",
        evaluate: (input) => input.correlationId.trim().length > 0,
      },
      {
        code: "IDEMPOTENCY_REQUIRED",
        message: "Idempotency key is required",
        evaluate: (input) => input.idempotencyKey.trim().length > 0,
      },
    );
  }

  registerRule(rule: PipelinePolicyRule): void {
    this.rules.push(rule);
  }

  evaluate(input: BusinessEventIntakeInput, organizationId: string): PolicyEvaluationIssue[] {
    const issues: PolicyEvaluationIssue[] = [];

    for (const rule of this.rules) {
      if (!rule.evaluate(input, organizationId)) {
        issues.push({ code: rule.code, message: rule.message });
      }
    }

    if (input.currency?.transactionCurrency && !ISO_CURRENCY.test(input.currency.transactionCurrency)) {
      issues.push({
        code: "INVALID_CURRENCY",
        message: "Transaction currency must be a 3-letter ISO code",
        field: "currency",
      });
    }

    if (input.periodId && this.fiscalPeriodService) {
      const periodValidation = this.fiscalPeriodService.validatePosting(input.periodId, {
        organizationId,
        workspaceId: "",
        userId: "",
        role: "read_only",
      });
      if (!periodValidation.passed) {
        issues.push({
          code: periodValidation.issues[0]?.code ?? "PERIOD_POLICY_FAILED",
          message: periodValidation.issues[0]?.message ?? "Period policy validation failed",
          field: "periodId",
        });
      }
    }

    if (input.transactionDate && input.periodId && this.fiscalPeriodService) {
      const period = this.fiscalPeriodService.findPeriodByDate(input.transactionDate, {
        organizationId,
        workspaceId: "",
        userId: "",
        role: "read_only",
      });
      if (period && period.id !== input.periodId) {
        issues.push({
          code: "PERIOD_DATE_MISMATCH",
          message: "Transaction date does not match specified period",
          field: "transactionDate",
        });
      }
    }

    return issues;
  }

  listRuleCodes(): readonly string[] {
    return this.rules.map((rule) => rule.code);
  }
}
