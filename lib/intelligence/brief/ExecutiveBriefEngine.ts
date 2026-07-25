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
import { aggregateBusinessHealth } from "@/lib/intelligence/shared/provider-aggregation";
import { fetchProviderContributions } from "@/lib/providers/provider-data";
import type { ProviderDashboardContribution } from "@/types/providers";
import type { DailyExecutiveBrief } from "@/types/brief";
import type { ExecutiveBrief } from "@/types/intelligence";

/**
 * Executive Brief Engine (ES-028 · Sprint 4).
 *
 * Collects provider data, aggregates insights, prioritizes by impact,
 * and produces a structured Daily Executive Brief — no UI formatting.
 */
export class ExecutiveBriefEngine {
  generateDailyBriefFromContributions(
    contributions: ProviderDashboardContribution[],
    templateId = DEFAULT_BRIEF_TEMPLATE.id,
  ): DailyExecutiveBrief {
    const health = aggregateBusinessHealth(contributions);
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

  async generateDailyBrief(
    templateId = DEFAULT_BRIEF_TEMPLATE.id,
    contributions?: ProviderDashboardContribution[],
  ): Promise<DailyExecutiveBrief> {
    const resolvedContributions =
      contributions ?? (await fetchProviderContributions());

    return this.generateDailyBriefFromContributions(resolvedContributions, templateId);
  }

  generateDashboardBriefFromContributions(
    contributions: ProviderDashboardContribution[],
    templateId?: string,
  ): ExecutiveBrief {
    const dailyBrief = this.generateDailyBriefFromContributions(
      contributions,
      templateId ?? DEFAULT_BRIEF_TEMPLATE.id,
    );

    return executiveBriefFormatter.toDashboardBrief(dailyBrief);
  }

  async generateDashboardBrief(
    templateId?: string,
    contributions?: ProviderDashboardContribution[],
  ): Promise<ExecutiveBrief> {
    const dailyBrief = await this.generateDailyBrief(templateId, contributions);
    return executiveBriefFormatter.toDashboardBrief(dailyBrief);
  }
}

export const executiveBriefEngine = new ExecutiveBriefEngine();

export async function buildDailyExecutiveBrief(
  templateId?: string,
  contributions?: ProviderDashboardContribution[],
): Promise<DailyExecutiveBrief> {
  return executiveBriefEngine.generateDailyBrief(templateId, contributions);
}

export async function buildExecutiveBriefForDashboard(
  templateId?: string,
  contributions?: ProviderDashboardContribution[],
): Promise<ExecutiveBrief> {
  if (contributions) {
    return executiveBriefEngine.generateDashboardBriefFromContributions(
      contributions,
      templateId,
    );
  }

  return executiveBriefEngine.generateDashboardBrief(templateId);
}
