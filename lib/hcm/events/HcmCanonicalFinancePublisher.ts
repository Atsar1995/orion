import type { CurrencyAmount } from "@/types/hcm-payroll";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

/** ADR-014 canonical HCM → Finance event types (P-009.15). */
export const HCM_CANONICAL_FINANCE_EVENT_TYPES = [
  "hcm.workforce.cost.recorded",
  "hcm.expense.approved",
] as const;

export type HcmCanonicalFinanceEventType = (typeof HCM_CANONICAL_FINANCE_EVENT_TYPES)[number];

export const HCM_CANONICAL_EVENT_VERSION = "1";

/** Temporary legacy shim labels — retained for workflow compatibility during migration. */
export const HCM_CANONICAL_LEGACY_EVENT_TYPES = {
  workforceCostRecorded: "WorkforceCostRecorded",
  expenseApproved: "ExpenseApproved",
} as const;

/** Builds ES-FIN-002 idempotency keys aligned with FinanceEventMapper. */
export function buildHcmCanonicalIdempotencyKey(
  organizationId: string,
  eventType: HcmCanonicalFinanceEventType,
  params: {
    readonly employeeId?: string;
    readonly costPeriodId?: string;
    readonly expenseId?: string;
  },
): string {
  if (eventType === "hcm.workforce.cost.recorded") {
    const employeeId = params.employeeId ?? "";
    const costPeriodId = params.costPeriodId ?? "1";
    return `${organizationId}:${HCM_IIL_SERVICE_ID}:${eventType}:${employeeId}:${costPeriodId}`;
  }

  const expenseId = params.expenseId ?? "";
  return `${organizationId}:${HCM_IIL_SERVICE_ID}:${eventType}:${expenseId}:1`;
}

type PublishCanonicalInput = {
  readonly canonicalEventType: HcmCanonicalFinanceEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId: string;
  readonly payload: Readonly<Record<string, string>>;
  readonly legacyHcmEventType?: string;
};

function publishCanonicalEvent(input: PublishCanonicalInput, context: ServiceContext): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();

  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId,
      payload: {
        workspace: "hcm",
        canonicalEventType: input.canonicalEventType,
        eventVersion: HCM_CANONICAL_EVENT_VERSION,
        sourceDomain: "hcm",
        ...(input.legacyHcmEventType ? { hcmEventType: input.legacyHcmEventType } : {}),
        ...input.payload,
      },
      auditMetadata: { sourceDomain: "hcm" },
    },
    context,
  );
}

function formatAmount(amount: CurrencyAmount): string {
  return String(amount.value);
}

/** Publishes hcm.workforce.cost.recorded for a finalized payroll entry. */
export function publishWorkforceCostRecorded(
  input: {
    readonly employeeId: string;
    readonly costPeriodId: string;
    readonly amount: CurrencyAmount;
    readonly costCentreId?: string;
    readonly correlationId: string;
    readonly transactionDate?: string;
    readonly includeLegacyShim?: boolean;
  },
  context: ServiceContext,
): IntelligenceEvent {
  const organizationId = context.organizationId;
  const idempotencyKey = buildHcmCanonicalIdempotencyKey(organizationId, "hcm.workforce.cost.recorded", {
    employeeId: input.employeeId,
    costPeriodId: input.costPeriodId,
  });

  return publishCanonicalEvent(
    {
      canonicalEventType: "hcm.workforce.cost.recorded",
      entityType: "employee",
      entityId: input.employeeId,
      correlationId: input.correlationId,
      legacyHcmEventType: input.includeLegacyShim
        ? HCM_CANONICAL_LEGACY_EVENT_TYPES.workforceCostRecorded
        : undefined,
      payload: {
        employeeId: input.employeeId,
        costPeriodId: input.costPeriodId,
        amount: formatAmount(input.amount),
        currencyCode: input.amount.currency,
        ...(input.costCentreId ? { costCentreId: input.costCentreId } : {}),
        ...(input.transactionDate ? { transactionDate: input.transactionDate } : {}),
        idempotencyKey,
      },
    },
    context,
  );
}

/** Publishes hcm.expense.approved after expense approval. */
export function publishExpenseApproved(
  input: {
    readonly expenseId: string;
    readonly employeeId: string;
    readonly amount: CurrencyAmount;
    readonly costPeriodId?: string;
    readonly costCentreId?: string;
    readonly approvalReference?: string;
    readonly correlationId: string;
    readonly includeLegacyShim?: boolean;
  },
  context: ServiceContext,
): IntelligenceEvent {
  const organizationId = context.organizationId;
  const idempotencyKey = buildHcmCanonicalIdempotencyKey(organizationId, "hcm.expense.approved", {
    expenseId: input.expenseId,
  });

  return publishCanonicalEvent(
    {
      canonicalEventType: "hcm.expense.approved",
      entityType: "expense",
      entityId: input.expenseId,
      correlationId: input.correlationId,
      legacyHcmEventType: input.includeLegacyShim
        ? HCM_CANONICAL_LEGACY_EVENT_TYPES.expenseApproved
        : undefined,
      payload: {
        expenseId: input.expenseId,
        employeeId: input.employeeId,
        amount: formatAmount(input.amount),
        currencyCode: input.amount.currency,
        ...(input.costPeriodId ? { costPeriodId: input.costPeriodId } : {}),
        ...(input.costCentreId ? { costCentreId: input.costCentreId } : {}),
        ...(input.approvalReference ? { approvalReference: input.approvalReference } : {}),
        idempotencyKey,
      },
    },
    context,
  );
}
