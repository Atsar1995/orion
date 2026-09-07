import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import { describe, expect, it } from "vitest";
import {
  adminAccuracyCtx,
  createAccuracyStack,
  searchWithRequest,
  seedCampaignProductGraph,
} from "@/tests/aurora/helpers/retrievalAccuracyFixtures";

const GRAPH_RETRIEVAL_QUERY = "campaign product performance";
const GRAPH_RETRIEVAL_DOMAINS = ["knowledge.campaign", "knowledge.product"] as const;

describe("graphTraversal — wired retrieval accuracy", () => {
  it("returns the linked product within ranked retrieval output when campaignId anchors graph traversal", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const { campaignId, productId } = await seedCampaignProductGraph(repository);
    const stack = createAccuracyStack(repository);
    const ctx = adminAccuracyCtx();

    const preflightResult = await stack.retrievalService.preflight(ctx, {
      taskType: "ad_campaign",
      query: GRAPH_RETRIEVAL_QUERY,
      campaignId,
      domains: [...GRAPH_RETRIEVAL_DOMAINS],
    });

    const returnedIds = preflightResult.contextPackage.entities.map((entity) => entity.id);
    expect(returnedIds).toContain(productId);

    const ranked = await searchWithRequest(stack, ctx, {
      taskType: "ad_campaign",
      query: GRAPH_RETRIEVAL_QUERY,
      campaignId,
      domains: [...GRAPH_RETRIEVAL_DOMAINS],
    });

    expect(ranked.some((entry) => entry.entity.id === productId)).toBe(true);
    expect(ranked.some((entry) => entry.entity.id === campaignId)).toBe(true);
  });
});
