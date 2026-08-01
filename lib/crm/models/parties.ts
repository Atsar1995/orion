/** CRM party view models (Mission P-008.1). */

import type {
  OrganisationType,
  PartyKind,
  PartyRoleType,
  PartyStatus,
} from "@/types/crm-party";

export type OrganisationListItem = {
  id: string;
  displayName: string;
  legalName?: string;
  organisationType: OrganisationType;
  industry?: string;
  status: PartyStatus;
  roles: PartyRoleType[];
  assignedOwner?: string;
  email?: string;
  phone?: string;
  country?: string;
  linkedContacts: number;
};

export type OrganisationListView = {
  total: number;
  items: OrganisationListItem[];
  filterOptions: {
    organisationTypes: OrganisationType[];
    industries: string[];
    statuses: PartyStatus[];
    assignedOwners: string[];
  };
};

export type OrganisationDetailView = {
  id: string;
  displayName: string;
  legalName?: string;
  organisationType: OrganisationType;
  industry?: string;
  status: PartyStatus;
  roles: PartyRoleType[];
  assignedOwner?: string;
  contact: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  registrationNumber?: string;
  taxId?: string;
  employeeCount?: number;
  annualRevenue?: string;
  notes?: string;
  contacts: PersonListItem[];
  relationships: PartyRelationshipView[];
};

export type PersonListItem = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  primaryOrganisationId?: string;
  primaryOrganisationName?: string;
  status: PartyStatus;
  roles: PartyRoleType[];
};

export type PersonDetailView = PersonListItem & {
  title?: string;
  industry?: string;
  assignedOwner?: string;
  notes?: string;
  relationships: PartyRelationshipView[];
};

export type PartySearchView = {
  total: number;
  items: Array<{
    id: string;
    kind: PartyKind;
    displayName: string;
    status: PartyStatus;
    roles: PartyRoleType[];
    email?: string;
    phone?: string;
    organisationType?: OrganisationType;
  }>;
};

export type PartyRelationshipView = {
  id: string;
  relationshipType: string;
  relatedPartyId: string;
  relatedPartyName: string;
  role?: string;
};

export type PartyBriefSignals = {
  totalParties: number;
  totalOrganisations: number;
  totalPersons: number;
  activeCustomers: number;
  prospectCount: number;
  vipCount: number;
  corporateGrowth: number;
  relationshipHealthScore: number;
  organisationTypes: Record<string, number>;
  briefingLine: string;
};

export type PartyAnalyticsView = {
  byType: Array<{ type: OrganisationType; count: number }>;
  byStatus: Array<{ status: PartyStatus; count: number }>;
  byRole: Array<{ role: PartyRoleType; count: number }>;
};
