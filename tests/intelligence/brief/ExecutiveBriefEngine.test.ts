import { describe, expect, it } from "vitest";
import { executiveBriefEngine } from "@/lib/intelligence/brief/ExecutiveBriefEngine";

describe("ExecutiveBriefEngine", () => {
  it("generates a daily executive brief from provider data", async () => {
    const brief = await executiveBriefEngine.generateDailyBrief();

    expect(brief.id).toMatch(/^brief-/);
    expect(brief.summary.headline).toBe("Daily Executive Brief");
    expect(brief.sections.length).toBeGreaterThan(0);
    expect(brief.topPriorities.length).toBeGreaterThan(0);
  });

  it("generates dashboard-compatible executive brief", async () => {
    const brief = await executiveBriefEngine.generateDashboardBrief();

    expect(brief.headline).toBeTruthy();
    expect(brief.body.length).toBeGreaterThan(20);
    expect(brief.generatedAt).toBeTruthy();
  });
});
