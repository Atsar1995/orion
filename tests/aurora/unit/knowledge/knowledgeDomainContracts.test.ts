import { describe, expect, it } from "vitest";
import type { EntityVersionRecord } from "@/lib/aurora/knowledge/domain/EntityVersionRecord";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import {
  KNOWLEDGE_CLASSIFICATIONS,
  KNOWLEDGE_DOMAINS,
  KNOWLEDGE_LIFECYCLE_STATUSES,
  KNOWLEDGE_SOURCE_TYPES,
} from "@/lib/aurora/knowledge/domain";

const REQUIRED_KNOWLEDGE_ENTITY_KEYS: readonly (keyof KnowledgeEntity)[] = [
  "id",
  "tenantId",
  "brandId",
  "domain",
  "entityType",
  "status",
  "classification",
  "title",
  "content",
  "sourceType",
  "sourceTrust",
  "version",
  "curatorAgent",
  "createdAt",
  "updatedAt",
];

const OPTIONAL_KNOWLEDGE_ENTITY_KEYS: readonly (keyof KnowledgeEntity)[] = [
  "validatedAt",
  "validatedBy",
  "staleAt",
];

const ENTITY_VERSION_RECORD_KEYS: readonly (keyof EntityVersionRecord)[] = [
  "entityId",
  "version",
  "snapshot",
  "changedBy",
  "changeReason",
  "createdAt",
];

function createKnowledgeEntityFixture(): KnowledgeEntity {
  return {
    id: "knw_550e8400-e29b-41d4-a716-446655440000",
    tenantId: "ten_001",
    brandId: "brd_001",
    domain: "knowledge.brand",
    entityType: "brand.profile",
    status: "validated",
    classification: "internal",
    title: "Brand profile",
    content: { voice: "professional" },
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    validatedAt: "2026-08-27T00:00:00.000Z",
    validatedBy: "usr_001",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

describe("knowledge domain contracts", () => {
  it("defines every lifecycle status from ES-AURORA-007 §2.9", () => {
    expect(KNOWLEDGE_LIFECYCLE_STATUSES).toEqual([
      "acquired",
      "provisional",
      "validated",
      "deprecated",
      "archived",
      "rejected",
    ]);
    expect(KNOWLEDGE_LIFECYCLE_STATUSES).toHaveLength(6);
  });

  it("defines every knowledge domain from ES-AURORA-007 §2.9", () => {
    expect(KNOWLEDGE_DOMAINS).toEqual([
      "knowledge.brand",
      "knowledge.product",
      "knowledge.campaign",
      "knowledge.customer",
      "knowledge.competitor",
      "knowledge.industry",
      "knowledge.seo",
      "knowledge.ads",
      "knowledge.content",
      "knowledge.market",
      "knowledge.executive",
    ]);
    expect(KNOWLEDGE_DOMAINS).toHaveLength(11);
  });

  it("defines every classification level from ES-AURORA-007 §2.8", () => {
    expect(KNOWLEDGE_CLASSIFICATIONS).toEqual([
      "public",
      "internal",
      "confidential",
      "restricted",
    ]);
    expect(KNOWLEDGE_CLASSIFICATIONS).toHaveLength(4);
  });

  it("defines every source type from ES-AURORA-007 §5.13", () => {
    expect(KNOWLEDGE_SOURCE_TYPES).toEqual([
      "source.human.brand_manager",
      "source.human.executive",
      "source.orion.crm_finance_sync",
      "source.integration.platform_sync",
      "source.campaign.completion_metrics",
      "source.agent.analysis",
      "source.external.feed",
      "source.agent.generation",
    ]);
    expect(KNOWLEDGE_SOURCE_TYPES).toHaveLength(8);
  });

  it("models the KnowledgeEntity structural contract", () => {
    const entity = createKnowledgeEntityFixture();

    for (const key of REQUIRED_KNOWLEDGE_ENTITY_KEYS) {
      expect(entity).toHaveProperty(key);
    }

    const entityWithOptionalFields: KnowledgeEntity = {
      ...entity,
      staleAt: "2026-11-27T00:00:00.000Z",
    };
    for (const key of OPTIONAL_KNOWLEDGE_ENTITY_KEYS) {
      expect(entityWithOptionalFields).toHaveProperty(key);
    }

    expect(entity.id.startsWith("knw_")).toBe(true);
    expect(typeof entity.content).toBe("object");
    expect(typeof entity.sourceTrust).toBe("number");
    expect(typeof entity.version).toBe("number");
  });

  it("models the EntityVersionRecord structural contract", () => {
    const snapshot = createKnowledgeEntityFixture();
    const versionRecord: EntityVersionRecord = {
      entityId: snapshot.id,
      version: snapshot.version,
      snapshot,
      changedBy: "usr_001",
      changeReason: "Initial validation",
      createdAt: "2026-08-27T00:00:00.000Z",
    };

    for (const key of ENTITY_VERSION_RECORD_KEYS) {
      expect(versionRecord).toHaveProperty(key);
    }

    expect(versionRecord.snapshot).toBe(snapshot);
    expect(versionRecord.snapshot.domain).toBe("knowledge.brand");
  });
});
