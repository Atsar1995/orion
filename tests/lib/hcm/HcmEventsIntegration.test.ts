import { describe, expect, it, beforeEach } from "vitest";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { registerIntelligenceHandlers } from "@/lib/platform/intelligence/register-intelligence-handlers";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import {
  HCM_ALL_OUTBOUND_EVENTS,
  HCM_IIL_SERVICE_ID,
  assertUniqueHcmEventCatalog,
  hcmFacade,
  registerHcmSubscribers,
  resolveHcmWorkflowTemplate,
} from "@/lib/hcm";
import { hcmWorkflowOrchestrator } from "@/lib/hcm/workflow/HcmWorkflowOrchestrator";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-hcm-events",
  workspaceId: "ws-hcm",
  userId: "user-hr",
  role: "executive",
};

describe("HCM Events & Workflow Integration (S-002.6)", () => {
  let service: IntelligenceIntegrationService;

  beforeEach(() => {
    service = new IntelligenceIntegrationService({
      serviceRegistry: new ServiceRegistry(),
      webhookGateway: new WebhookGateway(),
    });
    registerIntelligenceHandlers(service);
    hcmWorkflowOrchestrator.clearDispatches();
  });

  it("maintains a duplicate-free outbound event catalogue", () => {
    expect(() => assertUniqueHcmEventCatalog()).not.toThrow();
    expect(HCM_ALL_OUTBOUND_EVENTS.length).toBeGreaterThan(40);
    expect(new Set(HCM_ALL_OUTBOUND_EVENTS).size).toBe(HCM_ALL_OUTBOUND_EVENTS.length);
  });

  it("authorizes hcm-workspace as publisher", () => {
    const event = service.publish(
      {
        eventType: "CustomEvent",
        sourceService: HCM_IIL_SERVICE_ID,
        sourceWorkspace: "HCM",
        entityType: "employee",
        entityId: "emp-test",
        actorId: "user-hr",
        payload: { workspace: "hcm", hcmEventType: "EmployeeCreated" },
      },
      CONTEXT,
    );

    expect(event.sourceService).toBe(HCM_IIL_SERVICE_ID);
    expect(event.payload.hcmEventType).toBe("EmployeeCreated");
  });

  it("publishes foundation events when facade operations execute", () => {
    const integration = getIntelligenceIntegrationService();
    const employee = hcmFacade.createEmployee(
      {
        employeeNumber: "EVT-E001",
        identity: {
          legalName: { givenName: "Event", familyName: "Publisher" },
          governmentIdentifiers: [],
        },
        effectiveFrom: "2026-01-01",
      },
      CONTEXT,
    );

    const events = integration.listEvents(CONTEXT, 20);
    expect(employee.id).toBeTruthy();
    expect(events.some((entry) => entry.payload.hcmEventType === "EmployeeCreated")).toBe(true);
  });

  it("registers workflow subscriber without duplicate initialization", () => {
    const healthBefore = service.getHealth(CONTEXT).activeSubscriptions;
    registerHcmSubscribers(service);
    registerHcmSubscribers(service);
    expect(service.getHealth(CONTEXT).activeSubscriptions).toBe(healthBefore);
    expect(healthBefore).toBeGreaterThan(0);
  });

  it("orchestrates workflow from HCM leave events", async () => {
    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: HCM_IIL_SERVICE_ID,
        sourceWorkspace: "HCM",
        entityType: "leave_request",
        entityId: "leave-001",
        actorId: "user-hr",
        payload: {
          workspace: "hcm",
          hcmEventType: "LeaveRequested",
          workflowTemplateKey: "hcm.leave.approval",
        },
      },
      CONTEXT,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const dispatches = hcmWorkflowOrchestrator.listDispatches();
    expect(dispatches.some((entry) => entry.hcmEventType === "LeaveRequested")).toBe(true);
    expect(resolveHcmWorkflowTemplate("LeaveRequested")).toBe("hcm.leave.approval");
  });

  it("reports workflow and event integration on domain status", () => {
    const status = hcmFacade.getDomainStatus();
    expect(status.workflowIntegrated).toBe(true);
    expect(status.eventsIntegrated).toBe(true);
  });
});
