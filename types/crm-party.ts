/**
 * ORION CRM — Universal Party & Organization Model (Mission P-008.1).
 * Canonical business identity model shared across all ORION workspaces.
 */

export type PartyKind = "person" | "organisation";

export type OrganisationType =
  | "corporate_account"
  | "travel_agency"
  | "tour_operator"
  | "government"
  | "supplier"
  | "partner"
  | "association"
  | "education"
  | "ngo"
  | "membership"
  | "other";

/** Workspace-agnostic roles — a party may hold multiple simultaneously. */
export type PartyRoleType =
  | "guest"
  | "customer"
  | "corporate_contact"
  | "travel_agent"
  | "tour_operator"
  | "supplier"
  | "vendor"
  | "employee"
  | "investor"
  | "partner"
  | "prospect"
  | "member";

export type PartyStatus = "active" | "inactive" | "prospect" | "archived";

export type PartyRelationshipType =
  | "employs"
  | "represents"
  | "subsidiary"
  | "partner"
  | "referral"
  | "member_of"
  | "billing"
  | "other";

export type PartyAddressType = "primary" | "billing" | "shipping" | "office" | "other";

export type PartyAddress = {
  readonly id: string;
  readonly type: PartyAddressType;
  readonly line1: string;
  readonly line2?: string;
  readonly city?: string;
  readonly state?: string;
  readonly postalCode?: string;
  readonly country?: string;
  readonly isPrimary?: boolean;
};

export type PartyContactMethodType = "email" | "phone" | "mobile" | "fax" | "website" | "social";

export type PartyContactMethod = {
  readonly id: string;
  readonly type: PartyContactMethodType;
  readonly value: string;
  readonly label?: string;
  readonly isPrimary?: boolean;
};

export type PartyCommunicationPreference = {
  readonly channel: "email" | "phone" | "sms" | "whatsapp" | "postal";
  readonly enabled: boolean;
  readonly purpose?: "marketing" | "transactional" | "service" | "billing";
};

export type PartyExternalIdentifier = {
  readonly id: string;
  readonly system: string;
  readonly externalId: string;
  readonly linkedAt: string;
};

export type PartyRoleAssignment = {
  readonly id: string;
  readonly partyId: string;
  readonly role: PartyRoleType;
  readonly workspaceId?: string;
  readonly assignedAt: string;
  readonly assignedBy?: string;
  readonly notes?: string;
};

export type PartyTimelineEntry = {
  readonly id: string;
  readonly partyId: string;
  readonly type: "role_change" | "relationship" | "merge" | "interaction" | "note" | "identifier_linked";
  readonly summary: string;
  readonly occurredAt: string;
  readonly actorName?: string;
  readonly metadata?: Record<string, string>;
};

/** Legacy flat contact — derived from contactMethods when present. */
export type PartyContact = {
  readonly email?: string;
  readonly phone?: string;
  readonly mobile?: string;
  readonly website?: string;
  readonly address?: string;
  readonly city?: string;
  readonly country?: string;
};

export type PartyRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly kind: PartyKind;
  readonly displayName: string;
  readonly legalName?: string;
  readonly status: PartyStatus;
  readonly industry?: string;
  readonly contact: PartyContact;
  readonly roles: readonly PartyRoleType[];
  readonly addresses?: readonly PartyAddress[];
  readonly contactMethods?: readonly PartyContactMethod[];
  readonly communicationPreferences?: readonly PartyCommunicationPreference[];
  readonly externalIdentifiers?: readonly PartyExternalIdentifier[];
  readonly isVip?: boolean;
  readonly tags?: readonly string[];
  readonly assignedOwner?: string;
  readonly parentOrganisationId?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PersonRecord = PartyRecord & {
  readonly kind: "person";
  readonly firstName: string;
  readonly lastName: string;
  readonly title?: string;
  readonly primaryOrganisationId?: string;
  readonly jobTitle?: string;
};

export type OrganisationRecord = PartyRecord & {
  readonly kind: "organisation";
  readonly organisationType: OrganisationType;
  readonly registrationNumber?: string;
  readonly taxId?: string;
  readonly employeeCount?: number;
  readonly annualRevenue?: string;
};

export type PartyRelationship = {
  readonly id: string;
  readonly organizationId: string;
  readonly fromPartyId: string;
  readonly toPartyId: string;
  readonly relationshipType: PartyRelationshipType;
  readonly role?: string;
  readonly notes?: string;
  readonly validFrom?: string;
  readonly validTo?: string;
};

export type PartySearchFilter = {
  query?: string;
  kind?: PartyKind;
  organisationType?: OrganisationType;
  role?: PartyRoleType;
  status?: PartyStatus;
  industry?: string;
  assignedOwner?: string;
  isVip?: boolean;
};

export type CreatePersonInput = {
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  primaryOrganisationId?: string;
  jobTitle?: string;
  industry?: string;
  status?: PartyStatus;
  roles?: PartyRoleType[];
  assignedOwner?: string;
  notes?: string;
  isVip?: boolean;
};

export type CreateOrganisationInput = {
  displayName: string;
  legalName?: string;
  organisationType: OrganisationType;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  status?: PartyStatus;
  roles?: PartyRoleType[];
  assignedOwner?: string;
  parentOrganisationId?: string;
  registrationNumber?: string;
  taxId?: string;
  employeeCount?: number;
  annualRevenue?: string;
  notes?: string;
  isVip?: boolean;
};

export type ModifyPartyInput = Partial<
  Omit<PartyRecord, "id" | "organizationId" | "kind" | "createdAt">
>;

export type AssignPartyRoleInput = {
  partyId: string;
  role: PartyRoleType;
  workspaceId?: string;
  notes?: string;
};

export type LinkExternalIdentifierInput = {
  partyId: string;
  system: string;
  externalId: string;
};

export type LinkPartyRelationshipInput = {
  fromPartyId: string;
  toPartyId: string;
  relationshipType: PartyRelationshipType;
  role?: string;
  notes?: string;
};

export type MergePartiesInput = {
  primaryPartyId: string;
  duplicatePartyId: string;
};

export type PartyDuplicateCandidate = {
  primaryPartyId: string;
  primaryDisplayName: string;
  duplicatePartyId: string;
  duplicateDisplayName: string;
  score: number;
  reasons: string[];
};

export type PartyEngineEventType =
  | "PartyCreated"
  | "PartyUpdated"
  | "OrganisationCreated"
  | "RelationshipLinked"
  | "PartyArchived"
  | "PartyMerged"
  | "RoleAssigned"
  | "IdentifierLinked";

export type PublishPartyEngineEventInput = {
  eventType: PartyEngineEventType;
  partyId: string;
  actorId?: string;
  actorName?: string;
  payload?: Record<string, string>;
};
