import type { RelationshipMilestoneRecord } from "@/types/crm-customer-intelligence";
import type { CommercialIntelligenceRepository } from "@/lib/crm/repositories/CommercialIntelligenceRepository";

/** Customer analytics data access contract (Mission P-008.6). */
export type CustomerIntelligenceRepository = CommercialIntelligenceRepository & {
  listRelationshipMilestones(organizationId: string): RelationshipMilestoneRecord[];
  listMilestonesForParty(partyId: string): RelationshipMilestoneRecord[];
};
