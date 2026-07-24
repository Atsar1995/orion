import type { HealthStatus } from "@/lib/command-center-data";
import {
  HIGHEST_PRIORITY_PAYABLE,
  HIGHEST_PRIORITY_RECEIVABLE,
} from "@/lib/finance-receivables-payables";

// TD-001: Placeholder finance insights until accounting integrations ship

export type FinanceTrendDirection = "up" | "down" | "neutral";

export type FinanceKpiMetric = {
  label: string;
  value: string;
  change: string;
  direction: FinanceTrendDirection;
};

export type FinanceChartPoint = {
  label: string;
  value: number;
  displayValue: string;
};

export type FinanceBreakdownItem = {
  label: string;
  value: number;
  displayValue: string;
  share: string;
};

export type FinanceInsight = {
  priority: number;
  title: string;
  description: string;
};

export type FinanceAlert = {
  severity: HealthStatus;
  message: string;
};

export const FINANCE_HEALTH_SCORE = {
  score: 88,
  trend: "+2",
  status: "healthy" as HealthStatus,
  summary: "Strong cash position with revenue above plan; receivables collection needs attention.",
  drivers: [
    { label: "Cash Flow", status: "healthy" as HealthStatus },
    { label: "Revenue Growth", status: "healthy" as HealthStatus },
    { label: "Receivables", status: "attention" as HealthStatus },
    { label: "Expense Control", status: "healthy" as HealthStatus },
  ],
};

export const FINANCE_ENHANCED_KPIS: FinanceKpiMetric[] = [
  { label: "Cash Balance", value: "₹18.4L", change: "+4.1%", direction: "up" },
  { label: "Monthly Revenue", value: "₹42.8L", change: "+8.2%", direction: "up" },
  { label: "Monthly Expenses", value: "₹32.3L", change: "+2.1%", direction: "up" },
  { label: "Net Margin", value: "24.6%", change: "+1.4pp", direction: "up" },
  { label: "Receivables", value: "₹42K", change: "+12K overdue", direction: "down" },
  { label: "Payables", value: "₹28K", change: "On schedule", direction: "neutral" },
  { label: "Runway", value: "14 mo", change: "Stable", direction: "neutral" },
  { label: "Burn Rate", value: "₹2.7L/mo", change: "-3.2%", direction: "up" },
];

export const REVENUE_TREND_SERIES: FinanceChartPoint[] = [
  { label: "Jan", value: 34, displayValue: "₹34L" },
  { label: "Feb", value: 36, displayValue: "₹36L" },
  { label: "Mar", value: 38, displayValue: "₹38L" },
  { label: "Apr", value: 39, displayValue: "₹39L" },
  { label: "May", value: 41, displayValue: "₹41L" },
  { label: "Jun", value: 43, displayValue: "₹43L" },
];

export const EXPENSE_BREAKDOWN_SERIES: FinanceBreakdownItem[] = [
  { label: "Payroll", value: 46, displayValue: "₹14.8L", share: "46%" },
  { label: "Marketing", value: 17, displayValue: "₹5.6L", share: "17%" },
  { label: "Operations", value: 15, displayValue: "₹4.9L", share: "15%" },
  { label: "Technology", value: 11, displayValue: "₹3.4L", share: "11%" },
  { label: "Other", value: 11, displayValue: "₹3.6L", share: "11%" },
];

export const FINANCE_CASH_FLOW_SUMMARY = {
  period: "Last 30 days",
  inflow: "₹42.8L",
  outflow: "₹32.3L",
  net: "+₹10.5L",
  status: "healthy" as HealthStatus,
  items: [
    { label: "Operating inflow", amount: "+₹38.2L" },
    { label: "Operating outflow", amount: "-₹29.1L" },
    { label: "Investing", amount: "-₹1.8L" },
    { label: "Financing", amount: "-₹1.4L" },
  ],
};

export const FINANCE_EXECUTIVE_INSIGHTS: FinanceInsight[] = [
  {
    priority: 1,
    title: "Collect overdue hospitality receivables",
    description:
      "₹12K overdue from OranIA Hospitality Group. Collection before month-end protects Q3 cash buffer.",
  },
  {
    priority: 2,
    title: "Revenue outpacing expense growth",
    description:
      "Revenue grew 8.2% while expenses rose 2.1%. Margin expansion creates room for controlled marketing investment.",
  },
  {
    priority: 3,
    title: "Payroll remains largest cost centre",
    description:
      "Payroll at 46% of expenses. Review headcount plan before Q3 hiring commitments.",
  },
];

export const FINANCE_ALERTS: FinanceAlert[] = [
  {
    severity: "attention",
    message: "₹12K receivables overdue — OranIA Hospitality Group (5 days)",
  },
  {
    severity: "attention",
    message: "Commerce Partner Ltd invoice due in 3 days — ₹12K",
  },
  {
    severity: "healthy",
    message: "Cash balance above low-cash threshold (₹5L)",
  },
];

/** Single-line finance context for the daily Executive Brief. */
export const FINANCE_EXECUTIVE_BRIEFING_LINE =
  "Finance health score is 88/100 with positive cash flow and revenue 8% above plan; collect ₹18K overdue from OranIA Hospitality Group and schedule ₹9K Cloud Infrastructure payment by Thursday.";

/** Compact finance metrics for the Executive Brief finance card. */
export const ADVISOR_FINANCE_SNAPSHOT = {
  healthScore: FINANCE_HEALTH_SCORE.score,
  trend: FINANCE_HEALTH_SCORE.trend,
  status: FINANCE_HEALTH_SCORE.status,
  cashBalance: "₹18.4L",
  monthlyRevenue: "₹42.8L",
  netMargin: "24.6%",
  topInsight: FINANCE_EXECUTIVE_INSIGHTS[0],
  topAlert: FINANCE_ALERTS[0],
  topReceivable: HIGHEST_PRIORITY_RECEIVABLE,
  topPayable: HIGHEST_PRIORITY_PAYABLE,
};

/** Returns the maximum value in a chart series for scaling. */
export function getChartMaxValue(points: FinanceChartPoint[]): number {
  return Math.max(...points.map((point) => point.value), 1);
}

/** Returns the maximum value in a breakdown series for scaling. */
export function getBreakdownMaxValue(items: FinanceBreakdownItem[]): number {
  return Math.max(...items.map((item) => item.value), 1);
}
