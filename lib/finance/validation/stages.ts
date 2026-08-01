import type {
  FinanceValidationInput,
  FinanceValidationIssue,
  FinanceValidationStage,
} from "@/types/finance-validation";
import { FINANCE_AUTHORIZED_EVENT_SOURCES } from "@/lib/finance/constants";
import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";

const ISO_CURRENCY_PATTERN = /^[A-Z]{3}$/;
const PERIOD_ID_PATTERN = /^[a-z0-9-]+$/i;

export function validateOrganization(input: FinanceValidationInput): FinanceValidationIssue[] {
  const issues: FinanceValidationIssue[] = [];

  if (!input.context.organizationId.trim()) {
    issues.push({
      stage: "organization",
      code: "ORGANIZATION_REQUIRED",
      message: "Organization identifier is required",
      field: "organizationId",
    });
  }

  if (!input.context.workspaceId.trim()) {
    issues.push({
      stage: "organization",
      code: "WORKSPACE_REQUIRED",
      message: "Workspace identifier is required",
      field: "workspaceId",
    });
  }

  return issues;
}

export function validateAuthorization(input: FinanceValidationInput): FinanceValidationIssue[] {
  const issues: FinanceValidationIssue[] = [];

  if (!input.context.userId.trim()) {
    issues.push({
      stage: "authorization",
      code: "ACTOR_REQUIRED",
      message: "Authenticated user is required",
      field: "userId",
    });
  }

  if (!input.context.role) {
    issues.push({
      stage: "authorization",
      code: "ROLE_REQUIRED",
      message: "User role is required",
      field: "role",
    });
  }

  if (input.requiredRole && input.context.role !== input.requiredRole) {
    issues.push({
      stage: "authorization",
      code: "INSUFFICIENT_ROLE",
      message: `Role ${input.requiredRole} required`,
      field: "role",
    });
  }

  return issues;
}

export function validateCurrency(input: FinanceValidationInput): FinanceValidationIssue[] {
  if (!input.currency) {
    return [];
  }

  const issues: FinanceValidationIssue[] = [];

  if (!ISO_CURRENCY_PATTERN.test(input.currency.transactionCurrency)) {
    issues.push({
      stage: "currency",
      code: "INVALID_TRANSACTION_CURRENCY",
      message: "Transaction currency must be a 3-letter ISO code",
      field: "transactionCurrency",
    });
  }

  if (
    input.currency.functionalCurrency &&
    !ISO_CURRENCY_PATTERN.test(input.currency.functionalCurrency)
  ) {
    issues.push({
      stage: "currency",
      code: "INVALID_FUNCTIONAL_CURRENCY",
      message: "Functional currency must be a 3-letter ISO code",
      field: "functionalCurrency",
    });
  }

  if (input.currency.exchangeRate !== undefined && input.currency.exchangeRate <= 0) {
    issues.push({
      stage: "currency",
      code: "INVALID_EXCHANGE_RATE",
      message: "Exchange rate must be positive",
      field: "exchangeRate",
    });
  }

  return issues;
}

export function validateAccountingPeriod(input: FinanceValidationInput): FinanceValidationIssue[] {
  if (!input.period) {
    return [];
  }

  const issues: FinanceValidationIssue[] = [];

  if (!input.period.periodId.trim()) {
    issues.push({
      stage: "accounting_period",
      code: "PERIOD_REQUIRED",
      message: "Accounting period identifier is required",
      field: "periodId",
    });
  } else if (!PERIOD_ID_PATTERN.test(input.period.periodId.trim())) {
    issues.push({
      stage: "accounting_period",
      code: "INVALID_PERIOD_ID",
      message: "Accounting period identifier format is invalid",
      field: "periodId",
    });
  }

  return issues;
}

export function validateReferenceIntegrity(input: FinanceValidationInput): FinanceValidationIssue[] {
  const issues: FinanceValidationIssue[] = [];

  if (input.sourceEntityType !== undefined && !input.sourceEntityType.trim()) {
    issues.push({
      stage: "reference_integrity",
      code: "SOURCE_ENTITY_TYPE_REQUIRED",
      message: "Source entity type cannot be empty when provided",
      field: "sourceEntityType",
    });
  }

  if (input.sourceEntityId !== undefined && !input.sourceEntityId.trim()) {
    issues.push({
      stage: "reference_integrity",
      code: "SOURCE_ENTITY_ID_REQUIRED",
      message: "Source entity identifier cannot be empty when provided",
      field: "sourceEntityId",
    });
  }

  if (
    (input.sourceEntityType && !input.sourceEntityId) ||
    (!input.sourceEntityType && input.sourceEntityId)
  ) {
    issues.push({
      stage: "reference_integrity",
      code: "SOURCE_ENTITY_PAIR_REQUIRED",
      message: "Source entity type and identifier must both be present",
    });
  }

  if (input.correlationId !== undefined && !input.correlationId.trim()) {
    issues.push({
      stage: "reference_integrity",
      code: "CORRELATION_ID_REQUIRED",
      message: "Correlation identifier cannot be empty when provided",
      field: "correlationId",
    });
  }

  return issues;
}

export function validateDuplicateDetection(
  input: FinanceValidationInput,
  idempotencyRepository: IdempotencyRepository,
): FinanceValidationIssue[] {
  if (!input.idempotencyKey?.trim()) {
    return [];
  }

  if (idempotencyRepository.exists(input.context.organizationId, input.idempotencyKey)) {
    return [
      {
        stage: "duplicate_detection",
        code: "DUPLICATE_EVENT",
        message: "Event with this idempotency key was already processed",
        field: "idempotencyKey",
      },
    ];
  }

  return [];
}

export function validateIdempotency(input: FinanceValidationInput): FinanceValidationIssue[] {
  if (!input.idempotencyKey?.trim()) {
    return [
      {
        stage: "idempotency",
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "Idempotency key is required for event processing",
        field: "idempotencyKey",
      },
    ];
  }

  return [];
}

export function validateAuthorizedEventSource(sourceService: string): FinanceValidationIssue[] {
  if (!FINANCE_AUTHORIZED_EVENT_SOURCES.includes(sourceService as (typeof FINANCE_AUTHORIZED_EVENT_SOURCES)[number])) {
    return [
      {
        stage: "reference_integrity",
        code: "UNAUTHORIZED_EVENT_SOURCE",
        message: `Event source ${sourceService} is not authorized for Finance subscription`,
        field: "sourceService",
      },
    ];
  }

  return [];
}

export const FINANCE_VALIDATION_STAGE_ORDER: readonly FinanceValidationStage[] = [
  "organization",
  "authorization",
  "duplicate_detection",
  "idempotency",
  "currency",
  "accounting_period",
  "reference_integrity",
];
