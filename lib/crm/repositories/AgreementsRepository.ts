import type {
  AgreementSearchFilter,
  ApprovalRecord,
  ContractRecord,
  ProposalRecord,
  QuotationRecord,
  RateAgreementRecord,
  RenewalRecord,
} from "@/types/crm-agreements";
import type { CommercialRepository } from "@/lib/crm/repositories/CommercialRepository";

/** Commercial agreements data access contract (Mission P-008.3). */
export type AgreementsRepository = CommercialRepository & {
  listProposals(organizationId: string): ProposalRecord[];
  getProposal(id: string): ProposalRecord | null;
  searchProposals(filter: AgreementSearchFilter, organizationId: string): ProposalRecord[];
  createProposal(record: ProposalRecord): ProposalRecord;
  updateProposal(id: string, patch: Partial<ProposalRecord>): ProposalRecord | null;

  listQuotations(organizationId: string): QuotationRecord[];
  getQuotation(id: string): QuotationRecord | null;
  createQuotation(record: QuotationRecord): QuotationRecord;
  updateQuotation(id: string, patch: Partial<QuotationRecord>): QuotationRecord | null;

  listContracts(organizationId: string): ContractRecord[];
  getContract(id: string): ContractRecord | null;
  searchContracts(filter: AgreementSearchFilter, organizationId: string): ContractRecord[];
  createContract(record: ContractRecord): ContractRecord;
  updateContract(id: string, patch: Partial<ContractRecord>): ContractRecord | null;

  listRateAgreements(organizationId: string): RateAgreementRecord[];
  getRateAgreement(id: string): RateAgreementRecord | null;
  createRateAgreement(record: RateAgreementRecord): RateAgreementRecord;
  updateRateAgreement(id: string, patch: Partial<RateAgreementRecord>): RateAgreementRecord | null;

  listApprovals(organizationId: string): ApprovalRecord[];
  getApproval(id: string): ApprovalRecord | null;
  createApproval(record: ApprovalRecord): ApprovalRecord;
  updateApproval(id: string, patch: Partial<ApprovalRecord>): ApprovalRecord | null;

  listRenewals(organizationId: string): RenewalRecord[];
  createRenewal(record: RenewalRecord): RenewalRecord;
};

export type { AgreementSearchFilter };
