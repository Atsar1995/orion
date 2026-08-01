import "@/lib/intelligence/register-executive-providers";

import type { BriefRepository } from "@/lib/executive/brief/BriefRepository";
import { IntelligenceBusBriefRepository } from "@/lib/executive/brief/BriefService";
import { mapIntelligenceBusToBriefView } from "@/lib/executive/brief/map-intelligence-bus-to-brief";
import { TtlCache } from "@/lib/data/cache/TtlCache";
import { dataProviderFailedError, dataUnknownError } from "@/lib/data/errors";
import { platformLogger } from "@/lib/data/logging/PlatformLogger";
import { mapSnapshotToDashboardState } from "@/lib/data/mappers/map-snapshot-to-dashboard-state";
import type { DashboardState } from "@/lib/dashboard/DashboardState";
import { getDashboardSnapshot } from "@/lib/orchestrator/Orchestrator";
import type {
  DataEnvelope,
  DataFreshness,
  ExecutiveInsightRecord,
} from "@/lib/data/types";
import type { BriefView } from "@/types/executive";
import type { DashboardSnapshot } from "@/types/intelligence";

const BRIEF_CACHE_TTL_MS = 60_000;
const DASHBOARD_CACHE_TTL_MS = 60_000;

function envelopeFreshnessIsStale(generatedAt: string): boolean {
  const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(generatedAt).getTime()) / 1000));
  return ageSeconds > BRIEF_CACHE_TTL_MS / 1000;
}

function buildFreshness(generatedAt: string, ttlSeconds: number, sourceCount: number): DataFreshness {
  const generatedMs = new Date(generatedAt).getTime();
  const ageSeconds = Math.max(0, Math.floor((Date.now() - generatedMs) / 1000));

  return {
    generatedAt,
    lastUpdatedAt: generatedAt,
    ttlSeconds,
    isStale: ageSeconds > ttlSeconds,
    sourceCount,
  };
}

function mapRecommendationToInsight(
  recommendation: BriefView["recommendations"][number],
): ExecutiveInsightRecord {
  return {
    id: recommendation.id,
    title: recommendation.title,
    content: recommendation.description,
    source: recommendation.evidence[0]?.source ?? "Platform Intelligence",
    confidence: recommendation.confidence.value,
    confidenceLabel: recommendation.confidence.label,
    businessImpact: recommendation.impact,
    evidence: recommendation.evidence.map((item) => item.label),
    generatedAt: new Date().toISOString(),
    workspace: recommendation.category,
  };
}

/** Unified Executive Intelligence Engine — shared data entry for brief and dashboard (Mission S1C). */
export class ExecutiveIntelligenceEngine {
  private readonly briefCache = new TtlCache<BriefView>(BRIEF_CACHE_TTL_MS);
  private readonly dashboardCache = new TtlCache<DashboardSnapshot>(DASHBOARD_CACHE_TTL_MS);

  constructor(private readonly briefRepository: BriefRepository = new IntelligenceBusBriefRepository()) {}

  async getMorningBriefEnvelope(executiveName?: string): Promise<DataEnvelope<BriefView>> {
    const cacheKey = executiveName ? `brief:${executiveName}` : "brief:default";
    const cached = this.briefCache.get(cacheKey);
    const errors: ReturnType<typeof dataProviderFailedError>[] = [];

    try {
      const brief =
        cached ??
        (executiveName
          ? mapIntelligenceBusToBriefView(executiveName)
          : await this.briefRepository.getBriefView());

      if (!cached) {
        this.briefCache.set(cacheKey, brief);
      }

      const sources = brief.aiSummary.sources;
      const lifecycle = errors.length > 0 ? "incomplete" : envelopeFreshnessIsStale(brief.generatedAt) ? "stale" : brief.lifecycle;

      return {
        status: brief.recommendations.length === 0 && brief.criticalAlerts.length === 0 ? "empty" : "ready",
        data: {
          ...brief,
          lifecycle,
        },
        freshness: buildFreshness(brief.generatedAt, BRIEF_CACHE_TTL_MS / 1000, sources.length),
        sources,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Brief generation failed.";
      platformLogger.serviceFailure(message, "ExecutiveIntelligenceEngine.getMorningBriefEnvelope");
      errors.push(dataProviderFailedError("brief", message));

      return {
        status: "error",
        data: null,
        freshness: buildFreshness(new Date().toISOString(), BRIEF_CACHE_TTL_MS / 1000, 0),
        sources: [],
        errors,
      };
    }
  }

  async getDashboardEnvelope(): Promise<DataEnvelope<DashboardState>> {
    const errors: ReturnType<typeof dataProviderFailedError>[] = [];

    try {
      const cached = this.dashboardCache.get("dashboard");
      const snapshot = cached ?? (await getDashboardSnapshot());

      if (!cached) {
        this.dashboardCache.set("dashboard", snapshot);
      }

      const state = mapSnapshotToDashboardState(snapshot);
      platformLogger.dataEvent("Dashboard snapshot composed", "ExecutiveIntelligenceEngine", {
        providers: String(state.sourceProviders.length),
      });

      return {
        status: state.recommendations.items.length === 0 ? "empty" : "ready",
        data: state,
        freshness: buildFreshness(state.generatedAt, DASHBOARD_CACHE_TTL_MS / 1000, state.sourceProviders.length),
        sources: [...state.sourceProviders],
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dashboard generation failed.";
      platformLogger.serviceFailure(message, "ExecutiveIntelligenceEngine.getDashboardEnvelope");
      errors.push(dataUnknownError(message, "dashboard"));

      return {
        status: "error",
        data: null,
        freshness: buildFreshness(new Date().toISOString(), DASHBOARD_CACHE_TTL_MS / 1000, 0),
        sources: [],
        errors,
      };
    }
  }

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    const cached = this.dashboardCache.get("dashboard");

    if (cached) {
      return cached;
    }

    const snapshot = await getDashboardSnapshot();
    this.dashboardCache.set("dashboard", snapshot);
    return snapshot;
  }

  async getExecutiveInsights(): Promise<ExecutiveInsightRecord[]> {
    const envelope = await this.getMorningBriefEnvelope();

    if (!envelope.data) {
      return [];
    }

    return envelope.data.recommendations.map(mapRecommendationToInsight);
  }

  invalidateCache(): void {
    this.briefCache.clear();
    this.dashboardCache.clear();
    platformLogger.dataEvent("Executive intelligence cache cleared", "ExecutiveIntelligenceEngine");
  }
}

export const executiveIntelligenceEngine = new ExecutiveIntelligenceEngine();

export async function getExecutiveMorningBrief(executiveName?: string): Promise<DataEnvelope<BriefView>> {
  return executiveIntelligenceEngine.getMorningBriefEnvelope(executiveName);
}

export async function getExecutiveDashboardState(): Promise<DataEnvelope<DashboardState>> {
  return executiveIntelligenceEngine.getDashboardEnvelope();
}
