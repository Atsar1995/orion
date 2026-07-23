import type { HealthStatus } from "@/lib/command-center-data";

export type RiskLevel = "high" | "medium" | "low";

export type ConfidenceLevel = "high" | "medium" | "low";

export type BusinessSnapshotItem = {
  domain: string;
  status: string;
  health: HealthStatus;
};

export type BusinessOpportunity = {
  title: string;
  description: string;
};

export type RecommendedDecision = {
  priority: number;
  decision: string;
  why: string;
  expectedImpact: string;
  confidence: ConfidenceLevel;
};

export type CalendarEvent = {
  time: string;
  title: string;
};

export type CriticalRisk = {
  level: RiskLevel;
  message: string;
};

export const BUSINESS_HEALTH = {
  score: "92",
  trend: "+3",
  status: "healthy" as HealthStatus,
};

export const EXECUTIVE_BRIEF =
  "Business performance remains healthy across all departments. Marketing generated high-quality leads yesterday. Hotel occupancy is expected to exceed 90% this weekend. Cash flow remains positive. Two operational issues require attention before noon.";

export const TODAYS_PRIORITIES = [
  "Confirm VIP arrivals",
  "Review weekend pricing",
  "Approve supplier invoice",
  "Marketing campaign review",
  "Call travel partner",
] as const;

export const CRITICAL_RISKS: CriticalRisk[] = [
  { level: "high", message: "Occupancy below target for weekday arrivals" },
  { level: "high", message: "Guest complaint awaiting response — Room 305" },
  { level: "medium", message: "Supplier payment overdue — housekeeping linens" },
];

export const BUSINESS_OPPORTUNITIES = {
  totalRevenueOpportunity: "₹3.25 lakh",
  items: [
    {
      title: "Weekend demand increasing",
      description: "Occupancy forecast exceeds 90% — premium inventory limited.",
    },
    {
      title: "Upsell luxury suites",
      description: "Six suite upgrades available for arriving VIP guests.",
    },
    {
      title: "Repeat guests promotion",
      description: "Returning guests spend 28% more than first-time guests.",
    },
  ] satisfies BusinessOpportunity[],
};

export const RECOMMENDED_DECISIONS: RecommendedDecision[] = [
  {
    priority: 1,
    decision: "Increase weekend room rates",
    why: "Demand exceeds forecast with limited premium inventory.",
    expectedImpact: "Higher revenue",
    confidence: "high",
  },
  {
    priority: 2,
    decision: "Resolve guest complaint before VIP check-in",
    why: "Room 305 issue threatens satisfaction and review score.",
    expectedImpact: "Protect guest experience and repeat bookings",
    confidence: "high",
  },
  {
    priority: 3,
    decision: "Launch weekday direct booking offer",
    why: "Tuesday occupancy has trailed target for six consecutive weeks.",
    expectedImpact: "Improve weekday occupancy without OTA discounting",
    confidence: "medium",
  },
];

export const BUSINESS_SNAPSHOT: BusinessSnapshotItem[] = [
  { domain: "Marketing", status: "Healthy", health: "healthy" },
  { domain: "Hospitality", status: "Excellent", health: "healthy" },
  { domain: "Finance", status: "Stable", health: "healthy" },
  { domain: "CRM", status: "Good", health: "healthy" },
  { domain: "Operations", status: "Needs Attention", health: "attention" },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { time: "10:30", title: "Travel Agent Meeting" },
  { time: "14:00", title: "Marketing Review" },
  { time: "16:30", title: "Operations Review" },
];

export const WEATHER = {
  location: "Srinagar",
  temperature: "28°C",
  condition: "Sunny",
  summary: "Excellent day for outdoor guest activities.",
};

export const ADVISOR_QUICK_ACTIONS = [
  { label: "Open Hospitality", href: "/hospitality" },
  { label: "Review Finance" },
  { label: "Launch Marketing", href: "/marketing" },
  { label: "View Reports" },
  { label: "Create Task" },
] as const;

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
