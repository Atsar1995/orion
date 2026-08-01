import type { RelationshipMilestoneRecord } from "@/types/crm-customer-intelligence";

const TENANT = "org-orania";

const MILESTONES: RelationshipMilestoneRecord[] = [
  {
    id: "ms-orania-renewal-2026",
    partyId: "org-party-orania-hospitality-group",
    organizationId: TENANT,
    milestone: "Enterprise renewal entered negotiation",
    recordedAt: "2026-07-15T09:00:00.000Z",
    outcome: "Proposal v2 under founder review",
  },
  {
    id: "ms-commerce-expansion",
    partyId: "org-party-commerce-partner-ltd",
    organizationId: TENANT,
    milestone: "Platform expansion opportunity qualified",
    recordedAt: "2026-07-20T09:00:00.000Z",
    outcome: "Quotation issued",
  },
  {
    id: "ms-retail-churn-risk",
    partyId: "org-party-retail-channel-co",
    organizationId: TENANT,
    milestone: "Retention risk elevated — 30 days no contact",
    recordedAt: "2026-07-28T09:00:00.000Z",
    outcome: "Executive outreach scheduled",
  },
];

/** Hospitality enrichment hints keyed by party slug fragment (Mission P-008.6 bridge). */
export const HOSPITALITY_ENRICHMENT: Record<
  string,
  { stays: number; loyaltyTier: string; lastStay: string; totalSpend: number }
> = {
  "orania-hospitality-group": { stays: 24, loyaltyTier: "Platinum", lastStay: "2026-07-18", totalSpend: 4200000 },
  "luxury-retreats": { stays: 8, loyaltyTier: "Gold", lastStay: "2026-06-12", totalSpend: 960000 },
  "retail-channel-co": { stays: 3, loyaltyTier: "Silver", lastStay: "2026-05-01", totalSpend: 180000 },
};

export function buildCustomerIntelligenceSeed(): {
  milestones: RelationshipMilestoneRecord[];
} {
  return { milestones: [...MILESTONES] };
}

export { TENANT as CUSTOMER_INTELLIGENCE_SEED_TENANT };
