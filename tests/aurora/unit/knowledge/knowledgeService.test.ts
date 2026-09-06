import { describe, expect, it, vi } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  InMemoryKnowledgeRepository,
  KnowledgeEntityAlreadyExistsError,
  KnowledgeEntityNotFoundError,
  KnowledgeVersionConflictError,
} from "@/lib/aurora/knowledge/repositories";
import {
  DefaultKnowledgeService,
  KnowledgeInvalidEntityError,
  KnowledgeInvalidLifecycleTransitionError,
  KnowledgeInvalidTenantContextError,
  KnowledgeUnsupportedEntityTypeError,
} from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  DefaultKnowledgeGraphService,
  RelationshipEngine,
} from "@/lib/aurora/knowledge/services";
import {
  DefaultTaxonomyManager,
  type TaxonomyManager,
} from "@/lib/aurora/knowledge/services/TaxonomyManager";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "ten_alpha";
const TENANT_B = "ten_beta";
const ENTITY_ID = "knw_550e8400-e29b-41d4-a716-446655440000";

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

function createService(
  repository = new InMemoryKnowledgeRepository(),
  taxonomyManager: TaxonomyManager = new DefaultTaxonomyManager(),
) {
  return new DefaultKnowledgeService(
    repository,
    new DefaultAuroraAuthorizationService(),
    taxonomyManager,
  );
}

function createContext(tenantId: string) {
  return createTestAuroraRuntimeContext({
    tenantId,
    userId: "usr_test",
  });
}

describe("KnowledgeService", () => {
  it("creates a valid Phase-1 entity", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
      title: "Brand profile",
    });

    await expect(service.createEntity(ctx, { entity })).resolves.toEqual(entity);
    await expect(service.getEntity(ctx, ENTITY_ID)).resolves.toEqual(entity);
  });

  it("rejects unknown entity types", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });

    await expect(
      service.createEntity(ctx, {
        entity: { ...entity, entityType: "brand.unknown_type" },
      }),
    ).rejects.toBeInstanceOf(KnowledgeUnsupportedEntityTypeError);
  });

  it("rejects invalid entity schema", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: "not-a-valid-id",
      entityType: "brand.profile",
    });

    await expect(service.createEntity(ctx, { entity })).rejects.toBeInstanceOf(
      KnowledgeInvalidEntityError,
    );
  });

  it("rejects invalid tenant ownership on create", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_B, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });

    await expect(service.createEntity(ctx, { entity })).rejects.toBeInstanceOf(
      KnowledgeInvalidTenantContextError,
    );
  });

  it("gets an entity within tenant scope", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });

    await service.createEntity(ctx, { entity });
    await expect(service.getEntity(ctx, ENTITY_ID)).resolves.toEqual(entity);
  });

  it("hides cross-tenant entities on get", async () => {
    const service = createService();
    const tenantACtx = createContext(TENANT_A);
    const tenantBCtx = createContext(TENANT_B);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });

    await service.createEntity(tenantACtx, { entity });
    await expect(service.getEntity(tenantBCtx, ENTITY_ID)).resolves.toBeNull();
  });

  it("updates a valid entity and increments version", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });
    await service.createEntity(ctx, { entity });

    const updated = {
      ...entity,
      status: "provisional" as const,
      title: "Updated profile",
      version: 2,
      updatedAt: "2026-08-27T01:00:00.000Z",
    };

    await expect(
      service.updateEntity(ctx, ENTITY_ID, {
        entity: updated,
        changedBy: "usr_001",
        changeReason: "Ingestion complete",
      }),
    ).resolves.toEqual(updated);
  });

  it("rejects stale version numbers", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });
    await service.createEntity(ctx, { entity });

    await expect(
      service.updateEntity(ctx, ENTITY_ID, {
        entity: {
          ...entity,
          version: 3,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeVersionConflictError);
  });

  it("rejects immutable tenant and id mutation", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });
    await service.createEntity(ctx, { entity });

    await expect(
      service.updateEntity(ctx, ENTITY_ID, {
        entity: {
          ...entity,
          tenantId: TENANT_B,
          version: 2,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidTenantContextError);

    await expect(
      service.updateEntity(ctx, ENTITY_ID, {
        entity: {
          ...entity,
          id: "knw_660e8400-e29b-41d4-a716-446655440001",
          version: 2,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidEntityError);
  });

  it("returns version history for tenant-scoped entities", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "campaign.record",
    });
    await service.createEntity(ctx, { entity });

    const versionTwo = {
      ...entity,
      status: "provisional" as const,
      version: 2,
      updatedAt: "2026-08-27T01:00:00.000Z",
    };
    await service.updateEntity(ctx, ENTITY_ID, {
      entity: versionTwo,
      changedBy: "svc_ingest",
    });

    const history = await service.getVersionHistory(ctx, ENTITY_ID);
    expect(history).toHaveLength(2);
    expect(history.map((record) => record.version)).toEqual([1, 2]);
    expect(history[0]?.snapshot).toEqual(entity);
    expect(history[1]?.snapshot).toEqual(versionTwo);
  });

  it("rejects invalid lifecycle values", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
      status: "acquired",
    });

    await expect(
      service.createEntity(ctx, {
        entity: {
          ...entity,
          status: "not-a-status" as KnowledgeEntity["status"],
        },
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidEntityError);
  });

  it("allows explicit lifecycle transitions from ES-AURORA-007 §2.10", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });
    await service.createEntity(ctx, { entity });

    const provisional = {
      ...entity,
      status: "provisional" as const,
      version: 2,
      updatedAt: "2026-08-27T01:00:00.000Z",
    };
    await expect(
      service.updateEntity(ctx, ENTITY_ID, {
        entity: provisional,
        changedBy: "svc_ingest",
      }),
    ).resolves.toMatchObject({ status: "provisional", version: 2 });

    const validated = {
      ...provisional,
      status: "validated" as const,
      version: 3,
      updatedAt: "2026-08-27T02:00:00.000Z",
    };
    await expect(
      service.updateEntity(ctx, ENTITY_ID, {
        entity: validated,
        changedBy: "usr_approver",
      }),
    ).resolves.toMatchObject({ status: "validated", version: 3 });
  });

  it("rejects undocumented lifecycle transitions", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });
    await service.createEntity(ctx, { entity });

    await expect(
      service.updateEntity(ctx, ENTITY_ID, {
        entity: {
          ...entity,
          status: "validated",
          version: 2,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidLifecycleTransitionError);
  });

  it("validates classification values", async () => {
    const service = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });

    await expect(
      service.createEntity(ctx, {
        entity: {
          ...entity,
          classification: "top-secret" as KnowledgeEntity["classification"],
        },
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidEntityError);
  });

  it("propagates repository errors", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const service = createService(repository);
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });

    await service.createEntity(ctx, { entity });
    await expect(service.createEntity(ctx, { entity })).rejects.toBeInstanceOf(
      KnowledgeEntityAlreadyExistsError,
    );

    const missingId = "knw_660e8400-e29b-41d4-a716-446655440099";

    await expect(
      service.updateEntity(ctx, missingId, {
        entity: {
          ...entity,
          id: missingId,
          version: 2,
          updatedAt: "2026-08-27T01:00:00.000Z",
        },
        changedBy: "usr_001",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);

    await expect(service.getVersionHistory(ctx, missingId)).rejects.toBeInstanceOf(
      KnowledgeEntityNotFoundError,
    );
  });

  describe("taxonomy placement governance", () => {
    it("accepts a valid domain/entityType combination", async () => {
      const taxonomyManager = new DefaultTaxonomyManager();
      const validateSpy = vi.spyOn(taxonomyManager, "validateEntityPlacement");
      const service = createService(new InMemoryKnowledgeRepository(), taxonomyManager);
      const ctx = createContext(TENANT_A);
      const entity = createEntity(TENANT_A, {
        id: ENTITY_ID,
        entityType: "brand.profile",
      });

      await expect(service.createEntity(ctx, { entity })).resolves.toEqual(entity);
      expect(validateSpy).toHaveBeenCalledWith(entity);
    });

    it("rejects an invalid domain/entityType combination on create", async () => {
      const taxonomyManager: TaxonomyManager = {
        validateEntityPlacement: vi.fn().mockReturnValue({
          valid: false,
          errors: [
            "Entity type brand.profile is not listed in taxonomy for domain knowledge.campaign.",
          ],
        }),
        getDomainTaxonomy: vi.fn(),
        suggestEntityType: vi.fn(),
      };
      const service = createService(new InMemoryKnowledgeRepository(), taxonomyManager);
      const ctx = createContext(TENANT_A);
      const entity = createEntity(TENANT_A, {
        id: ENTITY_ID,
        entityType: "brand.profile",
      });

      await expect(service.createEntity(ctx, { entity })).rejects.toBeInstanceOf(
        KnowledgeInvalidEntityError,
      );
      expect(taxonomyManager.validateEntityPlacement).toHaveBeenCalledWith(entity);
    });

    it("rejects an invalid domain/entityType combination on update", async () => {
      let placementChecks = 0;
      const taxonomyManager: TaxonomyManager = {
        validateEntityPlacement: vi.fn((entity) => {
          placementChecks += 1;
          if (placementChecks === 1) {
            return { valid: true, errors: [] };
          }
          return {
            valid: false,
            errors: [
              "Entity type brand.profile is not listed in taxonomy for domain knowledge.campaign.",
            ],
          };
        }),
        getDomainTaxonomy: vi.fn(),
        suggestEntityType: vi.fn(),
      };
      const service = createService(new InMemoryKnowledgeRepository(), taxonomyManager);
      const ctx = createContext(TENANT_A);
      const entity = createEntity(TENANT_A, {
        id: ENTITY_ID,
        entityType: "brand.profile",
      });
      await service.createEntity(ctx, { entity });

      await expect(
        service.updateEntity(ctx, ENTITY_ID, {
          entity: {
            ...entity,
            status: "provisional",
            version: 2,
            updatedAt: "2026-08-27T01:00:00.000Z",
          },
          changedBy: "usr_001",
        }),
      ).rejects.toBeInstanceOf(KnowledgeInvalidEntityError);
      expect(taxonomyManager.validateEntityPlacement).toHaveBeenCalledTimes(2);
    });

    it("invokes TaxonomyManager on entity create and update", async () => {
      const taxonomyManager = new DefaultTaxonomyManager();
      const validateSpy = vi.spyOn(taxonomyManager, "validateEntityPlacement");
      const service = createService(new InMemoryKnowledgeRepository(), taxonomyManager);
      const ctx = createContext(TENANT_A);
      const entity = createEntity(TENANT_A, {
        id: ENTITY_ID,
        entityType: "campaign.record",
      });
      await service.createEntity(ctx, { entity });

      const updated = {
        ...entity,
        status: "provisional" as const,
        version: 2,
        updatedAt: "2026-08-27T01:00:00.000Z",
      };
      await service.updateEntity(ctx, ENTITY_ID, {
        entity: updated,
        changedBy: "usr_001",
      });

      expect(validateSpy).toHaveBeenCalledTimes(2);
      expect(validateSpy).toHaveBeenNthCalledWith(1, entity);
      expect(validateSpy).toHaveBeenNthCalledWith(2, updated);
    });

    it("preserves existing valid KnowledgeService behavior after taxonomy wiring", async () => {
      const service = createService();
      const ctx = createContext(TENANT_A);
      const entity = createEntity(TENANT_A, {
        id: ENTITY_ID,
        entityType: "brand.profile",
        title: "Brand profile",
      });

      await expect(service.createEntity(ctx, { entity })).resolves.toEqual(entity);
      await expect(service.getEntity(ctx, ENTITY_ID)).resolves.toEqual(entity);
    });

    it("delegates taxonomy enforcement through KnowledgeGraphService entity writes", async () => {
      const taxonomyManager: TaxonomyManager = {
        validateEntityPlacement: vi.fn().mockReturnValue({
          valid: false,
          errors: ["Entity type brand.profile is not listed in taxonomy for domain knowledge.campaign."],
        }),
        getDomainTaxonomy: vi.fn(),
        suggestEntityType: vi.fn(),
      };
      const repository = new InMemoryKnowledgeRepository();
      const authorization = new DefaultAuroraAuthorizationService();
      const knowledgeService = new DefaultKnowledgeService(
        repository,
        authorization,
        taxonomyManager,
      );
      const graphService = new DefaultKnowledgeGraphService(
        knowledgeService,
        new RelationshipEngine(repository),
        repository,
        authorization,
      );
      const ctx = createContext(TENANT_A);
      const entity = createEntity(TENANT_A, {
        id: ENTITY_ID,
        entityType: "brand.profile",
      });

      await expect(graphService.createEntity(ctx, { entity })).rejects.toBeInstanceOf(
        KnowledgeInvalidEntityError,
      );
      expect(taxonomyManager.validateEntityPlacement).toHaveBeenCalledWith(entity);
    });
  });
});
