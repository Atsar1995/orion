import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import { KNOWLEDGE_DOMAINS } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { extractEntityEmbeddingText } from "@/lib/aurora/knowledge/services/embeddingIndexing";
import type {
  ContextLayerKey,
  RetrievalTaskType,
  ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

/** Task-to-domain mapping (ES-AURORA-007 Appendix D · A-004 §6.2). */
export const RETRIEVAL_TASK_DOMAIN_MAP: Readonly<
  Record<
    RetrievalTaskType,
    { readonly primary: readonly KnowledgeDomain[]; readonly secondary: readonly KnowledgeDomain[] }
  >
> = {
  content_generation: {
    primary: ["knowledge.brand", "knowledge.product", "knowledge.content"],
    secondary: ["knowledge.seo", "knowledge.campaign"],
  },
  seo_analysis: {
    primary: ["knowledge.seo", "knowledge.content"],
    secondary: ["knowledge.brand", "knowledge.industry"],
  },
  ad_campaign: {
    primary: ["knowledge.ads", "knowledge.campaign", "knowledge.customer"],
    secondary: ["knowledge.brand", "knowledge.competitor"],
  },
  social_posting: {
    primary: ["knowledge.brand", "knowledge.content", "knowledge.customer"],
    secondary: ["knowledge.campaign", "knowledge.seo"],
  },
  analytics_report: {
    primary: ["knowledge.campaign", "knowledge.content", "knowledge.ads"],
    secondary: ["knowledge.customer", "knowledge.executive"],
  },
  executive_briefing: {
    primary: ["knowledge.executive", "knowledge.campaign", "knowledge.market"],
    secondary: ["knowledge.brand", "knowledge.customer"],
  },
  competitive_analysis: {
    primary: ["knowledge.competitor", "knowledge.market", "knowledge.industry"],
    secondary: ["knowledge.brand", "knowledge.campaign"],
  },
  kb_curation: {
    primary: ["knowledge.brand", "knowledge.product"],
    secondary: KNOWLEDGE_DOMAINS,
  },
} as const;

const ENTITY_BLOCK_SEPARATOR = "\n\n---\n\n";

/** Deterministic whitespace word-count token approximation (ES-AURORA-007 §4.4 · embeddingIndexing). */
export function estimateTokenCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function truncateToTokenBudget(text: string, maxTokens: number): string {
  if (maxTokens <= 0) {
    return "";
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxTokens) {
    return words.join(" ");
  }

  return words.slice(0, maxTokens).join(" ");
}

export function serializeEntityForContext(entity: KnowledgeEntity): string {
  return `# ${entity.title} (${entity.entityType})\n${extractEntityEmbeddingText(entity)}`;
}

export function compareScoredEntitiesForAssembly(left: ScoredEntity, right: ScoredEntity): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.entity.id.localeCompare(right.entity.id);
}

export function deduplicateScoredEntities(
  scoredEntities: readonly ScoredEntity[],
): readonly ScoredEntity[] {
  const strongestByEntityId = new Map<string, ScoredEntity>();

  for (const scored of scoredEntities) {
    const existing = strongestByEntityId.get(scored.entity.id);
    if (!existing || compareScoredEntitiesForAssembly(scored, existing) < 0) {
      strongestByEntityId.set(scored.entity.id, scored);
    }
  }

  return [...strongestByEntityId.values()].sort(compareScoredEntitiesForAssembly);
}

export function passesAssemblyEntityFilters(
  scored: ScoredEntity,
  ctx: AuroraRuntimeContext,
  options: {
    readonly validatedOnly?: boolean;
    readonly includeProvisional?: boolean;
  },
): boolean {
  const { entity } = scored;

  if (entity.tenantId !== ctx.tenantId) {
    return false;
  }

  if (entity.classification === "restricted" && !ctx.roles.includes("aurora.admin")) {
    return false;
  }

  if (options.validatedOnly && entity.status !== "validated") {
    return false;
  }

  if (options.includeProvisional === false && entity.status === "provisional") {
    return false;
  }

  return true;
}

function matchesCampaignContext(entity: KnowledgeEntity, campaignId?: string): boolean {
  if (!campaignId) {
    return false;
  }

  if (entity.domain === "knowledge.campaign") {
    return true;
  }

  const content = entity.content;
  if (typeof content.campaignId === "string" && content.campaignId === campaignId) {
    return true;
  }

  return false;
}

function isTaskKnowledgeDomain(domain: KnowledgeDomain, taskType: RetrievalTaskType): boolean {
  const mapping = RETRIEVAL_TASK_DOMAIN_MAP[taskType];
  return mapping.primary.includes(domain) || mapping.secondary.includes(domain);
}

function isMemoryOnlySignal(scored: ScoredEntity): boolean {
  return (
    scored.memoryRelevanceScore !== undefined &&
    scored.semanticScore === undefined &&
    scored.keywordScore === undefined &&
    scored.graphProximityScore === undefined
  );
}

/** Resolve the canonical context layer for a scored entity (ES-AURORA-007 §4.6). */
export function resolveContextLayer(
  scored: ScoredEntity,
  taskType?: RetrievalTaskType,
  campaignId?: string,
): ContextLayerKey {
  const { entity } = scored;

  if (entity.domain === "knowledge.brand") {
    return "brand";
  }

  if (entity.domain === "knowledge.campaign" || matchesCampaignContext(entity, campaignId)) {
    return "campaign";
  }

  if (isMemoryOnlySignal(scored)) {
    return "sessionHistory";
  }

  if (taskType && isTaskKnowledgeDomain(entity.domain, taskType)) {
    return "taskKnowledge";
  }

  if (scored.graphProximityScore !== undefined) {
    return "graphEntities";
  }

  if (scored.memoryRelevanceScore !== undefined) {
    return "learningPreferences";
  }

  return "taskKnowledge";
}

export function assignScoredEntitiesToLayers(
  scoredEntities: readonly ScoredEntity[],
  taskType?: RetrievalTaskType,
  campaignId?: string,
): Readonly<Record<ContextLayerKey, readonly ScoredEntity[]>> {
  const grouped: Record<ContextLayerKey, ScoredEntity[]> = {
    brand: [],
    taskKnowledge: [],
    campaign: [],
    graphEntities: [],
    learningPreferences: [],
    sessionHistory: [],
  };

  for (const scored of scoredEntities) {
    const layer = resolveContextLayer(scored, taskType, campaignId);
    grouped[layer].push(scored);
  }

  for (const key of Object.keys(grouped) as ContextLayerKey[]) {
    grouped[key].sort(compareScoredEntitiesForAssembly);
  }

  return grouped;
}

export function buildLayerContent(
  entities: readonly ScoredEntity[],
  maxTokens: number,
  remainingGlobalTokens: number,
): { readonly content: string; readonly tokenCount: number; readonly includedEntities: readonly KnowledgeEntity[] } {
  const effectiveLimit = Math.min(maxTokens, remainingGlobalTokens);
  if (effectiveLimit <= 0 || entities.length === 0) {
    return { content: "", tokenCount: 0, includedEntities: [] };
  }

  const separatorTokenCost = estimateTokenCount(ENTITY_BLOCK_SEPARATOR);
  const includedEntities: KnowledgeEntity[] = [];
  const blocks: string[] = [];
  let usedTokens = 0;

  for (const scored of entities) {
    const block = serializeEntityForContext(scored.entity);
    const blockTokens = estimateTokenCount(block);
    const additionTokens = blocks.length === 0 ? blockTokens : separatorTokenCost + blockTokens;

    if (usedTokens + additionTokens <= effectiveLimit) {
      blocks.push(block);
      usedTokens += additionTokens;
      includedEntities.push(scored.entity);
      continue;
    }

    const remainingLayerTokens = effectiveLimit - usedTokens - (blocks.length === 0 ? 0 : separatorTokenCost);
    if (remainingLayerTokens <= 0) {
      break;
    }

    const truncatedBlock = truncateToTokenBudget(block, remainingLayerTokens);
    const truncatedTokens = estimateTokenCount(truncatedBlock);
    if (truncatedTokens <= 0) {
      break;
    }

    blocks.push(truncatedBlock);
    usedTokens += (blocks.length === 1 ? 0 : separatorTokenCost) + truncatedTokens;
    includedEntities.push(scored.entity);
    break;
  }

  return {
    content: blocks.join(ENTITY_BLOCK_SEPARATOR),
    tokenCount: usedTokens,
    includedEntities,
  };
}
