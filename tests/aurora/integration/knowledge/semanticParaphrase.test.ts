import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import { describe, expect, it } from "vitest";
import {
  ParaphraseNormalizationEmbeddingProvider,
  SEMANTIC_PARAPHRASE_QUERY,
  SEMANTIC_TARGET_PRODUCT_ID,
  adminAccuracyCtx,
  createAccuracyStack,
  searchWithRequest,
  seedSemanticParaphraseDataset,
  topEntityIds,
} from "@/tests/aurora/helpers/retrievalAccuracyFixtures";

describe("semanticParaphrase — wired retrieval accuracy", () => {
  it("returns the indexed target product within the top 5 for a paraphrased query", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await seedSemanticParaphraseDataset(repository);
    const stack = createAccuracyStack(repository, new ParaphraseNormalizationEmbeddingProvider());
    const ctx = adminAccuracyCtx();

    await stack.embeddingService.indexEntity(ctx, SEMANTIC_TARGET_PRODUCT_ID);

    const ranked = await searchWithRequest(stack, ctx, {
      taskType: "content_generation",
      query: SEMANTIC_PARAPHRASE_QUERY,
    });

    const topFive = topEntityIds(ranked, 5);
    expect(topFive).toContain(SEMANTIC_TARGET_PRODUCT_ID);
  });
});
