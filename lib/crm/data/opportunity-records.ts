import type {
  CrmOpportunityRecord,
  OpportunityHealthLabel,
  OpportunityPriorityLabel,
  OpportunityStage,
} from "@/lib/crm/models/opportunities";

export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

/** Maps stage and deal signals to executive health label. */
export function resolveOpportunityHealthLabel(input: {
  stage: OpportunityStage;
  probability: number;
  customerHealthScore: number;
}): OpportunityHealthLabel {
  if (input.stage === "Won") {
    return "Closed Won";
  }

  if (input.stage === "Lost") {
    return "Closed Lost";
  }

  if (input.probability >= 70 && input.customerHealthScore >= 75) {
    return "Healthy";
  }

  if (input.probability < 40 || input.customerHealthScore < 55) {
    return "High Risk";
  }

  return "Needs Attention";
}

/** Maps numeric priority score to executive priority label. */
export function resolveOpportunityPriorityLabel(score: number): OpportunityPriorityLabel {
  if (score >= 70) {
    return "High";
  }

  if (score >= 45) {
    return "Medium";
  }

  return "Low";
}

function formatExpectedRevenue(valueAmount: number, probability: number): string {
  const amount = Math.round((valueAmount * probability) / 100);

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  }

  return `₹${Math.round(amount / 1000)}K`;
}

type RawOpportunityRecord = Omit<
  CrmOpportunityRecord,
  "healthLabel" | "priority" | "expectedRevenue"
> & {
  customerHealthScore: number;
  priorityScore: number;
};

const RAW_OPPORTUNITY_RECORDS: RawOpportunityRecord[] = [
  {
    id: "orania-enterprise-renewal",
    name: "OranIA Group — Enterprise Renewal",
    customer: "OranIA Hospitality Group",
    customerId: "orania-hospitality-group",
    stage: "Negotiation",
    value: "₹18L",
    valueAmount: 1800000,
    probability: 85,
    expectedClose: "28 Jul 2026",
    assignedOwner: "Founder",
    lastUpdated: "24 Jul 2026",
    nextAction: "Final contract review with founder",
    summary:
      "Enterprise renewal in final negotiation. Founder presence recommended at contract review.",
    customerHealthScore: 91,
    priorityScore: 88,
  },
  {
    id: "commerce-platform-expansion",
    name: "Commerce Partner — Platform Expansion",
    customer: "Commerce Partner Ltd",
    customerId: "commerce-partner-ltd",
    stage: "Proposal",
    value: "₹12L",
    valueAmount: 1200000,
    probability: 65,
    expectedClose: "15 Aug 2026",
    assignedOwner: "Sales Director",
    lastUpdated: "24 Jul 2026",
    nextAction: "Approve pricing and send revised proposal",
    summary:
      "Platform expansion proposal sent. Awaiting founder pricing approval before customer sign-off.",
    customerHealthScore: 78,
    priorityScore: 72,
  },
  {
    id: "retail-retention-package",
    name: "Retail Channel — Retention Package",
    customer: "Retail Channel Co",
    customerId: "retail-channel-co",
    stage: "Qualified",
    value: "₹6L",
    valueAmount: 600000,
    probability: 40,
    expectedClose: "20 Aug 2026",
    assignedOwner: "Founder",
    lastUpdated: "23 Jul 2026",
    nextAction: "Founder re-engagement call",
    summary:
      "Retention deal at risk due to VIP inactivity. Founder intervention required to maintain momentum.",
    customerHealthScore: 52,
    priorityScore: 76,
  },
  {
    id: "luxury-new-property",
    name: "Luxury Retreats — New Property",
    customer: "Luxury Retreats",
    customerId: "luxury-retreats",
    stage: "Lead",
    value: "₹8L",
    valueAmount: 800000,
    probability: 45,
    expectedClose: "30 Sep 2026",
    assignedOwner: "Relationship Manager",
    lastUpdated: "23 Jul 2026",
    nextAction: "Schedule property walkthrough",
    summary: "New property deal in early discovery. Accelerate to proposal before Q3 budget lock.",
    customerHealthScore: 86,
    priorityScore: 58,
  },
  {
    id: "consulting-annual-contract",
    name: "Consulting Client A — Annual Contract",
    customer: "Consulting Client A",
    customerId: "consulting-client-a",
    stage: "Lead",
    value: "₹4L",
    valueAmount: 400000,
    probability: 30,
    expectedClose: "15 Oct 2026",
    assignedOwner: "Sales Director",
    lastUpdated: "22 Jul 2026",
    nextAction: "Send capability overview",
    summary: "Annual contract quotation prepared. Awaiting customer review and decision timeline.",
    customerHealthScore: 82,
    priorityScore: 42,
  },
  {
    id: "travel-seasonal-package",
    name: "Travel Partner — Seasonal Package",
    customer: "Travel Partner Agency",
    customerId: "travel-partner-agency",
    stage: "Lead",
    value: "₹3L",
    valueAmount: 300000,
    probability: 25,
    expectedClose: "1 Nov 2026",
    assignedOwner: "Relationship Manager",
    lastUpdated: "21 Jul 2026",
    nextAction: "Introductory meeting",
    summary: "Seasonal package opportunity in early discovery. Introductory meeting pending.",
    customerHealthScore: 75,
    priorityScore: 35,
  },
  {
    id: "abc-equipment-upgrade",
    name: "ABC Industries — Equipment Upgrade",
    customer: "ABC Industries",
    customerId: "abc-industries",
    stage: "Proposal",
    value: "₹5L",
    valueAmount: 500000,
    probability: 55,
    expectedClose: "10 Aug 2026",
    assignedOwner: "Sales Director",
    lastUpdated: "20 Jul 2026",
    nextAction: "Proposal awaiting approval",
    summary: "High-value equipment upgrade proposal awaiting internal approval before send.",
    customerHealthScore: 68,
    priorityScore: 61,
  },
  {
    id: "orania-q2-service-order",
    name: "OranIA Group — Q2 Service Order",
    customer: "OranIA Hospitality Group",
    customerId: "orania-hospitality-group",
    stage: "Won",
    value: "₹6L",
    valueAmount: 600000,
    probability: 100,
    expectedClose: "21 Jul 2026",
    assignedOwner: "Founder",
    lastUpdated: "21 Jul 2026",
    nextAction: "Onboarding complete",
    summary: "Q2 service order confirmed and booked. Onboarding completed successfully.",
    customerHealthScore: 91,
    priorityScore: 0,
  },
  {
    id: "hospitality-onboarding",
    name: "Coastal Hotels — Onboarding Package",
    customer: "Coastal Hotels",
    customerId: "coastal-hotels",
    stage: "Won",
    value: "₹2.5L",
    valueAmount: 250000,
    probability: 100,
    expectedClose: "15 Jul 2026",
    assignedOwner: "Relationship Manager",
    lastUpdated: "15 Jul 2026",
    nextAction: "Handoff to customer success",
    summary: "Onboarding package closed. Customer success handoff in progress.",
    customerHealthScore: 80,
    priorityScore: 0,
  },
  {
    id: "sunrise-reactivation",
    name: "Sunrise Exports — Reactivation Deal",
    customer: "Sunrise Exports",
    customerId: "sunrise-exports",
    stage: "Lost",
    value: "₹1.5L",
    valueAmount: 150000,
    probability: 0,
    expectedClose: "10 Jul 2026",
    assignedOwner: "Relationship Manager",
    lastUpdated: "10 Jul 2026",
    nextAction: "Archive and schedule reactivation outreach",
    summary: "Reactivation deal lost after 45 days of inactivity. Archive and plan future outreach.",
    customerHealthScore: 58,
    priorityScore: 0,
  },
  {
    id: "regional-partner-expansion",
    name: "Regional Partner — Expansion Pilot",
    customer: "Regional Partner Ltd",
    customerId: "regional-partner-ltd",
    stage: "Qualified",
    value: "₹7L",
    valueAmount: 700000,
    probability: 50,
    expectedClose: "5 Sep 2026",
    assignedOwner: "Sales Director",
    lastUpdated: "18 Jul 2026",
    nextAction: "Discovery workshop",
    summary: "Expansion pilot qualified. Discovery workshop scheduled to define scope.",
    customerHealthScore: 74,
    priorityScore: 55,
  },
  {
    id: "legacy-client-downgrade",
    name: "Legacy Client — Contract Downgrade",
    customer: "Legacy Client Corp",
    customerId: "legacy-client-corp",
    stage: "Lost",
    value: "₹2L",
    valueAmount: 200000,
    probability: 0,
    expectedClose: "5 Jul 2026",
    assignedOwner: "Sales Director",
    lastUpdated: "5 Jul 2026",
    nextAction: "Document loss reason",
    summary: "Contract downgrade lost to competitor. Document loss reason for pipeline review.",
    customerHealthScore: 48,
    priorityScore: 0,
  },
];

/** Placeholder CRM opportunity records (TD-002). */
export const CRM_OPPORTUNITY_RECORDS: CrmOpportunityRecord[] = RAW_OPPORTUNITY_RECORDS.map(
  (record) => {
    const { customerHealthScore, priorityScore, ...rest } = record;

    return {
      ...rest,
      healthLabel: resolveOpportunityHealthLabel({
        stage: record.stage,
        probability: record.probability,
        customerHealthScore,
      }),
      priority:
        record.stage === "Won" || record.stage === "Lost"
          ? "Low"
          : resolveOpportunityPriorityLabel(priorityScore),
      expectedRevenue: formatExpectedRevenue(record.valueAmount, record.probability),
    };
  },
);
