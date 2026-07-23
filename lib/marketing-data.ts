import type { HealthStatus } from "@/lib/command-center-data";

export type ChannelPerformance = {
  channel: string;
  status: HealthStatus;
  leads: number;
  conversion: string;
  summary: string;
};

export type CampaignInsight = {
  name: string;
  spend: string;
  roi: string;
  status: HealthStatus;
  insight: string;
};

export type CriticalIssue = {
  status: HealthStatus;
  message: string;
};

export type RecommendedAction = {
  priority: number;
  title: string;
  description: string;
};

export type MarketingActivity = {
  time: string;
  description: string;
};

export const MARKETING_SUMMARY =
  "Marketing is performing above target this week with strong organic lead quality and steady paid campaign returns.";

export const MARKETING_HEALTH = {
  score: "82",
  status: "healthy" as HealthStatus,
  topChannel: "SEO",
  lowestChannel: "Meta Ads",
};

export const MARKETING_METRICS = [
  { label: "Website Visits", value: "12,480" },
  { label: "Leads Generated", value: "147" },
  { label: "Conversion Rate", value: "3.8%" },
  { label: "Marketing Spend", value: "₹1.2L" },
  { label: "ROI", value: "3.2x" },
  { label: "Health Score", value: "82/100" },
] as const;

export const EXECUTIVE_BRIEFING =
  "Marketing performance remains healthy. Organic search continues to generate the highest quality leads while paid campaigns show declining conversion efficiency. Focus on improving campaign targeting before increasing advertising spend.";

export const CHANNEL_PERFORMANCE: ChannelPerformance[] = [
  {
    channel: "Website",
    status: "healthy",
    leads: 42,
    conversion: "4.2%",
    summary: "Direct traffic and landing pages converting well",
  },
  {
    channel: "SEO",
    status: "healthy",
    leads: 38,
    conversion: "5.1%",
    summary: "Top-performing channel for qualified leads",
  },
  {
    channel: "Google Ads",
    status: "attention",
    leads: 28,
    conversion: "2.9%",
    summary: "Spend efficient; conversion rate below target",
  },
  {
    channel: "Meta",
    status: "attention",
    leads: 19,
    conversion: "2.1%",
    summary: "Lowest performing paid channel this week",
  },
  {
    channel: "Email",
    status: "healthy",
    leads: 12,
    conversion: "6.4%",
    summary: "Strong open rates; room to grow list size",
  },
  {
    channel: "WhatsApp",
    status: "healthy",
    leads: 5,
    conversion: "8.0%",
    summary: "High intent inquiries from existing guests",
  },
  {
    channel: "Google Business Profile",
    status: "healthy",
    leads: 3,
    conversion: "7.5%",
    summary: "Reviews driving local discovery",
  },
];

export const CAMPAIGN_INSIGHTS: CampaignInsight[] = [
  {
    name: "Summer Staycation",
    spend: "₹42K",
    roi: "4.1x",
    status: "healthy",
    insight: "Meta campaign exceeding weekend booking targets",
  },
  {
    name: "Google Search — ORANIA",
    spend: "₹28K",
    roi: "3.4x",
    status: "healthy",
    insight: "Branded keywords delivering consistent direct bookings",
  },
  {
    name: "ATSAR Launch Promo",
    spend: "₹8K",
    roi: "2.1x",
    status: "attention",
    insight: "Email open rate strong; checkout conversion lagging",
  },
  {
    name: "Retargeting — Cart Abandon",
    spend: "₹15K",
    roi: "1.8x",
    status: "attention",
    insight: "Creative fatigue likely; refresh recommended",
  },
];

export const TOP_OPPORTUNITIES = [
  "Improve SEO — publish two locality landing pages this month",
  "Increase email engagement — launch a re-engagement sequence",
  "Optimize Google Ads — tighten keywords and negative match lists",
  "Improve review response rate — reply to 8 pending Google reviews",
] as const;

export const CRITICAL_ISSUES: CriticalIssue[] = [
  {
    status: "critical",
    message: "Meta retargeting ROI below 2x for 5 consecutive days",
  },
  {
    status: "attention",
    message: "Ad spend pacing 8% ahead of monthly budget",
  },
  {
    status: "attention",
    message: "ATSAR Launch Promo conversion dropped 18% week-over-week",
  },
];

export const RECOMMENDED_ACTIONS: RecommendedAction[] = [
  {
    priority: 1,
    title: "Refresh retargeting creative",
    description:
      "Update Meta cart-abandon ads and tighten audience targeting before increasing spend.",
  },
  {
    priority: 2,
    title: "Reply to pending Google reviews",
    description:
      "Eight unanswered reviews are affecting local trust and discovery performance.",
  },
  {
    priority: 3,
    title: "Expand SEO content",
    description:
      "Organic search is the top channel — capitalize with two new landing pages.",
  },
];

export const RECENT_ACTIVITY: MarketingActivity[] = [
  { time: "09:15", description: "Summer Staycation campaign reached 1,000 impressions" },
  { time: "08:40", description: "New lead captured via SEO landing page" },
  { time: "08:00", description: "Weekly marketing performance report generated" },
  { time: "07:30", description: "Google Ads budget alert — 80% of weekly cap used" },
  { time: "Yesterday", description: "Email campaign ATSAR Launch sent to 2,400 subscribers" },
];

export const MARKETING_QUICK_ACTIONS = [
  { label: "Create Campaign" },
  { label: "View Analytics" },
  { label: "Manage Email List" },
  { label: "Reply to Reviews" },
  { label: "Open Intelligence", href: "/intelligence" },
] as const;
