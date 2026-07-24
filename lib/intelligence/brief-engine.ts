import type {
  ExecutiveBriefOutput,
  ExecutiveBriefSnapshot,
  PlatformHealthSnapshot,
  RecommendationBundle,
  WorkspaceBriefContribution,
  WorkspaceSummary,
} from "@/lib/intelligence/engine-models";
import type { BriefEngine } from "@/lib/intelligence/engine-interfaces";
import { healthEngine } from "@/lib/intelligence/health-engine";
import { recommendationEngine } from "@/lib/intelligence/recommendation-engine";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";

type BuildWorkspaceBriefInput = {
  workspaceId: string;
  workspaceLabel: string;
  healthScore: WorkspaceBriefContribution["healthScore"];
  briefingLine: string;
  topPriorities: WorkspaceBriefContribution["topPriorities"];
  criticalAlerts: WorkspaceBriefContribution["criticalAlerts"];
  weeklySummary: string;
  executiveNotes: string;
  recommendedAction: WorkspaceBriefContribution["recommendedAction"];
};

/** Builds workspace summaries from provider executive summaries. */
export function aggregateWorkspaceSummaries(
  providers: RegisteredExecutiveProvider[],
): WorkspaceSummary[] {
  return providers.map((provider) => {
    const summary = provider.getExecutiveSummary();

    return {
      workspaceId: provider.id,
      workspaceLabel: provider.workspace,
      headline: summary.headline,
      body: summary.body,
      status: summary.status,
      briefingLine: provider.getBriefingLine(),
    };
  });
}

/** Produces the platform Executive Brief snapshot from engine outputs. */
export function prepareExecutiveBrief(
  providers: RegisteredExecutiveProvider[],
  health: PlatformHealthSnapshot,
  recommendations: RecommendationBundle,
  summaries: WorkspaceSummary[],
): ExecutiveBriefSnapshot {
  const primarySummary = summaries[0];
  const topRecommendation = recommendations.recommendations[0];
  const topPriority = recommendations.priorities[0];

  return {
    platformHealth: health,
    topPriorities: recommendations.priorities,
    criticalAlerts: recommendations.criticalAlerts,
    executiveRecommendations: recommendations.recommendations,
    workspaceSummaries: summaries,
    briefingLine: providers.map((provider) => provider.getBriefingLine()).join(" "),
    recommendedAction: topRecommendation
      ? {
          title: topRecommendation.title,
          description: topRecommendation.description,
        }
      : topPriority
        ? { title: topPriority.title, description: topPriority.description }
        : { title: "", description: "" },
    weeklySummary: primarySummary?.body ?? "",
    executiveNotes: summaries.map((item) => item.headline).join(" · "),
  };
}

/** Default Brief Engine implementation (Mission 17B). */
export const briefEngine: BriefEngine = {
  prepare: prepareExecutiveBrief,
};

/** Builds a workspace contribution for legacy brief aggregation. */
export function buildWorkspaceBriefContribution(
  input: BuildWorkspaceBriefInput,
): WorkspaceBriefContribution {
  return {
    workspaceId: input.workspaceId,
    workspaceLabel: input.workspaceLabel,
    briefingLine: input.briefingLine,
    healthScore: input.healthScore,
    topPriorities: input.topPriorities,
    criticalAlerts: input.criticalAlerts,
    weeklySummary: input.weeklySummary,
    executiveNotes: input.executiveNotes,
    recommendedAction: input.recommendedAction,
  };
}

/** Maps ExecutiveBriefSnapshot to legacy ExecutiveBriefOutput. */
export function toExecutiveBriefOutput(snapshot: ExecutiveBriefSnapshot): ExecutiveBriefOutput {
  return {
    briefingLine: snapshot.briefingLine,
    topPriorities: snapshot.topPriorities,
    criticalAlerts: snapshot.criticalAlerts,
    weeklySummary: snapshot.weeklySummary,
    executiveNotes: snapshot.executiveNotes,
    recommendedAction: snapshot.recommendedAction,
  };
}

/** Aggregates workspace contributions into legacy Executive Brief output. */
export function aggregateExecutiveBrief(
  contributions: WorkspaceBriefContribution[],
): ExecutiveBriefOutput {
  const providers: RegisteredExecutiveProvider[] = contributions.map((contribution) => ({
    id: contribution.workspaceId,
    workspace: contribution.workspaceLabel,
    version: "1.0.0",
    getHealth: () => contribution.healthScore,
    getAlerts: () => contribution.criticalAlerts,
    getRecommendations: () => [],
    getExecutiveSummary: () => ({
      headline: contribution.executiveNotes,
      body: contribution.weeklySummary,
      status: contribution.healthScore.status,
    }),
    getMetrics: () => [],
    getRisks: () => [],
    getPriorities: () => contribution.topPriorities,
    getBriefingLine: () => contribution.briefingLine,
    getBriefCardSnapshot: () => null,
  }));

  const summaries: WorkspaceSummary[] = contributions.map((contribution) => ({
    workspaceId: contribution.workspaceId,
    workspaceLabel: contribution.workspaceLabel,
    headline: contribution.executiveNotes,
    body: contribution.weeklySummary,
    status: contribution.healthScore.status,
    briefingLine: contribution.briefingLine,
  }));

  const health = healthEngine.aggregate(providers);
  const recommendations = recommendationEngine.aggregate(providers);

  return toExecutiveBriefOutput(
    prepareExecutiveBrief(providers, health, recommendations, summaries),
  );
}
