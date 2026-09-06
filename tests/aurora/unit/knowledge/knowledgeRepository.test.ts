import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  InMemoryKnowledgeRepository,
  KnowledgeEntityAlreadyExistsError,
  KnowledgeEntityNotFoundError,
  KnowledgeTenantBoundaryError,
  KnowledgeVersionConflictError,
} from "@/lib/aurora/knowledge/repositories";

const TENANT_A = "ten_alpha";
const TENANT_B = "ten_beta";

function createEntity(
  tenantId: string,
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId,
    brandId: "brd_001",
    domain: definition.domain,
    status: "acquired",
    classification: "internal",
    title: "Test entity",
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

describe("InMemoryKnowledgeRepository", () => {
  it("starts empty", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await expect(repository.list(TENANT_A)).resolves.toEqual([]);
    await expect(repository.getById(TENANT_A, "knw_missing")).resolves.toBeNull();
  });

  it("creates and retrieves an entity", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });

    await repository.create(TENANT_A, entity);
    await expect(repository.getById(TENANT_A, entity.id)).resolves.toEqual(entity);
  });

  it("rejects duplicate entity IDs within a tenant", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });

    await repository.create(TENANT_A, entity);
    await expect(repository.create(TENANT_A, entity)).rejects.toBeInstanceOf(
      KnowledgeEntityAlreadyExistsError,
    );
  });

  it("enforces tenant isolation on get", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });

    await repository.create(TENANT_A, entity);
    await expect(repository.getById(TENANT_B, entity.id)).resolves.toBeNull();
  });

  it("enforces tenant isolation on list", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entityA = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const entityB = createEntity(TENANT_B, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "seo.keyword",
    });

    await repository.create(TENANT_A, entityA);
    await repository.create(TENANT_B, entityB);

    await expect(repository.list(TENANT_A)).resolves.toEqual([entityA]);
    await expect(repository.list(TENANT_B)).resolves.toEqual([entityB]);
  });

  it("creates version 2 on update and preserves version 1", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    await repository.create(TENANT_A, entity);

    const updated = {
      ...entity,
      title: "Updated title",
      version: 2,
      updatedAt: "2026-08-27T01:00:00.000Z",
    };

    await repository.update(TENANT_A, entity.id, {
      entity: updated,
      changedBy: "usr_001",
      changeReason: "Title change",
      versionCreatedAt: "2026-08-27T01:00:00.000Z",
    });

    await expect(repository.getById(TENANT_A, entity.id)).resolves.toEqual(updated);

    const history = await repository.getVersionHistory(TENANT_A, entity.id);
    expect(history).toHaveLength(2);
    expect(history[0]?.snapshot).toEqual(entity);
    expect(history[1]?.snapshot).toEqual(updated);
  });

  it("returns version history in deterministic order", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "campaign.record",
    });
    await repository.create(TENANT_A, entity);

    const versionTwo = {
      ...entity,
      status: "provisional" as const,
      version: 2,
      updatedAt: "2026-08-27T01:00:00.000Z",
    };
    const versionThree = {
      ...versionTwo,
      status: "validated" as const,
      version: 3,
      updatedAt: "2026-08-27T02:00:00.000Z",
    };

    await repository.update(TENANT_A, entity.id, {
      entity: versionTwo,
      changedBy: "svc_ingest",
    });
    await repository.update(TENANT_A, entity.id, {
      entity: versionThree,
      changedBy: "usr_approver",
    });

    const history = await repository.getVersionHistory(TENANT_A, entity.id);
    expect(history.map((record) => record.version)).toEqual([1, 2, 3]);
    expect(history[0]?.snapshot.version).toBe(1);
    expect(history[2]?.snapshot.version).toBe(3);
  });

  it("increments versions sequentially across updates", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_770e8400-e29b-41d4-a716-446655440002",
      entityType: "content.pattern",
    });
    await repository.create(TENANT_A, entity);

    const versionTwo = { ...entity, version: 2, updatedAt: "2026-08-27T01:00:00.000Z" };
    await repository.update(TENANT_A, entity.id, { entity: versionTwo, changedBy: "usr_001" });

    await expect(
      repository.update(TENANT_A, entity.id, {
        entity: { ...entity, version: 2, updatedAt: "2026-08-27T02:00:00.000Z" },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeVersionConflictError);
  });

  it("rejects tenantId mutation on update", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "product.product",
    });
    await repository.create(TENANT_A, entity);

    await expect(
      repository.update(TENANT_A, entity.id, {
        entity: {
          ...entity,
          tenantId: TENANT_B,
          version: 2,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeTenantBoundaryError);
  });

  it("rejects entity id mutation on update", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "product.product",
    });
    await repository.create(TENANT_A, entity);

    await expect(
      repository.update(TENANT_A, entity.id, {
        entity: {
          ...entity,
          id: "knw_660e8400-e29b-41d4-a716-446655440001",
          version: 2,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeVersionConflictError);
  });

  it("rejects cross-tenant update", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "seo.keyword",
    });
    await repository.create(TENANT_A, entity);

    await expect(
      repository.update(TENANT_B, entity.id, {
        entity: {
          ...entity,
          version: 2,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });

  it("returns list results in deterministic order", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entityZ = createEntity(TENANT_A, {
      id: "knw_ffffffff-ffff-4fff-8fff-ffffffffffff",
      entityType: "brand.guideline",
    });
    const entityA = createEntity(TENANT_A, {
      id: "knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      entityType: "brand.profile",
    });

    await repository.create(TENANT_A, entityZ);
    await repository.create(TENANT_A, entityA);

    const listed = await repository.list(TENANT_A);
    expect(listed.map((entry) => entry.id)).toEqual([entityA.id, entityZ.id]);
  });

  it("searches keywords with title-weighted ranking", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: "knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        entityType: "brand.profile",
        title: "Orion exact title",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: "knw_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        entityType: "campaign.record",
        title: "Campaign",
        content: { note: "Orion exact title in content" },
      }),
    );

    const matches = await repository.searchKeyword(TENANT_A, "Orion exact title");
    expect(matches[0]?.entity.id).toBe("knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(matches[0]?.rank).toBeGreaterThan(matches[1]?.rank ?? 0);
  });

  it("returns empty keyword results for blank queries", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await expect(repository.searchKeyword(TENANT_A, "   ")).resolves.toEqual([]);
  });

  it("scopes keyword search to tenant entities", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: "knw_550e8400-e29b-41d4-a716-446655440000",
        entityType: "brand.profile",
        title: "Orion tenant scoped",
      }),
    );

    await expect(repository.searchKeyword(TENANT_B, "Orion tenant scoped")).resolves.toEqual([]);
  });
});
