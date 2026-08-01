import { describe, expect, it } from "vitest";
import {
  dataPlatformFacade,
  PLATFORM_MISSION_DATA_SYNCHRONIZATION,
} from "@/lib/platform/data";
import {
  SYNCHRONIZATION_INBOUND_EVENTS,
  SYNCHRONIZATION_OUTBOUND_EVENTS,
} from "@/lib/platform/data/synchronization-events";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-011.5 Enterprise Data Synchronization Engine — Certification", () => {
  it("declares mission identifier P-011.5", () => {
    expect(PLATFORM_MISSION_DATA_SYNCHRONIZATION).toBe("P-011.5");
  });

  it("exposes only approved public sync services via facade", () => {
    expect(dataPlatformFacade.synchronization).toBeDefined();
    expect(dataPlatformFacade.subscriptions).toBeDefined();
    expect(dataPlatformFacade.syncPolicies).toBeDefined();
    expect(dataPlatformFacade.syncMonitoring).toBeDefined();
    expect(dataPlatformFacade.syncAudit).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(dataPlatformFacade, "repository")).toBe(false);
  });

  it("supports required inbound and outbound events", () => {
    expect(SYNCHRONIZATION_INBOUND_EVENTS).toContain("MasterEntityUpdated");
    expect(SYNCHRONIZATION_INBOUND_EVENTS).toContain("ValidationPassed");
    expect(SYNCHRONIZATION_OUTBOUND_EVENTS).toContain("SynchronizationCompleted");
    expect(SYNCHRONIZATION_OUTBOUND_EVENTS).toContain("SynchronizationConflictDetected");
  });

  it("provides seeded sync policies and subscriptions", () => {
    const policies = dataPlatformFacade.syncPolicies.listPolicies(CONTEXT);
    const subs = dataPlatformFacade.subscriptions.listSubscriptions(CONTEXT);
    expect(policies.length).toBeGreaterThan(0);
    expect(subs.length).toBeGreaterThanOrEqual(4);
  });
});
