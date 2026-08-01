import { resolveCustomerOrganisationId } from "@/lib/crm/data/seed-parties";
import { CRM_CUSTOMER_RECORDS } from "@/lib/crm/data/customer-records";
import type {
  CommercialActivityRecord,
  CommercialOpportunityRecord,
  CommercialOpportunityStage,
  LeadRecord,
  LeadSource,
} from "@/types/crm-commercial";
import type { OpportunityStage } from "@/lib/crm/models/opportunities";

const TENANT = "org-orania";
const NOW = "2026-07-30T09:00:00.000Z";

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  return `₹${Math.round(amount / 1000)}K`;
}

export function mapLegacyStageToCommercial(stage: OpportunityStage): CommercialOpportunityStage {
  const map: Record<OpportunityStage, CommercialOpportunityStage> = {
    Lead: "identified",
    Qualified: "qualified",
    Proposal: "proposal",
    Negotiation: "negotiation",
    Won: "won",
    Lost: "lost",
  };
  return map[stage];
}

export function mapCommercialStageToLegacy(stage: CommercialOpportunityStage): OpportunityStage {
  const map: Record<CommercialOpportunityStage, OpportunityStage> = {
    identified: "Lead",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
    closed: "Won",
  };
  return map[stage];
}

const RAW_OPPORTUNITIES: Array<{
  id: string;
  name: string;
  customerId: string;
  customer: string;
  stage: CommercialOpportunityStage;
  valueAmount: number;
  probability: number;
  expectedClose: string;
  owner: string;
  lastUpdated: string;
  nextActivity: string;
  summary: string;
  score: number;
  source?: LeadSource;
  leadId?: string;
}> = [
  {
    id: "orania-enterprise-renewal",
    name: "OranIA Group — Enterprise Renewal",
    customerId: "orania-hospitality-group",
    customer: "OranIA Hospitality Group",
    stage: "negotiation",
    valueAmount: 1800000,
    probability: 85,
    expectedClose: "28 Jul 2026",
    owner: "Founder",
    lastUpdated: "24 Jul 2026",
    nextActivity: "Final contract review with founder",
    summary: "Enterprise renewal in final negotiation.",
    score: 88,
    source: "corporate",
  },
  {
    id: "commerce-platform-expansion",
    name: "Commerce Partner — Platform Expansion",
    customerId: "commerce-partner-ltd",
    customer: "Commerce Partner Ltd",
    stage: "proposal",
    valueAmount: 1200000,
    probability: 65,
    expectedClose: "15 Aug 2026",
    owner: "Sales Director",
    lastUpdated: "24 Jul 2026",
    nextActivity: "Approve pricing and send revised proposal",
    summary: "Platform expansion proposal sent.",
    score: 72,
    source: "referral",
  },
  {
    id: "retail-retention-package",
    name: "Retail Channel — Retention Package",
    customerId: "retail-channel-co",
    customer: "Retail Channel Co",
    stage: "qualified",
    valueAmount: 600000,
    probability: 40,
    expectedClose: "20 Aug 2026",
    owner: "Founder",
    lastUpdated: "23 Jul 2026",
    nextActivity: "Founder re-engagement call",
    summary: "Retention deal at risk due to VIP inactivity.",
    score: 76,
    source: "corporate",
  },
  {
    id: "luxury-new-property",
    name: "Luxury Retreats — New Property",
    customerId: "luxury-retreats",
    customer: "Luxury Retreats",
    stage: "identified",
    valueAmount: 800000,
    probability: 45,
    expectedClose: "30 Sep 2026",
    owner: "Relationship Manager",
    lastUpdated: "23 Jul 2026",
    nextActivity: "Schedule property walkthrough",
    summary: "New property deal in early discovery.",
    score: 58,
    source: "travel_agent",
    leadId: "lead-luxury-retreats",
  },
  {
    id: "consulting-annual-contract",
    name: "Consulting Client A — Annual Contract",
    customerId: "consulting-client-a",
    customer: "Consulting Client A",
    stage: "identified",
    valueAmount: 400000,
    probability: 30,
    expectedClose: "15 Oct 2026",
    owner: "Sales Director",
    lastUpdated: "22 Jul 2026",
    nextActivity: "Send capability overview",
    summary: "Annual contract quotation prepared.",
    score: 42,
    source: "website",
    leadId: "lead-consulting-client-a",
  },
  {
    id: "travel-seasonal-package",
    name: "Travel Partner — Seasonal Package",
    customerId: "travel-partner-agency",
    customer: "Travel Partner Agency",
    stage: "identified",
    valueAmount: 300000,
    probability: 25,
    expectedClose: "1 Nov 2026",
    owner: "Relationship Manager",
    lastUpdated: "21 Jul 2026",
    nextActivity: "Introductory meeting",
    summary: "Seasonal package opportunity in early discovery.",
    score: 35,
    source: "travel_agent",
    leadId: "lead-travel-partner",
  },
  {
    id: "abc-equipment-upgrade",
    name: "ABC Industries — Equipment Upgrade",
    customerId: "abc-industries",
    customer: "ABC Industries",
    stage: "proposal",
    valueAmount: 500000,
    probability: 55,
    expectedClose: "10 Aug 2026",
    owner: "Sales Director",
    lastUpdated: "20 Jul 2026",
    nextActivity: "Proposal awaiting approval",
    summary: "Equipment upgrade proposal awaiting internal approval.",
    score: 61,
    source: "corporate",
  },
  {
    id: "orania-q2-service-order",
    name: "OranIA Group — Q2 Service Order",
    customerId: "orania-hospitality-group",
    customer: "OranIA Hospitality Group",
    stage: "won",
    valueAmount: 600000,
    probability: 100,
    expectedClose: "21 Jul 2026",
    owner: "Founder",
    lastUpdated: "21 Jul 2026",
    nextActivity: "Onboarding complete",
    summary: "Q2 service order confirmed.",
    score: 0,
    source: "corporate",
  },
  {
    id: "hospitality-onboarding",
    name: "Coastal Hotels — Onboarding Package",
    customerId: "coastal-hotels",
    customer: "Coastal Hotels",
    stage: "won",
    valueAmount: 250000,
    probability: 100,
    expectedClose: "15 Jul 2026",
    owner: "Relationship Manager",
    lastUpdated: "15 Jul 2026",
    nextActivity: "Handoff to customer success",
    summary: "Onboarding package closed.",
    score: 0,
    source: "referral",
  },
  {
    id: "sunrise-reactivation",
    name: "Sunrise Exports — Reactivation Deal",
    customerId: "sunrise-exports",
    customer: "Sunrise Exports",
    stage: "lost",
    valueAmount: 150000,
    probability: 0,
    expectedClose: "10 Jul 2026",
    owner: "Relationship Manager",
    lastUpdated: "10 Jul 2026",
    nextActivity: "Archive and schedule reactivation outreach",
    summary: "Reactivation deal lost after inactivity.",
    score: 0,
    source: "email",
  },
  {
    id: "regional-partner-expansion",
    name: "Regional Partner — Expansion Pilot",
    customerId: "regional-partner-ltd",
    customer: "Regional Partner Ltd",
    stage: "qualified",
    valueAmount: 700000,
    probability: 50,
    expectedClose: "5 Sep 2026",
    owner: "Sales Director",
    lastUpdated: "18 Jul 2026",
    nextActivity: "Discovery workshop",
    summary: "Expansion pilot qualified.",
    score: 55,
    source: "campaign",
  },
  {
    id: "legacy-client-downgrade",
    name: "Legacy Client — Contract Downgrade",
    customerId: "legacy-client-corp",
    customer: "Legacy Client Corp",
    stage: "lost",
    valueAmount: 200000,
    probability: 0,
    expectedClose: "5 Jul 2026",
    owner: "Sales Director",
    lastUpdated: "5 Jul 2026",
    nextActivity: "Document loss reason",
    summary: "Contract downgrade lost to competitor.",
    score: 0,
    source: "phone",
  },
];

function buildOpportunities(): CommercialOpportunityRecord[] {
  return RAW_OPPORTUNITIES.map((record) => {
    const customer = CRM_CUSTOMER_RECORDS.find((entry) => entry.id === record.customerId);
    return {
      id: record.id,
      organizationId: TENANT,
      partyId: resolveCustomerOrganisationId(record.customerId, customer?.company ?? record.customer),
      organisationPartyId: resolveCustomerOrganisationId(record.customerId, customer?.company ?? record.customer),
      leadId: record.leadId,
      name: record.name,
      stage: record.stage,
      source: record.source,
      industry: customer?.industry,
      territory: "West India",
      owner: record.owner,
      valueAmount: record.valueAmount,
      probability: record.probability,
      expectedClose: record.expectedClose,
      nextActivity: record.nextActivity,
      tags: record.stage === "negotiation" ? ["strategic", "renewal"] : undefined,
      score: record.score,
      summary: record.summary,
      createdAt: NOW,
      updatedAt: record.lastUpdated,
    };
  });
}

const LEAD_SEED: LeadRecord[] = [
  {
    id: "lead-luxury-retreats",
    organizationId: TENANT,
    organisationPartyId: resolveCustomerOrganisationId("luxury-retreats", "Luxury Retreats"),
    displayName: "Luxury Retreats — New Property Inquiry",
    source: "travel_agent",
    industry: "Hospitality",
    territory: "West India",
    owner: "Relationship Manager",
    estimatedValue: 800000,
    probability: 45,
    expectedClose: "30 Sep 2026",
    nextActivity: "Schedule property walkthrough",
    tags: ["hospitality", "new-property"],
    status: "qualified",
    notes: "Converted to opportunity after initial qualification.",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "lead-consulting-client-a",
    organizationId: TENANT,
    organisationPartyId: resolveCustomerOrganisationId("consulting-client-a", "Consulting Client A"),
    displayName: "Consulting Client A — Annual Contract Inquiry",
    source: "website",
    industry: "Professional Services",
    territory: "South India",
    owner: "Sales Director",
    estimatedValue: 400000,
    probability: 30,
    expectedClose: "15 Oct 2026",
    nextActivity: "Send capability overview",
    status: "contacted",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "lead-travel-partner",
    organizationId: TENANT,
    organisationPartyId: resolveCustomerOrganisationId("travel-partner-agency", "Travel Partner Agency"),
    displayName: "Travel Partner Agency — Seasonal Package",
    source: "travel_agent",
    industry: "Travel",
    territory: "National",
    owner: "Relationship Manager",
    estimatedValue: 300000,
    probability: 25,
    expectedClose: "1 Nov 2026",
    nextActivity: "Introductory meeting",
    status: "new",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "lead-coastal-hotels-web",
    organizationId: TENANT,
    displayName: "Coastal Hotels — Website Inquiry",
    source: "website",
    industry: "Hospitality",
    territory: "East India",
    owner: "Sales Director",
    estimatedValue: 350000,
    probability: 20,
    expectedClose: "30 Nov 2026",
    nextActivity: "Qualification call",
    status: "new",
    tags: ["inbound"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "lead-campaign-q3",
    organizationId: TENANT,
    displayName: "Q3 Campaign — Enterprise Bundle",
    source: "campaign",
    industry: "Commerce",
    territory: "National",
    owner: "Founder",
    estimatedValue: 950000,
    probability: 35,
    expectedClose: "15 Sep 2026",
    nextActivity: "Campaign follow-up webinar",
    status: "proposal_requested",
    tags: ["campaign", "enterprise"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "lead-walkin-demo",
    organizationId: TENANT,
    displayName: "Walk-in Demo — Regional Distributor",
    source: "walk_in",
    industry: "Commerce",
    territory: "West India",
    owner: "Sales Director",
    estimatedValue: 220000,
    probability: 15,
    nextActivity: "Product demo scheduling",
    status: "new",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "lead-social-linkedin",
    organizationId: TENANT,
    displayName: "LinkedIn Inbound — SaaS Integrator",
    source: "social_media",
    industry: "Technology",
    territory: "National",
    owner: "Relationship Manager",
    estimatedValue: 180000,
    probability: 10,
    nextActivity: "Initial discovery call",
    status: "new",
    tags: ["social"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "lead-import-expo",
    organizationId: TENANT,
    displayName: "Trade Expo Import — 12 contacts",
    source: "import",
    industry: "Mixed",
    territory: "National",
    owner: "Sales Director",
    estimatedValue: 1500000,
    probability: 15,
    nextActivity: "Bulk qualification review",
    status: "qualified",
    tags: ["import", "bulk"],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

function buildActivities(
  leads: LeadRecord[],
  opportunities: CommercialOpportunityRecord[],
): CommercialActivityRecord[] {
  return [
    {
      id: "comm-act-1",
      organizationId: TENANT,
      opportunityId: "orania-enterprise-renewal",
      partyId: opportunities.find((entry) => entry.id === "orania-enterprise-renewal")?.partyId,
      type: "meeting",
      subject: "Final contract review with founder",
      dueAt: "2026-07-28T10:00:00.000Z",
      owner: "Founder",
      createdAt: NOW,
    },
    {
      id: "comm-act-2",
      organizationId: TENANT,
      leadId: "lead-campaign-q3",
      type: "call",
      subject: "Campaign follow-up webinar",
      dueAt: "2026-08-01T14:00:00.000Z",
      owner: "Founder",
      createdAt: NOW,
    },
    {
      id: "comm-act-3",
      organizationId: TENANT,
      leadId: leads[2]?.id,
      type: "email",
      subject: "Introductory meeting confirmation",
      owner: "Relationship Manager",
      createdAt: NOW,
    },
  ];
}

/** Builds mutable commercial seed for in-memory repository. */
export function buildCommercialSeed(): {
  leads: LeadRecord[];
  opportunities: CommercialOpportunityRecord[];
  activities: CommercialActivityRecord[];
} {
  const opportunities = buildOpportunities();
  const leads = LEAD_SEED;
  const activities = buildActivities(leads, opportunities);
  return { leads, opportunities, activities };
}

export { formatCurrency as formatCommercialCurrency, TENANT as COMMERCIAL_SEED_TENANT };
