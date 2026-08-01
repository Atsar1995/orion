import type { ComposedDashboardSection, DashboardComposition } from "@/lib/dashboard/DashboardComposer";
import { composeDashboard } from "@/lib/dashboard/DashboardComposer";
import { getExecutiveDashboardState } from "@/lib/data";

export type ExecutiveDashboardComposition = DashboardComposition & {
  readonly status: import("@/lib/data/types").DataStatus;
  readonly errors: readonly import("@/lib/data/types").DataError[];
  readonly sources: readonly string[];
  readonly lastUpdatedAt: string;
};

/** Loads provider-backed dashboard state and composes the EP-002 layout (Mission S1C). */
export async function composeExecutiveDashboard(): Promise<ExecutiveDashboardComposition> {
  const envelope = await getExecutiveDashboardState();

  if (!envelope.data) {
    return {
      status: envelope.status,
      errors: envelope.errors,
      sources: envelope.sources,
      lastUpdatedAt: envelope.freshness.lastUpdatedAt,
      state: {
        businessHealth: {
          score: 0,
          maxScore: 100,
          trend: "—",
          status: "attention",
          summary: "Dashboard data is unavailable.",
          drivers: [],
        },
        confidence: {
          score: 0,
          band: "low",
          summary: "Confidence unavailable.",
          factors: [],
        },
        morningBrief: {
          headline: "Dashboard unavailable",
          summary: envelope.errors[0]?.message ?? "Unable to load executive dashboard.",
          keyPoints: [],
          generatedAt: envelope.freshness.generatedAt,
          lifecycle: "stale",
        },
        alertCenter: {
          generatedAt: envelope.freshness.generatedAt,
          alerts: [],
          counts: {
            total: 0,
            active: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            information: 0,
            resolved: 0,
            escalated: 0,
          },
        },
        priorities: { items: [] },
        kpis: { items: [] },
        narrative: {
          title: "Executive Narrative",
          focusArea: "—",
          paragraphs: [],
        },
        recommendations: { items: [] },
        generatedAt: envelope.freshness.generatedAt,
        lastUpdatedAt: envelope.freshness.lastUpdatedAt,
        sourceProviders: [],
      },
      sections: [] as readonly ComposedDashboardSection[],
    };
  }

  const composition = composeDashboard({ state: envelope.data });

  return {
    ...composition,
    status: envelope.status,
    errors: envelope.errors,
    sources: envelope.sources,
    lastUpdatedAt: envelope.freshness.lastUpdatedAt,
  };
}
