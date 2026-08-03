import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import type { PostingContext } from "@/lib/finance/services/PostingContext";
import type { JournalDraftInput } from "@/types/finance-ledger";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Canonical HCM → Finance event types supported in Wave A (ADR-014). */
export const HCM_FINANCE_EVENT_TYPES = [
  "hcm.workforce.cost.recorded",
  "hcm.expense.approved",
] as const;

export type HcmFinanceEventType = (typeof HCM_FINANCE_EVENT_TYPES)[number];

const SUPPORTED_EVENT_VERSION = "1";

/** Resolves the ADR-014 canonical event type from an IIL envelope. */
export function resolveCanonicalEventType(event: IntelligenceEvent): HcmFinanceEventType | null {
  const canonical = event.payload.canonicalEventType ?? event.payload.eventType;
  if ((HCM_FINANCE_EVENT_TYPES as readonly string[]).includes(canonical)) {
    return canonical as HcmFinanceEventType;
  }

  return null;
}

/** Returns true when the envelope declares a supported contract version. */
export function isSupportedEventVersion(event: IntelligenceEvent): boolean {
  const version = event.payload.eventVersion ?? event.version;
  return version === SUPPORTED_EVENT_VERSION;
}

/** Builds the ES-FIN-002 idempotency key for an inbound HCM event. */
export function buildHcmFinanceIdempotencyKey(
  event: IntelligenceEvent,
  eventType: HcmFinanceEventType,
): string {
  if (event.payload.idempotencyKey?.trim()) {
    return event.payload.idempotencyKey.trim();
  }

  const organizationId = event.organizationId;
  if (eventType === "hcm.workforce.cost.recorded") {
    const employeeId = event.payload.employeeId ?? event.entityId;
    const costPeriodId = event.payload.costPeriodId ?? "1";
    return `${organizationId}:${HCM_IIL_SERVICE_ID}:${eventType}:${employeeId}:${costPeriodId}`;
  }

  const expenseId = event.payload.expenseId ?? event.entityId;
  return `${organizationId}:${HCM_IIL_SERVICE_ID}:${eventType}:${expenseId}:1`;
}

/** Maps a canonical HCM event to a journal draft — no business calculations. */
export function mapHcmEventToJournalDraft(
  event: IntelligenceEvent,
  eventType: HcmFinanceEventType,
): JournalDraftInput {
  const amount = parseAmount(event.payload.amount);
  const currency = event.payload.currencyCode ?? "ZAR";
  const periodId = event.payload.costPeriodId ?? event.payload.periodId ?? "period-2026-07";
  const journalId = `journal-hcm-${event.eventId}`;

  if (eventType === "hcm.workforce.cost.recorded") {
    return {
      entry: {
        id: journalId,
        organizationId: event.organizationId,
        periodId,
        status: "draft",
        correlationId: event.correlationId,
        idempotencyKey: buildHcmFinanceIdempotencyKey(event, eventType),
      },
      lines: [
        {
          id: `${journalId}-line-debit`,
          journalId,
          accountId: "coa-5100",
          debitAmount: amount,
          creditAmount: 0,
          currency,
        },
        {
          id: `${journalId}-line-credit`,
          journalId,
          accountId: "coa-3100",
          debitAmount: 0,
          creditAmount: amount,
          currency,
        },
      ],
    };
  }

  return {
    entry: {
      id: journalId,
      organizationId: event.organizationId,
      periodId,
      status: "draft",
      correlationId: event.correlationId,
      idempotencyKey: buildHcmFinanceIdempotencyKey(event, eventType),
    },
    lines: [
      {
        id: `${journalId}-line-debit`,
        journalId,
        accountId: "coa-5100",
        debitAmount: amount,
        creditAmount: 0,
        currency,
      },
      {
        id: `${journalId}-line-credit`,
        journalId,
        accountId: "coa-2100",
        debitAmount: 0,
        creditAmount: amount,
        currency,
      },
    ],
  };
}

/** Maps a posted journal request from an inbound HCM event. */
export function mapHcmEventToPostingContext(
  journalId: string,
  event: IntelligenceEvent,
  eventType: HcmFinanceEventType,
  serviceContext: ServiceContext,
): PostingContext {
  const costCentreId = event.payload.costCentreId ?? "cc-hcm-default";
  const journalDate =
    event.payload.transactionDate ??
    event.payload.journalDate ??
    resolveDefaultJournalDate(event.payload.costPeriodId ?? event.payload.periodId);

  return {
    organizationId: event.organizationId,
    journalId,
    correlationId: event.correlationId,
    idempotencyKey: buildHcmFinanceIdempotencyKey(event, eventType),
    eventId: event.eventId,
    serviceContext,
    requestMetadata: {
      journalDate,
      postedBy: event.actorId,
      sourceService: event.sourceService,
      canonicalEventType: eventType,
      costCentre: costCentreId,
      ...(event.payload.approvalReference
        ? { approvalReference: event.payload.approvalReference }
        : {}),
    },
  };
}

/** Validates required contract payload fields per event type. */
export function validateHcmContractPayload(
  event: IntelligenceEvent,
  eventType: HcmFinanceEventType,
): string | null {
  if (!parseAmount(event.payload.amount)) {
    return "AMOUNT_REQUIRED";
  }

  if (eventType === "hcm.workforce.cost.recorded") {
    if (!(event.payload.employeeId ?? event.entityId)) {
      return "EMPLOYEE_ID_REQUIRED";
    }
    if (!(event.payload.costPeriodId ?? event.payload.periodId)) {
      return "COST_PERIOD_REQUIRED";
    }
    return null;
  }

  if (!(event.payload.expenseId ?? event.entityId)) {
    return "EXPENSE_ID_REQUIRED";
  }

  return null;
}

function parseAmount(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function resolveDefaultJournalDate(periodId?: string): string {
  const match = periodId?.match(/period-(\d{4})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-15`;
  }

  return "2026-07-15";
}
