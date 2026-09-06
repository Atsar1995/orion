import { describe, expect, it } from "vitest";
import { KNOWLEDGE_DOMAINS } from "@/lib/aurora/knowledge/domain";
import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import {
  PHASE_ONE_ENTITY_TYPES,
  knowledgeEntityRegistry,
} from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";

/** Appendix A rows with Phase = 1 (ES-AURORA-007). */
const APPENDIX_A_PHASE_ONE_ENTITY_TYPES = [
  "brand.profile",
  "brand.guideline",
  "brand.visual_identity",
  "brand.messaging_pillar",
  "brand.approval_policy",
  "product.product",
  "product.feature",
  "product.pricing",
  "product.audience",
  "campaign.record",
  "campaign.lesson",
  "campaign.channel_performance",
  "campaign.optimization",
  "seo.keyword",
  "seo.audit_finding",
  "seo.ranking",
  "seo.content_score",
  "content.pattern",
  "content.topic_cluster",
  "content.pillar",
  "content.repurposing_map",
] as const;

describe("KnowledgeEntityRegistry", () => {
  it("contains exactly 45 canonical definitions", () => {
    expect(knowledgeEntityRegistry.list()).toHaveLength(45);
  });

  it("includes every Appendix A Phase-1 entity type", () => {
    expect(PHASE_ONE_ENTITY_TYPES).toHaveLength(APPENDIX_A_PHASE_ONE_ENTITY_TYPES.length);
    expect([...PHASE_ONE_ENTITY_TYPES].sort()).toEqual(
      [...APPENDIX_A_PHASE_ONE_ENTITY_TYPES].sort(),
    );
    for (const entityType of APPENDIX_A_PHASE_ONE_ENTITY_TYPES) {
      expect(knowledgeEntityRegistry.has(entityType)).toBe(true);
      expect(knowledgeEntityRegistry.isPhaseOne(entityType)).toBe(true);
    }
  });

  it("returns undefined for unknown entity types", () => {
    expect(knowledgeEntityRegistry.get("brand.unknown")).toBeUndefined();
    expect(knowledgeEntityRegistry.get("not.in.catalogue")).toBeUndefined();
  });

  it("reports has() correctly", () => {
    expect(knowledgeEntityRegistry.has("brand.profile")).toBe(true);
    expect(knowledgeEntityRegistry.has("knowledge.meta.schema_version")).toBe(true);
    expect(knowledgeEntityRegistry.has("brand.unknown")).toBe(false);
  });

  it("returns list() in deterministic entityType order", () => {
    const listed = knowledgeEntityRegistry.list().map((definition) => definition.entityType);
    const sorted = [...listed].sort((left, right) => left.localeCompare(right));
    expect(listed).toEqual(sorted);
    expect(listed[0]).toBe("ads.audience");
    expect(listed.at(-1)).toBe("seo.ranking");
  });

  it("returns only matching definitions from listByDomain()", () => {
    const brandDefinitions = knowledgeEntityRegistry.listByDomain("knowledge.brand");
    expect(brandDefinitions.length).toBeGreaterThan(0);
    expect(
      brandDefinitions.every((definition) => definition.domain === "knowledge.brand"),
    ).toBe(true);
    expect(brandDefinitions.map((definition) => definition.entityType)).toEqual([
      "brand.approval_policy",
      "brand.guideline",
      "brand.messaging_pillar",
      "brand.profile",
      "brand.visual_identity",
    ]);

    const reserved = knowledgeEntityRegistry.get("knowledge.meta.schema_version");
    expect(reserved?.domain).toBeUndefined();
    expect(knowledgeEntityRegistry.listByDomain("knowledge.brand")).not.toContainEqual(reserved);
  });

  it("assigns valid KnowledgeDomain values to catalogued definitions", () => {
    for (const definition of knowledgeEntityRegistry.list()) {
      if (definition.domain === undefined) {
        expect(definition.entityType).toBe("knowledge.meta.schema_version");
        continue;
      }
      expect(KNOWLEDGE_DOMAINS).toContain(definition.domain);
    }
  });

  it("classifies Phase-1 status correctly", () => {
    for (const entityType of APPENDIX_A_PHASE_ONE_ENTITY_TYPES) {
      expect(knowledgeEntityRegistry.isPhaseOne(entityType)).toBe(true);
    }

    expect(knowledgeEntityRegistry.isPhaseOne("customer.segment")).toBe(false);
    expect(knowledgeEntityRegistry.isPhaseOne("knowledge.meta.schema_version")).toBe(false);
    expect(knowledgeEntityRegistry.isPhaseOne("unknown.type")).toBe(false);
  });

  it("contains no duplicate entity type identifiers", () => {
    const entityTypes = knowledgeEntityRegistry.list().map((definition) => definition.entityType);
    expect(new Set(entityTypes).size).toBe(entityTypes.length);
  });

  it("includes the reserved schema version entity type", () => {
    const reserved = knowledgeEntityRegistry.get("knowledge.meta.schema_version");
    expect(reserved).toEqual({
      entityType: "knowledge.meta.schema_version",
      phase: 2,
      description: "reserved",
    });
  });

  it("covers all eleven knowledge domains in catalogue entries", () => {
    const domains = new Set<KnowledgeDomain>();
    for (const definition of knowledgeEntityRegistry.list()) {
      if (definition.domain) {
        domains.add(definition.domain);
      }
    }
    expect(domains.size).toBe(KNOWLEDGE_DOMAINS.length);
    expect([...domains].sort()).toEqual([...KNOWLEDGE_DOMAINS].sort());
  });
});
