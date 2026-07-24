import type { HealthStatus } from "@/lib/command-center-data";

// TD-002: Placeholder CRM business data until customer intelligence service integration

export type CrmTrendDirection = "up" | "down" | "neutral";

export type CrmKpiMetric = {
  label: string;
  value: string;
  change: string;
  direction: CrmTrendDirection;
};

export type CrmInsight = {
  priority: number;
  title: string;
  description: string;
};

export type CrmAlert = {
  severity: HealthStatus;
  message: string;
};

export type CrmPipelineStage = {
  label: string;
  count: number;
  displayValue: string;
};

export type CrmRelationshipSegment = {
  label: string;
  count: number;
  displayValue: string;
  share: string;
  status: HealthStatus;
};

export type CrmCustomerProfile = {
  name: string;
  value: string;
  status: HealthStatus;
  detail: string;
};

export type CrmRecommendedAction = {
  title: string;
  description: string;
};

export const CRM_INSIGHTS_READY = true;

export const CRM_ENHANCED_KPIS: CrmKpiMetric[] = [
  { label: "Total Customers", value: "912", change: "+18", direction: "up" },
  { label: "Active Customers", value: "847", change: "+12", direction: "up" },
  { label: "Open Opportunities", value: "24", change: "+3", direction: "up" },
  { label: "Customer Health", value: "84/100", change: "+3 pts", direction: "up" },
  { label: "At-Risk Customers", value: "12", change: "+2", direction: "down" },
  { label: "Follow-ups Due", value: "8", change: "This week", direction: "neutral" },
];

export const OPPORTUNITY_PIPELINE: CrmPipelineStage[] = [
  { label: "Prospect", count: 9, displayValue: "9" },
  { label: "Qualified", count: 6, displayValue: "6" },
  { label: "Proposal", count: 4, displayValue: "4" },
  { label: "Negotiation", count: 3, displayValue: "3" },
  { label: "Won", count: 2, displayValue: "2" },
];

export const PIPELINE_SUMMARY = {
  totalValue: "₹1.8Cr",
  trend: "+14%",
  summary:
    "Pipeline grew 14% this quarter with negotiation-stage deals concentrated in hospitality and commerce segments.",
};

export const RELATIONSHIP_HEALTH: CrmRelationshipSegment[] = [
  { label: "Healthy", count: 720, displayValue: "720", share: "85%", status: "healthy" },
  { label: "Needs Attention", count: 115, displayValue: "115", share: "14%", status: "attention" },
  { label: "At Risk", count: 12, displayValue: "12", share: "1%", status: "critical" },
];

export const CRM_EXECUTIVE_INSIGHTS: CrmInsight[] = [
  {
    priority: 1,
    title: "VIP customer inactivity detected",
    description:
      "Retail Channel Co — no contact in 30 days. High lifetime value account at churn risk. Schedule founder call today.",
  },
  {
    priority: 2,
    title: "Opportunity pipeline growing",
    description:
      "Three new qualified opportunities added this week. Commerce segment shows strongest conversion velocity.",
  },
  {
    priority: 3,
    title: "Engagement trend improving",
    description:
      "Average response time dropped to 4.2 hours. Hospitality segment engagement up 12% month-over-month.",
  },
  {
    priority: 4,
    title: "Follow-up recommendations",
    description:
      "Eight follow-ups due this week — prioritise OranIA Group renewal and Commerce Partner proposal approval.",
  },
  {
    priority: 5,
    title: "Revenue opportunity",
    description:
      "Luxury Retreats new property deal (₹8L) in discovery — accelerate to proposal before Q3 budget lock.",
  },
];

export const CRM_CUSTOMER_ALERTS: CrmAlert[] = [
  { severity: "attention", message: "Follow-up overdue — Retail Channel Co (VIP, 30 days inactive)" },
  { severity: "attention", message: "Opportunity nearing close — OranIA Group renewal (₹18L, negotiation)" },
  { severity: "attention", message: "Customer inactivity — 3 accounts with no touchpoint in 21+ days" },
  { severity: "healthy", message: "Commerce Partner proposal awaiting founder pricing approval" },
];

export const HIGHEST_VALUE_CUSTOMER: CrmCustomerProfile = {
  name: "OranIA Hospitality Group",
  value: "₹42L lifetime",
  status: "healthy",
  detail: "Enterprise renewal in negotiation — ₹18L opportunity",
};

export const HIGHEST_RISK_CUSTOMER: CrmCustomerProfile = {
  name: "Retail Channel Co",
  value: "₹8L lifetime",
  status: "critical",
  detail: "No contact in 30 days — churn risk elevated",
};

export const LARGEST_OPPORTUNITY: CrmCustomerProfile = {
  name: "OranIA Group — Enterprise Renewal",
  value: "₹18L",
  status: "healthy",
  detail: "Negotiation stage — close before month end",
};

export const CRM_RECOMMENDED_ACTION: CrmRecommendedAction = {
  title: "Call Retail Channel Co today",
  description:
    "Re-engage highest-risk VIP account before weekend. Confirm renewal intent and address any open concerns.",
};

export const CRM_EXECUTIVE_NOTES =
  "Prioritise OranIA Group renewal before month end. Re-engage Retail Channel Co to prevent churn. Commerce Partner proposal needs founder approval on pricing.";

export const CRM_CUSTOMER_HEALTH_INPUT = {
  score: 84,
  trend: "+3",
  status: "healthy" as HealthStatus,
  summary:
    "Customer relationships are strong with improving engagement in hospitality. Twelve accounts need attention — VIP inactivity is the primary risk signal.",
  drivers: [
    { label: "Engagement", status: "healthy" as HealthStatus },
    { label: "Retention", status: "healthy" as HealthStatus },
    { label: "Pipeline", status: "healthy" as HealthStatus },
    { label: "At-Risk Accounts", status: "attention" as HealthStatus },
  ],
};
