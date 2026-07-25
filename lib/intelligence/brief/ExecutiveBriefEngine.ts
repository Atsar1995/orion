import { collectInsights } from "@/lib/intelligence/brief/ExecutiveBriefAggregator";
import { executiveBriefFormatter } from "@/lib/intelligence/brief/ExecutiveBriefFormatter";
import {
  deduplicateInsights,
  rankByImpact,
} from "@/lib/intelligence/brief/ExecutiveBriefPrioritizer";
import { getBriefScheduleContext } from "@/lib/intelligence/brief/ExecutiveBriefScheduler";
import {
  DEFAULT_BRIEF_TEMPLATE,
  getBriefTemplate,
} from "@/lib/intelligence/brief/ExecutiveBriefTemplates";
import {
  fetchProviderContributions,
} from "@/lib/providers/dashboard-aggregator";
import type { DailyExecutiveBrief } from "@/types/brief";
import type { BusinessHealth, ExecutiveBrief } from "@/types/intelligence";

function aggregateBusinessHealthFromContributions(
  contributions: Awaited<ReturnType<typeof fetchProviderContributions>>,
): BusinessHealth {
  const drivers = contributions
    .map((item) => item.healthDriver)
    .filter((driver): driver is NonNullable<typeof driver> => Boolean(driver));

  const healthyCount = drivers.filter((driver) => driver.status === "healthy").length;
  const score = drivers.length ? Math.round((healthyCount / drivers.length) * 100) : 0;
  const status =
    score >= 85 ? "healthy" : score >= 65 ? ("attention" as const) : ("critical" as const);

  return {
    score,
    maxScore: 100,
    trend: "+3",
    status,
    summary: "Platform health aggregated from registered workspace providers.",
    drivers,
  };
}

/**
 * Executive Brief Engine (ES-028 · Sprint 4).
 *
 * Collects provider data, aggregates insights, prioritizes by impact,
 * and produces a structured Daily Executive Brief — no UI formatting.
 */
export class ExecutiveBriefEngine {
  async generateDailyBrief(templateId = DEFAULT_BRIEF_TEMPLATE.id): Promise<DailyExecutiveBrief> {
    const contributions = await fetchProviderContributions();
    const health = aggregateBusinessHealthFromContributions(contributions);
    const schedule = getBriefScheduleContext();
    const template = getBriefTemplate(templateId);

    const { insights, actions } = collectInsights(contributions, health);
    const deduped = deduplicateInsights(insights);
    const ranked = rankByImpact(deduped);

    return executiveBriefFormatter.formatDailyBrief({
      insights: ranked,
      actions,
      template,
      scheduledFor: schedule.scheduledFor,
      generatedAt: schedule.generatedAt,
      healthScore: health.score,
      healthStatus: health.status,
    });
  }

  async generateDashboardBrief(templateId?: string): Promise<ExecutiveBrief> {
    const dailyBrief = await this.generateDailyBrief(templateId);
    return executiveBriefFormatter.toDashboardBrief(dailyBrief);
  }
}

export const executiveBriefEngine = new ExecutiveBriefEngine();

export async function buildDailyExecutiveBrief(
  templateId?: string,
): Promise<DailyExecutiveBrief> {
  return executiveBriefEngine.generateDailyBrief(templateId);
}

export async function buildExecutiveBriefForDashboard(
  templateId?: string,
): Promise<ExecutiveBrief> {
  return executiveBriefEngine.generateDashboardBrief(templateId);
}
