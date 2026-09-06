import type { KnowledgeClassification } from "@/lib/aurora/knowledge/domain/KnowledgeClassification";
import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type { KnowledgeLifecycleStatus } from "@/lib/aurora/knowledge/domain/KnowledgeLifecycleStatus";
import type { KnowledgeSourceType } from "@/lib/aurora/knowledge/domain/KnowledgeSourceType";

/** Canonical knowledge entity contract (ES-AURORA-007 §2.9). */
export interface KnowledgeEntity {
  /** Entity identifier — format: knw_{uuid} */
  readonly id: string;
  readonly tenantId: string;
  readonly brandId: string;
  readonly domain: KnowledgeDomain;
  readonly entityType: string;
  readonly status: KnowledgeLifecycleStatus;
  readonly classification: KnowledgeClassification;
  readonly title: string;
  readonly content: Record<string, unknown>;
  readonly sourceType: KnowledgeSourceType;
  readonly sourceTrust: number;
  readonly version: number;
  readonly curatorAgent: string;
  readonly validatedAt?: string;
  readonly validatedBy?: string;
  readonly staleAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
