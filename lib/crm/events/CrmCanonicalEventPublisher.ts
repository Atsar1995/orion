import { CRM_IIL_SERVICE_ID, CRM_WORKSPACE_LABEL } from "@/lib/crm/constants";
import {
  CRM_CANONICAL_ENTITY_TYPES,
  CRM_CANONICAL_EVENT_VERSION,
  type CrmCanonicalEventType,
} from "@/lib/crm/events/crmOutboundEvents";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

type IdempotencyParams = {
  readonly leadId?: string;
  readonly opportunityId?: string;
  readonly quoteId?: string;
  readonly customerId?: string;
  readonly salesOrderId?: string;
  readonly caseId?: string;
  readonly version?: string;
};

/** Builds deterministic CRM canonical idempotency keys (ADR-014 · ES-CRM-001). */
export function buildCrmCanonicalIdempotencyKey(
  organizationId: string,
  eventType: CrmCanonicalEventType,
  params: IdempotencyParams,
): string {
  const prefix = `${organizationId}:${CRM_IIL_SERVICE_ID}`;

  switch (eventType) {
    case "crm.lead.created":
      return `${prefix}:crm-lead-${params.leadId}-created-v1`;
    case "crm.lead.qualified":
      return `${prefix}:crm-lead-${params.leadId}-qualified-v1`;
    case "crm.opportunity.created":
      return `${prefix}:crm-opportunity-${params.opportunityId}-created-v1`;
    case "crm.opportunity.closed":
      return `${prefix}:crm-opportunity-${params.opportunityId}-closed-v1`;
    case "crm.quote.created":
      return `${prefix}:crm-quote-${params.quoteId}-created-v1`;
    case "crm.customer.created":
      return `${prefix}:crm-customer-${params.customerId}-created-v1`;
    case "crm.customer.updated":
      return `${prefix}:crm-customer-${params.customerId}-updated-v${params.version ?? "1"}`;
    case "crm.salesorder.confirmed":
      return `${prefix}:crm-salesorder-${params.salesOrderId}-confirmed-v1`;
    case "crm.revenue.recognized":
      return `${prefix}:crm-revenue-${params.salesOrderId}-recognized-v1`;
    case "crm.case.closed":
      return `${prefix}:crm-case-${params.caseId}-closed-v1`;
    default: {
      const exhaustive: never = eventType;
      throw new Error(`UNSUPPORTED_CRM_EVENT:${exhaustive}`);
    }
  }
}

type PublishCanonicalInput = {
  readonly canonicalEventType: CrmCanonicalEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly idempotencyKey: string;
  readonly payload: Readonly<Record<string, string>>;
};

/** ADR-014 CRM canonical event publisher — publish-only, Durable IIL transport (P-008.14). */
export class CrmCanonicalEventPublisher {
  publishLeadCreated(
    input: {
      readonly leadId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly source?: string;
      readonly owner?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(organizationId, "crm.lead.created", {
      leadId: input.leadId,
    });

    return this.publish(
      {
        canonicalEventType: "crm.lead.created",
        entityType: CRM_CANONICAL_ENTITY_TYPES.lead,
        entityId: input.leadId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          leadId: input.leadId,
          ...(input.source ? { source: input.source } : {}),
          ...(input.owner ? { owner: input.owner } : {}),
        },
      },
      context,
    );
  }

  publishLeadQualified(
    input: {
      readonly leadId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly qualifiedBy?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(organizationId, "crm.lead.qualified", {
      leadId: input.leadId,
    });

    return this.publish(
      {
        canonicalEventType: "crm.lead.qualified",
        entityType: CRM_CANONICAL_ENTITY_TYPES.lead,
        entityId: input.leadId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          leadId: input.leadId,
          ...(input.qualifiedBy ? { qualifiedBy: input.qualifiedBy } : {}),
        },
      },
      context,
    );
  }

  publishOpportunityCreated(
    input: {
      readonly opportunityId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly leadId?: string;
      readonly stage?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(
      organizationId,
      "crm.opportunity.created",
      { opportunityId: input.opportunityId },
    );

    return this.publish(
      {
        canonicalEventType: "crm.opportunity.created",
        entityType: CRM_CANONICAL_ENTITY_TYPES.opportunity,
        entityId: input.opportunityId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          opportunityId: input.opportunityId,
          ...(input.leadId ? { leadId: input.leadId } : {}),
          ...(input.stage ? { stage: input.stage } : {}),
        },
      },
      context,
    );
  }

  publishOpportunityClosed(
    input: {
      readonly opportunityId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly outcome: string;
      readonly amount?: string;
      readonly currencyCode?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(
      organizationId,
      "crm.opportunity.closed",
      { opportunityId: input.opportunityId },
    );

    return this.publish(
      {
        canonicalEventType: "crm.opportunity.closed",
        entityType: CRM_CANONICAL_ENTITY_TYPES.opportunity,
        entityId: input.opportunityId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          opportunityId: input.opportunityId,
          outcome: input.outcome,
          ...(input.amount ? { amount: input.amount } : {}),
          ...(input.currencyCode ? { currencyCode: input.currencyCode } : {}),
        },
      },
      context,
    );
  }

  publishQuoteCreated(
    input: {
      readonly quoteId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly opportunityId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(organizationId, "crm.quote.created", {
      quoteId: input.quoteId,
    });

    return this.publish(
      {
        canonicalEventType: "crm.quote.created",
        entityType: CRM_CANONICAL_ENTITY_TYPES.quote,
        entityId: input.quoteId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          quoteId: input.quoteId,
          ...(input.opportunityId ? { opportunityId: input.opportunityId } : {}),
        },
      },
      context,
    );
  }

  publishCustomerCreated(
    input: {
      readonly customerId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly displayName?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(
      organizationId,
      "crm.customer.created",
      { customerId: input.customerId },
    );

    return this.publish(
      {
        canonicalEventType: "crm.customer.created",
        entityType: CRM_CANONICAL_ENTITY_TYPES.customer,
        entityId: input.customerId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          customerId: input.customerId,
          ...(input.displayName ? { displayName: input.displayName } : {}),
        },
      },
      context,
    );
  }

  publishCustomerUpdated(
    input: {
      readonly customerId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly version?: string;
      readonly changeType?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const version = input.version ?? "1";
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(
      organizationId,
      "crm.customer.updated",
      { customerId: input.customerId, version },
    );

    return this.publish(
      {
        canonicalEventType: "crm.customer.updated",
        entityType: CRM_CANONICAL_ENTITY_TYPES.customer,
        entityId: input.customerId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          customerId: input.customerId,
          version,
          ...(input.changeType ? { changeType: input.changeType } : {}),
        },
      },
      context,
    );
  }

  publishSalesOrderConfirmed(
    input: {
      readonly salesOrderId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly quoteId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(
      organizationId,
      "crm.salesorder.confirmed",
      { salesOrderId: input.salesOrderId },
    );

    return this.publish(
      {
        canonicalEventType: "crm.salesorder.confirmed",
        entityType: CRM_CANONICAL_ENTITY_TYPES.salesOrder,
        entityId: input.salesOrderId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          salesOrderId: input.salesOrderId,
          ...(input.quoteId ? { quoteId: input.quoteId } : {}),
        },
      },
      context,
    );
  }

  publishRevenueRecognized(
    input: {
      readonly salesOrderId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly amount: string;
      readonly currencyCode: string;
      readonly period?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(
      organizationId,
      "crm.revenue.recognized",
      { salesOrderId: input.salesOrderId },
    );

    return this.publish(
      {
        canonicalEventType: "crm.revenue.recognized",
        entityType: CRM_CANONICAL_ENTITY_TYPES.revenue,
        entityId: input.salesOrderId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          salesOrderId: input.salesOrderId,
          amount: input.amount,
          currencyCode: input.currencyCode,
          ...(input.period ? { period: input.period } : {}),
        },
      },
      context,
    );
  }

  publishCaseClosed(
    input: {
      readonly caseId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly resolution?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildCrmCanonicalIdempotencyKey(organizationId, "crm.case.closed", {
      caseId: input.caseId,
    });

    return this.publish(
      {
        canonicalEventType: "crm.case.closed",
        entityType: CRM_CANONICAL_ENTITY_TYPES.case,
        entityId: input.caseId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          caseId: input.caseId,
          ...(input.resolution ? { resolution: input.resolution } : {}),
        },
      },
      context,
    );
  }

  private publish(input: PublishCanonicalInput, context: ServiceContext): IntelligenceEvent {
    const integration = getIntelligenceIntegrationService();
    const eventTimestamp = new Date().toISOString();

    return integration.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: CRM_WORKSPACE_LABEL,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: context.userId ?? "system",
        correlationId: input.correlationId,
        payload: {
          workspace: "crm",
          canonicalEventType: input.canonicalEventType,
          eventVersion: CRM_CANONICAL_EVENT_VERSION,
          sourceDomain: "crm",
          eventTimestamp,
          idempotencyKey: input.idempotencyKey,
          ...(input.causationId ? { causationId: input.causationId } : {}),
          ...input.payload,
        },
        auditMetadata: {
          sourceDomain: "crm",
          ...(input.causationId ? { causationId: input.causationId } : {}),
        },
      },
      context,
    );
  }
}

export const defaultCrmCanonicalEventPublisher = new CrmCanonicalEventPublisher();
