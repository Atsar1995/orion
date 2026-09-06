import type { z } from "zod";
import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { createPhaseOneKnowledgeEntitySchema } from "@/lib/aurora/knowledge/schemas/knowledgeEntityEnvelope";
import {
  PHASE_ONE_ENTITY_TYPES,
  knowledgeEntityRegistry,
} from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";

export type PhaseOneEntityType = (typeof PHASE_ONE_ENTITY_TYPES)[number];

type PhaseOneSchemaMap = {
  readonly [K in PhaseOneEntityType]: z.ZodType<KnowledgeEntity>;
};

function buildPhaseOneSchemaMap(): PhaseOneSchemaMap {
  const schemas = {} as Record<string, z.ZodType<KnowledgeEntity>>;

  for (const entityType of PHASE_ONE_ENTITY_TYPES) {
    const definition = knowledgeEntityRegistry.get(entityType);
    if (!definition?.domain) {
      throw new Error(`Phase-1 registry entry missing domain: ${entityType}`);
    }

    schemas[entityType] = createPhaseOneKnowledgeEntitySchema(
      entityType,
      definition.domain as KnowledgeDomain,
    );
  }

  return schemas as PhaseOneSchemaMap;
}

export const PHASE_ONE_KNOWLEDGE_ENTITY_SCHEMAS: PhaseOneSchemaMap = buildPhaseOneSchemaMap();

export class KnowledgeEntitySchemaRegistry {
  get(entityType: string): z.ZodType<KnowledgeEntity> | undefined {
    if (!this.isPhaseOne(entityType)) {
      return undefined;
    }
    return PHASE_ONE_KNOWLEDGE_ENTITY_SCHEMAS[entityType as PhaseOneEntityType];
  }

  has(entityType: string): boolean {
    return this.isPhaseOne(entityType);
  }

  listPhaseOneEntityTypes(): readonly PhaseOneEntityType[] {
    return PHASE_ONE_ENTITY_TYPES as readonly PhaseOneEntityType[];
  }

  isPhaseOne(entityType: string): entityType is PhaseOneEntityType {
    return knowledgeEntityRegistry.isPhaseOne(entityType);
  }

  parse(entityType: PhaseOneEntityType, input: unknown): KnowledgeEntity {
    return PHASE_ONE_KNOWLEDGE_ENTITY_SCHEMAS[entityType].parse(input);
  }

  safeParse(entityType: PhaseOneEntityType, input: unknown) {
    return PHASE_ONE_KNOWLEDGE_ENTITY_SCHEMAS[entityType].safeParse(input);
  }
}

export const knowledgeEntitySchemaRegistry = new KnowledgeEntitySchemaRegistry();
