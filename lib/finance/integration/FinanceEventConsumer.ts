import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { FinanceEventDispatcher } from "@/lib/finance/integration/FinanceEventDispatcher";
import {
  isSupportedEventVersion,
  resolveCanonicalEventType,
  resolveCrmCanonicalEventType,
  resolveProcurementCanonicalEventType,
} from "@/lib/finance/integration/FinanceEventMapper";
import { isUnsupportedCrmCanonicalEventType } from "@/lib/finance/integration/FinanceSupportedEvents";
import { isUnsupportedProcurementCanonicalEventType } from "@/lib/finance/integration/FinanceProcurementSupportedEvents";
import type { FinanceEventResult } from "@/lib/finance/integration/FinanceEventResult";
import type { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import { PROCUREMENT_IIL_SERVICE_ID } from "@/lib/procurement/constants";
import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

const initializedServices = new Set<IntelligenceIntegrationService>();

/** Subscribes Finance to canonical HCM, CRM, and Procurement events through the IIL (P-009.9 · P-009.19 · P-010.19). */
export class FinanceEventConsumer {
  private readonly dispatcher: FinanceEventDispatcher;

  constructor(processor: FinanceInboundProcessor) {
    this.dispatcher = new FinanceEventDispatcher(processor);
  }

  /** Registers HCM, CRM, and Procurement inbound consumers on the intelligence integration service. */
  register(service: IntelligenceIntegrationService): void {
    if (initializedServices.has(service)) {
      return;
    }

    initializedServices.add(service);

    service.subscribe(
      {
        subscriberId: `${FINANCE_IIL_SERVICE_ID}-hcm-chain`,
        eventTypes: ["CustomEvent"],
        priority: 15,
      },
      async (event, context) => {
        if (event.sourceService !== HCM_IIL_SERVICE_ID) {
          return;
        }

        await this.consumeHcm(event, context);
      },
    );

    service.subscribe(
      {
        subscriberId: `${FINANCE_IIL_SERVICE_ID}-crm-chain`,
        eventTypes: ["CustomEvent"],
        priority: 15,
      },
      async (event, context) => {
        if (event.sourceService !== CRM_IIL_SERVICE_ID) {
          return;
        }

        await this.consumeCrm(event, context);
      },
    );

    service.subscribe(
      {
        subscriberId: `${FINANCE_IIL_SERVICE_ID}-procurement-chain`,
        eventTypes: ["CustomEvent"],
        priority: 15,
      },
      async (event, context) => {
        if (event.sourceService !== PROCUREMENT_IIL_SERVICE_ID) {
          return;
        }

        await this.consumeProcurement(event, context);
      },
    );
  }

  /** Validates the envelope and dispatches supported HCM finance events. */
  async consumeHcm(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult> {
    const envelopeIssue = this.validateHcmEnvelope(event);
    if (envelopeIssue) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: event.payload.canonicalEventType ?? event.eventType,
        code: envelopeIssue,
        message: "Envelope validation failed",
      };
    }

    const eventType = resolveCanonicalEventType(event);
    if (!eventType) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: event.payload.canonicalEventType ?? event.eventType,
        code: "UNSUPPORTED_EVENT",
        message: "Unsupported inbound event type",
      };
    }

    if (!isSupportedEventVersion(event)) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType,
        code: "VERSION_MISMATCH",
        message: "Unsupported event contract version",
      };
    }

    return this.dispatcher.dispatch(event, context, eventType);
  }

  /** Validates the envelope and dispatches supported CRM finance events. */
  async consumeCrm(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult> {
    const canonicalEventType = event.payload.canonicalEventType ?? event.eventType;

    if (isUnsupportedCrmCanonicalEventType(canonicalEventType)) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: canonicalEventType,
        code: "UNSUPPORTED_EVENT",
        message: "Unsupported CRM inbound event type",
      };
    }

    const envelopeIssue = this.validateCrmEnvelope(event);
    if (envelopeIssue) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: canonicalEventType,
        code: envelopeIssue,
        message: "Envelope validation failed",
      };
    }

    const eventType = resolveCrmCanonicalEventType(event);
    if (!eventType) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: canonicalEventType,
        code: "UNSUPPORTED_EVENT",
        message: "Unsupported inbound event type",
      };
    }

    if (!isSupportedEventVersion(event)) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType,
        code: "VERSION_MISMATCH",
        message: "Unsupported event contract version",
      };
    }

    return this.dispatcher.dispatch(event, context, eventType);
  }

  /** Validates the envelope and dispatches supported Procurement finance events. */
  async consumeProcurement(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult> {
    const canonicalEventType = event.payload.canonicalEventType ?? event.eventType;

    if (isUnsupportedProcurementCanonicalEventType(canonicalEventType)) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: canonicalEventType,
        code: "UNSUPPORTED_EVENT",
        message: "Unsupported Procurement inbound event type",
      };
    }

    const envelopeIssue = this.validateProcurementEnvelope(event);
    if (envelopeIssue) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: canonicalEventType,
        code: envelopeIssue,
        message: "Envelope validation failed",
      };
    }

    const eventType = resolveProcurementCanonicalEventType(event);
    if (!eventType) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType: canonicalEventType,
        code: "UNSUPPORTED_EVENT",
        message: "Unsupported inbound event type",
      };
    }

    if (!isSupportedEventVersion(event)) {
      return {
        status: "rejected",
        eventId: event.eventId,
        eventType,
        code: "VERSION_MISMATCH",
        message: "Unsupported event contract version",
      };
    }

    return this.dispatcher.dispatch(event, context, eventType);
  }

  /** Backward-compatible alias for HCM consumption in existing tests. */
  async consume(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult> {
    if (event.sourceService === PROCUREMENT_IIL_SERVICE_ID) {
      return this.consumeProcurement(event, context);
    }

    if (event.sourceService === CRM_IIL_SERVICE_ID) {
      return this.consumeCrm(event, context);
    }

    return this.consumeHcm(event, context);
  }

  private validateHcmEnvelope(event: IntelligenceEvent): string | null {
    const baseIssue = this.validateSharedEnvelope(event);
    if (baseIssue) {
      return baseIssue;
    }

    const sourceDomain = event.payload.sourceDomain ?? event.auditMetadata.sourceDomain;
    if (sourceDomain && sourceDomain !== "hcm") {
      return "SOURCE_DOMAIN_MISMATCH";
    }

    if (!resolveCanonicalEventType(event)) {
      return "UNSUPPORTED_EVENT";
    }

    return null;
  }

  private validateCrmEnvelope(event: IntelligenceEvent): string | null {
    const baseIssue = this.validateSharedEnvelope(event);
    if (baseIssue) {
      return baseIssue;
    }

    if (!event.payload.idempotencyKey?.trim()) {
      return "IDEMPOTENCY_KEY_REQUIRED";
    }

    if (!event.payload.canonicalEventType?.trim()) {
      return "CANONICAL_EVENT_TYPE_REQUIRED";
    }

    const sourceDomain = event.payload.sourceDomain ?? event.auditMetadata.sourceDomain;
    if (sourceDomain && sourceDomain !== "crm") {
      return "SOURCE_DOMAIN_MISMATCH";
    }

    if (!resolveCrmCanonicalEventType(event)) {
      return "UNSUPPORTED_EVENT";
    }

    return null;
  }

  private validateProcurementEnvelope(event: IntelligenceEvent): string | null {
    if (!event.eventId.trim()) {
      return "INVALID_ENVELOPE";
    }

    if (!event.organizationId.trim()) {
      return "INVALID_ENVELOPE";
    }

    if (!event.correlationId.trim()) {
      return "INVALID_ENVELOPE";
    }

    if (!event.entityType.trim() || !event.entityId.trim()) {
      return "INVALID_ENVELOPE";
    }

    if (!event.payload.idempotencyKey?.trim()) {
      return "INVALID_ENVELOPE";
    }

    if (!event.payload.canonicalEventType?.trim()) {
      return "INVALID_ENVELOPE";
    }

    const sourceDomain = event.payload.sourceDomain ?? event.auditMetadata.sourceDomain;
    if (sourceDomain && sourceDomain !== "procurement") {
      return "INVALID_ENVELOPE";
    }

    if (!resolveProcurementCanonicalEventType(event)) {
      return "INVALID_ENVELOPE";
    }

    return null;
  }

  private validateSharedEnvelope(event: IntelligenceEvent): string | null {
    if (!event.eventId.trim()) {
      return "EVENT_ID_REQUIRED";
    }

    if (!event.organizationId.trim()) {
      return "ORGANIZATION_ID_REQUIRED";
    }

    if (!event.correlationId.trim()) {
      return "CORRELATION_ID_REQUIRED";
    }

    if (!event.entityType.trim() || !event.entityId.trim()) {
      return "ENTITY_REFERENCE_REQUIRED";
    }

    return null;
  }
}

/** Clears subscription guard — test isolation only. */
export function resetFinanceEventConsumerForTests(): void {
  initializedServices.clear();
}
