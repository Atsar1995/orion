import { describe, expect, it } from "vitest";
import {
  dataPlatformFacade,
  PLATFORM_MISSION_DATA_REGISTRY,
} from "@/lib/platform/data";
import {
  MASTER_DATA_INBOUND_EVENTS,
  MASTER_DATA_OUTBOUND_EVENTS,
} from "@/lib/platform/data/data-platform-events";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-011.1 Enterprise Master Data Registry — Certification", () => {
  it("declares mission identifier P-011.1", () => {
    expect(PLATFORM_MISSION_DATA_REGISTRY).toBe("P-011.1");
  });

  it("exposes only approved public services via facade", () => {
    expect(dataPlatformFacade.registry).toBeDefined();
    expect(dataPlatformFacade.lookup).toBeDefined();
    expect(dataPlatformFacade.discovery).toBeDefined();
    expect(dataPlatformFacade.identity).toBeDefined();
    expect(dataPlatformFacade.registryQuery).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(dataPlatformFacade, "repository")).toBe(false);
  });

  it("supports required inbound and outbound events", () => {
    expect(MASTER_DATA_INBOUND_EVENTS).toContain("EntityRegistrationRequested");
    expect(MASTER_DATA_OUTBOUND_EVENTS).toContain("MasterEntityRegistered");
    expect(MASTER_DATA_OUTBOUND_EVENTS).toContain("MasterEntityArchived");
  });

  it("provides registry statistics", () => {
    const stats = dataPlatformFacade.registryQuery.getStats(CONTEXT);
    expect(stats.registeredEntityTypes).toBeGreaterThan(0);
    expect(stats.totalMasterEntities).toBeGreaterThan(0);
    expect(Object.keys(stats.byDomain).length).toBeGreaterThan(0);
  });

  it("registers all mission entity types in canonical registry", () => {
    const requiredTypes = [
      "organization",
      "customer",
      "vendor",
      "financial_account",
      "guest",
      "workflow_definition",
      "notification_template",
    ] as const;

    for (const entityType of requiredTypes) {
      const reg = dataPlatformFacade.registryQuery.getEntityType(entityType, CONTEXT);
      expect(reg?.entityType).toBe(entityType);
    }
  });
});
