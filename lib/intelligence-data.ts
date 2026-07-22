export type BusinessHealthModule = {
  title: string;
  metrics: readonly { label: string; value: string }[];
};

export const EXECUTIVE_BRIEFING_ITEMS = [
  "Occupancy increased to 84% across ORANIA properties",
  "Revenue up 8% week-over-week",
  "3 pending guest issues require attention",
  "ATSAR processed 12 new orders today",
  "Marketing campaigns performing above target",
  "Daily summary: Platform healthy, no critical alerts",
] as const;

export const BUSINESS_HEALTH_MODULES: BusinessHealthModule[] = [
  {
    title: "Hotels",
    metrics: [
      { label: "Occupancy", value: "84%" },
      { label: "RevPAR", value: "₹4,200" },
    ],
  },
  {
    title: "Commerce",
    metrics: [
      { label: "Orders", value: "12" },
      { label: "Revenue", value: "₹1.8L" },
    ],
  },
  {
    title: "Marketing",
    metrics: [
      { label: "Campaign ROI", value: "3.2x" },
      { label: "Leads", value: "47" },
    ],
  },
  {
    title: "Finance",
    metrics: [
      { label: "Cash Flow", value: "Positive" },
      { label: "Outstanding", value: "₹42K" },
    ],
  },
];

export const AI_INSIGHTS = [
  "Revenue trend improving across all properties",
  "Weekend demand increasing for the next 14 days",
  "Advertising performing well on Meta and Google",
  "Customer satisfaction improving after recent service updates",
] as const;

export const INTELLIGENCE_RECOMMENDATIONS = [
  "Increase room pricing for peak weekend dates",
  "Launch a limited-time weekend promotion",
  "Reply to pending guest reviews on Google",
  "Approve ATSAR quotation #Q-1042",
  "Contact supplier regarding low inventory on linens",
] as const;

export const PRIORITY_ALERTS = [
  "Guest complaint — Room 204 checkout delay",
  "Payment overdue — Invoice #INV-8831",
  "Inventory warning — Housekeeping supplies below threshold",
  "Booking conflict — Double reservation on 24 July",
  "Engineering notification — Build pipeline scheduled tonight",
] as const;

export const BUSINESS_METRICS = [
  { label: "Occupancy", value: "84%" },
  { label: "Revenue", value: "₹8.4L" },
  { label: "Orders", value: "12" },
  { label: "Website Visitors", value: "1,240" },
  { label: "Conversion Rate", value: "3.8%" },
  { label: "Marketing ROI", value: "3.2x" },
] as const;

export const ASK_ORION_PROMPTS = [
  "Show today's reservations.",
  "Explain today's revenue.",
  "Which guests need attention?",
  "Summarize today's priorities.",
  "What should I focus on next?",
] as const;

export const INTELLIGENCE_QUICK_ACTIONS = [
  { label: "Reply to Reviews" },
  { label: "Create Campaign" },
  { label: "View Reservations" },
  { label: "Open ATSAR" },
  { label: "Engineering Dashboard", href: "/engineering" },
] as const;
