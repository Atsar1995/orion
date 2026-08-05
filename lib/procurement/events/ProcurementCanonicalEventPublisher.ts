import {
  PROCUREMENT_IIL_SERVICE_ID,
  PROCUREMENT_WORKSPACE_LABEL,
} from "@/lib/procurement/constants";
import {
  PROCUREMENT_CANONICAL_ENTITY_TYPES,
  PROCUREMENT_CANONICAL_EVENT_VERSION,
  type ProcurementCanonicalEventType,
} from "@/lib/procurement/events/procurementOutboundEvents";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

type IdempotencyParams = {
  readonly vendorId?: string;
  readonly requisitionId?: string;
  readonly rfqId?: string;
  readonly quotationId?: string;
  readonly purchaseOrderId?: string;
  readonly goodsReceiptId?: string;
  readonly invoiceId?: string;
  readonly contractId?: string;
  readonly version?: string;
};

/** Builds deterministic Procurement canonical idempotency keys (ADR-014 · P-010.6). */
export function buildProcurementCanonicalIdempotencyKey(
  organizationId: string,
  eventType: ProcurementCanonicalEventType,
  params: IdempotencyParams,
): string {
  const prefix = `${organizationId}:${PROCUREMENT_IIL_SERVICE_ID}`;

  switch (eventType) {
    case "procurement.vendor.created":
      return `${prefix}:procurement-vendor-${params.vendorId}-created-v1`;
    case "procurement.vendor.updated":
      return `${prefix}:procurement-vendor-${params.vendorId}-updated-v${params.version ?? "1"}`;
    case "procurement.requisition.created":
      return `${prefix}:procurement-requisition-${params.requisitionId}-created-v1`;
    case "procurement.requisition.approved":
      return `${prefix}:procurement-requisition-${params.requisitionId}-approved-v1`;
    case "procurement.rfq.sent":
      return `${prefix}:procurement-rfq-${params.rfqId}-sent-v1`;
    case "procurement.quotation.received":
      return `${prefix}:procurement-quotation-${params.quotationId}-received-v1`;
    case "procurement.purchaseorder.created":
      return `${prefix}:procurement-purchaseorder-${params.purchaseOrderId}-created-v1`;
    case "procurement.purchaseorder.approved":
      return `${prefix}:procurement-purchaseorder-${params.purchaseOrderId}-approved-v1`;
    case "procurement.goods.received":
      return `${prefix}:procurement-goods-${params.goodsReceiptId}-received-v1`;
    case "procurement.invoice.received":
      return `${prefix}:procurement-invoice-${params.invoiceId}-received-v1`;
    case "procurement.invoice.approved":
      return `${prefix}:procurement-invoice-${params.invoiceId}-approved-v1`;
    case "procurement.contract.created":
      return `${prefix}:procurement-contract-${params.contractId}-created-v1`;
    default: {
      const exhaustive: never = eventType;
      throw new Error(`UNSUPPORTED_PROCUREMENT_EVENT:${exhaustive}`);
    }
  }
}

type PublishCanonicalInput = {
  readonly canonicalEventType: ProcurementCanonicalEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly idempotencyKey: string;
  readonly payload: Readonly<Record<string, string>>;
};

/** ADR-014 Procurement canonical event publisher — publish-only, Durable IIL transport (P-010.6). */
export class ProcurementCanonicalEventPublisher {
  publishVendorCreated(
    input: {
      readonly vendorId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly displayName?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.vendor.created",
      { vendorId: input.vendorId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.vendor.created",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.vendor,
        entityId: input.vendorId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          vendorId: input.vendorId,
          ...(input.displayName ? { displayName: input.displayName } : {}),
        },
      },
      context,
    );
  }

  publishVendorUpdated(
    input: {
      readonly vendorId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly version?: string;
      readonly changeType?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const version = input.version ?? "1";
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.vendor.updated",
      { vendorId: input.vendorId, version },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.vendor.updated",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.vendor,
        entityId: input.vendorId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          vendorId: input.vendorId,
          version,
          ...(input.changeType ? { changeType: input.changeType } : {}),
        },
      },
      context,
    );
  }

  publishRequisitionCreated(
    input: {
      readonly requisitionId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly requesterId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.requisition.created",
      { requisitionId: input.requisitionId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.requisition.created",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.requisition,
        entityId: input.requisitionId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          requisitionId: input.requisitionId,
          ...(input.requesterId ? { requesterId: input.requesterId } : {}),
        },
      },
      context,
    );
  }

  publishRequisitionApproved(
    input: {
      readonly requisitionId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly approvedBy?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.requisition.approved",
      { requisitionId: input.requisitionId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.requisition.approved",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.requisition,
        entityId: input.requisitionId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          requisitionId: input.requisitionId,
          ...(input.approvedBy ? { approvedBy: input.approvedBy } : {}),
        },
      },
      context,
    );
  }

  publishRfqSent(
    input: {
      readonly rfqId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly requisitionId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.rfq.sent",
      { rfqId: input.rfqId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.rfq.sent",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.rfq,
        entityId: input.rfqId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          rfqId: input.rfqId,
          ...(input.requisitionId ? { requisitionId: input.requisitionId } : {}),
        },
      },
      context,
    );
  }

  publishQuotationReceived(
    input: {
      readonly quotationId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly rfqId?: string;
      readonly vendorId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.quotation.received",
      { quotationId: input.quotationId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.quotation.received",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.quotation,
        entityId: input.quotationId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          quotationId: input.quotationId,
          ...(input.rfqId ? { rfqId: input.rfqId } : {}),
          ...(input.vendorId ? { vendorId: input.vendorId } : {}),
        },
      },
      context,
    );
  }

  publishPurchaseOrderCreated(
    input: {
      readonly purchaseOrderId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly requisitionId?: string;
      readonly vendorId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.purchaseorder.created",
      { purchaseOrderId: input.purchaseOrderId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.purchaseorder.created",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.purchaseOrder,
        entityId: input.purchaseOrderId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          purchaseOrderId: input.purchaseOrderId,
          ...(input.requisitionId ? { requisitionId: input.requisitionId } : {}),
          ...(input.vendorId ? { vendorId: input.vendorId } : {}),
        },
      },
      context,
    );
  }

  publishPurchaseOrderApproved(
    input: {
      readonly purchaseOrderId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly approvedBy?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.purchaseorder.approved",
      { purchaseOrderId: input.purchaseOrderId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.purchaseorder.approved",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.purchaseOrder,
        entityId: input.purchaseOrderId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          purchaseOrderId: input.purchaseOrderId,
          ...(input.approvedBy ? { approvedBy: input.approvedBy } : {}),
        },
      },
      context,
    );
  }

  publishGoodsReceived(
    input: {
      readonly goodsReceiptId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly purchaseOrderId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.goods.received",
      { goodsReceiptId: input.goodsReceiptId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.goods.received",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.goodsReceipt,
        entityId: input.goodsReceiptId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          goodsReceiptId: input.goodsReceiptId,
          ...(input.purchaseOrderId ? { purchaseOrderId: input.purchaseOrderId } : {}),
        },
      },
      context,
    );
  }

  publishInvoiceReceived(
    input: {
      readonly invoiceId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly vendorId?: string;
      readonly purchaseOrderId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.invoice.received",
      { invoiceId: input.invoiceId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.invoice.received",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.invoice,
        entityId: input.invoiceId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          invoiceId: input.invoiceId,
          ...(input.vendorId ? { vendorId: input.vendorId } : {}),
          ...(input.purchaseOrderId ? { purchaseOrderId: input.purchaseOrderId } : {}),
        },
      },
      context,
    );
  }

  publishInvoiceApproved(
    input: {
      readonly invoiceId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly approvedBy?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.invoice.approved",
      { invoiceId: input.invoiceId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.invoice.approved",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.invoice,
        entityId: input.invoiceId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          invoiceId: input.invoiceId,
          ...(input.approvedBy ? { approvedBy: input.approvedBy } : {}),
        },
      },
      context,
    );
  }

  publishContractCreated(
    input: {
      readonly contractId: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly vendorId?: string;
    },
    context: ServiceContext,
  ): IntelligenceEvent {
    const organizationId = context.organizationId;
    const idempotencyKey = buildProcurementCanonicalIdempotencyKey(
      organizationId,
      "procurement.contract.created",
      { contractId: input.contractId },
    );

    return this.publish(
      {
        canonicalEventType: "procurement.contract.created",
        entityType: PROCUREMENT_CANONICAL_ENTITY_TYPES.contract,
        entityId: input.contractId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        idempotencyKey,
        payload: {
          contractId: input.contractId,
          ...(input.vendorId ? { vendorId: input.vendorId } : {}),
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
        sourceService: PROCUREMENT_IIL_SERVICE_ID,
        sourceWorkspace: PROCUREMENT_WORKSPACE_LABEL,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: context.userId ?? "system",
        correlationId: input.correlationId,
        payload: {
          workspace: "procurement",
          canonicalEventType: input.canonicalEventType,
          eventVersion: PROCUREMENT_CANONICAL_EVENT_VERSION,
          sourceDomain: "procurement",
          eventTimestamp,
          idempotencyKey: input.idempotencyKey,
          ...(input.causationId ? { causationId: input.causationId } : {}),
          ...input.payload,
        },
        auditMetadata: {
          sourceDomain: "procurement",
          ...(input.causationId ? { causationId: input.causationId } : {}),
        },
      },
      context,
    );
  }
}

export const defaultProcurementCanonicalEventPublisher = new ProcurementCanonicalEventPublisher();
