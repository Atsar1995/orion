import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import { describe, expect, it } from "vitest";
import {
  NON_ROAS_CAMPAIGN_IDS,
  ROAS_CAMPAIGN_IDS,
  adminAccuracyCtx,
  createAccuracyStack,
  searchWithRequest,
  seedKeywordExactMatchDataset,
} from "@/tests/aurora/helpers/retrievalAccuracyFixtures";

describe("keywordExactMatch — wired retrieval accuracy", () => {
  it("ranks ROAS campaign entities above non-ROAS campaigns for an exact ROAS query", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await seedKeywordExactMatchDataset(repository);
    const stack = createAccuracyStack(repository);
    const ctx = adminAccuracyCtx();

    const ranked = await searchWithRequest(stack, ctx, {
      taskType: "analytics_report",
      query: "ROAS",
    });

    const rankedIds = ranked.map((entry) => entry.entity.id);
    const roasPositions = ROAS_CAMPAIGN_IDS.map((id) => rankedIds.indexOf(id)).filter((index) => index >= 0);
    const nonRoasPositions = NON_ROAS_CAMPAIGN_IDS.map((id) => rankedIds.indexOf(id)).filter((index) => index >= 0);

    expect(roasPositions).toHaveLength(ROAS_CAMPAIGN_IDS.length);
    expect(nonRoasPositions).toHaveLength(NON_ROAS_CAMPAIGN_IDS.length);

    const bestRoasPosition = Math.min(...roasPositions);
    const worstNonRoasPosition = Math.max(...nonRoasPositions);
    expect(bestRoasPosition).toBeLessThan(worstNonRoasPosition);
  });
});
