/** Knowledge classification levels (ES-AURORA-007 §2.8 · §7.11). */
export type KnowledgeClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

export const KNOWLEDGE_CLASSIFICATIONS: readonly KnowledgeClassification[] = [
  "public",
  "internal",
  "confidential",
  "restricted",
] as const;
