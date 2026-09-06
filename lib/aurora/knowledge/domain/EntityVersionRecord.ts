import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";

/** Immutable entity version snapshot (ES-AURORA-007 §2.7 · Gate 1 snapshot type). */
export interface EntityVersionRecord {
  readonly entityId: string;
  readonly version: number;
  readonly snapshot: KnowledgeEntity;
  /** userId or serviceId */
  readonly changedBy: string;
  readonly changeReason?: string;
  readonly createdAt: string;
}
