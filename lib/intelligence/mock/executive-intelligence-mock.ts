import type {
  Alert,
  BusinessHealth,
  ExecutiveBrief,
  ExecutiveMetricsBundle,
  ExecutiveTask,
  Recommendation,
  Trend,
} from "@/types/intelligence";

const MOCK_GENERATED_AT = "2026-07-25T08:00:00.000Z";

export const MOCK_BUSINESS_HEALTH: BusinessHealth = {
  score: 88,
  maxScore: 100,
  trend: "+3",
  status: "healthy",
  summary: "Platform health is strong across finance, CRM, and hospitality.",
  drivers: [
    { label: "Finance", status: "healthy" },
    { label: "CRM", status: "healthy" },
    { label: "Hospitality", status: "attention" },
    { label: "Marketing", status: "healthy" },
  ],
};

export const MOCK_EXECUTIVE_METRICS: ExecutiveMetricsBundle = {
  revenue: {
    id: "metric-revenue",
    label: "Revenue",
    value: "₹42.8L",
    change: "+8.2%",
    trend: "up",
    workspace: "Finance",
  },
  occupancy: {
    id: "metric-occupancy",
    label: "Occupancy",
    value: "84%",
    change: "+6 pts",
    trend: "up",
    workspace: "Hospitality",
  },
  customer: {
    id: "metric-customer",
    label: "Customer Metrics",
    value: "312 active",
    change: "+14",
    trend: "up",
    workspace: "CRM",
  },
  marketing: {
    id: "metric-marketing",
    label: "Marketing Metrics",
    value: "4.2× ROAS",
    change: "-0.3",
    trend: "down",
    workspace: "Marketing",
  },
};

export const MOCK_EXECUTIVE_BRIEF: ExecutiveBrief = {
  headline: "Executive Brief",
  body:
    "Business performance remains healthy across finance and CRM. Hospitality occupancy is trending above target ahead of the weekend. Marketing ROAS dipped slightly — campaign review recommended. Two operational alerts require attention before noon.",
  generatedAt: MOCK_GENERATED_AT,
};

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    priority: 1,
    title: "Increase weekend room rates",
    description: "Demand exceeds forecast with limited premium inventory.",
    category: "executive",
  },
  {
    id: "rec-2",
    priority: 2,
    title: "Resolve guest complaint before VIP check-in",
    description: "Room 305 issue threatens satisfaction and review score.",
    category: "risk",
  },
  {
    id: "rec-3",
    priority: 3,
    title: "Refresh underperforming ad creative",
    description: "Meta campaign CTR declined 12% week-over-week.",
    category: "growth",
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-1",
    severity: "critical",
    message: "Guest complaint awaiting response — Room 305",
    category: "operational",
  },
  {
    id: "alert-2",
    severity: "attention",
    message: "Supplier payment overdue — housekeeping linens",
    category: "follow-up",
  },
  {
    id: "alert-3",
    severity: "attention",
    message: "Weekday occupancy below target for Tuesday arrivals",
    category: "risk",
  },
];

export const MOCK_TRENDS: Trend[] = [
  {
    id: "trend-revenue",
    label: "Revenue",
    currentValue: "₹42.8L",
    previousValue: "₹39.6L",
    direction: "up",
    period: "7d",
    workspace: "Finance",
  },
  {
    id: "trend-occupancy",
    label: "Occupancy",
    currentValue: "84%",
    previousValue: "78%",
    direction: "up",
    period: "7d",
    workspace: "Hospitality",
  },
  {
    id: "trend-pipeline",
    label: "Pipeline Value",
    currentValue: "₹18.2L",
    previousValue: "₹16.9L",
    direction: "up",
    period: "7d",
    workspace: "CRM",
  },
  {
    id: "trend-roas",
    label: "Marketing ROAS",
    currentValue: "4.2×",
    previousValue: "4.5×",
    direction: "down",
    period: "7d",
    workspace: "Marketing",
  },
];

export const MOCK_EXECUTIVE_TASKS: ExecutiveTask[] = [
  { id: "task-1", title: "Confirm VIP arrivals" },
  { id: "task-2", title: "Review weekend pricing" },
  { id: "task-3", title: "Approve supplier invoice" },
  { id: "task-4", title: "Marketing campaign review" },
  { id: "task-5", title: "Call travel partner" },
];

/** Simulates async service latency for Promise-based APIs. */
export function resolveMock<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}
