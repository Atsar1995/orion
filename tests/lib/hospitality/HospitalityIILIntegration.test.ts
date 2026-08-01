import { describe, expect, it, beforeEach } from "vitest";
import { publishHospitalityEvent } from "@/lib/hospitality/hospitality-events";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { registerIntelligenceHandlers } from "@/lib/platform/intelligence/register-intelligence-handlers";
import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Hospitality IIL integration (P-007)", () => {
  let service: IntelligenceIntegrationService;

  beforeEach(() => {
    service = new IntelligenceIntegrationService({
      serviceRegistry: new ServiceRegistry(),
      webhookGateway: new WebhookGateway(),
    });
    registerIntelligenceHandlers(service);
  });

  it("registers hospitality-workspace as authorized publisher", () => {
    const registry = new ServiceRegistry();
    const publisher = registry.find(HOSPITALITY_IIL_SERVICE_ID);

    expect(publisher?.serviceId).toBe("hospitality-workspace");
    expect(publisher?.workspace).toBe("Hospitality");
  });

  it("publishes reservation events through hospitality-workspace publisher", () => {
    const event = service.publish(
      {
        eventType: "ReservationCreated",
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "reservation",
        entityId: "res-001",
        actorId: "user-executive",
        payload: { workspace: "hospitality" },
      },
      CONTEXT,
    );

    expect(event.eventType).toBe("ReservationCreated");
    expect(event.sourceService).toBe("hospitality-workspace");
    expect(event.organizationId).toBe("org-orania");
  });

  it("publishHospitalityEvent helper does not throw for authorized context", () => {
    expect(() =>
      publishHospitalityEvent(
        {
          eventType: "ReservationCreated",
          reservationId: "res-test",
          actorId: "user-executive",
          actorName: "Executive",
        },
        CONTEXT,
      ),
    ).not.toThrow();
  });
});
