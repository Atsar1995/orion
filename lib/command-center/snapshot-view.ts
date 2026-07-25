import type { DashboardSnapshot, ExecutiveTask, Trend } from "@/types/intelligence";
import type { Alert } from "@/types/intelligence";

/** Presentation-only KPI row for the Command Center snapshot grid. */
export type CommandCenterKpi = {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  workspace?: string;
};

/** Activity timeline row derived from orchestrator snapshot fields. */
export type ActivityTimelineItem = {
  id: string;
  time: string;
  title: string;
  category: "sync" | "event" | "task" | "action";
};

function findTrend(snapshot: DashboardSnapshot, workspace: string): Trend | undefined {
  return snapshot.trends.find((trend) => trend.workspace === workspace);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Maps orchestrator metrics and trends to Command Center KPI labels — no business rules. */
export function buildCommandCenterKpis(snapshot: DashboardSnapshot): CommandCenterKpi[] {
  const { metrics, trends } = snapshot;
  const financeTrend = findTrend(snapshot, "Finance");
  const hospitalityTrend = findTrend(snapshot, "Hospitality");
  const commerceTrend = trends.find(
    (trend) => trend.workspace === "Commerce" || trend.label.toLowerCase().includes("order"),
  );

  return [
    {
      id: "revenue",
      label: "Revenue",
      value: metrics.revenue.value,
      change: metrics.revenue.change,
      trend: metrics.revenue.trend,
      workspace: metrics.revenue.workspace,
    },
    {
      id: "profit",
      label: "Profit",
      value: financeTrend?.currentValue ?? metrics.revenue.value,
      change: financeTrend
        ? `${financeTrend.currentValue} vs ${financeTrend.previousValue}`
        : metrics.revenue.change,
      trend: financeTrend?.direction ?? metrics.revenue.trend,
      workspace: "Finance",
    },
    {
      id: "occupancy",
      label: "Occupancy",
      value: metrics.occupancy.value,
      change: metrics.occupancy.change,
      trend: metrics.occupancy.trend,
      workspace: metrics.occupancy.workspace,
    },
    {
      id: "bookings",
      label: "Bookings",
      value: commerceTrend?.currentValue ?? hospitalityTrend?.currentValue ?? "—",
      change: commerceTrend?.period ?? hospitalityTrend?.period,
      trend: commerceTrend?.direction ?? hospitalityTrend?.direction ?? "neutral",
      workspace: "Hospitality",
    },
    {
      id: "sales",
      label: "Sales",
      value: metrics.customer.value,
      change: metrics.customer.change,
      trend: metrics.customer.trend,
      workspace: metrics.customer.workspace,
    },
    {
      id: "marketing",
      label: "Marketing",
      value: metrics.marketing.value,
      change: metrics.marketing.change,
      trend: metrics.marketing.trend,
      workspace: metrics.marketing.workspace,
    },
    {
      id: "cash-flow",
      label: "Cash Flow",
      value: financeTrend?.currentValue ?? metrics.revenue.value,
      change: metrics.revenue.change,
      trend: metrics.revenue.trend,
      workspace: "Finance",
    },
    {
      id: "customer-satisfaction",
      label: "Customer Satisfaction",
      value: metrics.customer.value,
      change: metrics.customer.change,
      trend: metrics.customer.trend,
      workspace: "CRM",
    },
  ];
}

export function buildPrioritiesFromTasks(tasks: ExecutiveTask[]): string[] {
  return tasks.filter((task) => !task.completed).map((task) => task.title);
}

export function buildCriticalChanges(snapshot: DashboardSnapshot): string[] {
  const alertMessages = snapshot.alertPanel.critical.map((alert) => alert.message);
  const trendShifts = snapshot.trends
    .filter((trend) => trend.direction === "down")
    .map((trend) => `${trend.label}: ${trend.currentValue} (${trend.period})`);

  return [...alertMessages, ...trendShifts].slice(0, 6);
}

export function buildActivityTimeline(snapshot: DashboardSnapshot): ActivityTimelineItem[] {
  const items: ActivityTimelineItem[] = [
    {
      id: "provider-sync",
      time: formatTime(snapshot.brief.generatedAt),
      title: "Provider synchronization complete · Intelligence Orchestrator",
      category: "sync",
    },
  ];

  for (const trend of snapshot.trends.slice(0, 3)) {
    items.push({
      id: `trend-${trend.id}`,
      time: formatTime(snapshot.brief.generatedAt),
      title: `${trend.label} · ${trend.workspace} · ${trend.currentValue}`,
      category: "event",
    });
  }

  for (const task of snapshot.tasks.slice(0, 4)) {
    items.push({
      id: `task-${task.id}`,
      time: formatTime(snapshot.brief.generatedAt),
      title: task.completed ? `Completed · ${task.title}` : task.title,
      category: task.completed ? "action" : "task",
    });
  }

  for (const recommendation of snapshot.recommendations.slice(0, 2)) {
    items.push({
      id: `rec-${recommendation.id}`,
      time: formatTime(snapshot.brief.generatedAt),
      title: `Recommendation · ${recommendation.title}`,
      category: "action",
    });
  }

  return items;
}

export function filterAlertsBySeverity(
  alerts: Alert[],
  severity: Alert["severity"],
): Alert[] {
  return alerts.filter((alert) => alert.severity === severity);
}

export function countPendingDecisions(snapshot: DashboardSnapshot): number {
  return snapshot.recommendations.length;
}

export function countActiveAlerts(snapshot: DashboardSnapshot): number {
  return snapshot.alertPanel.counts.active;
}
