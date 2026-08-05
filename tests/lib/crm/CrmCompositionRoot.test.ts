import { beforeEach, describe, expect, it, vi } from "vitest";
import { CrmFacade } from "@/lib/crm/CrmFacade";
import { createCrmWiring } from "@/lib/crm/createCrmWiring";
import {
  crmAgreementsService,
  crmCommercialService,
  crmCommercialIntelligenceService,
  crmCustomerIntelligenceService,
  crmExecutiveDashboardService,
  crmFacade,
  crmPartyService,
  crmRepository,
  crmService,
} from "@/lib/crm";
import { InMemoryCrmRepository } from "@/lib/crm/repositories/InMemoryCrmRepository";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";

import type { ServiceContext } from "@/types/services";

const TEST_CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("CRM Composition Root Convergence (P-008.18)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("resolves all public services from crmFacade wiring", () => {
    expect(crmPartyService).toBe(crmFacade.party);
    expect(crmCommercialService).toBe(crmFacade.commercial);
    expect(crmAgreementsService).toBe(crmFacade.agreements);
    expect(crmCommercialIntelligenceService).toBe(crmFacade.commercialIntelligence);
    expect(crmCustomerIntelligenceService).toBe(crmFacade.customerIntelligence);
    expect(crmExecutiveDashboardService).toBe(crmFacade.executiveDashboard);
    expect(crmService).toBe(crmFacade.crmService);
    expect(crmRepository).toBe(crmFacade.repository);
  });

  it("shares one domain repository instance across wiring facades", () => {
    const platformStore = new InMemoryPlatformStore();
    const wiring = createCrmWiring(platformStore);

    expect(wiring.partyFacade).not.toBe(wiring.commercialFacade);
    expect(wiring.party).toBe(wiring.commercial);
    expect(wiring.party).toBe(wiring.agreements);
    expect(wiring.party).toBe(wiring.executiveDashboard);
    expect(wiring.party).toBe(wiring.crm);
  });

  it("supports repository replacement through createCrmWiring options", () => {
    const platformStore = new InMemoryPlatformStore();
    const mockRepository = new InMemoryCrmRepository();
    const listSpy = vi.spyOn(mockRepository, "listLeads");

    const wiring = createCrmWiring(platformStore, { repository: mockRepository });
    wiring.commercialFacade.leads.list(TEST_CONTEXT);

    expect(listSpy).toHaveBeenCalled();
    expect(wiring.executiveDashboard).toBe(mockRepository);
  });

  it("constructs an isolated facade graph for mock PlatformStore lifecycle", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();

    const wiring = createCrmWiring(platformStore);
    const facade = new CrmFacade(wiring);

    expect(facade.repository).toBe(wiring.executiveDashboard);
    expect(facade.commercial).toBe(wiring.commercialFacade);
    expect(facade.wiring.platformStore).toBe(platformStore);
    expect(facade.wiring.backing).toBe(platformStore.getCrmBacking());

    await platformStore.shutdown();
    expect(platformStore.isInitialized()).toBe(false);
  });

  it("does not expose TD-002 defaultCrmRepository singleton", async () => {
    const module = await import("@/lib/crm/repositories/InMemoryCrmRepository");
    expect("defaultCrmRepository" in module).toBe(false);
  });

  it("wires canonical publisher and sales order service through composition root", () => {
    const wiring = createCrmWiring(new InMemoryPlatformStore());

    expect(wiring.canonicalEventPublisher).toBeDefined();
    expect(wiring.salesOrderService).toBeDefined();
    expect(wiring.caseService).toBeDefined();
    expect(wiring.authorization).toBeDefined();
    expect(wiring.crmRepository.persistenceAdapter).toBe("in-memory");
  });

  it("preserves organization isolation through wired repository", () => {
    const wiring = createCrmWiring(new InMemoryPlatformStore());
    const orgBLead = wiring.commercialFacade.leads.create(
      {
        displayName: "Test Inbound Lead",
        source: "website",
        owner: "Sales Director",
        estimatedValue: 250000,
      },
      { organizationId: "org-other", workspaceId: "workspace-other", userId: "user-1", role: "executive" },
      "Test User",
    );

    expect(wiring.commercialFacade.leads.getDetail(orgBLead.id, TEST_CONTEXT)).toBeNull();
  });
});
