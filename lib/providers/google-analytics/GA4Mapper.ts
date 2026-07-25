import type { ProviderDashboardContribution } from "@/types/providers";
import type {
  GA4CoreMetrics,
  GA4MetricsSnapshot,
  GA4PeriodComparison,
} from "@/types/google-analytics";
import type {
  Alert,
  BusinessHealthDriver,
  ExecutiveMetric,
  IntelligenceHealthStatus,
  IntelligenceTrendDirection,
  Recommendation,
  Trend,
} from "@/types/intelligence";

const PROVIDER_ID = "google-analytics";
const WORKSPACE = "Marketing";

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return Math.round(value).toLocaleString("en-US");
}

function formatCurrency(value: number): string {
  if (value <= 0) {
    return "₹0";
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return "0s";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function formatDelta(current: number, previous: number, suffix = ""): string {
  const delta = percentChange(current, previous);
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}${suffix}`;
}

function trendDirection(current: number, previous: number): IntelligenceTrendDirection {
  if (current > previous) {
    return "up";
  }

  if (current < previous) {
    return "down";
  }

  return "neutral";
}

function deriveMarketingHealth(comparison: GA4PeriodComparison): BusinessHealthDriver {
  const { current, previous } = comparison;
  let status: IntelligenceHealthStatus = "healthy";

  if (current.bounceRate > 0.65 || current.engagementRate < 0.35) {
    status = "critical";
  } else if (
    current.bounceRate > 0.55 ||
    current.engagementRate < 0.45 ||
    percentChange(current.sessions, previous.sessions) < -10
  ) {
    status = "attention";
  }

  return { label: "Marketing", status };
}

function buildExecutiveMetric(comparison: GA4PeriodComparison): ExecutiveMetric {
  const { current, previous } = comparison;

  return {
    id: "metric-marketing-ga4",
    label: "Marketing Metrics",
    value: `${formatCount(current.sessions)} sessions`,
    change: formatDelta(current.sessions, previous.sessions, "%"),
    trend: trendDirection(current.sessions, previous.sessions),
    workspace: WORKSPACE,
  };
}

function buildTrends(comparison: GA4PeriodComparison): Trend[] {
  const { current, previous, periodLabel } = comparison;

  return [
    {
      id: "trend-ga4-sessions",
      label: "Sessions",
      currentValue: formatCount(current.sessions),
      previousValue: formatCount(previous.sessions),
      direction: trendDirection(current.sessions, previous.sessions),
      period: periodLabel,
      workspace: WORKSPACE,
    },
    {
      id: "trend-ga4-users",
      label: "Users",
      currentValue: formatCount(current.users),
      previousValue: formatCount(previous.users),
      direction: trendDirection(current.users, previous.users),
      period: periodLabel,
      workspace: WORKSPACE,
    },
    {
      id: "trend-ga4-conversions",
      label: "Conversions",
      currentValue: formatCount(current.conversions),
      previousValue: formatCount(previous.conversions),
      direction: trendDirection(current.conversions, previous.conversions),
      period: periodLabel,
      workspace: WORKSPACE,
    },
    {
      id: "trend-ga4-revenue",
      label: "Revenue",
      currentValue: formatCurrency(current.revenue),
      previousValue: formatCurrency(previous.revenue),
      direction: trendDirection(current.revenue, previous.revenue),
      period: periodLabel,
      workspace: WORKSPACE,
    },
    {
      id: "trend-ga4-engagement",
      label: "Engagement Rate",
      currentValue: formatPercent(current.engagementRate),
      previousValue: formatPercent(previous.engagementRate),
      direction: trendDirection(current.engagementRate, previous.engagementRate),
      period: periodLabel,
      workspace: WORKSPACE,
    },
  ];
}

function buildRecommendations(snapshot: GA4MetricsSnapshot): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { current, previous } = snapshot.comparison;

  if (percentChange(current.sessions, previous.sessions) < -8) {
    recommendations.push({
      id: "rec-ga4-traffic-decline",
      priority: 2,
      title: "Investigate traffic decline",
      description: `Sessions fell ${formatDelta(current.sessions, previous.sessions, "%")} week-over-week. Review top traffic sources and campaign changes.`,
      category: "risk",
    });
  }

  if (current.bounceRate > 0.55) {
    const topLanding = snapshot.landingPages[0];
    recommendations.push({
      id: "rec-ga4-bounce-rate",
      priority: 1,
      title: "Reduce landing page bounce rate",
      description: topLanding
        ? `Bounce rate is ${formatPercent(current.bounceRate)}. Top landing page "${topLanding.path}" has ${formatPercent(topLanding.bounceRate)} bounce.`
        : `Bounce rate is elevated at ${formatPercent(current.bounceRate)}.`,
      category: "growth",
    });
  }

  const topCampaign = snapshot.campaigns.find((campaign) => campaign.sessions > 0);
  if (topCampaign && topCampaign.conversions === 0 && topCampaign.sessions > 50) {
    recommendations.push({
      id: "rec-ga4-campaign-conversion",
      priority: 3,
      title: "Optimize underperforming campaign",
      description: `Campaign "${topCampaign.campaign}" drove ${formatCount(topCampaign.sessions)} sessions with zero conversions.`,
      category: "growth",
    });
  }

  if (percentChange(current.conversions, previous.conversions) > 10) {
    recommendations.push({
      id: "rec-ga4-conversion-growth",
      priority: 4,
      title: "Scale winning conversion paths",
      description: `Conversions increased ${formatDelta(current.conversions, previous.conversions, "%")}. Consider increasing budget on top-performing channels.`,
      category: "executive",
    });
  }

  return recommendations.slice(0, 4);
}

function buildAlerts(snapshot: GA4MetricsSnapshot): Alert[] {
  const alerts: Alert[] = [];
  const { current, previous } = snapshot.comparison;

  if (current.bounceRate > 0.65) {
    alerts.push({
      id: "alert-ga4-bounce-critical",
      severity: "critical",
      message: `Bounce rate critical at ${formatPercent(current.bounceRate)}`,
      category: "risk",
    });
  } else if (current.bounceRate > 0.55) {
    alerts.push({
      id: "alert-ga4-bounce-attention",
      severity: "attention",
      message: `Bounce rate elevated at ${formatPercent(current.bounceRate)}`,
      category: "risk",
    });
  }

  if (percentChange(current.sessions, previous.sessions) < -15) {
    alerts.push({
      id: "alert-ga4-traffic-drop",
      severity: "attention",
      message: `Sessions dropped ${formatDelta(current.sessions, previous.sessions, "%")} vs prior period`,
      category: "operational",
    });
  }

  if (current.revenue > 0 && percentChange(current.revenue, previous.revenue) < -20) {
    alerts.push({
      id: "alert-ga4-revenue-drop",
      severity: "critical",
      message: `GA4 revenue declined ${formatDelta(current.revenue, previous.revenue, "%")}`,
      category: "risk",
    });
  }

  return alerts;
}

function buildBriefSegments(snapshot: GA4MetricsSnapshot): string[] {
  const { current, previous } = snapshot.comparison;
  const segments: string[] = [];

  segments.push(
    `GA4 reports ${formatCount(current.sessions)} sessions (${formatDelta(current.sessions, previous.sessions, "%")}) with ${formatCount(current.activeUsers)} active users.`,
  );

  segments.push(
    `Engagement rate is ${formatPercent(current.engagementRate)} with average session duration ${formatDuration(current.averageEngagementTime)}.`,
  );

  if (current.revenue > 0) {
    segments.push(
      `E-commerce revenue ${formatCurrency(current.revenue)} from ${formatCount(current.transactions)} transactions.`,
    );
  }

  const topSource = snapshot.trafficSources[0];
  if (topSource) {
    segments.push(
      `Top traffic source: ${topSource.source}/${topSource.medium} (${formatCount(topSource.sessions)} sessions).`,
    );
  }

  return segments;
}

/** Maps GA4 metrics snapshot into ORION dashboard contribution models. */
export function mapGA4SnapshotToContribution(
  snapshot: GA4MetricsSnapshot,
): ProviderDashboardContribution {
  return {
    providerId: PROVIDER_ID,
    workspace: WORKSPACE,
    metric: buildExecutiveMetric(snapshot.comparison),
    healthDriver: deriveMarketingHealth(snapshot.comparison),
    recommendations: buildRecommendations(snapshot),
    alerts: buildAlerts(snapshot),
    trends: buildTrends(snapshot.comparison),
    briefSegments: buildBriefSegments(snapshot),
  };
}

/** Exposes raw GA4 core metrics for diagnostics and future engines. */
export function extractGA4CoreMetrics(comparison: GA4PeriodComparison): {
  current: GA4CoreMetrics;
  previous: GA4CoreMetrics;
} {
  return {
    current: comparison.current,
    previous: comparison.previous,
  };
}
