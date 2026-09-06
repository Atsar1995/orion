import type { EmbeddingMetadata } from "@/lib/aurora/knowledge/types/RetrievalTypes";

/** Injectable embedding generation port (ES-AURORA-007 §4.4). */
export interface EmbeddingProvider {
  embed(text: string, metadata?: EmbeddingMetadata): Promise<readonly number[]>;
  embedBatch(texts: readonly string[]): Promise<readonly (readonly number[])[]>;
}

/**
 * Provider failure signal for ERR-2 keyword-only degradation.
 * Retrieval pipeline consumers must not fabricate embeddings when this occurs.
 */
export class EmbeddingProviderUnavailableError extends Error {
  readonly name = "EmbeddingProviderUnavailableError";
  readonly degradeToKeywordSearch = true as const;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/** Production stub until ORION AI Provider exposes an embedding contract. */
export class UnavailableEmbeddingProvider implements EmbeddingProvider {
  async embed(_text: string, _metadata?: EmbeddingMetadata): Promise<readonly number[]> {
    throw new EmbeddingProviderUnavailableError(
      "ORION embedding provider is not configured for Aurora knowledge indexing.",
    );
  }

  async embedBatch(_texts: readonly string[]): Promise<readonly (readonly number[])[]> {
    throw new EmbeddingProviderUnavailableError(
      "ORION embedding provider is not configured for Aurora knowledge indexing.",
    );
  }
}
