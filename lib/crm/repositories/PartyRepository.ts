import type {
  CreateOrganisationInput,
  CreatePersonInput,
  LinkPartyRelationshipInput,
  ModifyPartyInput,
  OrganisationRecord,
  PartyExternalIdentifier,
  PartyRelationship,
  PartyRoleAssignment,
  PartySearchFilter,
  PartyTimelineEntry,
  PersonRecord,
} from "@/types/crm-party";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";

/** Universal party data access contract (Mission P-008.1). */
export type PartyRepository = CrmRepository & {
  listOrganisations(organizationId: string): OrganisationRecord[];
  getOrganisation(id: string): OrganisationRecord | null;
  searchOrganisations(filter: PartySearchFilter, organizationId: string): OrganisationRecord[];
  createOrganisation(record: OrganisationRecord): OrganisationRecord;
  updateOrganisation(id: string, patch: Partial<OrganisationRecord>): OrganisationRecord | null;

  listPersons(organizationId: string): PersonRecord[];
  getPerson(id: string): PersonRecord | null;
  searchPersons(filter: PartySearchFilter, organizationId: string): PersonRecord[];
  createPerson(record: PersonRecord): PersonRecord;
  updatePerson(id: string, patch: Partial<PersonRecord>): PersonRecord | null;
  deletePerson(id: string): boolean;

  listPartyRelationships(organizationId: string): PartyRelationship[];
  getPartyRelationshipsForParty(partyId: string): PartyRelationship[];
  linkPartyRelationship(relationship: PartyRelationship): PartyRelationship;
  reassignRelationships(fromPartyId: string, toPartyId: string): void;

  listRoleAssignments(partyId: string, organizationId: string): PartyRoleAssignment[];
  addRoleAssignment(assignment: PartyRoleAssignment): PartyRoleAssignment;

  addExternalIdentifier(partyId: string, identifier: PartyExternalIdentifier): PartyExternalIdentifier;

  listTimelineEntries(partyId: string): PartyTimelineEntry[];
  addTimelineEntry(entry: PartyTimelineEntry): PartyTimelineEntry;
};

export type {
  CreateOrganisationInput,
  CreatePersonInput,
  LinkPartyRelationshipInput,
  ModifyPartyInput,
  PartySearchFilter,
};
