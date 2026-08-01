/**
 * Finance Domain — validation framework types (Mission P-009.1).
 * @see docs/Finance/Engineering/ES-FIN-001_Finance_Domain_Engineering_Specification.md
 */

import type { AccountingPeriodReference } from "@/types/finance-period";
import type { FinanceCurrencyContext } from "@/types/finance-currency";
import type { ServiceContext } from "@/types/services";

/** Validation stages executed before financial processing (P-009.1 — no accounting rules yet). */
export type FinanceValidationStage =
  | "organization"
  | "authorization"
  | "currency"
  | "accounting_period"
  | "reference_integrity"
  | "duplicate_detection"
  | "idempotency";

export type FinanceValidationIssue = {
  readonly stage: FinanceValidationStage;
  readonly code: string;
  readonly message: string;
  readonly field?: string;
};

export type FinanceValidationResult = {
  readonly passed: boolean;
  readonly issues: readonly FinanceValidationIssue[];
  readonly stagesExecuted: readonly FinanceValidationStage[];
};

/** Input envelope for pre-processing validation. */
export type FinanceValidationInput = {
  readonly context: ServiceContext;
  readonly idempotencyKey?: string;
  readonly sourceEntityType?: string;
  readonly sourceEntityId?: string;
  readonly correlationId?: string;
  readonly currency?: FinanceCurrencyContext;
  readonly period?: AccountingPeriodReference;
  readonly requiredRole?: string;
};
