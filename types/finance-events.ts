/**
 * Finance Domain — enterprise event contract types (Mission P-009.1).
 * @see docs/Finance/Blueprints/D-008_Enterprise_Financial_Event_Model.md
 */

import type { FinanceCurrencyContext } from "@/types/finance-currency";
import type { IntelligenceEventPriority } from "@/types/intelligence-integration";

/** Canonical financial event names from D-008 (contracts only in P-009.1). */
export type FinanceFinancialEventType =
  | "InvoiceIssued"
  | "InvoicePaid"
  | "PaymentReceived"
  | "PaymentMade"
  | "RevenueRecognized"
  | "ExpenseRecorded"
  | "JournalPosted"
  | "JournalReversed"
  | "PeriodClosed"
  | "FinancialKpiUpdated"
  | "FinancialBriefSignalPublished";

/** Business events Finance subscribes to (publishers: Hospitality, Commercial, HR, Procurement). */
export type FinanceBusinessEventType =
  | "ContractSigned"
  | "ContractRenewed"
  | "FolioSettled"
  | "BillingChargePosted"
  | "OpportunityWon"
  | "PurchaseReceived"
  | "SalaryApproved"
  | "CustomEvent";

/** Conceptual enterprise event contract (no JSON schema — D-008 §7). */
export type EnterpriseEventContract = {
  readonly eventId: string;
  readonly organizationId: string;
  readonly timestamp: string;
  readonly publisher: string;
  readonly version: string;
  readonly correlationId: string;
  readonly sourceEntityType: string;
  readonly sourceEntityId: string;
  readonly financialContext?: FinanceCurrencyContext;
  readonly priority: IntelligenceEventPriority;
  readonly status: "published" | "rejected" | "superseded" | "compensated";
};

export type PublishFinanceEventInput = {
  readonly eventType: FinanceFinancialEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly actorId?: string;
  readonly actorName?: string;
  readonly priority?: IntelligenceEventPriority;
  readonly correlationId?: string;
  readonly idempotencyKey?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

export type FinanceEventSubscriptionDescriptor = {
  readonly subscriberId: string;
  readonly businessEventTypes: readonly FinanceBusinessEventType[];
  readonly sourceServices: readonly string[];
};

/** Record of a received business event awaiting future transformation (P-009.2+). */
export type FinanceInboundBusinessEventRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly eventType: FinanceBusinessEventType;
  readonly sourceService: string;
  readonly sourceEntityType: string;
  readonly sourceEntityId: string;
  readonly correlationId: string;
  readonly receivedAt: string;
  readonly status: "received" | "validated" | "rejected";
};
