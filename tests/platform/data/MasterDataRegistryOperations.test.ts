import { describe, expect, it, beforeEach } from "vitest";
import { DataPlatformFacade } from "@/lib/platform/data";
import { InMemoryMasterEntityRepository } from "@/lib/platform/data/repositories/InMemoryMasterEntityRepository";
import { handleEntityRegistrationRequested } from "@/lib/platform/data/register-data-subscribers";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-011.1 Enterprise Master Data Registry — Operations", () => {
  let facade: DataPlatformFacade;

  beforeEach(() => {
    facade = new DataPlatformFacade(new InMemoryMasterEntityRepository());
  });

  it("lists seeded canonical entity types", () => {
    const types = facade.registryQuery.listEntityTypes();
    expect(types.length).toBeGreaterThanOrEqual(20);
    expect(types.some((t) => t.entityType === "customer")).toBe(true);
    expect(types.some((t) => t.entityType === "financial_account")).toBe(true);
  });

  it("discovers seeded master entities", () => {
    const result = facade.discovery.discover(CONTEXT);
    expect(result.total).toBeGreaterThanOrEqual(6);
    expect(result.entities.length).toBeGreaterThan(0);
  });

  it("registers a new master entity", () => {
    const entity = facade.registry.register(
      {
        entityType: "product",
        businessKey: "prod-widget-001",
        displayName: "Enterprise Widget",
        domainKey: "commercial",
      },
      CONTEXT,
    );

    expect(entity.id).toMatch(/^md-/);
    expect(entity.globalId).toContain("org-orania");
    expect(entity.status).toBe("draft");
    expect(entity.version).toBe(1);
  });

  it("rejects duplicate business keys", () => {
    const input = {
      entityType: "customer" as const,
      businessKey: "cust-dup-001",
      displayName: "Duplicate Customer",
      domainKey: "commercial",
    };

    facade.registry.register(input, CONTEXT);
    expect(() => facade.registry.register(input, CONTEXT)).toThrow("DUPLICATE_BUSINESS_KEY");
  });

  it("activates and deactivates entities", () => {
    const entity = facade.registry.register(
      {
        entityType: "vendor",
        businessKey: "vnd-new-001",
        displayName: "New Vendor",
        domainKey: "commercial",
      },
      CONTEXT,
    );

    const activated = facade.registry.activate(entity.id, CONTEXT);
    expect(activated.status).toBe("active");

    const deactivated = facade.registry.deactivate(entity.id, CONTEXT);
    expect(deactivated.status).toBe("inactive");
  });

  it("looks up by business key and global id", () => {
    const entity = facade.registry.register(
      {
        entityType: "location",
        businessKey: "loc-hq-001",
        displayName: "Head Office",
        domainKey: "platform",
      },
      CONTEXT,
    );

    const byKey = facade.lookup.getByBusinessKey("location", "loc-hq-001", CONTEXT);
    expect(byKey?.id).toBe(entity.id);

    const byGlobal = facade.lookup.getByGlobalId(entity.globalId, CONTEXT);
    expect(byGlobal?.id).toBe(entity.id);
  });

  it("validates identity integrity", () => {
    const result = facade.discovery.discover(CONTEXT, { pageSize: 1 });
    const entityId = result.entities[0]?.id;
    expect(entityId).toBeTruthy();
    if (entityId) {
      expect(facade.identity.validateIntegrity(entityId, CONTEXT)).toBe(true);
    }
  });

  it("updates entity with version increment", () => {
    const entity = facade.registry.register(
      {
        entityType: "employee",
        businessKey: "emp-001",
        displayName: "Jane Analyst",
        domainKey: "platform",
      },
      CONTEXT,
    );

    const updated = facade.registry.update(
      { entityId: entity.id, displayName: "Jane Senior Analyst" },
      CONTEXT,
    );
    expect(updated.displayName).toBe("Jane Senior Analyst");
    expect(updated.version).toBe(2);
  });

  it("handles inbound registration requests", async () => {
    await handleEntityRegistrationRequested(
      {
        entityType: "supplier",
        businessKey: "sup-001",
        displayName: "Supply Chain Co",
        domainKey: "commercial",
      },
      CONTEXT,
      facade,
    );

    const found = facade.lookup.getByBusinessKey("supplier", "sup-001", CONTEXT);
    expect(found?.displayName).toBe("Supply Chain Co");
  });

  it("enforces organization isolation", () => {
    const otherOrg: ServiceContext = { ...CONTEXT, organizationId: "org-other" };
    const result = facade.discovery.discover(otherOrg);
    expect(result.total).toBe(0);
  });
});
