import { beforeEach, describe, expect, it } from "vitest";
import { createCrmWiring } from "@/lib/crm/createCrmWiring";
import {
  CRM_CANONICAL_EVENT_VERSION,
  CRM_CANONICAL_OUTBOUND_EVENTS,
  CRM_ALL_OUTBOUND_EVENTS,
  assertUniqueCrmEventCatalog,
  buildCrmCanonicalIdempotencyKey,
  defaultCrmCanonicalEventPublisher,
} from "@/lib/crm/events";
import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { getCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import { CRM_SEED_ORG_ID } from "@/lib/crm/persistence/createCrmStore";
import { crmFacade } from "@/lib/crm";
import {
  getIntelligenceIntegrationService,
  resetIntelligenceIntegrationForTests,
} from "@/lib/platform/intelligence";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import { resetCrmEventPipelineRegistryForTests } from "@/lib/crm/services/crmEventPipelineRegistry";
import type { ServiceContext } from "@/types/services";

const ORG_A = CRM_SEED_ORG_ID;
const ORG_B = "org-other";

const serviceContext: ServiceContext = {
  organizationId: ORG_A,
  workspaceId: "workspace-orania",
  userId: "user-crm-publisher",
  role: "organization_admin",
};

describe("CRM Canonical Event Publisher (P-008.14)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
    resetCrmEventPipelineRegistryForTests();
  });

  it("registers the version 1 canonical CRM event catalog", () => {
    expect(CRM_CANONICAL_OUTBOUND_EVENTS).toHaveLength(10);
    expect(CRM_ALL_OUTBOUND_EVENTS).toEqual(CRM_CANONICAL_OUTBOUND_EVENTS);
    expect(() => assertUniqueCrmEventCatalog()).not.toThrow();
  });

  it("reports canonical events as ready on domain status and wiring", () => {
    expect(crmFacade.getDomainStatus().readyForCanonicalEvents).toBe(true);

    const wiring = createCrmWiring(new InMemoryPlatformStore());
    expect(wiring.canonicalEventPublisher).toBe(defaultCrmCanonicalEventPublisher);
    expect(getCrmEventPipelineRegistry().canonicalPublisherReady).toBe(true);
  });

  it("publishes crm.lead.created with ADR-014 envelope fields", () => {
    const event = defaultCrmCanonicalEventPublisher.publishLeadCreated(
      {
        leadId: "lead-001",
        correlationId: "corr-lead-001",
        source: "web",
        owner: "user-sales",
      },
      serviceContext,
    );

    expect(event.eventId).toBeTruthy();
    expect(event.correlationId).toBe("corr-lead-001");
    expect(event.organizationId).toBe(ORG_A);
    expect(event.sourceService).toBe(CRM_IIL_SERVICE_ID);
    expect(event.payload.canonicalEventType).toBe("crm.lead.created");
    expect(event.payload.eventVersion).toBe(CRM_CANONICAL_EVENT_VERSION);
    expect(event.payload.sourceDomain).toBe("crm");
    expect(event.payload.eventTimestamp).toBeTruthy();
    expect(event.payload.idempotencyKey).toBe(
      buildCrmCanonicalIdempotencyKey(ORG_A, "crm.lead.created", { leadId: "lead-001" }),
    );
    expect(event.idempotencyKey).toBe(event.payload.idempotencyKey);
    expect(event.auditMetadata.sourceDomain).toBe("crm");
  });

  it("builds deterministic idempotency keys for all canonical contracts", () => {
    expect(
      buildCrmCanonicalIdempotencyKey(ORG_A, "crm.lead.created", { leadId: "lead-001" }),
    ).toBe(`${ORG_A}:${CRM_IIL_SERVICE_ID}:crm-lead-lead-001-created-v1`);

    expect(
      buildCrmCanonicalIdempotencyKey(ORG_A, "crm.opportunity.closed", {
        opportunityId: "opp-001",
      }),
    ).toBe(`${ORG_A}:${CRM_IIL_SERVICE_ID}:crm-opportunity-opp-001-closed-v1`);

    expect(
      buildCrmCanonicalIdempotencyKey(ORG_A, "crm.revenue.recognized", {
        salesOrderId: "so-001",
      }),
    ).toBe(`${ORG_A}:${CRM_IIL_SERVICE_ID}:crm-revenue-so-001-recognized-v1`);
  });

  it("includes causationId in payload and durable envelope metadata", () => {
    const event = defaultCrmCanonicalEventPublisher.publishOpportunityCreated(
      {
        opportunityId: "opp-cause-001",
        correlationId: "corr-parent",
        causationId: "evt-parent-001",
        stage: "proposal",
      },
      serviceContext,
    );

    expect(event.payload.causationId).toBe("evt-parent-001");
    expect(event.causationId).toBe("evt-parent-001");
    expect(event.auditMetadata.causationId).toBe("evt-parent-001");
  });

  it("isolates organization context on publication", () => {
    defaultCrmCanonicalEventPublisher.publishLeadCreated(
      {
        leadId: "lead-org-a",
        correlationId: "corr-org-a",
      },
      serviceContext,
    );

    defaultCrmCanonicalEventPublisher.publishLeadCreated(
      {
        leadId: "lead-org-b",
        correlationId: "corr-org-b",
      },
      { ...serviceContext, organizationId: ORG_B },
    );

    const orgAEvents = getIntelligenceIntegrationService()
      .listEvents(serviceContext, 20)
      .filter((entry) => entry.payload.canonicalEventType === "crm.lead.created");

    const orgBEvents = getIntelligenceIntegrationService()
      .listEvents({ ...serviceContext, organizationId: ORG_B }, 20)
      .filter((entry) => entry.payload.canonicalEventType === "crm.lead.created");

    expect(orgAEvents).toHaveLength(1);
    expect(orgAEvents[0]?.payload.leadId).toBe("lead-org-a");
    expect(orgBEvents).toHaveLength(1);
    expect(orgBEvents[0]?.organizationId).toBe(ORG_B);
  });

  it("suppresses duplicate publish for the same idempotency key via durable IIL", () => {
    const publisher = defaultCrmCanonicalEventPublisher;
    const input = {
      leadId: "lead-dup-001",
      correlationId: "corr-dup-001",
    };

    publisher.publishLeadCreated(input, serviceContext);

    expect(() => publisher.publishLeadCreated(input, serviceContext)).toThrow("DUPLICATE_EVENT");
  });

  it("publishes revenue recognized with required commercial payload fields", () => {
    const event = defaultCrmCanonicalEventPublisher.publishRevenueRecognized(
      {
        salesOrderId: "so-rev-001",
        correlationId: "corr-rev-001",
        amount: "125000",
        currencyCode: "ZAR",
        period: "2026-07",
      },
      serviceContext,
    );

    expect(event.payload.canonicalEventType).toBe("crm.revenue.recognized");
    expect(event.payload.amount).toBe("125000");
    expect(event.payload.currencyCode).toBe("ZAR");
    expect(event.payload.period).toBe("2026-07");
    expect(event.entityType).toBe("revenue");
  });

  it("registers through IIL durable transport and lists persisted events", async () => {
    const iil = new IntelligenceIntegrationService({
      serviceRegistry: new ServiceRegistry(),
      webhookGateway: new WebhookGateway(),
    });

    iil.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Customer Intelligence",
        entityType: "lead",
        entityId: "lead-iil-001",
        actorId: "user-crm-publisher",
        correlationId: "corr-iil-001",
        payload: {
          canonicalEventType: "crm.lead.created",
          eventVersion: CRM_CANONICAL_EVENT_VERSION,
          sourceDomain: "crm",
          eventTimestamp: new Date().toISOString(),
          leadId: "lead-iil-001",
          idempotencyKey: buildCrmCanonicalIdempotencyKey(ORG_A, "crm.lead.created", {
            leadId: "lead-iil-001",
          }),
        },
        auditMetadata: { sourceDomain: "crm" },
      },
      serviceContext,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const persisted = await iil.listPersistedEvents(serviceContext, 10);
    expect(persisted.some((entry) => entry.payload.canonicalEventType === "crm.lead.created")).toBe(
      true,
    );
  });

  it("covers all version 1 canonical publisher methods", () => {
    const publisher = defaultCrmCanonicalEventPublisher;
    const context = serviceContext;

    const events = [
      publisher.publishLeadCreated({ leadId: "lead-1", correlationId: "c1" }, context),
      publisher.publishLeadQualified({ leadId: "lead-1", correlationId: "c2" }, context),
      publisher.publishOpportunityCreated(
        { opportunityId: "opp-1", correlationId: "c3" },
        context,
      ),
      publisher.publishOpportunityClosed(
        { opportunityId: "opp-1", correlationId: "c4", outcome: "won" },
        context,
      ),
      publisher.publishQuoteCreated({ quoteId: "quote-1", correlationId: "c5" }, context),
      publisher.publishCustomerCreated({ customerId: "cust-1", correlationId: "c6" }, context),
      publisher.publishCustomerUpdated({ customerId: "cust-1", correlationId: "c7" }, context),
      publisher.publishSalesOrderConfirmed(
        { salesOrderId: "so-1", correlationId: "c8" },
        context,
      ),
      publisher.publishRevenueRecognized(
        {
          salesOrderId: "so-1",
          correlationId: "c9",
          amount: "1000",
          currencyCode: "ZAR",
        },
        context,
      ),
      publisher.publishCaseClosed({ caseId: "case-1", correlationId: "c10" }, context),
    ];

    const publishedTypes = events.map((event) => event.payload.canonicalEventType);
    expect(publishedTypes).toEqual([...CRM_CANONICAL_OUTBOUND_EVENTS]);
  });
});
