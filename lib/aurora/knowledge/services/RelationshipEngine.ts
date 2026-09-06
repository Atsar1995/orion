import { randomUUID } from "node:crypto";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type {
  KnowledgeRelationship,
  RelationshipType,
} from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import {
  getRelationshipTypeDefinition,
  isRelationshipType,
} from "@/lib/aurora/knowledge/registry/relationshipTypeDefinitions";
import type { KnowledgeRepository } from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
import {
  KnowledgeEntityNotFoundError,
  KnowledgeInvalidRelationshipError,
  KnowledgeRelationshipAlreadyExistsError,
} from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";

export type CreateRelationshipInput = {
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly relationshipType: RelationshipType;
  readonly weight?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt?: string;
};

/** Weight decay: 5% per 30 days since entity update (Appendix B). */
export function applyRelationshipWeightDecay(
  weight: number,
  entityUpdatedAt: string,
  referenceTime: string = new Date().toISOString(),
): number {
  const updatedMs = Date.parse(entityUpdatedAt);
  const referenceMs = Date.parse(referenceTime);
  if (Number.isNaN(updatedMs) || Number.isNaN(referenceMs)) {
    return weight;
  }
  const dayMs = 86_400_000;
  const daysElapsed = Math.max(0, Math.floor((referenceMs - updatedMs) / dayMs));
  const decayPeriods = Math.floor(daysElapsed / 30);
  return Math.max(0, weight * 0.95 ** decayPeriods);
}

function domainAllowed(
  domain: KnowledgeEntity["domain"],
  rule: readonly KnowledgeEntity["domain"][] | "any",
): boolean {
  return rule === "any" || rule.includes(domain);
}

export class RelationshipEngine {
  constructor(private readonly repository: KnowledgeRepository) {}

  async createRelationship(
    tenantId: string,
    input: CreateRelationshipInput,
  ): Promise<KnowledgeRelationship> {
    if (!isRelationshipType(input.relationshipType)) {
      throw new KnowledgeInvalidRelationshipError(
        `Invalid relationship type: ${input.relationshipType}.`,
      );
    }

    const definition = getRelationshipTypeDefinition(input.relationshipType);
    if (!definition) {
      throw new KnowledgeInvalidRelationshipError(
        `Unsupported relationship type: ${input.relationshipType}.`,
      );
    }

    const source = await this.repository.getById(tenantId, input.sourceEntityId);
    if (!source) {
      throw new KnowledgeEntityNotFoundError(input.sourceEntityId, tenantId);
    }

    const target = await this.repository.getById(tenantId, input.targetEntityId);
    if (!target) {
      throw new KnowledgeEntityNotFoundError(input.targetEntityId, tenantId);
    }

    if (source.tenantId !== tenantId || target.tenantId !== tenantId) {
      throw new KnowledgeInvalidRelationshipError(
        "Relationship endpoints must belong to the same tenant.",
      );
    }

    if (!domainAllowed(source.domain, definition.sourceDomains)) {
      throw new KnowledgeInvalidRelationshipError(
        `Source domain ${source.domain} is not allowed for ${input.relationshipType}.`,
      );
    }

    if (!domainAllowed(target.domain, definition.targetDomains)) {
      throw new KnowledgeInvalidRelationshipError(
        `Target domain ${target.domain} is not allowed for ${input.relationshipType}.`,
      );
    }

    if (definition.requiresSameEntityType && source.entityType !== target.entityType) {
      throw new KnowledgeInvalidRelationshipError(
        `${input.relationshipType} requires source and target entities of the same type.`,
      );
    }

    const weight = input.weight ?? definition.defaultWeight;
    if (weight < 0 || weight > 1) {
      throw new KnowledgeInvalidRelationshipError("Relationship weight must be between 0.0 and 1.0.");
    }

    const existing = await this.repository.getRelationships(
      tenantId,
      input.sourceEntityId,
      "out",
    );
    const duplicate = existing.find(
      (relationship) =>
        relationship.targetEntityId === input.targetEntityId &&
        relationship.relationshipType === input.relationshipType,
    );
    if (duplicate) {
      throw new KnowledgeRelationshipAlreadyExistsError(
        input.sourceEntityId,
        input.targetEntityId,
        input.relationshipType,
      );
    }

    const relationship: KnowledgeRelationship = {
      id: randomUUID(),
      tenantId,
      sourceEntityId: input.sourceEntityId,
      targetEntityId: input.targetEntityId,
      relationshipType: input.relationshipType,
      weight,
      metadata: input.metadata ?? {},
      createdAt: input.createdAt ?? new Date().toISOString(),
    };

    return this.repository.saveRelationship(tenantId, relationship);
  }
}

export {
  KnowledgeEntityNotFoundError,
  KnowledgeInvalidRelationshipError,
  KnowledgeRelationshipAlreadyExistsError,
};
