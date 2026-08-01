import type { CrmOpportunityRecord } from "@/lib/crm/models/opportunities";
import {
  mapCommercialStageToLegacy,
  formatCommercialCurrency,
} from "@/lib/crm/data/seed-commercial";
import {
  resolveOpportunityHealthLabel,
  resolveOpportunityPriorityLabel,
} from "@/lib/crm/data/opportunity-records";
import type { CommercialOpportunityRecord } from "@/types/crm-commercial";
import type { PartyRepository } from "@/lib/crm/repositories/PartyRepository";

function formatExpectedRevenue(valueAmount: number, probability: number): string {
  return formatCommercialCurrency(Math.round((valueAmount * probability) / 100));
}

function resolveCustomerName(partyId: string, repository: PartyRepository): string {
  const org = repository.getOrganisation(partyId);
  if (org) return org.displayName;
  const person = repository.getPerson(partyId);
  return person?.displayName ?? partyId;
}

/** Maps canonical commercial opportunity to legacy CRM UI record. */
export function mapCommercialToLegacyOpportunity(
  record: CommercialOpportunityRecord,
  repository: PartyRepository,
): CrmOpportunityRecord {
  const legacyStage = mapCommercialStageToLegacy(record.stage);
  const customerHealthScore = 75;

  return {
    id: record.id,
    name: record.name,
    customer: resolveCustomerName(record.organisationPartyId ?? record.partyId, repository),
    customerId: record.organisationPartyId?.replace("org-party-", "") ?? record.partyId,
    stage: legacyStage,
    value: formatCommercialCurrency(record.valueAmount),
    valueAmount: record.valueAmount,
    probability: record.probability,
    expectedClose: record.expectedClose,
    assignedOwner: record.owner,
    lastUpdated: record.updatedAt.slice(0, 10),
    healthLabel: resolveOpportunityHealthLabel({
      stage: legacyStage,
      probability: record.probability,
      customerHealthScore,
    }),
    priority:
      record.stage === "won" || record.stage === "lost" || record.stage === "closed"
        ? "Low"
        : resolveOpportunityPriorityLabel(record.score),
    nextAction: record.nextActivity,
    expectedRevenue: formatExpectedRevenue(record.valueAmount, record.probability),
    summary: record.summary,
  };
}
