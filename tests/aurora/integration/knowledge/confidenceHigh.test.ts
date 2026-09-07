import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import { describe, expect, it } from "vitest";
import {
  RichBrandKbEmbeddingProvider,
  adminAccuracyCtx,
  createAccuracyStack,
  seedRichBrandKb,
} from "@/tests/aurora/helpers/retrievalAccuracyFixtures";

describe("confidenceHigh — wired retrieval accuracy", () => {
  it("returns high confidence for a rich validated brand knowledge base", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const stack = createAccuracyStack(repository, new RichBrandKbEmbeddingProvider());
    const ctx = adminAccuracyCtx();
    const seed = await seedRichBrandKb(repository, stack.embeddingService, ctx);

    const result = await stack.retrievalService.preflight(ctx, {
      taskType: "kb_curation",
      query: seed.query,
      campaignId: seed.campaignId,
      domains: ["knowledge.brand"],
    });

    expect(result.confidence).toBe("high");
  });
});
