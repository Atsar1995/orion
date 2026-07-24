import type { HealthStatus } from "@/lib/command-center-data";

// TD-002: Placeholder CRM data until customer intelligence service integration

export type CrmActivity = {
  time: string;
  description: string;
};

export type CrmOpportunity = {
  name: string;
  value: string;
  stage: string;
  status: HealthStatus;
};

export const CRM_EXECUTIVE_SUMMARY =
  "Customer relationships are healthy with 847 active contacts and a pipeline of ₹1.8Cr. Three high-value opportunities require follow-up this week; hospitality segment shows strongest engagement.";

export const CRM_HEALTH = {
  score: "84",
  status: "healthy" as HealthStatus,
  activeCustomers: "847",
  atRisk: "12",
};

export const CRM_KPIS = [
  { label: "Active Customers", value: "847" },
  { label: "Pipeline Value", value: "₹1.8Cr" },
  { label: "Win Rate", value: "32%" },
  { label: "Avg Deal Size", value: "₹4.2L" },
  { label: "Open Opportunities", value: "24" },
  { label: "At-Risk Accounts", value: "12" },
  { label: "Response Time", value: "4.2h" },
  { label: "Health Score", value: "84/100" },
] as const;

export const CRM_CUSTOMER_HEALTH = {
  summary:
    "Customer health scoring will integrate engagement, satisfaction, and revenue signals when the intelligence service ships.",
  trend: "+5 accounts improved",
};

export const CRM_OPPORTUNITY_SNAPSHOT = {
  totalValue: "₹1.8Cr",
  closingThisMonth: "₹42L",
  topOpportunity: "OranIA Group — Enterprise Renewal",
};

export const CRM_TOP_OPPORTUNITIES: CrmOpportunity[] = [
  {
    name: "OranIA Group — Enterprise Renewal",
    value: "₹18L",
    stage: "Negotiation",
    status: "healthy",
  },
  {
    name: "Commerce Partner — Platform Expansion",
    value: "₹12L",
    stage: "Proposal",
    status: "attention",
  },
  {
    name: "Luxury Retreats — New Property",
    value: "₹8L",
    stage: "Discovery",
    status: "healthy",
  },
];

export const CRM_RECENT_ACTIVITY: CrmActivity[] = [
  { time: "10:20", description: "Call completed — OranIA Group renewal discussion" },
  { time: "09:45", description: "Proposal sent — Commerce Partner platform expansion" },
  { time: "Yesterday", description: "Meeting scheduled — Luxury Retreats new property" },
  { time: "Yesterday", description: "At-risk flag raised — Retail Channel Co (no contact 30d)" },
  { time: "Mon", description: "Pipeline review completed — 24 open opportunities" },
];

export const CRM_EXECUTIVE_NOTES =
  "Prioritise OranIA Group renewal before month end. Re-engage Retail Channel Co to prevent churn. Commerce Partner proposal needs founder approval on pricing.";
