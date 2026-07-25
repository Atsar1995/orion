import { describe, expect, it } from "vitest";
import { formatDailyBrief, toDashboardBrief } from "@/lib/intelligence/brief/ExecutiveBriefFormatter";
import { DEFAULT_BRIEF_TEMPLATE } from "@/lib/intelligence/brief/ExecutiveBriefTemplates";
import type { ExecutiveAction, ExecutiveInsight } from "@/types/brief";

describe("ExecutiveBriefFormatter", () => {
  const generatedAt = "2026-07-25T10:00:00.000Z";
  const scheduledFor = "2026-07-25T00:00:00.000Z";

  const insights: ExecutiveInsight[] = [
    {
      id: "summary",
      title: "Platform Health",
      content: "Score is stable.",
      category: "executive-summary",
      priority: "high",
      source: "platform",
      impactScore: 350,
    },
    {
      id: "issue",
      title: "Guest complaint",
      content: "Room 305 requires response.",
      category: "critical-issues",
      priority: "critical",
      severity: "critical",
      source: "hospitality",
      impactScore: 480,
    },
  ];

  const actions: ExecutiveAction[] = [
    {
      id: "action-1",
      label: "Respond to guest",
      description: "Assign duty manager",
      priority: "critical",
    },
  ];

  it("formats a structured daily executive brief", () => {
    const brief = formatDailyBrief({
      insights,
      actions,
      template: DEFAULT_BRIEF_TEMPLATE,
      generatedAt,
      scheduledFor,
      healthScore: 80,
      healthStatus: "attention",
    });

    expect(brief.templateId).toBe(DEFAULT_BRIEF_TEMPLATE.id);
    expect(brief.summary.headline).toBe("Daily Executive Brief");
    expect(brief.summary.healthScore).toBe(80);
    expect(brief.sections.length).toBe(DEFAULT_BRIEF_TEMPLATE.sections.length);
    expect(brief.topPriorities[0]?.priority).toBe("critical");
    expect(brief.recommendedActions).toHaveLength(1);
  });

  it("maps daily brief to dashboard executive brief", () => {
    const daily = formatDailyBrief({
      insights,
      actions,
      template: DEFAULT_BRIEF_TEMPLATE,
      generatedAt,
      scheduledFor,
    });

    const dashboardBrief = toDashboardBrief(daily);

    expect(dashboardBrief.headline).toBe("Daily Executive Brief");
    expect(dashboardBrief.body).toContain("Score is stable.");
    expect(dashboardBrief.body).toContain("critical issue");
    expect(dashboardBrief.generatedAt).toBe(generatedAt);
  });
});
