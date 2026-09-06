import { randomUUID } from "node:crypto";
import {
  KnowledgeEntityNotFoundError,
  PostgresKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
import {
  DefaultKnowledgeService,
  DefaultTaxonomyManager,
} from "@/lib/aurora/knowledge/services";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import {
  createHarnessContext,
  createKnowledgeEntity,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";
import { PostgresKnowledgeRepositoryUnsafe } from "@/tests/aurora/integration/knowledge/postgresKnowledgeRepositoryUnsafe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe.skipIf(!AURORA_LIVE_POSTGRES)("crossTenantKnowledgeRead", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let repository: PostgresKnowledgeRepository;
  let unsafeRepository: PostgresKnowledgeRepositoryUnsafe;
  let knowledgeService: DefaultKnowledgeService;
  let tenantAEntityId: string;
  let tenantBEntityId: string;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      repository = new PostgresKnowledgeRepository(harness.tenantDbScope);
      unsafeRepository = new PostgresKnowledgeRepositoryUnsafe(harness.tenantDbScope);
      knowledgeService = new DefaultKnowledgeService(
        repository,
        new DefaultAuroraAuthorizationService(),
        new DefaultTaxonomyManager(),
      );

      tenantAEntityId = `knw_${randomUUID()}`;
      tenantBEntityId = `knw_${randomUUID()}`;

      await repository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: tenantAEntityId,
          entityType: "brand.profile",
          title: "Tenant A exclusive profile",
        }),
      );
      await repository.create(
        harness.tenantBId,
        createKnowledgeEntity(harness.tenantBId, harness.brandBId, {
          id: tenantBEntityId,
          entityType: "brand.profile",
          title: "Tenant B exclusive profile",
        }),
      );
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping crossTenantKnowledgeRead suite:", error);
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

  it("returns null when tenant A reads tenant B entity by id through repository", async () => {
    await expect(repository.getById(harness!.tenantAId, tenantBEntityId)).resolves.toBeNull();
  });

  it("returns null when tenant A reads tenant B entity through KnowledgeService", async () => {
    const tenantACtx = createHarnessContext(harness!, "A", {
      auroraPermissions: ["aurora.knowledge.read"],
    });

    await expect(knowledgeService.getEntity(tenantACtx, tenantBEntityId)).resolves.toBeNull();
  });

  it("rejects cross-tenant updates with KnowledgeEntityNotFoundError", async () => {
    const tenantBEntity = await repository.getById(harness!.tenantBId, tenantBEntityId);
    expect(tenantBEntity).toBeTruthy();

    await expect(
      repository.update(harness!.tenantAId, tenantBEntityId, {
        entity: {
          ...tenantBEntity!,
          tenantId: harness!.tenantAId,
          brandId: harness!.brandAId,
          version: tenantBEntity!.version + 1,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_intruder",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });

  it("keeps tenant lists scoped without cross-tenant visibility", async () => {
    const tenantAList = await repository.list(harness!.tenantAId);
    const tenantBList = await repository.list(harness!.tenantBId);

    expect(tenantAList.some((entry) => entry.id === tenantAEntityId)).toBe(true);
    expect(tenantAList.some((entry) => entry.id === tenantBEntityId)).toBe(false);
    expect(tenantBList.some((entry) => entry.id === tenantBEntityId)).toBe(true);
    expect(tenantBList.some((entry) => entry.id === tenantAEntityId)).toBe(false);
  });

  it("blocks cross-tenant version history access", async () => {
    await expect(
      repository.getVersionHistory(harness!.tenantAId, tenantBEntityId),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });

  it("enforces PostgreSQL RLS for knowledge entities and versions", async () => {
    await expect(
      unsafeRepository.countEntitiesForForeignTenantWithoutPredicate(
        harness!.tenantAId,
        harness!.tenantBId,
      ),
    ).resolves.toBe(0);

    await expect(
      unsafeRepository.countVersionHistoryForForeignTenantWithoutPredicate(
        harness!.tenantAId,
        harness!.tenantBId,
        tenantBEntityId,
      ),
    ).resolves.toBe(0);
  });

  it("verifies knowledge entity and embedding tables have row level security enabled", async () => {
    const result = await harness!.privilegedConnection.query<{
      relname: string;
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(
      `SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relname IN (
           'aurora_knowledge_entity',
           'aurora_knowledge_entity_version',
           'aurora_knowledge_embedding',
           'aurora_knowledge_relationship'
         )
       ORDER BY c.relname ASC`,
    );

    expect(result.rows).toEqual([
      {
        relname: "aurora_knowledge_embedding",
        relrowsecurity: true,
        relforcerowsecurity: true,
      },
      {
        relname: "aurora_knowledge_entity",
        relrowsecurity: true,
        relforcerowsecurity: true,
      },
      {
        relname: "aurora_knowledge_entity_version",
        relrowsecurity: true,
        relforcerowsecurity: true,
      },
      {
        relname: "aurora_knowledge_relationship",
        relrowsecurity: true,
        relforcerowsecurity: true,
      },
    ]);
  });
});

describe("crossTenantKnowledgeRead availability marker", () => {
  it("reports whether live PostgreSQL verification is configured", () => {
    if (!AURORA_LIVE_POSTGRES) {
      expect(process.env.AURORA_LIVE_POSTGRES).not.toBe("1");
    } else {
      expect(process.env.ORION_DATABASE_URL).toBeTruthy();
      expect(process.env.AURORA_APP_DATABASE_URL).toBeTruthy();
    }
  });
});
