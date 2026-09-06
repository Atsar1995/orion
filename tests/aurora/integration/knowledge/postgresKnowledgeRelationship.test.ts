import { AuroraMigrationRegistry } from "@/lib/aurora/persistence/AuroraMigrationRegistry";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  PostgresKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
import { RelationshipEngine } from "@/lib/aurora/knowledge/services/RelationshipEngine";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

function createKnowledgeEntity(
  tenantId: string,
  brandId: string,
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId,
    brandId,
    domain: definition.domain,
    status: "validated",
    classification: "internal",
    title: "Knowledge entity",
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe.skipIf(!AURORA_LIVE_POSTGRES)("PostgreSQL knowledge relationships", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let repository: PostgresKnowledgeRepository;
  let relationshipEngine: RelationshipEngine;
  let brandId: string;
  let campaignId: string;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      repository = new PostgresKnowledgeRepository(harness.tenantDbScope);
      relationshipEngine = new RelationshipEngine(repository);
      brandId = "knw_550e8400-e29b-41d4-a716-446655440000";
      campaignId = "knw_660e8400-e29b-41d4-a716-446655440001";

      await repository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: brandId,
          entityType: "brand.profile",
        }),
      );
      await repository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: campaignId,
          entityType: "campaign.record",
        }),
      );
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping knowledge relationship suite:", error);
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

  it("registers migration version 8", () => {
    const registry = new AuroraMigrationRegistry();
    expect(registry.getByVersion(8)?.id).toBe("008_knowledge_relationship");
  });

  it("persists and retrieves relationships under tenant RLS", async () => {
    const relationship = await relationshipEngine.createRelationship(harness!.tenantAId, {
      sourceEntityId: campaignId,
      targetEntityId: brandId,
      relationshipType: "belongs_to_brand",
    });

    await expect(
      repository.getRelationships(harness!.tenantAId, campaignId, "out"),
    ).resolves.toEqual([relationship]);
  });

  it("rejects cross-tenant relationship endpoints at the database layer", async () => {
    await expect(
      harness!.systemDbScope.run(async (client) => {
        await client.query(
          `INSERT INTO aurora_knowledge_relationship (
             tenant_id, source_entity_id, target_entity_id,
             relationship_type, weight, metadata, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
          [
            harness!.tenantBId,
            campaignId,
            brandId,
            "belongs_to_brand",
            1,
            "{}",
            "2026-08-27T04:00:00.000Z",
          ],
        );
      }),
    ).rejects.toMatchObject({ code: "23503" });
  });
});
