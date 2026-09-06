import { createHash } from "node:crypto";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";

/**
 * Canon chunk size is 512 tokens (ES-AURORA-007 §4.4).
 * Deterministic approximation: whitespace-delimited words, max 512 words per chunk.
 */
export const EMBEDDING_CHUNK_WORD_LIMIT = 512 as const;

export function extractEntityEmbeddingText(entity: KnowledgeEntity): string {
  const contentText =
    entity.content && typeof entity.content === "object"
      ? JSON.stringify(entity.content)
      : String(entity.content ?? "");
  return `${entity.title}\n${entity.entityType}\n${contentText}`.trim();
}

export function chunkEmbeddingText(text: string): readonly string[] {
  const normalized = text.trim();
  if (!normalized) {
    return [];
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  for (let index = 0; index < words.length; index += EMBEDDING_CHUNK_WORD_LIMIT) {
    chunks.push(words.slice(index, index + EMBEDDING_CHUNK_WORD_LIMIT).join(" "));
  }

  return chunks;
}

export function hashEmbeddingChunkContent(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}
