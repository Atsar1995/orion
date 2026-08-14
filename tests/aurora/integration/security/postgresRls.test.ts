import { readAuroraTenantSetting } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import {
  PostgresBrandRepository,
  PostgresBrandRepositoryUnsafe,
} from "@/lib/aurora/persistence/PostgresBrandRepository";
import {
  PostgresBusinessEntityRepository,
  PostgresBusinessEntityRepositoryUnsafe,
} from "@/lib/aurora/persistence/PostgresBusinessEntityRepository";
import {
  PostgresScheduleRepositoryUnsafe,
  PostgresWorkspaceConfigRepository,
  PostgresWorkspaceConfigRepositoryUnsafe,
} from "@/lib/aurora/persistence/PostgresWorkspaceConfigRepository";
import {
  PostgresConfigurationRepository,
  PostgresConfigurationRepositoryUnsafe,
} from "@/lib/aurora/persistence/PostgresConfigurationRepository";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe.skipIf(!AURORA_LIVE_POSTGRES)("PostgreSQL Aurora RLS security", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping RLS suite:", error);
    }
  });

  afterAll(async () => {
    if (harness && postgresAvailable) {
      await cleanupPostgresTestHarness(harness);
    }
  });

  it("runs only when live PostgreSQL is reachable", () => {
    expect(postgresAvailable).toBe(true);
  });

  it("blocks cross-tenant business reads", async () => {
    const businessRepo = new PostgresBusinessEntityRepository(
      harness!.tenantDbScope,
    );
    const foreign = await businessRepo.getById(harness!.tenantAId, harness!.businessBId);
    expect(foreign).toBeNull();
  });

  it("blocks cross-tenant brand reads", async () => {
    const brandRepo = new PostgresBrandRepository(harness!.tenantDbScope);
    const foreign = await brandRepo.getById(harness!.tenantAId, harness!.brandBId);
    expect(foreign).toBeNull();
  });

  it("blocks cross-tenant business writes", async () => {
    const businessRepo = new PostgresBusinessEntityRepository(
      harness!.tenantDbScope,
    );
    await expect(
      businessRepo.update(harness!.tenantAId, harness!.businessBId, { name: "Hacked" }),
    ).rejects.toMatchObject({ code: "AURORA_ERR_0404" });
  });

  it("blocks cross-tenant brand writes", async () => {
    const brandRepo = new PostgresBrandRepository(harness!.tenantDbScope);
    await expect(
      brandRepo.update(harness!.tenantAId, harness!.brandBId, { name: "Hacked Brand" }),
    ).rejects.toMatchObject({ code: "AURORA_ERR_0404" });
  });

  it("reads tenant configuration", async () => {
    const configurationRepo = new PostgresConfigurationRepository(harness!.tenantDbScope);

    const config = await configurationRepo.get(harness!.tenantAId);

    expect(config).toMatchObject({
      tenantId: harness!.tenantAId,
      tier: "starter",
      approvalPolicy: {},
      tokenBudget: 10_000,
      featureOverrides: {},
      limits: {},
    });
  });

  it("blocks cross-tenant configuration access", async () => {
    const configurationRepo = new PostgresConfigurationRepositoryUnsafe(
      harness!.tenantDbScope,
    );

    const foreign = await configurationRepo.getWithoutAssert(
      harness!.tenantAId,
      harness!.tenantBId,
    );

    expect(foreign).toBeNull();
  });

  it("upserts tenant configuration", async () => {
    const configurationRepo = new PostgresConfigurationRepository(harness!.tenantDbScope);

    const updated = await configurationRepo.upsert({
      tenantId: harness!.tenantAId,
      tier: "professional",
      approvalPolicy: {
        requireApproval: true,
      },
      tokenBudget: 50_000,
      featureOverrides: {
        testFeature: true,
      },
      limits: {
        maxBrands: 5,
        maxStorageMb: 1024,
        dailyAgentTokens: 50_000,
      },
    });

    expect(updated).toMatchObject({
      tenantId: harness!.tenantAId,
      tier: "professional",
      approvalPolicy: {
        requireApproval: true,
      },
      tokenBudget: 50_000,
      featureOverrides: {
        testFeature: true,
      },
      limits: {
        maxBrands: 5,
        maxStorageMb: 1024,
        dailyAgentTokens: 50_000,
      },
    });
  });

  it("blocks cross-tenant workspace config access", async () => {
    const workspaceRepo = new PostgresWorkspaceConfigRepository(
      harness!.tenantDbScope,
    );
    const foreign = await workspaceRepo.get(harness!.tenantAId, harness!.userBId);
    expect(foreign).toBeNull();
  });

  it("blocks cross-tenant schedule manipulation", async () => {
    const scheduleRepo = new PostgresScheduleRepositoryUnsafe(harness!.tenantDbScope);
    const visibleCount = await scheduleRepo.countForTenantWithoutAssert(
      harness!.tenantAId,
      harness!.tenantBId,
    );
    expect(visibleCount).toBe(0);
  });

  it("prevents attaching a brand to another tenant business", async () => {
    const unsafeBrandRepo = new PostgresBrandRepositoryUnsafe(harness!.tenantDbScope);
    await expect(
      unsafeBrandRepo.updateBusinessIdWithoutAssert(
        harness!.tenantAId,
        harness!.brandAId,
        harness!.businessBId,
      ),
    ).rejects.toThrow(/business_id must belong to the same tenant/i);

    const brandRepo = new PostgresBrandRepository(harness!.tenantDbScope);
    const brand = await brandRepo.getById(harness!.tenantAId, harness!.brandAId);
    expect(brand?.businessId).toBe(harness!.businessAId);
  });

  it("enforces RLS when application tenant assertions are bypassed", async () => {
    const unsafeBusinessRepo = new PostgresBusinessEntityRepositoryUnsafe(harness!.tenantDbScope);
    const unsafeBrandRepo = new PostgresBrandRepositoryUnsafe(harness!.tenantDbScope);
    const unsafeWorkspaceRepo = new PostgresWorkspaceConfigRepositoryUnsafe(harness!.tenantDbScope);

    await expect(
      unsafeBusinessRepo.getByIdWithoutAssert(harness!.tenantAId, harness!.businessBId),
    ).resolves.toBeNull();
    await expect(
      unsafeBrandRepo.getByIdWithoutAssert(harness!.tenantAId, harness!.brandBId),
    ).resolves.toBeNull();
    await expect(
      unsafeWorkspaceRepo.getWithoutAssert(harness!.tenantAId, harness!.tenantBId, harness!.userBId),
    ).resolves.toBeNull();
  });

  it("clears SET LOCAL tenant context after transaction commit", async () => {
    await harness!.tenantDbScope.run(harness!.tenantAId, async (client) => {
      const scoped = await readAuroraTenantSetting(client);
      expect(scoped).toBe(harness!.tenantAId);
    });

    const client = await harness!.appConnection.acquireClient();
    try {
      await client.query("BEGIN");
      const unset = await readAuroraTenantSetting(client);
      expect(unset).toBeNull();

      const denied = await client.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM aurora_business_entity WHERE tenant_id = $1",
        [harness!.tenantAId],
      );
      expect(Number(denied.rows[0]?.count ?? 0)).toBe(0);
      await client.query("ROLLBACK");
    } finally {
      harness!.appConnection.releaseClient(client);
    }
  });
});

describe("PostgreSQL Aurora RLS availability marker", () => {
  it("reports whether live PostgreSQL verification is configured", () => {
    if (!AURORA_LIVE_POSTGRES) {
      expect(process.env.AURORA_LIVE_POSTGRES).not.toBe("1");
    } else {
      expect(process.env.ORION_DATABASE_URL).toBeTruthy();
      expect(process.env.AURORA_APP_DATABASE_URL).toBeTruthy();
    }
  });
});
