import { z } from "zod";
import { KNOWLEDGE_CLASSIFICATIONS } from "@/lib/aurora/knowledge/domain/KnowledgeClassification";
import { KNOWLEDGE_DOMAINS } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import { KNOWLEDGE_LIFECYCLE_STATUSES } from "@/lib/aurora/knowledge/domain/KnowledgeLifecycleStatus";
import { KNOWLEDGE_SOURCE_TYPES } from "@/lib/aurora/knowledge/domain/KnowledgeSourceType";
import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";

/** ISO-8601 timestamp string (ES-AURORA-007 §2.9 temporal fields). */
export const iso8601TimestampSchema = z.iso.datetime();

/** Entity identifier — format: knw_{uuid} (ES-AURORA-007 §2.9). */
export const knowledgeEntityIdSchema = z
  .string()
  .regex(
    /^knw_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "id must match knw_{uuid}",
  );

export const knowledgeLifecycleStatusSchema = z.enum(
  KNOWLEDGE_LIFECYCLE_STATUSES as unknown as [
    (typeof KNOWLEDGE_LIFECYCLE_STATUSES)[number],
    ...(typeof KNOWLEDGE_LIFECYCLE_STATUSES)[number][],
  ],
);

export const knowledgeClassificationSchema = z.enum(
  KNOWLEDGE_CLASSIFICATIONS as unknown as [
    (typeof KNOWLEDGE_CLASSIFICATIONS)[number],
    ...(typeof KNOWLEDGE_CLASSIFICATIONS)[number][],
  ],
);

export const knowledgeSourceTypeSchema = z.enum(
  KNOWLEDGE_SOURCE_TYPES as unknown as [
    (typeof KNOWLEDGE_SOURCE_TYPES)[number],
    ...(typeof KNOWLEDGE_SOURCE_TYPES)[number][],
  ],
);

export const knowledgeDomainSchema = z.enum(
  KNOWLEDGE_DOMAINS as unknown as [
    (typeof KNOWLEDGE_DOMAINS)[number],
    ...(typeof KNOWLEDGE_DOMAINS)[number][],
  ],
);

/** Generic content envelope when entity payload is not further specified (ES-AURORA-007 §2.9). */
export const knowledgeEntityContentSchema = z.record(z.string(), z.unknown());

/**
 * Source trust score — bounded 0.0–1.0 per ES-AURORA-007 §5.13 trust hierarchy
 * and quality scoring dimensions (§5.14).
 */
export const sourceTrustSchema = z.number().min(0).max(1);

const knowledgeEntityEnvelopeFields = {
  id: knowledgeEntityIdSchema,
  tenantId: z.string().min(1),
  brandId: z.string().min(1),
  status: knowledgeLifecycleStatusSchema,
  classification: knowledgeClassificationSchema,
  title: z.string().min(1),
  content: knowledgeEntityContentSchema,
  sourceType: knowledgeSourceTypeSchema,
  sourceTrust: sourceTrustSchema,
  version: z.number().int().positive(),
  curatorAgent: z.string().min(1),
  validatedAt: iso8601TimestampSchema.optional(),
  validatedBy: z.string().min(1).optional(),
  staleAt: iso8601TimestampSchema.optional(),
  createdAt: iso8601TimestampSchema,
  updatedAt: iso8601TimestampSchema,
} as const;

/** Builds a Phase-1 entity schema with canonical entityType and domain literals. */
export function createPhaseOneKnowledgeEntitySchema<
  const TEntityType extends string,
  const TDomain extends KnowledgeDomain,
>(entityType: TEntityType, domain: TDomain) {
  return z
    .object({
      ...knowledgeEntityEnvelopeFields,
      entityType: z.literal(entityType),
      domain: z.literal(domain),
    })
    .strict();
}

export type KnowledgeEntityEnvelopeInput = z.infer<
  ReturnType<typeof createPhaseOneKnowledgeEntitySchema<string, KnowledgeDomain>>
>;
