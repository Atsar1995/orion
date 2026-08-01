/** CRM agreements view models (Mission P-008.3). */

import type {
  AgreementLifecycleStatus,
  ApprovalRecord,
  ContractType,
  RateAgreementType,
  RenewalRecord,
} from "@/types/crm-agreements";

export type ProposalListItem = {
  id: string;
  title: string;
  partyName: string;
  status: AgreementLifecycleStatus;
  version: number;
  owner: string;
  total: string;
  validUntil?: string;
  opportunityId?: string;
};

export type ContractListItem = {
  id: string;
  title: string;
  partyName: string;
  contractType: ContractType;
  status: AgreementLifecycleStatus;
  owner: string;
  total: string;
  effectiveFrom: string;
  effectiveTo: string;
  daysToExpiry?: number;
};

export type RateAgreementListItem = {
  id: string;
  name: string;
  partyName: string;
  agreementType: RateAgreementType;
  status: AgreementLifecycleStatus;
  validFrom: string;
  validTo: string;
  season?: string;
};

export type AgreementsBriefSignals = {
  pendingApprovals: number;
  expiringContracts: number;
  upcomingRenewals: number;
  activeContracts: number;
  pipelineUnderContract: string;
  briefingLine: string;
};

export type RenewalDashboardView = {
  upcoming: Array<RenewalRecord & { contractTitle: string; partyName: string }>;
  expiring: ContractListItem[];
  pendingApprovals: ApprovalRecord[];
};

export type AgreementsRegistryView = {
  proposals: ProposalListItem[];
  contracts: ContractListItem[];
  rateAgreements: RateAgreementListItem[];
};
