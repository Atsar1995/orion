import type {
  CommercialActivityRecord,
  CommercialOpportunityRecord,
  LeadRecord,
  LeadSearchFilter,
  OpportunitySearchFilter,
} from "@/types/crm-commercial";
import type { PartyRepository } from "@/lib/crm/repositories/PartyRepository";

/** Commercial domain data access contract (Mission P-008.2). */
export type CommercialRepository = PartyRepository & {
  listLeads(organizationId: string): LeadRecord[];
  getLead(id: string): LeadRecord | null;
  searchLeads(filter: LeadSearchFilter, organizationId: string): LeadRecord[];
  createLead(record: LeadRecord): LeadRecord;
  updateLead(id: string, patch: Partial<LeadRecord>): LeadRecord | null;

  listCommercialOpportunities(organizationId: string): CommercialOpportunityRecord[];
  getCommercialOpportunity(id: string): CommercialOpportunityRecord | null;
  searchCommercialOpportunities(
    filter: OpportunitySearchFilter,
    organizationId: string,
  ): CommercialOpportunityRecord[];
  createCommercialOpportunity(record: CommercialOpportunityRecord): CommercialOpportunityRecord;
  updateCommercialOpportunity(
    id: string,
    patch: Partial<CommercialOpportunityRecord>,
  ): CommercialOpportunityRecord | null;

  listCommercialActivities(organizationId: string): CommercialActivityRecord[];
  getCommercialActivitiesForEntity(input: {
    leadId?: string;
    opportunityId?: string;
  }): CommercialActivityRecord[];
  createCommercialActivity(record: CommercialActivityRecord): CommercialActivityRecord;
};

export type { LeadSearchFilter, OpportunitySearchFilter };
