// Domain CRM repository — wired exclusively through createCrmWiring() (P-008.18).

import {
  CRM_CUSTOMER_ALERTS,
  CRM_CUSTOMER_HEALTH_INPUT,
  CRM_ENHANCED_KPIS,
  CRM_EXECUTIVE_INSIGHTS,
  CRM_RECOMMENDED_ACTION,
  HIGHEST_RISK_CUSTOMER,
  HIGHEST_VALUE_CUSTOMER,
  LARGEST_OPPORTUNITY,
  OPPORTUNITY_PIPELINE,
  PIPELINE_SUMMARY,
  RELATIONSHIP_HEALTH,
} from "@/lib/crm-business-data";
import {
  CRM_EXECUTIVE_NOTES,
  CRM_EXECUTIVE_SUMMARY,
  CRM_RECENT_ACTIVITY,
} from "@/lib/crm-data";
import {
  CUSTOMER_PROFILES,
  MANAGED_OPPORTUNITIES,
  RELATIONSHIP_ACTIONS,
} from "@/lib/crm-relationships-opportunities";
import { CRM_CUSTOMER_RECORDS } from "@/lib/crm/data/customer-records";
import { CRM_ACTIVITY_RECORDS } from "@/lib/crm/data/activity-records";
import { buildAgreementsSeed } from "@/lib/crm/data/seed-agreements";
import { buildCommercialSeed } from "@/lib/crm/data/seed-commercial";
import { mapCommercialToLegacyOpportunity } from "@/lib/crm/commercial/commercial-mapper";
import { buildCommercialIntelligenceSeed } from "@/lib/crm/data/seed-commercial-intelligence";
import { buildPartySeed } from "@/lib/crm/data/seed-parties";
import { buildExecutiveDashboardSeed } from "@/lib/crm/data/seed-executive-dashboard";
import { buildCustomerIntelligenceSeed } from "@/lib/crm/data/seed-customer-intelligence";
import type { ExecutiveDashboardRepository } from "@/lib/crm/repositories/ExecutiveDashboardRepository";
import type {
  AgreementSearchFilter,
  ApprovalRecord,
  ContractRecord,
  ProposalRecord,
  QuotationRecord,
  RateAgreementRecord,
  RenewalRecord,
} from "@/types/crm-agreements";
import type {
  BenchmarkRecord,
  CommercialAlert,
  ForecastHistoryRecord,
  ForecastRecord,
} from "@/types/crm-commercial-intelligence";
import type { RelationshipMilestoneRecord } from "@/types/crm-customer-intelligence";
import type {
  CommercialSnapshotRecord,
  PerformanceTrendRecord,
} from "@/types/crm-executive-dashboard";
import type {
  CommercialActivityRecord,
  CommercialOpportunityRecord,
  LeadRecord,
  LeadSearchFilter,
  OpportunitySearchFilter,
} from "@/types/crm-commercial";
import type {
  OrganisationRecord,
  PartyExternalIdentifier,
  PartyRelationship,
  PartyRoleAssignment,
  PartySearchFilter,
  PartyTimelineEntry,
  PersonRecord,
} from "@/types/crm-party";

const ACTIVE_OPPORTUNITIES = CRM_ENHANCED_KPIS.find(
  (metric) => metric.label === "Open Opportunities",
);

/** In-memory CRM repository backed by placeholder domain data. */
export class InMemoryCrmRepository implements ExecutiveDashboardRepository {
  private organisations: OrganisationRecord[];
  private persons: PersonRecord[];
  private relationships: PartyRelationship[];
  private roleAssignments: PartyRoleAssignment[];
  private timelineEntries: PartyTimelineEntry[];
  private leads: LeadRecord[];
  private commercialOpportunities: CommercialOpportunityRecord[];
  private commercialActivities: CommercialActivityRecord[];
  private proposals: ProposalRecord[];
  private quotations: QuotationRecord[];
  private contracts: ContractRecord[];
  private rateAgreements: RateAgreementRecord[];
  private approvals: ApprovalRecord[];
  private renewals: RenewalRecord[];
  private forecastHistory: ForecastHistoryRecord[];
  private benchmarks: BenchmarkRecord[];
  private commercialAlerts: CommercialAlert[];
  private forecastSnapshots: ForecastRecord[];
  private relationshipMilestones: RelationshipMilestoneRecord[];
  private dashboardSnapshots: CommercialSnapshotRecord[];
  private performanceTrends: PerformanceTrendRecord[];

  constructor() {
    const seed = buildPartySeed();
    const commercial = buildCommercialSeed();
    const agreements = buildAgreementsSeed();
    const intelligence = buildCommercialIntelligenceSeed();
    const customerIntelligence = buildCustomerIntelligenceSeed();
    const executiveDashboard = buildExecutiveDashboardSeed();
    this.organisations = [...seed.organisations];
    this.persons = [...seed.persons];
    this.relationships = [...seed.relationships];
    this.roleAssignments = [...seed.roleAssignments];
    this.timelineEntries = [...seed.timelineEntries];
    this.leads = [...commercial.leads];
    this.commercialOpportunities = [...commercial.opportunities];
    this.commercialActivities = [...commercial.activities];
    this.proposals = [...agreements.proposals];
    this.quotations = [...agreements.quotations];
    this.contracts = [...agreements.contracts];
    this.rateAgreements = [...agreements.rateAgreements];
    this.approvals = [...agreements.approvals];
    this.renewals = [...agreements.renewals];
    this.forecastHistory = [...intelligence.forecastHistory];
    this.benchmarks = [...intelligence.benchmarks];
    this.commercialAlerts = [...intelligence.alerts];
    this.forecastSnapshots = [];
    this.relationshipMilestones = [...customerIntelligence.milestones];
    this.dashboardSnapshots = [...executiveDashboard.snapshots];
    this.performanceTrends = [...executiveDashboard.trends];
  }

  listOrganisations(organizationId: string): OrganisationRecord[] {
    return this.organisations.filter((entry) => entry.organizationId === organizationId);
  }

  getOrganisation(id: string): OrganisationRecord | null {
    return this.organisations.find((entry) => entry.id === id) ?? null;
  }

  searchOrganisations(filter: PartySearchFilter, organizationId: string): OrganisationRecord[] {
    return this.listOrganisations(organizationId).filter((record) => this.matchesPartyFilter(record, filter));
  }

  createOrganisation(record: OrganisationRecord): OrganisationRecord {
    this.organisations.push(record);
    return record;
  }

  updateOrganisation(id: string, patch: Partial<OrganisationRecord>): OrganisationRecord | null {
    const index = this.organisations.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.organisations[index] = { ...this.organisations[index]!, ...patch };
    return this.organisations[index]!;
  }

  listPersons(organizationId: string): PersonRecord[] {
    return this.persons.filter((entry) => entry.organizationId === organizationId);
  }

  getPerson(id: string): PersonRecord | null {
    return this.persons.find((entry) => entry.id === id) ?? null;
  }

  searchPersons(filter: PartySearchFilter, organizationId: string): PersonRecord[] {
    return this.listPersons(organizationId).filter((record) => this.matchesPartyFilter(record, filter));
  }

  createPerson(record: PersonRecord): PersonRecord {
    this.persons.push(record);
    return record;
  }

  updatePerson(id: string, patch: Partial<PersonRecord>): PersonRecord | null {
    const index = this.persons.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.persons[index] = { ...this.persons[index]!, ...patch };
    return this.persons[index]!;
  }

  deletePerson(id: string): boolean {
    const index = this.persons.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    this.persons.splice(index, 1);
    return true;
  }

  listPartyRelationships(organizationId: string): PartyRelationship[] {
    return this.relationships.filter((entry) => entry.organizationId === organizationId);
  }

  getPartyRelationshipsForParty(partyId: string): PartyRelationship[] {
    return this.relationships.filter(
      (entry) => entry.fromPartyId === partyId || entry.toPartyId === partyId,
    );
  }

  linkPartyRelationship(relationship: PartyRelationship): PartyRelationship {
    this.relationships.push(relationship);
    return relationship;
  }

  reassignRelationships(fromPartyId: string, toPartyId: string): void {
    this.relationships = this.relationships.map((entry) => ({
      ...entry,
      fromPartyId: entry.fromPartyId === fromPartyId ? toPartyId : entry.fromPartyId,
      toPartyId: entry.toPartyId === fromPartyId ? toPartyId : entry.toPartyId,
    }));
  }

  listRoleAssignments(partyId: string, organizationId: string): PartyRoleAssignment[] {
    const party = this.getPerson(partyId) ?? this.getOrganisation(partyId);
    if (!party || party.organizationId !== organizationId) return [];
    return this.roleAssignments.filter((entry) => entry.partyId === partyId);
  }

  addRoleAssignment(assignment: PartyRoleAssignment): PartyRoleAssignment {
    this.roleAssignments.push(assignment);
    return assignment;
  }

  addExternalIdentifier(partyId: string, identifier: PartyExternalIdentifier): PartyExternalIdentifier {
    const personIndex = this.persons.findIndex((entry) => entry.id === partyId);
    if (personIndex >= 0) {
      const person = this.persons[personIndex]!;
      this.persons[personIndex] = {
        ...person,
        externalIdentifiers: [...(person.externalIdentifiers ?? []), identifier],
      };
      return identifier;
    }

    const orgIndex = this.organisations.findIndex((entry) => entry.id === partyId);
    if (orgIndex >= 0) {
      const org = this.organisations[orgIndex]!;
      this.organisations[orgIndex] = {
        ...org,
        externalIdentifiers: [...(org.externalIdentifiers ?? []), identifier],
      };
    }
    return identifier;
  }

  listTimelineEntries(partyId: string): PartyTimelineEntry[] {
    return this.timelineEntries.filter((entry) => entry.partyId === partyId);
  }

  addTimelineEntry(entry: PartyTimelineEntry): PartyTimelineEntry {
    this.timelineEntries.push(entry);
    return entry;
  }

  listLeads(organizationId: string): LeadRecord[] {
    return this.leads.filter((entry) => entry.organizationId === organizationId);
  }

  getLead(id: string): LeadRecord | null {
    return this.leads.find((entry) => entry.id === id) ?? null;
  }

  searchLeads(filter: LeadSearchFilter, organizationId: string): LeadRecord[] {
    return this.listLeads(organizationId).filter((record) => {
      if (filter.source && record.source !== filter.source) return false;
      if (filter.status && record.status !== filter.status) return false;
      if (filter.owner && record.owner !== filter.owner) return false;
      if (filter.territory && record.territory !== filter.territory) return false;
      if (filter.query) {
        const haystack = [record.displayName, record.industry, record.owner, record.territory]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(filter.query.toLowerCase())) return false;
      }
      return true;
    });
  }

  createLead(record: LeadRecord): LeadRecord {
    this.leads.push(record);
    return record;
  }

  updateLead(id: string, patch: Partial<LeadRecord>): LeadRecord | null {
    const index = this.leads.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.leads[index] = { ...this.leads[index]!, ...patch };
    return this.leads[index]!;
  }

  listCommercialOpportunities(organizationId: string): CommercialOpportunityRecord[] {
    return this.commercialOpportunities.filter((entry) => entry.organizationId === organizationId);
  }

  getCommercialOpportunity(id: string): CommercialOpportunityRecord | null {
    return this.commercialOpportunities.find((entry) => entry.id === id) ?? null;
  }

  searchCommercialOpportunities(
    filter: OpportunitySearchFilter,
    organizationId: string,
  ): CommercialOpportunityRecord[] {
    return this.listCommercialOpportunities(organizationId).filter((record) => {
      if (filter.stage && record.stage !== filter.stage) return false;
      if (filter.owner && record.owner !== filter.owner) return false;
      if (filter.partyId && record.partyId !== filter.partyId) return false;
      if (filter.query) {
        const haystack = [record.name, record.owner, record.summary].join(" ").toLowerCase();
        if (!haystack.includes(filter.query.toLowerCase())) return false;
      }
      return true;
    });
  }

  createCommercialOpportunity(record: CommercialOpportunityRecord): CommercialOpportunityRecord {
    this.commercialOpportunities.push(record);
    return record;
  }

  updateCommercialOpportunity(
    id: string,
    patch: Partial<CommercialOpportunityRecord>,
  ): CommercialOpportunityRecord | null {
    const index = this.commercialOpportunities.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.commercialOpportunities[index] = { ...this.commercialOpportunities[index]!, ...patch };
    return this.commercialOpportunities[index]!;
  }

  listCommercialActivities(organizationId: string): CommercialActivityRecord[] {
    return this.commercialActivities.filter((entry) => entry.organizationId === organizationId);
  }

  getCommercialActivitiesForEntity(input: {
    leadId?: string;
    opportunityId?: string;
  }): CommercialActivityRecord[] {
    return this.commercialActivities.filter((entry) => {
      if (input.leadId && entry.leadId === input.leadId) return true;
      if (input.opportunityId && entry.opportunityId === input.opportunityId) return true;
      return false;
    });
  }

  createCommercialActivity(record: CommercialActivityRecord): CommercialActivityRecord {
    this.commercialActivities.push(record);
    return record;
  }

  listProposals(organizationId: string): ProposalRecord[] {
    return this.proposals.filter((entry) => entry.organizationId === organizationId);
  }

  getProposal(id: string): ProposalRecord | null {
    return this.proposals.find((entry) => entry.id === id) ?? null;
  }

  searchProposals(filter: AgreementSearchFilter, organizationId: string): ProposalRecord[] {
    return this.listProposals(organizationId).filter((record) =>
      this.matchesAgreementFilter(record, filter),
    );
  }

  createProposal(record: ProposalRecord): ProposalRecord {
    this.proposals.push(record);
    return record;
  }

  updateProposal(id: string, patch: Partial<ProposalRecord>): ProposalRecord | null {
    const index = this.proposals.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.proposals[index] = { ...this.proposals[index]!, ...patch };
    return this.proposals[index]!;
  }

  listQuotations(organizationId: string): QuotationRecord[] {
    return this.quotations.filter((entry) => entry.organizationId === organizationId);
  }

  getQuotation(id: string): QuotationRecord | null {
    return this.quotations.find((entry) => entry.id === id) ?? null;
  }

  createQuotation(record: QuotationRecord): QuotationRecord {
    this.quotations.push(record);
    return record;
  }

  updateQuotation(id: string, patch: Partial<QuotationRecord>): QuotationRecord | null {
    const index = this.quotations.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.quotations[index] = { ...this.quotations[index]!, ...patch };
    return this.quotations[index]!;
  }

  listContracts(organizationId: string): ContractRecord[] {
    return this.contracts.filter((entry) => entry.organizationId === organizationId);
  }

  getContract(id: string): ContractRecord | null {
    return this.contracts.find((entry) => entry.id === id) ?? null;
  }

  searchContracts(filter: AgreementSearchFilter, organizationId: string): ContractRecord[] {
    return this.listContracts(organizationId).filter((record) =>
      this.matchesAgreementFilter(record, filter),
    );
  }

  createContract(record: ContractRecord): ContractRecord {
    this.contracts.push(record);
    return record;
  }

  updateContract(id: string, patch: Partial<ContractRecord>): ContractRecord | null {
    const index = this.contracts.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.contracts[index] = { ...this.contracts[index]!, ...patch };
    return this.contracts[index]!;
  }

  listRateAgreements(organizationId: string): RateAgreementRecord[] {
    return this.rateAgreements.filter((entry) => entry.organizationId === organizationId);
  }

  getRateAgreement(id: string): RateAgreementRecord | null {
    return this.rateAgreements.find((entry) => entry.id === id) ?? null;
  }

  createRateAgreement(record: RateAgreementRecord): RateAgreementRecord {
    this.rateAgreements.push(record);
    return record;
  }

  updateRateAgreement(id: string, patch: Partial<RateAgreementRecord>): RateAgreementRecord | null {
    const index = this.rateAgreements.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.rateAgreements[index] = { ...this.rateAgreements[index]!, ...patch };
    return this.rateAgreements[index]!;
  }

  listApprovals(organizationId: string): ApprovalRecord[] {
    const entityIds = new Set([
      ...this.proposals.filter((entry) => entry.organizationId === organizationId).map((entry) => entry.id),
      ...this.contracts.filter((entry) => entry.organizationId === organizationId).map((entry) => entry.id),
    ]);
    return this.approvals.filter((entry) => entityIds.has(entry.entityId));
  }

  getApproval(id: string): ApprovalRecord | null {
    return this.approvals.find((entry) => entry.id === id) ?? null;
  }

  createApproval(record: ApprovalRecord): ApprovalRecord {
    this.approvals.push(record);
    return record;
  }

  updateApproval(id: string, patch: Partial<ApprovalRecord>): ApprovalRecord | null {
    const index = this.approvals.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.approvals[index] = { ...this.approvals[index]!, ...patch };
    return this.approvals[index]!;
  }

  listRenewals(organizationId: string): RenewalRecord[] {
    const contractIds = new Set(
      this.contracts.filter((entry) => entry.organizationId === organizationId).map((entry) => entry.id),
    );
    return this.renewals.filter((entry) => contractIds.has(entry.contractId));
  }

  createRenewal(record: RenewalRecord): RenewalRecord {
    this.renewals.push(record);
    return record;
  }

  listForecastHistory(organizationId: string): ForecastHistoryRecord[] {
    return this.forecastHistory.filter((entry) => entry.organizationId === organizationId);
  }

  listBenchmarks(organizationId: string): BenchmarkRecord[] {
    return this.benchmarks.filter((entry) => entry.organizationId === organizationId);
  }

  listCommercialAlerts(organizationId: string): CommercialAlert[] {
    return this.commercialAlerts.filter((entry) => entry.organizationId === organizationId);
  }

  listForecastSnapshots(organizationId: string): ForecastRecord[] {
    return this.forecastSnapshots.filter((entry) => entry.organizationId === organizationId);
  }

  createForecastSnapshot(record: ForecastRecord): ForecastRecord {
    this.forecastSnapshots.push(record);
    return record;
  }

  listRelationshipMilestones(organizationId: string): RelationshipMilestoneRecord[] {
    return this.relationshipMilestones.filter((entry) => entry.organizationId === organizationId);
  }

  listMilestonesForParty(partyId: string): RelationshipMilestoneRecord[] {
    return this.relationshipMilestones.filter((entry) => entry.partyId === partyId);
  }

  listDashboardSnapshots(organizationId: string): CommercialSnapshotRecord[] {
    return this.dashboardSnapshots.filter((entry) => entry.organizationId === organizationId);
  }

  listPerformanceTrends(organizationId: string): PerformanceTrendRecord[] {
    return this.performanceTrends.filter((entry) => entry.organizationId === organizationId);
  }

  private matchesAgreementFilter(
    record: { status: string; partyId: string; owner: string; title?: string; name?: string },
    filter: AgreementSearchFilter,
  ): boolean {
    if (filter.status && record.status !== filter.status) return false;
    if (filter.partyId && record.partyId !== filter.partyId) return false;
    if (filter.owner && record.owner !== filter.owner) return false;
    if (filter.query) {
      const haystack = [record.title, record.name, record.owner].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(filter.query.toLowerCase())) return false;
    }
    return true;
  }

  private matchesPartyFilter(
    record: OrganisationRecord | PersonRecord,
    filter: PartySearchFilter,
  ): boolean {
    if (filter.kind && record.kind !== filter.kind) return false;
    if (filter.status && record.status !== filter.status) return false;
    if (filter.industry && record.industry !== filter.industry) return false;
    if (filter.assignedOwner && record.assignedOwner !== filter.assignedOwner) return false;
    if (filter.role && !record.roles.includes(filter.role)) return false;
    if (filter.isVip !== undefined && Boolean(record.isVip) !== filter.isVip) return false;
    if (
      filter.organisationType &&
      record.kind === "organisation" &&
      record.organisationType !== filter.organisationType
    ) {
      return false;
    }
    if (filter.query) {
      const query = filter.query.toLowerCase();
      const haystack = [
        record.displayName,
        record.industry,
        record.contact.email,
        record.contact.phone,
        record.assignedOwner,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  }

  getExecutiveSummary() {
    return CRM_EXECUTIVE_SUMMARY;
  }

  getExecutiveNotes() {
    return CRM_EXECUTIVE_NOTES;
  }

  getRecentActivity() {
    return [...CRM_RECENT_ACTIVITY];
  }

  getEnhancedKpis() {
    return [...CRM_ENHANCED_KPIS];
  }

  getCustomerHealthInput() {
    return { ...CRM_CUSTOMER_HEALTH_INPUT, drivers: [...CRM_CUSTOMER_HEALTH_INPUT.drivers] };
  }

  getPipelineSummary() {
    return {
      ...PIPELINE_SUMMARY,
      activeOpportunities: Number.parseInt(ACTIVE_OPPORTUNITIES?.value ?? "24", 10),
    };
  }

  getPipelineStages() {
    return [...OPPORTUNITY_PIPELINE];
  }

  getRelationshipHealth() {
    return [...RELATIONSHIP_HEALTH];
  }

  getExecutiveInsights() {
    return [...CRM_EXECUTIVE_INSIGHTS];
  }

  getCustomerAlerts() {
    return [...CRM_CUSTOMER_ALERTS];
  }

  getRecommendedAction() {
    return { ...CRM_RECOMMENDED_ACTION };
  }

  getHighestValueCustomer() {
    return { ...HIGHEST_VALUE_CUSTOMER };
  }

  getHighestRiskCustomer() {
    return { ...HIGHEST_RISK_CUSTOMER };
  }

  getLargestOpportunity() {
    return { ...LARGEST_OPPORTUNITY };
  }

  getCustomerProfiles() {
    return [...CUSTOMER_PROFILES];
  }

  getCustomerRecords() {
    return [...CRM_CUSTOMER_RECORDS];
  }

  getOpportunityRecords() {
    return this.commercialOpportunities.map((record) =>
      mapCommercialToLegacyOpportunity(record, this),
    );
  }

  getActivityRecords() {
    return [...CRM_ACTIVITY_RECORDS];
  }

  getManagedOpportunities() {
    return [...MANAGED_OPPORTUNITIES];
  }

  getRelationshipActions() {
    return [...RELATIONSHIP_ACTIONS];
  }
}
