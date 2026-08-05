import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import {
  PROCUREMENT_CANONICAL_EVENT_VERSION,
  PROCUREMENT_CANONICAL_OUTBOUND_EVENTS,
  PROCUREMENT_ALL_OUTBOUND_EVENTS,
  assertUniqueProcurementEventCatalog,
  buildProcurementCanonicalIdempotencyKey,
  ProcurementCanonicalEventPublisher,
  defaultProcurementCanonicalEventPublisher,
} from "@/lib/procurement/events";
import { PROCUREMENT_IIL_SERVICE_ID } from "@/lib/procurement/constants";
import { getProcurementEventPipelineRegistry } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { PROCUREMENT_SEED_ORG_ID } from "@/lib/procurement/persistence/createProcurementStore";
import { procurementFacade } from "@/lib/procurement";
import {
  getIntelligenceIntegrationService,
  resetIntelligenceIntegrationForTests,
} from "@/lib/platform/intelligence";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import { resetProcurementEventPipelineRegistryForTests } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import type { ServiceContext } from "@/types/services";

const ORG_A = PROCUREMENT_SEED_ORG_ID;
const ORG_B = "org-other";

const serviceContext: ServiceContext = {
  organizationId: ORG_A,
  workspaceId: "workspace-orania",
  userId: "user-procurement-publisher",
  role: "organization_admin",
};

describe("Procurement Canonical Event Publisher (P-010.6)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
    resetProcurementEventPipelineRegistryForTests();
  });

  it("registers the version 1 canonical Procurement event catalog", () => {
    expect(PROCUREMENT_CANONICAL_OUTBOUND_EVENTS).toHaveLength(12);
    expect(PROCUREMENT_ALL_OUTBOUND_EVENTS).toEqual(PROCUREMENT_CANONICAL_OUTBOUND_EVENTS);
    expect(() => assertUniqueProcurementEventCatalog()).not.toThrow();
  });

  it("reports canonical events as ready on domain status and wiring", () => {
    expect(procurementFacade.getDomainStatus().readyForCanonicalEvents).toBe(true);

    const wiring = createProcurementWiring(new InMemoryPlatformStore());
    expect(wiring.canonicalEventPublisher).toBeInstanceOf(ProcurementCanonicalEventPublisher);
    expect(wiring.canonicalEventPublisher).not.toBe(defaultProcurementCanonicalEventPublisher);
    expect(getProcurementEventPipelineRegistry().canonicalPublisherReady).toBe(true);
  });

  it("publishes procurement.vendor.created with ADR-014 envelope fields", () => {
    const event = defaultProcurementCanonicalEventPublisher.publishVendorCreated(
      {
        vendorId: "vendor-001",
        correlationId: "corr-vendor-001",
        displayName: "Acme Supplies",
      },
      serviceContext,
    );

    expect(event.eventId).toBeTruthy();
    expect(event.correlationId).toBe("corr-vendor-001");
    expect(event.organizationId).toBe(ORG_A);
    expect(event.sourceService).toBe(PROCUREMENT_IIL_SERVICE_ID);
    expect(event.payload.canonicalEventType).toBe("procurement.vendor.created");
    expect(event.payload.eventVersion).toBe(PROCUREMENT_CANONICAL_EVENT_VERSION);
    expect(event.payload.sourceDomain).toBe("procurement");
    expect(event.payload.eventTimestamp).toBeTruthy();
    expect(event.payload.idempotencyKey).toBe(
      buildProcurementCanonicalIdempotencyKey(ORG_A, "procurement.vendor.created", {
        vendorId: "vendor-001",
      }),
    );
    expect(event.idempotencyKey).toBe(event.payload.idempotencyKey);
    expect(event.auditMetadata.sourceDomain).toBe("procurement");
  });

  it("builds deterministic idempotency keys for all canonical contracts", () => {
    expect(
      buildProcurementCanonicalIdempotencyKey(ORG_A, "procurement.vendor.created", {
        vendorId: "vendor-001",
      }),
    ).toBe(`${ORG_A}:${PROCUREMENT_IIL_SERVICE_ID}:procurement-vendor-vendor-001-created-v1`);

    expect(
      buildProcurementCanonicalIdempotencyKey(ORG_A, "procurement.purchaseorder.approved", {
        purchaseOrderId: "po-001",
      }),
    ).toBe(`${ORG_A}:${PROCUREMENT_IIL_SERVICE_ID}:procurement-purchaseorder-po-001-approved-v1`);

    expect(
      buildProcurementCanonicalIdempotencyKey(ORG_A, "procurement.invoice.approved", {
        invoiceId: "inv-001",
      }),
    ).toBe(`${ORG_A}:${PROCUREMENT_IIL_SERVICE_ID}:procurement-invoice-inv-001-approved-v1`);
  });

  it("includes causationId in payload and durable envelope metadata", () => {
    const event = defaultProcurementCanonicalEventPublisher.publishRequisitionCreated(
      {
        requisitionId: "req-cause-001",
        correlationId: "corr-parent",
        causationId: "evt-parent-001",
        requesterId: "user-buyer",
      },
      serviceContext,
    );

    expect(event.payload.causationId).toBe("evt-parent-001");
    expect(event.causationId).toBe("evt-parent-001");
    expect(event.auditMetadata.causationId).toBe("evt-parent-001");
  });

  it("isolates organization context on publication", () => {
    defaultProcurementCanonicalEventPublisher.publishVendorCreated(
      {
        vendorId: "vendor-org-a",
        correlationId: "corr-org-a",
      },
      serviceContext,
    );

    defaultProcurementCanonicalEventPublisher.publishVendorCreated(
      {
        vendorId: "vendor-org-b",
        correlationId: "corr-org-b",
      },
      { ...serviceContext, organizationId: ORG_B },
    );

    const orgAEvents = getIntelligenceIntegrationService()
      .listEvents(serviceContext, 20)
      .filter((entry) => entry.payload.canonicalEventType === "procurement.vendor.created");

    const orgBEvents = getIntelligenceIntegrationService()
      .listEvents({ ...serviceContext, organizationId: ORG_B }, 20)
      .filter((entry) => entry.payload.canonicalEventType === "procurement.vendor.created");

    expect(orgAEvents).toHaveLength(1);
    expect(orgAEvents[0]?.payload.vendorId).toBe("vendor-org-a");
    expect(orgBEvents).toHaveLength(1);
    expect(orgBEvents[0]?.organizationId).toBe(ORG_B);
  });

  it("suppresses duplicate publish for the same idempotency key via durable IIL", () => {
    const publisher = defaultProcurementCanonicalEventPublisher;
    const input = {
      vendorId: "vendor-dup-001",
      correlationId: "corr-dup-001",
    };

    publisher.publishVendorCreated(input, serviceContext);

    expect(() => publisher.publishVendorCreated(input, serviceContext)).toThrow("DUPLICATE_EVENT");
  });

  it("publishes purchase order approved with required payload fields", () => {
    const event = defaultProcurementCanonicalEventPublisher.publishPurchaseOrderApproved(
      {
        purchaseOrderId: "po-001",
        correlationId: "corr-po-001",
        approvedBy: "user-director",
      },
      serviceContext,
    );

    expect(event.payload.canonicalEventType).toBe("procurement.purchaseorder.approved");
    expect(event.payload.purchaseOrderId).toBe("po-001");
    expect(event.payload.approvedBy).toBe("user-director");
    expect(event.entityType).toBe("purchaseorder");
  });

  it("registers through IIL durable transport and lists persisted events", async () => {
    const iil = new IntelligenceIntegrationService({
      serviceRegistry: new ServiceRegistry(),
      webhookGateway: new WebhookGateway(),
    });

    iil.publish(
      {
        eventType: "CustomEvent",
        sourceService: PROCUREMENT_IIL_SERVICE_ID,
        sourceWorkspace: "Source to Pay",
        entityType: "vendor",
        entityId: "vendor-iil-001",
        actorId: "user-procurement-publisher",
        correlationId: "corr-iil-001",
        payload: {
          canonicalEventType: "procurement.vendor.created",
          eventVersion: PROCUREMENT_CANONICAL_EVENT_VERSION,
          sourceDomain: "procurement",
          eventTimestamp: new Date().toISOString(),
          vendorId: "vendor-iil-001",
          idempotencyKey: buildProcurementCanonicalIdempotencyKey(
            ORG_A,
            "procurement.vendor.created",
            { vendorId: "vendor-iil-001" },
          ),
        },
        auditMetadata: { sourceDomain: "procurement" },
      },
      serviceContext,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const persisted = await iil.listPersistedEvents(serviceContext, 10);
    expect(
      persisted.some((entry) => entry.payload.canonicalEventType === "procurement.vendor.created"),
    ).toBe(true);
  });

  it("covers all version 1 canonical publisher methods", () => {
    const publisher = defaultProcurementCanonicalEventPublisher;
    const context = serviceContext;

    const events = [
      publisher.publishVendorCreated({ vendorId: "vendor-1", correlationId: "c1" }, context),
      publisher.publishVendorUpdated({ vendorId: "vendor-1", correlationId: "c2" }, context),
      publisher.publishRequisitionCreated(
        { requisitionId: "req-1", correlationId: "c3" },
        context,
      ),
      publisher.publishRequisitionApproved(
        { requisitionId: "req-1", correlationId: "c4" },
        context,
      ),
      publisher.publishRfqSent({ rfqId: "rfq-1", correlationId: "c5" }, context),
      publisher.publishQuotationReceived(
        { quotationId: "quote-1", correlationId: "c6" },
        context,
      ),
      publisher.publishPurchaseOrderCreated(
        { purchaseOrderId: "po-1", correlationId: "c7" },
        context,
      ),
      publisher.publishPurchaseOrderApproved(
        { purchaseOrderId: "po-1", correlationId: "c8" },
        context,
      ),
      publisher.publishGoodsReceived(
        { goodsReceiptId: "gr-1", correlationId: "c9" },
        context,
      ),
      publisher.publishInvoiceReceived({ invoiceId: "inv-1", correlationId: "c10" }, context),
      publisher.publishInvoiceApproved({ invoiceId: "inv-1", correlationId: "c11" }, context),
      publisher.publishContractCreated({ contractId: "ctr-1", correlationId: "c12" }, context),
    ];

    const publishedTypes = events.map((event) => event.payload.canonicalEventType);
    expect(publishedTypes).toEqual([...PROCUREMENT_CANONICAL_OUTBOUND_EVENTS]);
  });
});
