import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { FinanceEventDispatcher } from "@/lib/finance/integration/FinanceEventDispatcher";
import {
  isSupportedEventVersion,
  resolveCanonicalEventType,
} from "@/lib/finance/integration/FinanceEventMapper";
import type { FinanceEventResult } from "@/lib/finance/integration/FinanceEventResult";
import type { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

const initializedServices = new Set<IntelligenceIntegrationService>();

/** Subscribes Finance to canonical HCM events through the IIL (P-009.9). */
export class FinanceEventConsumer {
  private readonly dispatcher: FinanceEventDispatcher;

  constructor(processor: FinanceInboundProcessor) {
    this.dispatcher = new FinanceEventDispatcher(processor);
  }

  /** Registers the HCM → Finance consumer on the intelligence integration service. */
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

        await this.consume(event, context);
      },
    );
  }

  /** Validates the envelope and dispatches supported HCM finance events. */
  async consume(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult> {
    const envelopeIssue = this.validateEnvelope(event);
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

  private validateEnvelope(event: IntelligenceEvent): string | null {
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

    const sourceDomain = event.payload.sourceDomain ?? event.auditMetadata.sourceDomain;
    if (sourceDomain && sourceDomain !== "hcm") {
      return "SOURCE_DOMAIN_MISMATCH";
    }

    if (!resolveCanonicalEventType(event)) {
      return "UNSUPPORTED_EVENT";
    }

    return null;
  }
}

/** Clears subscription guard — test isolation only. */
export function resetFinanceEventConsumerForTests(): void {
  initializedServices.clear();
}
