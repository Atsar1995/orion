import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import { describe, expect, it } from "vitest";
import {
  HYBRID_GUIDELINE_IDS,
  adminAccuracyCtx,
  createAccuracyStack,
  searchWithRequest,
  seedHybridSearchRelevanceDataset,
  topEntityIds,
} from "@/tests/aurora/helpers/retrievalAccuracyFixtures";

describe("hybridSearchRelevance — wired retrieval accuracy", () => {
  it("ranks brand voice guidelines in the top 3 for a brand voice query through preflight and search", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await seedHybridSearchRelevanceDataset(repository);
    const stack = createAccuracyStack(repository);
    const ctx = adminAccuracyCtx();
    const query = "brand voice guidelines";

    const preflightResult = await stack.retrievalService.preflight(ctx, {
      taskType: "content_generation",
      query,
    });

    expect(preflightResult.contextPackage.entities.length).toBeGreaterThan(0);

    const ranked = await searchWithRequest(stack, ctx, {
      taskType: "content_generation",
      query,
    });

    const topThree = topEntityIds(ranked, 3);
    expect(topThree).toHaveLength(3);
    expect(new Set(topThree)).toEqual(new Set(HYBRID_GUIDELINE_IDS));
    expect(topThree.every((entityId) => HYBRID_GUIDELINE_IDS.includes(entityId as (typeof HYBRID_GUIDELINE_IDS)[number]))).toBe(
      true,
    );
  });
});
