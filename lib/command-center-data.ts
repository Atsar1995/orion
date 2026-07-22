export type HealthStatus = "healthy" | "attention" | "critical";

export type BusinessHealthItem = {
  module: string;
  status: HealthStatus;
  summary: string;
};

export type AttentionItem = {
  status: HealthStatus;
  message: string;
};

export type ActivityItem = {
  time: string;
  description: string;
};

export const FOUNDER_NAME = "Shafi";

export const EXECUTIVE_SUMMARY =
  "Overnight operations were stable across ORANIA and ATSAR, with three items requiring your attention before noon.";

export const BUSINESS_HEALTH_OVERVIEW: BusinessHealthItem[] = [
  { module: "Hotels", status: "healthy", summary: "84% occupancy" },
  { module: "Commerce", status: "healthy", summary: "12 orders today" },
  { module: "Marketing", status: "attention", summary: "Campaign review due" },
  { module: "Finance", status: "healthy", summary: "Cash flow positive" },
];

export const EXECUTIVE_BRIEFING_ITEMS = [
  "ORANIA occupancy reached 84% — above weekly target",
  "ATSAR revenue up 8% compared to last week",
  "Two guest reviews awaiting founder reply",
  "No critical engineering alerts overnight",
] as const;

export const CRITICAL_ATTENTION: AttentionItem[] = [
  {
    status: "critical",
    message: "Guest complaint — Room 204 checkout delay",
  },
  {
    status: "attention",
    message: "Payment overdue — Invoice #INV-8831",
  },
  {
    status: "attention",
    message: "Weekend pricing review recommended for ORANIA",
  },
];

export const INSIGHT_OF_THE_DAY =
  "Weekend demand is trending 14% higher than forecast. Consider adjusting ORANIA pricing for Friday and Saturday arrivals.";

export const TODAYS_PRIORITIES = [
  "Review and approve weekend room rates",
  "Reply to pending guest reviews",
  "Sign off on ATSAR quotation #Q-1042",
  "Confirm housekeeping inventory restock",
] as const;

export const RECOMMENDED_ACTIONS = [
  "Increase peak weekend pricing by 8–10%",
  "Launch a limited-time weekend promotion",
  "Schedule supplier call for linen inventory",
] as const;

export const RECENT_ACTIVITY: ActivityItem[] = [
  { time: "06:30", description: "Daily platform health check completed" },
  { time: "07:15", description: "ATSAR received 3 new orders" },
  { time: "08:00", description: "Marketing campaign report generated" },
  { time: "08:45", description: "Guest review submitted for ORANIA" },
];

export const COMMAND_CENTER_QUICK_ACTIONS = [
  { label: "Open Intelligence", href: "/intelligence" },
  { label: "Engineering", href: "/engineering" },
  { label: "Configuration", href: "/configuration" },
  { label: "View Reservations" },
  { label: "Create Campaign" },
] as const;
