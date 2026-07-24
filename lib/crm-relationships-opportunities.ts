import type { HealthStatus } from "@/lib/command-center-data";
import type { ExecutiveRecommendation } from "@/lib/intelligence/models";

// TD-002: Placeholder relationship and opportunity data until CRM service integration

export type CustomerProfileDetail = {
  name: string;
  industry: string;
  lifetimeValue: string;
  lifetimeValueAmount: number;
  healthScore: number;
  healthStatus: HealthStatus;
  relationshipStatus: string;
  lastInteraction: string;
  nextFollowUp: string;
  openOpportunities: number;
  executiveNotes: string;
  rank: number;
};

export type TimelineEventType =
  | "Meeting"
  | "Phone Call"
  | "Email"
  | "Quotation"
  | "Order"
  | "Note"
  | "Follow-up";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  date: string;
  time: string;
  customer: string;
  description: string;
};

export type OpportunityPriorityTier = "high" | "medium" | "low";

export type RawManagedOpportunity = {
  name: string;
  customer: string;
  value: string;
  valueAmount: number;
  stage: string;
  probability: number;
  expectedClose: string;
  nextAction: string;
  executivePriority: number;
  customerHealth: number;
  relationshipStatus: HealthStatus;
};

export type ManagedOpportunity = RawManagedOpportunity & {
  priority: OpportunityPriorityTier;
  priorityScore: number;
};

export type OpportunityPriorityGroup = {
  tier: OpportunityPriorityTier;
  label: string;
  opportunities: ManagedOpportunity[];
};

export type RelationshipAction = {
  priority: number;
  action: string;
  customer: string;
  description: string;
};

export type PortfolioCategory = {
  label: "Strategic" | "Growing" | "Stable" | "At Risk" | "Inactive";
  customerCount: number;
  revenueContribution: string;
  healthDistribution: string;
  status: HealthStatus;
};

export type PriorityRelationship = {
  name: string;
  industry: string;
  lifetimeValue: string;
  status: HealthStatus;
  reason: string;
  action: string;
};

export type PriorityOpportunity = {
  name: string;
  customer: string;
  value: string;
  stage: string;
  probability: number;
  expectedClose: string;
  action: string;
  status: HealthStatus;
};

export type WeeklyRelationshipHealth = {
  trend: string;
  engagementChange: string;
  atRiskChange: string;
  summary: string;
  status: HealthStatus;
};

const STAGE_WEIGHTS: Record<string, number> = {
  Negotiation: 25,
  Proposal: 15,
  Qualified: 10,
  Prospect: 5,
  Discovery: 8,
};

const RELATIONSHIP_STATUS_WEIGHTS: Record<HealthStatus, number> = {
  critical: 30,
  attention: 15,
  healthy: 0,
};

const PRIORITY_TIER_LABELS: Record<OpportunityPriorityTier, string> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

const RAW_CUSTOMER_PROFILES: Omit<CustomerProfileDetail, "rank">[] = [
  {
    name: "OranIA Hospitality Group",
    industry: "Hospitality",
    lifetimeValue: "₹42L",
    lifetimeValueAmount: 4200000,
    healthScore: 91,
    healthStatus: "healthy",
    relationshipStatus: "Strategic Partner",
    lastInteraction: "2 days ago — renewal call",
    nextFollowUp: "Friday — contract review",
    openOpportunities: 2,
    executiveNotes:
      "Enterprise renewal in negotiation. Founder presence recommended at final meeting.",
  },
  {
    name: "Retail Channel Co",
    industry: "Commerce",
    lifetimeValue: "₹8L",
    lifetimeValueAmount: 800000,
    healthScore: 52,
    healthStatus: "critical",
    relationshipStatus: "At Risk",
    lastInteraction: "30 days ago — quarterly review",
    nextFollowUp: "Today — re-engagement call",
    openOpportunities: 1,
    executiveNotes:
      "VIP account with no recent contact. Churn risk elevated — immediate founder outreach required.",
  },
  {
    name: "Commerce Partner Ltd",
    industry: "Commerce",
    lifetimeValue: "₹18L",
    lifetimeValueAmount: 1800000,
    healthScore: 78,
    healthStatus: "attention",
    relationshipStatus: "Growing",
    lastInteraction: "Yesterday — proposal sent",
    nextFollowUp: "Wednesday — pricing follow-up",
    openOpportunities: 1,
    executiveNotes:
      "Platform expansion proposal pending founder pricing approval.",
  },
  {
    name: "Luxury Retreats",
    industry: "Hospitality",
    lifetimeValue: "₹12L",
    lifetimeValueAmount: 1200000,
    healthScore: 86,
    healthStatus: "healthy",
    relationshipStatus: "Stable",
    lastInteraction: "Yesterday — meeting scheduled",
    nextFollowUp: "Next week — property walkthrough",
    openOpportunities: 1,
    executiveNotes: "New property deal in discovery — accelerate to proposal before Q3 budget lock.",
  },
];

const RAW_OPPORTUNITIES: RawManagedOpportunity[] = [
  {
    name: "OranIA Group — Enterprise Renewal",
    customer: "OranIA Hospitality Group",
    value: "₹18L",
    valueAmount: 1800000,
    stage: "Negotiation",
    probability: 85,
    expectedClose: "28 Jul 2026",
    nextAction: "Final contract review with founder",
    executivePriority: 1,
    customerHealth: 91,
    relationshipStatus: "healthy",
  },
  {
    name: "Commerce Partner — Platform Expansion",
    customer: "Commerce Partner Ltd",
    value: "₹12L",
    valueAmount: 1200000,
    stage: "Proposal",
    probability: 65,
    expectedClose: "15 Aug 2026",
    nextAction: "Approve pricing and send revised proposal",
    executivePriority: 2,
    customerHealth: 78,
    relationshipStatus: "attention",
  },
  {
    name: "Luxury Retreats — New Property",
    customer: "Luxury Retreats",
    value: "₹8L",
    valueAmount: 800000,
    stage: "Discovery",
    probability: 45,
    expectedClose: "30 Sep 2026",
    nextAction: "Schedule property walkthrough",
    executivePriority: 3,
    customerHealth: 86,
    relationshipStatus: "healthy",
  },
  {
    name: "Retail Channel — Retention Package",
    customer: "Retail Channel Co",
    value: "₹6L",
    valueAmount: 600000,
    stage: "Qualified",
    probability: 40,
    expectedClose: "20 Aug 2026",
    nextAction: "Founder re-engagement call",
    executivePriority: 1,
    customerHealth: 52,
    relationshipStatus: "critical",
  },
  {
    name: "Consulting Client A — Annual Contract",
    customer: "Consulting Client A",
    value: "₹4L",
    valueAmount: 400000,
    stage: "Prospect",
    probability: 30,
    expectedClose: "15 Oct 2026",
    nextAction: "Send capability overview",
    executivePriority: 4,
    customerHealth: 82,
    relationshipStatus: "healthy",
  },
  {
    name: "Travel Partner — Seasonal Package",
    customer: "Travel Partner Agency",
    value: "₹3L",
    valueAmount: 300000,
    stage: "Prospect",
    probability: 25,
    expectedClose: "1 Nov 2026",
    nextAction: "Introductory meeting",
    executivePriority: 5,
    customerHealth: 75,
    relationshipStatus: "healthy",
  },
];

export const RELATIONSHIP_EXECUTIVE_SUMMARY =
  "Four strategic relationships require founder attention this week. OranIA Hospitality Group renewal and Retail Channel Co re-engagement are highest impact. Eight follow-ups are due — three are VIP accounts.";

export const OPPORTUNITY_EXECUTIVE_SUMMARY =
  "₹1.8Cr pipeline with three high-priority opportunities. OranIA Group ₹18L renewal closes this month. Retail Channel retention deal needs founder intervention to prevent churn.";

export const RELATIONSHIP_TIMELINE: TimelineEvent[] = [
  {
    id: "evt-1",
    type: "Phone Call",
    date: "24 Jul 2026",
    time: "10:20",
    customer: "OranIA Hospitality Group",
    description: "Renewal discussion — contract terms agreed in principle",
  },
  {
    id: "evt-2",
    type: "Email",
    date: "24 Jul 2026",
    time: "09:45",
    customer: "Commerce Partner Ltd",
    description: "Platform expansion proposal sent with pricing options",
  },
  {
    id: "evt-3",
    type: "Meeting",
    date: "23 Jul 2026",
    time: "16:00",
    customer: "Luxury Retreats",
    description: "New property discovery meeting scheduled for next week",
  },
  {
    id: "evt-4",
    type: "Follow-up",
    date: "23 Jul 2026",
    time: "11:30",
    customer: "Retail Channel Co",
    description: "Follow-up overdue — no response to last outreach (30 days)",
  },
  {
    id: "evt-5",
    type: "Quotation",
    date: "22 Jul 2026",
    time: "14:15",
    customer: "Consulting Client A",
    description: "Annual contract quotation prepared — awaiting review",
  },
  {
    id: "evt-6",
    type: "Order",
    date: "21 Jul 2026",
    time: "10:00",
    customer: "OranIA Hospitality Group",
    description: "Q2 service order confirmed — ₹6L booked revenue",
  },
  {
    id: "evt-7",
    type: "Note",
    date: "21 Jul 2026",
    time: "09:00",
    customer: "Retail Channel Co",
    description: "Executive note — VIP inactivity flagged for founder review",
  },
];

/** Calculates opportunity priority score from value, probability, health, and executive rules. */
export function calculateOpportunityPriorityScore(
  opportunity: RawManagedOpportunity,
): number {
  const valueWeight = opportunity.valueAmount / 100000;
  const probabilityWeight = opportunity.probability * 0.4;
  const healthWeight = (100 - opportunity.customerHealth) * 0.2;
  const stageWeight = STAGE_WEIGHTS[opportunity.stage] ?? 5;
  const relationshipWeight =
    RELATIONSHIP_STATUS_WEIGHTS[opportunity.relationshipStatus];
  const executiveWeight = (6 - opportunity.executivePriority) * 5;

  return Math.round(
    valueWeight +
      probabilityWeight +
      healthWeight +
      stageWeight +
      relationshipWeight +
      executiveWeight,
  );
}

/** Classifies an opportunity priority score into high, medium, or low tier. */
export function classifyOpportunityPriority(
  score: number,
): OpportunityPriorityTier {
  if (score >= 70) {
    return "high";
  }

  if (score >= 45) {
    return "medium";
  }

  return "low";
}

/** Calculates customer relationship rank score for prioritisation. */
export function calculateCustomerRankScore(
  profile: Omit<CustomerProfileDetail, "rank">,
): number {
  const valueWeight = profile.lifetimeValueAmount / 200000;
  const healthWeight = (100 - profile.healthScore) * 0.5;
  const opportunityWeight = profile.openOpportunities * 8;
  const statusWeight =
    RELATIONSHIP_STATUS_WEIGHTS[profile.healthStatus] +
    (profile.relationshipStatus === "At Risk" ? 20 : 0) +
    (profile.relationshipStatus === "Strategic Partner" ? 10 : 0);

  return Math.round(valueWeight + healthWeight + opportunityWeight + statusWeight);
}

function enrichOpportunity(opportunity: RawManagedOpportunity): ManagedOpportunity {
  const priorityScore = calculateOpportunityPriorityScore(opportunity);

  return {
    ...opportunity,
    priorityScore,
    priority: classifyOpportunityPriority(priorityScore),
  };
}

function rankCustomerProfiles(
  profiles: Omit<CustomerProfileDetail, "rank">[],
): CustomerProfileDetail[] {
  return profiles
    .map((profile) => ({
      profile,
      rankScore: calculateCustomerRankScore(profile),
    }))
    .sort((left, right) => right.rankScore - left.rankScore)
    .map(({ profile }, index) => ({
      ...profile,
      rank: index + 1,
    }));
}

export const MANAGED_OPPORTUNITIES: ManagedOpportunity[] = RAW_OPPORTUNITIES.map(
  enrichOpportunity,
).sort((left, right) => right.priorityScore - left.priorityScore);

export const OPPORTUNITY_PRIORITY_GROUPS: OpportunityPriorityGroup[] = (
  ["high", "medium", "low"] as OpportunityPriorityTier[]
).map((tier) => ({
  tier,
  label: PRIORITY_TIER_LABELS[tier],
  opportunities: MANAGED_OPPORTUNITIES.filter(
    (opportunity) => opportunity.priority === tier,
  ),
}));

export const CUSTOMER_PROFILES: CustomerProfileDetail[] =
  rankCustomerProfiles(RAW_CUSTOMER_PROFILES);

export const RELATIONSHIP_ACTIONS: RelationshipAction[] = [
  {
    priority: 1,
    action: "Call Customer",
    customer: "Retail Channel Co",
    description:
      "Re-engage highest-risk VIP account. Confirm renewal intent and address open concerns.",
  },
  {
    priority: 2,
    action: "Schedule Meeting",
    customer: "OranIA Hospitality Group",
    description:
      "Final contract review for ₹18L enterprise renewal — founder presence recommended.",
  },
  {
    priority: 3,
    action: "Send Proposal",
    customer: "Commerce Partner Ltd",
    description:
      "Approve pricing and send revised platform expansion proposal by Wednesday.",
  },
  {
    priority: 4,
    action: "Follow-up Quotation",
    customer: "Consulting Client A",
    description: "Annual contract quotation awaiting review — follow up on decision timeline.",
  },
  {
    priority: 5,
    action: "Thank Customer",
    customer: "OranIA Hospitality Group",
    description: "Acknowledge Q2 service order confirmation — strengthen strategic partnership.",
  },
  {
    priority: 6,
    action: "Escalate Issue",
    customer: "Retail Channel Co",
    description:
      "30-day inactivity on VIP account — escalate to founder-led retention conversation.",
  },
];

export const CUSTOMER_PORTFOLIO: PortfolioCategory[] = [
  {
    label: "Strategic",
    customerCount: 24,
    revenueContribution: "42%",
    healthDistribution: "92% healthy",
    status: "healthy",
  },
  {
    label: "Growing",
    customerCount: 186,
    revenueContribution: "28%",
    healthDistribution: "78% healthy",
    status: "healthy",
  },
  {
    label: "Stable",
    customerCount: 637,
    revenueContribution: "24%",
    healthDistribution: "88% healthy",
    status: "healthy",
  },
  {
    label: "At Risk",
    customerCount: 12,
    revenueContribution: "4%",
    healthDistribution: "100% attention",
    status: "attention",
  },
  {
    label: "Inactive",
    customerCount: 53,
    revenueContribution: "2%",
    healthDistribution: "100% inactive",
    status: "critical",
  },
];

export const PORTFOLIO_EXECUTIVE_SUMMARY =
  "912 customers across five portfolio segments. Strategic and growing accounts drive 70% of revenue. Twelve at-risk accounts require immediate attention — three are VIP.";

export const EXECUTIVE_RECOMMENDATIONS: ExecutiveRecommendation[] = [
  {
    priority: 1,
    title: "Meet OranIA Hospitality Group this week",
    description:
      "₹18L enterprise renewal in final negotiation. Schedule founder-led contract review before month end.",
  },
  {
    priority: 2,
    title: "Contact Retail Channel Co today",
    description:
      "Highest-risk VIP account with 30 days inactivity. Immediate founder call required to prevent churn.",
  },
  {
    priority: 3,
    title: "Close three high-value opportunities",
    description:
      "OranIA renewal, Commerce Partner expansion, and Retail Channel retention represent ₹36L combined pipeline value.",
  },
  {
    priority: 4,
    title: "Re-engage inactive VIP customers",
    description:
      "Three VIP accounts with no touchpoint in 21+ days. Personal outreach recommended before weekend.",
  },
  {
    priority: 5,
    title: "Approve Commerce Partner pricing",
    description:
      "Platform expansion proposal blocked on founder pricing decision — unblock to maintain deal momentum.",
  },
];

export const WEEKLY_RELATIONSHIP_HEALTH: WeeklyRelationshipHealth = {
  trend: "+3 pts",
  engagementChange: "+12% hospitality segment",
  atRiskChange: "+2 accounts",
  summary:
    "Relationship health improved this week with stronger hospitality engagement. At-risk count rose by two — both commerce segment accounts.",
  status: "healthy",
};

export const HIGHEST_PRIORITY_RELATIONSHIP: PriorityRelationship = {
  name: "Retail Channel Co",
  industry: "Commerce",
  lifetimeValue: "₹8L",
  status: "critical",
  reason: "VIP account — 30 days without contact, churn risk elevated",
  action: "Founder re-engagement call today",
};

export const HIGHEST_PRIORITY_OPPORTUNITY: PriorityOpportunity = {
  name: "OranIA Group — Enterprise Renewal",
  customer: "OranIA Hospitality Group",
  value: "₹18L",
  stage: "Negotiation",
  probability: 85,
  expectedClose: "28 Jul 2026",
  action: "Final contract review with founder",
  status: "healthy",
};

export const WEEKLY_EXECUTIVE_SUMMARY =
  "This week: close OranIA ₹18L renewal, re-engage Retail Channel Co, and advance three high-priority opportunities totalling ₹36L.";
