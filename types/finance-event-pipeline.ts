/**
 * Finance Domain — Financial Event Pipeline types (Mission P-009.6).
 * @see docs/Finance/Blueprints/D-008_Enterprise_Financial_Event_Model.md
 */

import type { FinanceCurrencyContext } from "@/types/finance-currency";
import type { FinanceBusinessEventType, FinanceFinancialEventType } from "@/types/finance-events";

/** Extensible enterprise business event types accepted by the pipeline. */
export type PipelineBusinessEventType =
  | FinanceBusinessEventType
  | "SalesCompleted"
  | "ReservationConfirmed"
  | "ReservationCancelled"
  | "InvoiceApproved"
  | "RefundApproved"
  | "PaymentReceived"
  | "VendorInvoiceApproved"
  | "ExpenseApproved"
  | "InventoryAdjustment"
  | "PayrollApproved"
  | "ManualFinancialEvent";

/** Pipeline stage identifiers. */
export type PipelineStage =
  | "intake"
  | "validation"
  | "policy"
  | "classification"
  | "transformation"
  | "queued"
  | "processed"
  | "rejected"
  | "dead_letter";

/** Financial event classification categories. */
export type FinancialEventClassification =
  | "revenue"
  | "expense"
  | "payment"
  | "adjustment"
  | "manual"
  | "payroll"
  | "inventory";

/** Pipeline-produced event types (D-008 extension). */
export type PipelineEventType =
  | "FinancialEventCreated"
  | "FinancialEventValidated"
  | "FinancialEventRejected"
  | "FinancialEventQueued"
  | "FinancialEventProcessed"
  | "FinancialPipelineError";

export type PublishPipelineEventInput = {
  readonly eventType: PipelineEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

/** Immutable financial event record produced by the pipeline. */
export type FinancialEventRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly businessEventId: string;
  readonly businessEventType: PipelineBusinessEventType;
  readonly financialEventType: FinanceFinancialEventType;
  readonly classification: FinancialEventClassification;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly periodId?: string;
  readonly currency: string;
  readonly sourceEntityType: string;
  readonly sourceEntityId: string;
  readonly sourceService: string;
  readonly status: "created" | "validated" | "queued" | "processed" | "rejected" | "dead_letter";
  readonly pipelineStage: PipelineStage;
  readonly retryCount: number;
  readonly retryable: boolean;
  readonly errorCode?: string;
  readonly errorMessage?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Business event intake payload. */
export type BusinessEventIntakeInput = {
  readonly businessEventType: PipelineBusinessEventType;
  readonly sourceService: string;
  readonly sourceEntityType: string;
  readonly sourceEntityId: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly periodId?: string;
  readonly transactionDate?: string;
  readonly currency?: FinanceCurrencyContext;
  readonly payload?: Readonly<Record<string, string>>;
};

/** Dead letter queue contract record. */
export type DeadLetterRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly businessEventId: string;
  readonly financialEventId?: string;
  readonly reason: string;
  readonly errorCode: string;
  readonly retryable: boolean;
  readonly retryCount: number;
  readonly createdAt: string;
};

/** Immutable pipeline audit trail entry. */
export type PipelineAuditRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly eventId: string;
  readonly businessEventId: string;
  readonly stage: PipelineStage;
  readonly action: string;
  readonly actorId?: string;
  readonly details?: Readonly<Record<string, string>>;
  readonly timestamp: string;
};

export type PipelineProcessingResult = {
  readonly success: boolean;
  readonly financialEvent?: FinancialEventRecord;
  readonly stage: PipelineStage;
  readonly errorCode?: string;
  readonly errorMessage?: string;
  readonly retryable?: boolean;
};

export type PipelineInquiryQuery = {
  readonly status?: FinancialEventRecord["status"];
  readonly classification?: FinancialEventClassification;
  readonly businessEventType?: PipelineBusinessEventType;
};

/** Transformer function registered for a business event type. */
export type BusinessEventTransformer = (
  input: BusinessEventIntakeInput,
) => {
  readonly financialEventType: FinanceFinancialEventType;
  readonly classification: FinancialEventClassification;
};

/** Policy rule evaluated during pipeline processing. */
export type PipelinePolicyRule = {
  readonly code: string;
  readonly message: string;
  readonly evaluate: (input: BusinessEventIntakeInput, organizationId: string) => boolean;
};
