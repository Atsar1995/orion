import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { createFinancePersistenceRepositories } from "@/lib/finance/persistence/createFinancePersistenceRepositories";
import { createFinanceRepositories } from "@/lib/finance/persistence/createFinanceRepositories";
import { createIsolatedFinanceBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { healthStatusService } from "@/lib/observability/HealthStatusService";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import {
  ensureDefaultPlatformStoreInitialized,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/store/PlatformStoreFactory";

describe("Finance Platform Foundation (P-009.5 Wave A)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("wires repositories against a shared PlatformStore backing", () => {
    const platformStore = new InMemoryPlatformStore();
    const wiring = createFinanceWiring(platformStore);

    expect(wiring.platformStore).toBe(platformStore);
    expect(wiring.backing).toBe(platformStore.getFinanceBacking());
    expect(wiring.chartOfAccounts.findByCode(FINANCE_SEED_ORG_ID, "1000")).not.toBeNull();
    expect(wiring.period.getCurrentPeriod(FINANCE_SEED_ORG_ID)).not.toBeNull();
    expect(wiring.journalRepository.domain).toBe("finance");
    expect(wiring.eventLineageRepository.getByCorrelationId(FINANCE_SEED_ORG_ID, "missing")).toEqual([]);
  });

  it("creates repository bundle from isolated backing", () => {
    const backing = createIsolatedFinanceBacking();
    const repositories = createFinanceRepositories(backing);

    expect(repositories.chartOfAccounts.findByCode(FINANCE_SEED_ORG_ID, "1000")).not.toBeNull();
    expect(repositories.generalLedger.listBalances(FINANCE_SEED_ORG_ID, "period-2026-07").length).toBeGreaterThan(
      0,
    );
  });

  it("initializes default PlatformStore with finance backing", async () => {
    const store = await ensureDefaultPlatformStoreInitialized();
    const backing = store.getFinanceBacking();

    expect(store.isInitialized()).toBe(true);
    expect(backing.accounts).toBeInstanceOf(Map);
    expect(backing.fiscalPeriods).toBeInstanceOf(Map);
  });

  it("reports finance platform health via HealthStatusService", () => {
    const report = healthStatusService.getReport();
    const financeCheck = report.checks.find((check) => check.name === "finance_platform");

    expect(financeCheck).toBeDefined();
    expect(financeCheck?.status).toBe("healthy");
  });

  it("wires P-009.7 persistence repositories with organization isolation", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();

    const { journalRepository, eventLineageRepository } = createFinancePersistenceRepositories({
      platformStore,
    });
    const correlationId = "corr-p009-7a";

    eventLineageRepository.record({
      id: "lineage-001",
      organizationId: FINANCE_SEED_ORG_ID,
      correlationId,
      createdAt: "2026-08-03T00:00:00.000Z",
    });

    expect(journalRepository.findById(FINANCE_SEED_ORG_ID, "journal-missing")).toBeNull();
    expect(eventLineageRepository.getByCorrelationId(FINANCE_SEED_ORG_ID, correlationId)).toHaveLength(
      1,
    );
    expect(eventLineageRepository.getByCorrelationId("org-other", correlationId)).toHaveLength(0);
  });

  it("supports composition root lifecycle without mutating platform singleton state", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();

    const wiring = createFinanceWiring(platformStore);
    const existing = wiring.chartOfAccounts.findByCode(FINANCE_SEED_ORG_ID, "1000");
    expect(existing).not.toBeNull();

    if (existing) {
      wiring.backing.accounts.set(existing.id, { ...existing, name: "Wave A Updated" });
      expect(wiring.chartOfAccounts.findById(FINANCE_SEED_ORG_ID, existing.id)?.name).toBe(
        "Wave A Updated",
      );
    }

    await platformStore.shutdown();
    expect(platformStore.isInitialized()).toBe(false);
  });
});
