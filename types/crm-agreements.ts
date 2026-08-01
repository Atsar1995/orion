/**
 * ORION Commercial Agreements — Proposal, Contract & Agreements (Mission P-008.3).
 * D-003 domain. References Party and Opportunity — does not own identity.
 */

export type AgreementLifecycleStatus =
  | "draft"
  | "review"
  | "approved"
  | "issued"
  | "accepted"
  | "rejected"
  | "signed"
  | "active"
  | "expired"
  | "renewed"
  | "archived";

export type ContractType =
  | "corporate"
  | "travel_agent"
  | "supplier"
  | "partnership"
  | "service"
  | "master";

export type RateAgreementType =
  | "corporate"
  | "travel_agent"
  | "seasonal"
  | "promotional"
  | "negotiated";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type CommercialTerm = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly category?: string;
};

export type PricingLineItem = {
  readonly id: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly discountPercent?: number;
  readonly taxPercent?: number;
};

export type PricingSchedule = {
  readonly id: string;
  readonly currency: string;
  readonly lineItems: readonly PricingLineItem[];
  readonly subtotal: number;
  readonly discountTotal: number;
  readonly taxTotal: number;
  readonly total: number;
};

export type AgreementVersion = {
  readonly version: number;
  readonly createdAt: string;
  readonly createdBy?: string;
  readonly changeSummary: string;
  readonly snapshotStatus: AgreementLifecycleStatus;
};

export type ApprovalRecord = {
  readonly id: string;
  readonly entityType: "proposal" | "quotation" | "contract" | "rate_agreement";
  readonly entityId: string;
  readonly status: ApprovalStatus;
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly decidedBy?: string;
  readonly decidedAt?: string;
  readonly notes?: string;
};

export type RenewalRecord = {
  readonly id: string;
  readonly contractId: string;
  readonly previousContractId?: string;
  readonly renewalDate: string;
  readonly newValidTo: string;
  readonly status: AgreementLifecycleStatus;
  readonly notes?: string;
};

export type ProposalRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly opportunityId?: string;
  readonly title: string;
  readonly templateId?: string;
  readonly version: number;
  readonly versions: readonly AgreementVersion[];
  readonly status: AgreementLifecycleStatus;
  readonly owner: string;
  readonly pricing: PricingSchedule;
  readonly terms: readonly CommercialTerm[];
  readonly validUntil?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type QuotationRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly proposalId?: string;
  readonly opportunityId?: string;
  readonly reference: string;
  readonly version: number;
  readonly status: AgreementLifecycleStatus;
  readonly owner: string;
  readonly pricing: PricingSchedule;
  readonly validFrom: string;
  readonly validTo: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ContractRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly opportunityId?: string;
  readonly proposalId?: string;
  readonly quotationId?: string;
  readonly title: string;
  readonly contractType: ContractType;
  readonly version: number;
  readonly versions: readonly AgreementVersion[];
  readonly status: AgreementLifecycleStatus;
  readonly owner: string;
  readonly pricing: PricingSchedule;
  readonly terms: readonly CommercialTerm[];
  readonly effectiveFrom: string;
  readonly effectiveTo: string;
  readonly renewalRule?: string;
  readonly signedAt?: string;
  readonly attachmentRefs?: readonly string[];
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RateAgreementRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly contractId?: string;
  readonly name: string;
  readonly agreementType: RateAgreementType;
  readonly version: number;
  readonly status: AgreementLifecycleStatus;
  readonly owner: string;
  readonly pricing: PricingSchedule;
  readonly validFrom: string;
  readonly validTo: string;
  readonly season?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateProposalInput = {
  partyId: string;
  opportunityId?: string;
  title: string;
  owner: string;
  templateId?: string;
  pricing: Omit<PricingSchedule, "id">;
  terms?: CommercialTerm[];
  validUntil?: string;
  notes?: string;
};

export type CreateQuotationInput = {
  partyId: string;
  proposalId?: string;
  opportunityId?: string;
  owner: string;
  pricing: Omit<PricingSchedule, "id">;
  validFrom: string;
  validTo: string;
  notes?: string;
};

export type CreateContractInput = {
  partyId: string;
  opportunityId?: string;
  proposalId?: string;
  quotationId?: string;
  title: string;
  contractType: ContractType;
  owner: string;
  pricing: Omit<PricingSchedule, "id">;
  terms?: CommercialTerm[];
  effectiveFrom: string;
  effectiveTo: string;
  renewalRule?: string;
  notes?: string;
};

export type CreateRateAgreementInput = {
  partyId: string;
  contractId?: string;
  name: string;
  agreementType: RateAgreementType;
  owner: string;
  pricing: Omit<PricingSchedule, "id">;
  validFrom: string;
  validTo: string;
  season?: string;
  notes?: string;
};

export type RequestApprovalInput = {
  entityType: ApprovalRecord["entityType"];
  entityId: string;
  requestedBy: string;
  notes?: string;
};

export type DecideApprovalInput = {
  approvalId: string;
  approved: boolean;
  decidedBy: string;
  notes?: string;
};

export type RenewContractInput = {
  contractId: string;
  newEffectiveTo: string;
  notes?: string;
};

export type AgreementSearchFilter = {
  query?: string;
  status?: AgreementLifecycleStatus;
  partyId?: string;
  owner?: string;
};

export type AgreementsEngineEventType =
  | "ProposalCreated"
  | "ProposalApproved"
  | "ContractSigned"
  | "ContractRenewed"
  | "ContractExpired"
  | "RateAgreementUpdated";

export type PublishAgreementsEngineEventInput = {
  eventType: AgreementsEngineEventType;
  entityId: string;
  actorId?: string;
  actorName?: string;
  payload?: Record<string, string>;
};
