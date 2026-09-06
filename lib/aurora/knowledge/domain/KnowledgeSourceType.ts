/**
 * Source trust hierarchy identifiers (ES-AURORA-007 §5.13).
 * Each value maps to one row in the Source Trust Hierarchy table.
 */
export type KnowledgeSourceType =
  | "source.human.brand_manager"
  | "source.human.executive"
  | "source.orion.crm_finance_sync"
  | "source.integration.platform_sync"
  | "source.campaign.completion_metrics"
  | "source.agent.analysis"
  | "source.external.feed"
  | "source.agent.generation";

export const KNOWLEDGE_SOURCE_TYPES: readonly KnowledgeSourceType[] = [
  "source.human.brand_manager",
  "source.human.executive",
  "source.orion.crm_finance_sync",
  "source.integration.platform_sync",
  "source.campaign.completion_metrics",
  "source.agent.analysis",
  "source.external.feed",
  "source.agent.generation",
] as const;
