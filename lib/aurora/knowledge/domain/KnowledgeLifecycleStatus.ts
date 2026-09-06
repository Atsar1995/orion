/** Knowledge entity lifecycle states (ES-AURORA-007 §2.9). */
export type KnowledgeLifecycleStatus =
  | "acquired"
  | "provisional"
  | "validated"
  | "deprecated"
  | "archived"
  | "rejected";

export const KNOWLEDGE_LIFECYCLE_STATUSES: readonly KnowledgeLifecycleStatus[] = [
  "acquired",
  "provisional",
  "validated",
  "deprecated",
  "archived",
  "rejected",
] as const;
