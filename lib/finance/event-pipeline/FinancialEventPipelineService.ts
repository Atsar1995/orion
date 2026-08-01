import { randomUUID } from "crypto";
import { PipelineRulesEngine } from "@/lib/finance/event-pipeline/PipelineRulesEngine";
import { PolicyEvaluator } from "@/lib/finance/event-pipeline/PolicyEvaluator";
import { publishPipelineEvent } from "@/lib/finance/event-pipeline/pipeline-events";
import { TransformationRegistry } from "@/lib/finance/event-pipeline/TransformationRegistry";
import type {
  FinancialEventListItem,
  PipelineAuditView,
  PipelineInquiryView,
  PipelineRegistrationView,
} from "@/lib/finance/models/event-pipeline";
import type { FiscalPeriodService } from "@/lib/finance/fiscal-period/FiscalPeriodService";
import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
import type {
  BusinessEventIntakeRepository,
  DeadLetterRepository,
  FinancialEventRepository,
  PipelineAuditRepository,
} from "@/lib/finance/repositories/FinancialEventRepository";
import type {
  BusinessEventIntakeInput,
  DeadLetterRecord,
  FinancialEventRecord,
  PipelineInquiryQuery,
  PipelineProcessingResult,
} from "@/types/finance-event-pipeline";
import type { ServiceContext } from "@/types/services";

const MAX_RETRIES = 3;

function todayIso(): string {
  return new Date().toISOString();
}

/** Enterprise Financial Event Pipeline service (Mission P-009.6). */
export class FinancialEventPipelineService {
  readonly rules: PipelineRulesEngine;
  readonly policies: PolicyEvaluator;
  readonly transformations: TransformationRegistry;

  constructor(
    private readonly financialEventRepository: FinancialEventRepository,
    private readonly intakeRepository: BusinessEventIntakeRepository,
    private readonly deadLetterRepository: DeadLetterRepository,
    private readonly auditRepository: PipelineAuditRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    fiscalPeriodService: FiscalPeriodService,
    transformationRegistry: TransformationRegistry = new TransformationRegistry(),
  ) {
    this.rules = new PipelineRulesEngine(financialEventRepository, intakeRepository, idempotencyRepository);
    this.policies = new PolicyEvaluator(fiscalPeriodService);
    this.transformations = transformationRegistry;
  }

  /** Primary pipeline entry — processes business event through all stages. */
  processIntake(input: BusinessEventIntakeInput, context: ServiceContext): PipelineProcessingResult {
    const businessEventId = randomUUID();
    const now = todayIso();

    const validationIssues = this.rules.validateIntake(input, context.organizationId);
    if (validationIssues.length > 0) {
      return this.reject(input, context, businessEventId, validationIssues[0]!, "validation");
    }

    const policyIssues = this.policies.evaluate(input, context.organizationId);
    if (policyIssues.length > 0) {
      return this.reject(
        input,
        context,
        businessEventId,
        { code: policyIssues[0]!.code, message: policyIssues[0]!.message, retryable: false },
        "policy",
      );
    }

    this.intakeRepository.create({
      id: businessEventId,
      organizationId: context.organizationId,
      businessEventType: input.businessEventType,
      sourceService: input.sourceService,
      sourceEntityType: input.sourceEntityType,
      sourceEntityId: input.sourceEntityId,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
      receivedAt: now,
      status: "processing",
    });

    this.audit(context, businessEventId, "", "intake", "received", { sourceService: input.sourceService });
    this.audit(context, businessEventId, "", "validation", "passed");
    this.audit(context, businessEventId, "", "policy", "passed");

    let transformation: ReturnType<TransformationRegistry["transform"]>;
    try {
      transformation = this.transformations.transform(input);
    } catch (error) {
      const classified = this.rules.classifyError(error);
      return this.handleFailure(input, context, businessEventId, classified, "transformation");
    }

    this.audit(context, businessEventId, "", "classification", "classified", {
      classification: transformation.classification,
    });

    const currency = input.currency?.transactionCurrency ?? "ZAR";
    const eventId = randomUUID();

    const financialEvent: FinancialEventRecord = {
      id: eventId,
      organizationId: context.organizationId,
      businessEventId,
      businessEventType: input.businessEventType,
      financialEventType: transformation.financialEventType,
      classification: transformation.classification,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
      periodId: input.periodId,
      currency,
      sourceEntityType: input.sourceEntityType,
      sourceEntityId: input.sourceEntityId,
      sourceService: input.sourceService,
      status: "created",
      pipelineStage: "transformation",
      retryCount: 0,
      retryable: false,
      createdAt: now,
      updatedAt: now,
    };

    this.financialEventRepository.create(financialEvent);
    this.audit(context, businessEventId, eventId, "transformation", "created");

    publishPipelineEvent(
      {
        eventType: "FinancialEventCreated",
        entityType: "financial_event",
        entityId: eventId,
        correlationId: input.correlationId,
        payload: { financialEventType: transformation.financialEventType },
      },
      context,
    );

    const validated = this.financialEventRepository.update({
      ...financialEvent,
      status: "validated",
      pipelineStage: "validation",
      updatedAt: todayIso(),
    });

    publishPipelineEvent(
      {
        eventType: "FinancialEventValidated",
        entityType: "financial_event",
        entityId: eventId,
        correlationId: input.correlationId,
      },
      context,
    );

    const queued = this.financialEventRepository.update({
      ...validated,
      status: "queued",
      pipelineStage: "queued",
      updatedAt: todayIso(),
    });

    publishPipelineEvent(
      {
        eventType: "FinancialEventQueued",
        entityType: "financial_event",
        entityId: eventId,
        correlationId: input.correlationId,
        payload: { readyForJournal: "true" },
      },
      context,
    );

    this.idempotencyRepository.markProcessed(context.organizationId, input.idempotencyKey, {
      financialEventId: eventId,
    });

    const processed = this.financialEventRepository.update({
      ...queued,
      status: "processed",
      pipelineStage: "processed",
      updatedAt: todayIso(),
    });

    publishPipelineEvent(
      {
        eventType: "FinancialEventProcessed",
        entityType: "financial_event",
        entityId: eventId,
        correlationId: input.correlationId,
      },
      context,
    );

    this.audit(context, businessEventId, eventId, "processed", "completed");

    return { success: true, financialEvent: processed, stage: "processed" };
  }

  retryEvent(eventId: string, context: ServiceContext): PipelineProcessingResult {
    const existing = this.financialEventRepository.findById(context.organizationId, eventId);
    if (!existing) {
      return { success: false, stage: "dead_letter", errorCode: "EVENT_NOT_FOUND", errorMessage: "Event not found" };
    }

    if (!existing.retryable) {
      return {
        success: false,
        stage: existing.pipelineStage,
        errorCode: "NOT_RETRYABLE",
        errorMessage: "Event is not retryable",
        retryable: false,
      };
    }

    if (existing.retryCount >= MAX_RETRIES) {
      return this.moveToDeadLetter(existing, context, "MAX_RETRIES_EXCEEDED", "Maximum retry attempts exceeded");
    }

    const input: BusinessEventIntakeInput = {
      businessEventType: existing.businessEventType,
      sourceService: existing.sourceService,
      sourceEntityType: existing.sourceEntityType,
      sourceEntityId: existing.sourceEntityId,
      correlationId: `${existing.correlationId}-retry-${existing.retryCount + 1}`,
      idempotencyKey: `${existing.idempotencyKey}-retry-${existing.retryCount + 1}`,
      periodId: existing.periodId,
      currency: { transactionCurrency: existing.currency },
    };

    this.financialEventRepository.update({
      ...existing,
      retryCount: existing.retryCount + 1,
      updatedAt: todayIso(),
    });

    return this.processIntake(input, context);
  }

  getEvent(eventId: string, context: ServiceContext): FinancialEventRecord | null {
    return this.financialEventRepository.findById(context.organizationId, eventId);
  }

  inquiry(query: PipelineInquiryQuery, context: ServiceContext): PipelineInquiryView {
    const events = this.financialEventRepository.list(context.organizationId, query).map(mapListItem);
    const deadLetters = this.deadLetterRepository.list(context.organizationId);

    return {
      events,
      deadLetters,
      totalEvents: events.length,
      queuedCount: events.filter((event) => event.status === "queued").length,
      rejectedCount: events.filter((event) => event.status === "rejected").length,
    };
  }

  getAuditTrail(eventId: string, context: ServiceContext): PipelineAuditView {
    const event = this.financialEventRepository.findById(context.organizationId, eventId);
    const entries = event
      ? this.auditRepository.listByBusinessEvent(context.organizationId, event.businessEventId)
      : this.auditRepository.listByEvent(context.organizationId, eventId);
    return { entries, totalEntries: entries.length };
  }

  getRegistration(): PipelineRegistrationView {
    return {
      businessEventTypes: this.transformations.listRegisteredTypes(),
      policyRules: this.policies.listRuleCodes(),
    };
  }

  listDeadLetters(context: ServiceContext): readonly DeadLetterRecord[] {
    return this.deadLetterRepository.list(context.organizationId);
  }

  /** Legacy transformation entry point — delegates to pipeline intake. */
  transformBusinessEvent(
    inboundEventId: string,
    input: Omit<BusinessEventIntakeInput, "idempotencyKey"> & { idempotencyKey?: string },
    context: ServiceContext,
  ): PipelineProcessingResult {
    return this.processIntake(
      {
        ...input,
        idempotencyKey: input.idempotencyKey ?? inboundEventId,
      },
      context,
    );
  }

  private reject(
    input: BusinessEventIntakeInput,
    context: ServiceContext,
    businessEventId: string,
    issue: { code: string; message: string; retryable?: boolean },
    stage: FinancialEventRecord["pipelineStage"],
  ): PipelineProcessingResult {
    publishPipelineEvent(
      {
        eventType: "FinancialEventRejected",
        entityType: "business_event",
        entityId: businessEventId,
        correlationId: input.correlationId,
        payload: { code: issue.code },
      },
      context,
    );

    this.audit(context, businessEventId, "", stage, "rejected", { code: issue.code });

    return {
      success: false,
      stage,
      errorCode: issue.code,
      errorMessage: issue.message,
      retryable: issue.retryable ?? false,
    };
  }

  private handleFailure(
    input: BusinessEventIntakeInput,
    context: ServiceContext,
    businessEventId: string,
    classified: { code: string; message: string; retryable: boolean },
    stage: FinancialEventRecord["pipelineStage"],
  ): PipelineProcessingResult {
    publishPipelineEvent(
      {
        eventType: "FinancialPipelineError",
        entityType: "business_event",
        entityId: businessEventId,
        correlationId: input.correlationId,
        payload: { code: classified.code, retryable: String(classified.retryable) },
      },
      context,
    );

    if (!classified.retryable) {
      this.deadLetterRepository.create({
        id: randomUUID(),
        organizationId: context.organizationId,
        businessEventId,
        reason: classified.message,
        errorCode: classified.code,
        retryable: false,
        retryCount: 0,
        createdAt: todayIso(),
      });
    }

    return {
      success: false,
      stage,
      errorCode: classified.code,
      errorMessage: classified.message,
      retryable: classified.retryable,
    };
  }

  private moveToDeadLetter(
    event: FinancialEventRecord,
    context: ServiceContext,
    errorCode: string,
    reason: string,
  ): PipelineProcessingResult {
    const dlq: DeadLetterRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      businessEventId: event.businessEventId,
      financialEventId: event.id,
      reason,
      errorCode,
      retryable: false,
      retryCount: event.retryCount,
      createdAt: todayIso(),
    };

    this.deadLetterRepository.create(dlq);
    this.financialEventRepository.update({
      ...event,
      status: "dead_letter",
      pipelineStage: "dead_letter",
      errorCode,
      errorMessage: reason,
      updatedAt: todayIso(),
    });

    publishPipelineEvent(
      {
        eventType: "FinancialPipelineError",
        entityType: "financial_event",
        entityId: event.id,
        payload: { code: errorCode },
      },
      context,
    );

    return { success: false, stage: "dead_letter", errorCode, errorMessage: reason, retryable: false };
  }

  private audit(
    context: ServiceContext,
    businessEventId: string,
    eventId: string,
    stage: FinancialEventRecord["pipelineStage"],
    action: string,
    details?: Readonly<Record<string, string>>,
  ): void {
    this.auditRepository.record({
      id: randomUUID(),
      organizationId: context.organizationId,
      eventId: eventId || businessEventId,
      businessEventId,
      stage,
      action,
      actorId: context.userId,
      details,
      timestamp: todayIso(),
    });
  }
}

function mapListItem(event: FinancialEventRecord): FinancialEventListItem {
  return {
    id: event.id,
    businessEventType: event.businessEventType,
    financialEventType: event.financialEventType,
    classification: event.classification,
    status: event.status,
    pipelineStage: event.pipelineStage,
    correlationId: event.correlationId,
    currency: event.currency,
    createdAt: event.createdAt,
  };
}
