/** Knowledge graph domain identifiers (ES-AURORA-007 §2.9). */
export type KnowledgeDomain =
  | "knowledge.brand"
  | "knowledge.product"
  | "knowledge.campaign"
  | "knowledge.customer"
  | "knowledge.competitor"
  | "knowledge.industry"
  | "knowledge.seo"
  | "knowledge.ads"
  | "knowledge.content"
  | "knowledge.market"
  | "knowledge.executive";

export const KNOWLEDGE_DOMAINS: readonly KnowledgeDomain[] = [
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
] as const;
