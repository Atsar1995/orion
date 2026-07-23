import type { HealthStatus } from "@/lib/command-center-data";

export type BusinessDomainSnapshot = {
  domain: string;
  metrics: readonly { label: string; value: string }[];
};

export type Opportunity = {
  title: string;
  why: string;
  expectedImpact: string;
};

export type CriticalRisk = {
  severity: HealthStatus;
  risk: string;
};

export type RecommendedDecision = {
  priority: number;
  decision: string;
  why: string;
  expectedImpact: string;
};

export type TimelineBlock = {
  period: string;
  items: readonly string[];
};

export const BUSINESS_HEALTH = {
  score: "91",
  status: "healthy" as HealthStatus,
  explanation:
    "Revenue and guest satisfaction remain strong while marketing continues to generate quality leads.",
};

export const EXECUTIVE_BRIEF =
  "Business performance remains healthy across all departments. Marketing generated high-quality leads yesterday. Hotel occupancy is expected to exceed 90% this weekend. Cash flow remains positive. Two operational issues require attention before noon.";

export const BUSINESS_SNAPSHOT: BusinessDomainSnapshot[] = [
  {
    domain: "Marketing",
    metrics: [
      { label: "Leads", value: "47" },
      { label: "Website Traffic", value: "12.4K" },
      { label: "Campaign ROI", value: "3.2x" },
      { label: "Conversion Rate", value: "3.8%" },
    ],
  },
  {
    domain: "Hospitality",
    metrics: [
      { label: "Occupancy", value: "84%" },
      { label: "ADR", value: "₹5,200" },
      { label: "RevPAR", value: "₹4,368" },
      { label: "Guest Satisfaction", value: "4.6/5" },
    ],
  },
  {
    domain: "Finance",
    metrics: [
      { label: "Cash Position", value: "Positive" },
      { label: "Revenue Trend", value: "+8%" },
      { label: "Expense Trend", value: "+3%" },
      { label: "Profit Margin", value: "22%" },
    ],
  },
  {
    domain: "CRM",
    metrics: [
      { label: "New Customers", value: "18" },
      { label: "Returning Customers", value: "32" },
      { label: "VIP Guests", value: "3" },
      { label: "Pipeline Value", value: "₹12L" },
    ],
  },
  {
    domain: "Commerce",
    metrics: [
      { label: "Orders", value: "12" },
      { label: "Inventory Alerts", value: "2" },
      { label: "Fulfilment Status", value: "On track" },
      { label: "Revenue Today", value: "₹1.8L" },
    ],
  },
];

export const TOP_OPPORTUNITIES: Opportunity[] = [
  {
    title: "Increase Premium Room Rates",
    why: "Weekend demand exceeds historical averages.",
    expectedImpact: "Estimated revenue increase of ₹1.4 lakh.",
  },
  {
    title: "Expand Direct Booking Promotion",
    why: "Organic and direct channels outperform paid advertising ROI.",
    expectedImpact: "Reduce OTA commission exposure by 4–6%.",
  },
  {
    title: "Launch Returning Guest Offer",
    why: "Repeat guests spend 28% more than first-time guests.",
    expectedImpact: "Projected uplift of 12 repeat bookings this month.",
  },
  {
    title: "Replenish Low-Stock Commerce Items",
    why: "Two ATSAR SKUs are below reorder threshold with rising demand.",
    expectedImpact: "Prevent estimated ₹45K in missed order revenue.",
  },
];

export const CRITICAL_RISKS: CriticalRisk[] = [
  {
    severity: "critical",
    risk: "Room 305 maintenance — VIP check-in at 14:00 requires resolution",
  },
  {
    severity: "attention",
    risk: "Weekday occupancy tracking 6% below forecast for next week",
  },
  {
    severity: "attention",
    risk: "Meta retargeting ROI below target for 5 consecutive days",
  },
  {
    severity: "attention",
    risk: "Commerce inventory alert — linens and amenities below threshold",
  },
];

export const RECOMMENDED_DECISIONS: RecommendedDecision[] = [
  {
    priority: 1,
    decision: "Approve weekend premium rate increase",
    why: "Demand forecast exceeds 90% occupancy with limited suite inventory.",
    expectedImpact: "Estimated ₹1.4L incremental revenue this weekend.",
  },
  {
    priority: 2,
    decision: "Escalate Room 305 maintenance before VIP arrival",
    why: "Operational issue threatens guest experience and review score.",
    expectedImpact: "Protect guest satisfaction and prevent service recovery cost.",
  },
  {
    priority: 3,
    decision: "Shift marketing budget toward SEO and direct channels",
    why: "Paid campaign efficiency declining while organic leads quality improving.",
    expectedImpact: "Improve lead ROI and reduce acquisition cost over 30 days.",
  },
];

export const ORION_INTELLIGENCE = [
  "Marketing campaigns are increasing direct bookings.",
  "Guest satisfaction continues to improve.",
  "Weekday demand remains below forecast.",
  "Organic search outperforms paid advertising.",
] as const;

export const CROSS_WORKSPACE_INSIGHTS = [
  "Marketing campaign increased hotel occupancy.",
  "High occupancy increased housekeeping workload.",
  "Improved guest satisfaction increased repeat bookings.",
  "Revenue growth followed stronger direct bookings.",
] as const;

export const BUSINESS_MEMORY = [
  "Tuesday occupancy has remained below target for six weeks.",
  "Returning guests spend more than first-time guests.",
  "SEO consistently produces better ROI than paid search.",
  "Weekend golf packages outperform standard packages.",
] as const;

export const PRIORITY_TIMELINE: TimelineBlock[] = [
  {
    period: "Morning",
    items: ["Review overnight bookings", "Approve pricing"],
  },
  {
    period: "Midday",
    items: ["Resolve guest issues", "Review marketing"],
  },
  {
    period: "Afternoon",
    items: ["Prepare tomorrow", "Review revenue"],
  },
];

export const TODAYS_FOCUS = [
  "Resolve Room 305 maintenance before VIP check-in",
  "Approve weekend premium pricing adjustment",
  "Review marketing channel allocation for weekday demand",
] as const;

export const ADVISOR_QUICK_ACTIONS = [
  { label: "Open Marketing", href: "/marketing" },
  { label: "Open Hospitality", href: "/hospitality" },
  { label: "Open Finance" },
  { label: "View Calendar" },
  { label: "Executive Report" },
  { label: "Command Center", href: "/command-center" },
] as const;
