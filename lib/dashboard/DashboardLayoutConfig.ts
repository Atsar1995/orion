import type { DashboardWidgetId } from "@/lib/dashboard/DashboardState";

/** Grid span for a dashboard widget placement. */
export type DashboardWidgetSpan = "full" | "half" | "third";

/** Widget placement within a dashboard section. */
export type DashboardWidgetPlacement = {
  readonly id: DashboardWidgetId;
  readonly order: number;
  readonly span?: DashboardWidgetSpan;
  readonly variant?: "default" | "premium";
};

/** Section configuration for the executive dashboard layout. */
export type DashboardSectionConfig = {
  readonly id: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly columns?: 1 | 2 | 3 | 4;
  readonly widgets: readonly DashboardWidgetPlacement[];
};

/** Default EP-002 executive dashboard layout — configuration only. */
export const DEFAULT_DASHBOARD_LAYOUT: readonly DashboardSectionConfig[] = [
  {
    id: "overview",
    title: "Platform Overview",
    subtitle: "Deterministic EP-002 snapshot — mock data only",
    columns: 3,
    widgets: [
      { id: "business-health", order: 1, span: "third" },
      { id: "confidence", order: 2, span: "third" },
      { id: "kpi-highlights", order: 3, span: "third" },
    ],
  },
  {
    id: "brief",
    title: "Morning Executive Brief",
    subtitle: "Decision-ready orientation for the executive day",
    columns: 1,
    widgets: [{ id: "morning-brief", order: 1, span: "full", variant: "premium" }],
  },
  {
    id: "intelligence",
    title: "Executive Intelligence",
    columns: 2,
    widgets: [
      { id: "executive-narrative", order: 1, span: "half" },
      { id: "recommendation-preview", order: 2, span: "half" },
    ],
  },
  {
    id: "alert-center",
    title: "Executive Alert Center",
    subtitle: "Centralized notifications and executive alerts — deterministic mock snapshot",
    columns: 1,
    widgets: [{ id: "alert-center", order: 1, span: "full" }],
  },
  {
    id: "action",
    title: "Today's Priorities",
    columns: 1,
    widgets: [{ id: "priorities", order: 1, span: "full" }],
  },
] as const;
