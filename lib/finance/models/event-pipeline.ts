import type {
  DeadLetterRecord,
  FinancialEventRecord,
  PipelineAuditRecord,
  PipelineBusinessEventType,
  PipelineInquiryQuery,
} from "@/types/finance-event-pipeline";

export type FinancialEventListItem = {
  readonly id: string;
  readonly businessEventType: PipelineBusinessEventType;
  readonly financialEventType: FinancialEventRecord["financialEventType"];
  readonly classification: FinancialEventRecord["classification"];
  readonly status: FinancialEventRecord["status"];
  readonly pipelineStage: FinancialEventRecord["pipelineStage"];
  readonly correlationId: string;
  readonly currency: string;
  readonly createdAt: string;
};

export type PipelineInquiryView = {
  readonly events: readonly FinancialEventListItem[];
  readonly deadLetters: readonly DeadLetterRecord[];
  readonly totalEvents: number;
  readonly queuedCount: number;
  readonly rejectedCount: number;
};

export type PipelineAuditView = {
  readonly entries: readonly PipelineAuditRecord[];
  readonly totalEntries: number;
};

export type PipelineRegistrationView = {
  readonly businessEventTypes: readonly PipelineBusinessEventType[];
  readonly policyRules: readonly string[];
};
