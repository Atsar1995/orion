import { resolveCustomerOrganisationId } from "@/lib/crm/data/seed-parties";
import type {
  ApprovalRecord,
  ContractRecord,
  PricingSchedule,
  ProposalRecord,
  QuotationRecord,
  RateAgreementRecord,
  RenewalRecord,
} from "@/types/crm-agreements";

const TENANT = "org-orania";
const NOW = "2026-07-30T09:00:00.000Z";

function pricing(
  id: string,
  items: Array<{ description: string; quantity: number; unitPrice: number; discountPercent?: number; taxPercent?: number }>,
): PricingSchedule {
  const lineItems = items.map((item, index) => ({
    id: `${id}-line-${index + 1}`,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPercent: item.discountPercent,
    taxPercent: item.taxPercent ?? 18,
  }));
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * ((item.discountPercent ?? 0) / 100),
    0,
  );
  const afterDiscount = subtotal - discountTotal;
  const taxTotal = lineItems.reduce(
    (sum, item) => {
      const line = item.quantity * item.unitPrice * (1 - (item.discountPercent ?? 0) / 100);
      return sum + line * ((item.taxPercent ?? 18) / 100);
    },
    0,
  );
  return {
    id,
    currency: "INR",
    lineItems,
    subtotal,
    discountTotal,
    taxTotal,
    total: Math.round(afterDiscount + taxTotal),
  };
}

const PROPOSALS: ProposalRecord[] = [
  {
    id: "prop-orania-renewal-v2",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("orania-hospitality-group", "OranIA Hospitality Group"),
    opportunityId: "orania-enterprise-renewal",
    title: "OranIA Group — Enterprise Renewal Proposal",
    templateId: "tmpl-enterprise-renewal",
    version: 2,
    versions: [
      { version: 1, createdAt: "2026-07-15T09:00:00.000Z", createdBy: "Sales Director", changeSummary: "Initial draft", snapshotStatus: "draft" },
      { version: 2, createdAt: NOW, createdBy: "Founder", changeSummary: "Pricing revision after negotiation", snapshotStatus: "review" },
    ],
    status: "review",
    owner: "Founder",
    pricing: pricing("prop-orania-pricing", [
      { description: "Enterprise Platform License", quantity: 1, unitPrice: 1200000, discountPercent: 5 },
      { description: "Premium Support", quantity: 1, unitPrice: 400000 },
    ]),
    terms: [
      { id: "term-1", label: "Payment Terms", value: "Net 30", category: "billing" },
      { id: "term-2", label: "SLA", value: "99.9% uptime", category: "service" },
    ],
    validUntil: "2026-08-15",
    notes: "Awaiting founder approval before customer issue.",
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: NOW,
  },
  {
    id: "prop-commerce-expansion",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("commerce-partner-ltd", "Commerce Partner Ltd"),
    opportunityId: "commerce-platform-expansion",
    title: "Commerce Partner — Platform Expansion Proposal",
    templateId: "tmpl-platform-expansion",
    version: 1,
    versions: [{ version: 1, createdAt: NOW, changeSummary: "Initial proposal", snapshotStatus: "approved" }],
    status: "approved",
    owner: "Sales Director",
    pricing: pricing("prop-commerce-pricing", [
      { description: "Platform Expansion Module", quantity: 1, unitPrice: 900000, discountPercent: 10 },
      { description: "Implementation Services", quantity: 40, unitPrice: 7500 },
    ]),
    terms: [{ id: "term-3", label: "Go-live", value: "60 days from signing", category: "delivery" }],
    validUntil: "2026-08-20",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "prop-abc-equipment",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("abc-industries", "ABC Industries Pvt Ltd"),
    opportunityId: "abc-equipment-upgrade",
    title: "ABC Industries — Equipment Upgrade Proposal",
    version: 1,
    versions: [{ version: 1, createdAt: NOW, changeSummary: "Draft", snapshotStatus: "draft" }],
    status: "draft",
    owner: "Sales Director",
    pricing: pricing("prop-abc-pricing", [{ description: "Equipment Upgrade Package", quantity: 1, unitPrice: 500000 }]),
    terms: [],
    validUntil: "2026-08-10",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const QUOTATIONS: QuotationRecord[] = [
  {
    id: "quote-commerce-expansion-001",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("commerce-partner-ltd", "Commerce Partner Ltd"),
    proposalId: "prop-commerce-expansion",
    opportunityId: "commerce-platform-expansion",
    reference: "QT-2026-0042",
    version: 1,
    status: "issued",
    owner: "Sales Director",
    pricing: pricing("quote-commerce-pricing", [
      { description: "Platform Expansion Module", quantity: 1, unitPrice: 900000, discountPercent: 10 },
      { description: "Implementation Services", quantity: 40, unitPrice: 7500 },
    ]),
    validFrom: "2026-07-24",
    validTo: "2026-08-24",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "quote-consulting-annual",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("consulting-client-a", "Consulting Client A"),
    opportunityId: "consulting-annual-contract",
    reference: "QT-2026-0038",
    version: 1,
    status: "accepted",
    owner: "Sales Director",
    pricing: pricing("quote-consulting-pricing", [{ description: "Annual Service Contract", quantity: 1, unitPrice: 400000, discountPercent: 5 }]),
    validFrom: "2026-07-01",
    validTo: "2026-07-31",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const CONTRACTS: ContractRecord[] = [
  {
    id: "contract-orania-q2-service",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("orania-hospitality-group", "OranIA Hospitality Group"),
    opportunityId: "orania-q2-service-order",
    title: "OranIA Group — Q2 Service Agreement",
    contractType: "corporate",
    version: 1,
    versions: [{ version: 1, createdAt: "2026-07-21T09:00:00.000Z", changeSummary: "Executed", snapshotStatus: "signed" }],
    status: "active",
    owner: "Founder",
    pricing: pricing("contract-orania-q2", [{ description: "Q2 Service Package", quantity: 1, unitPrice: 600000 }]),
    terms: [{ id: "ct-1", label: "Term", value: "12 months", category: "duration" }],
    effectiveFrom: "2026-07-21",
    effectiveTo: "2027-07-20",
    renewalRule: "Auto-renew with 90-day notice",
    signedAt: "2026-07-21T10:00:00.000Z",
    createdAt: "2026-07-21T09:00:00.000Z",
    updatedAt: NOW,
  },
  {
    id: "contract-coastal-onboarding",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("coastal-hotels", "Coastal Hotels"),
    opportunityId: "hospitality-onboarding",
    title: "Coastal Hotels — Onboarding Agreement",
    contractType: "service",
    version: 1,
    versions: [{ version: 1, createdAt: "2026-07-15T09:00:00.000Z", changeSummary: "Signed", snapshotStatus: "signed" }],
    status: "active",
    owner: "Relationship Manager",
    pricing: pricing("contract-coastal", [{ description: "Onboarding Package", quantity: 1, unitPrice: 250000 }]),
    terms: [],
    effectiveFrom: "2026-07-15",
    effectiveTo: "2027-01-14",
    signedAt: "2026-07-15T11:00:00.000Z",
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: NOW,
  },
  {
    id: "contract-luxury-corporate",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("luxury-retreats", "Luxury Retreats"),
    title: "Luxury Retreats — Corporate Rate Agreement Contract",
    contractType: "corporate",
    version: 1,
    versions: [{ version: 1, createdAt: NOW, changeSummary: "Pending signature", snapshotStatus: "approved" }],
    status: "approved",
    owner: "Relationship Manager",
    pricing: pricing("contract-luxury", [{ description: "Corporate Room Nights (annual)", quantity: 500, unitPrice: 1200, discountPercent: 15 }]),
    terms: [{ id: "ct-2", label: "Minimum Commitment", value: "200 room nights", category: "volume" }],
    effectiveFrom: "2026-09-01",
    effectiveTo: "2027-08-31",
    renewalRule: "Manual renewal 60 days before expiry",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "contract-expiring-retail",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("retail-channel-co", "Retail Channel Co"),
    title: "Retail Channel — Retention Agreement",
    contractType: "corporate",
    version: 1,
    versions: [{ version: 1, createdAt: "2025-08-01T09:00:00.000Z", changeSummary: "Original", snapshotStatus: "signed" }],
    status: "active",
    owner: "Founder",
    pricing: pricing("contract-retail", [{ description: "Retention Package", quantity: 1, unitPrice: 600000 }]),
    terms: [],
    effectiveFrom: "2025-08-01",
    effectiveTo: "2026-08-15",
    renewalRule: "Requires renegotiation",
    signedAt: "2025-08-01T10:00:00.000Z",
    createdAt: "2025-08-01T09:00:00.000Z",
    updatedAt: NOW,
  },
];

const RATE_AGREEMENTS: RateAgreementRecord[] = [
  {
    id: "rate-orania-corporate",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("orania-hospitality-group", "OranIA Hospitality Group"),
    contractId: "contract-orania-q2-service",
    name: "OranIA Corporate Room Rate",
    agreementType: "corporate",
    version: 1,
    status: "active",
    owner: "Relationship Manager",
    pricing: pricing("rate-orania", [{ description: "Standard Room — Corporate", quantity: 1, unitPrice: 8500, discountPercent: 20 }]),
    validFrom: "2026-07-21",
    validTo: "2027-07-20",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "rate-travel-agent-seasonal",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("travel-partner-agency", "Travel Partner Agency"),
    name: "Travel Partner — Seasonal Package Rate",
    agreementType: "seasonal",
    version: 1,
    status: "active",
    owner: "Relationship Manager",
    pricing: pricing("rate-travel", [{ description: "Seasonal Package — Per Pax", quantity: 1, unitPrice: 4500, discountPercent: 12 }]),
    validFrom: "2026-10-01",
    validTo: "2027-03-31",
    season: "Winter 2026-27",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "rate-luxury-promo",
    organizationId: TENANT,
    partyId: resolveCustomerOrganisationId("luxury-retreats", "Luxury Retreats"),
    contractId: "contract-luxury-corporate",
    name: "Luxury Retreats — Promotional Rate",
    agreementType: "promotional",
    version: 1,
    status: "approved",
    owner: "Sales Director",
    pricing: pricing("rate-luxury-promo", [{ description: "Suite Upgrade Promo", quantity: 1, unitPrice: 15000, discountPercent: 25 }]),
    validFrom: "2026-09-01",
    validTo: "2026-12-31",
    season: "Q4 Launch",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const APPROVALS: ApprovalRecord[] = [
  {
    id: "approval-prop-orania",
    entityType: "proposal",
    entityId: "prop-orania-renewal-v2",
    status: "pending",
    requestedBy: "Sales Director",
    requestedAt: NOW,
    notes: "Founder sign-off required for discount tier",
  },
  {
    id: "approval-prop-abc",
    entityType: "proposal",
    entityId: "prop-abc-equipment",
    status: "pending",
    requestedBy: "Sales Director",
    requestedAt: NOW,
  },
  {
    id: "approval-contract-luxury",
    entityType: "contract",
    entityId: "contract-luxury-corporate",
    status: "approved",
    requestedBy: "Relationship Manager",
    requestedAt: "2026-07-28T09:00:00.000Z",
    decidedBy: "Founder",
    decidedAt: NOW,
  },
];

const RENEWALS: RenewalRecord[] = [
  {
    id: "renewal-retail-channel",
    contractId: "contract-expiring-retail",
    renewalDate: "2026-08-01",
    newValidTo: "2027-08-01",
    status: "review",
    notes: "Retention renewal — founder engagement required",
  },
  {
    id: "renewal-orania-fy27",
    contractId: "contract-orania-q2-service",
    previousContractId: "contract-orania-q2-service",
    renewalDate: "2027-04-01",
    newValidTo: "2028-07-20",
    status: "draft",
    notes: "Planned FY27 renewal",
  },
];

export function buildAgreementsSeed(): {
  proposals: ProposalRecord[];
  quotations: QuotationRecord[];
  contracts: ContractRecord[];
  rateAgreements: RateAgreementRecord[];
  approvals: ApprovalRecord[];
  renewals: RenewalRecord[];
} {
  return {
    proposals: [...PROPOSALS],
    quotations: [...QUOTATIONS],
    contracts: [...CONTRACTS],
    rateAgreements: [...RATE_AGREEMENTS],
    approvals: [...APPROVALS],
    renewals: [...RENEWALS],
  };
}

export { TENANT as AGREEMENTS_SEED_TENANT };
