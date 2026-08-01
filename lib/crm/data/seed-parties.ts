import { CRM_CUSTOMER_RECORDS } from "@/lib/crm/data/customer-records";
import type {
  OrganisationRecord,
  OrganisationType,
  PartyRelationship,
  PartyRoleAssignment,
  PartyTimelineEntry,
  PersonRecord,
} from "@/types/crm-party";

const TENANT = "org-orania";
const NOW = "2026-07-30T09:00:00.000Z";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveRoles(customer: (typeof CRM_CUSTOMER_RECORDS)[number]): PersonRecord["roles"] {
  if (customer.status === "Prospect") return ["prospect"];
  if (customer.industry === "Travel") return ["travel_agent", "customer"];
  if (customer.industry === "Hospitality") return ["customer", "partner"];
  if (customer.relationshipStatus === "Strategic Partner") return ["customer", "partner"];
  return ["customer"];
}

function enrichOrganisation(
  record: OrganisationRecord,
  customer: (typeof CRM_CUSTOMER_RECORDS)[number],
): OrganisationRecord {
  const isVip = customer.healthScore >= 90;
  return {
    ...record,
    roles: resolveRoles(customer),
    isVip,
    contactMethods: [
      { id: `${record.id}-email`, type: "email", value: customer.email, isPrimary: true },
      { id: `${record.id}-phone`, type: "phone", value: customer.phone, isPrimary: true },
    ],
    addresses: [
      {
        id: `${record.id}-addr`,
        type: "primary",
        line1: customer.company,
        country: customer.country,
        isPrimary: true,
      },
    ],
    communicationPreferences: [
      { channel: "email", enabled: true, purpose: "transactional" },
      { channel: "phone", enabled: isVip, purpose: "service" },
    ],
    externalIdentifiers:
      customer.industry === "Hospitality"
        ? [{ id: `${record.id}-hosp`, system: "hospitality", externalId: "orania-hospitality-group", linkedAt: NOW }]
        : [],
  };
}

function enrichPerson(record: PersonRecord, customer: (typeof CRM_CUSTOMER_RECORDS)[number]): PersonRecord {
  return {
    ...record,
    roles: customer.name.includes("Industries") ? ["corporate_contact", "customer"] : resolveRoles(customer),
    isVip: customer.healthScore >= 85,
    contactMethods: [
      { id: `${record.id}-email`, type: "email", value: customer.email, isPrimary: true },
      { id: `${record.id}-phone`, type: "phone", value: customer.phone, isPrimary: true },
    ],
    communicationPreferences: [{ channel: "email", enabled: true, purpose: "marketing" }],
  };
}

function resolveOrganisationType(industry: string, name: string): OrganisationType {
  const lower = `${industry} ${name}`.toLowerCase();
  if (lower.includes("travel") || lower.includes("agency")) return "travel_agency";
  if (lower.includes("tour")) return "tour_operator";
  if (lower.includes("government") || lower.includes("municipal")) return "government";
  if (lower.includes("university") || lower.includes("school") || lower.includes("education")) return "education";
  if (lower.includes("ngo") || lower.includes("foundation")) return "ngo";
  if (lower.includes("association") || lower.includes("chamber")) return "association";
  if (lower.includes("supplier") || lower.includes("vendor")) return "supplier";
  if (lower.includes("partner")) return "partner";
  if (lower.includes("membership") || lower.includes("club")) return "membership";
  if (lower.includes("hospitality") || lower.includes("corporate")) return "corporate_account";
  return "other";
}

function buildOrganisationsFromCustomers(): OrganisationRecord[] {
  const seen = new Map<string, OrganisationRecord>();

  for (const customer of CRM_CUSTOMER_RECORDS) {
    const key = slugify(customer.company);
    if (seen.has(key)) continue;

    seen.set(key, enrichOrganisation({
      id: `org-party-${key}`,
      organizationId: TENANT,
      kind: "organisation",
      displayName: customer.company,
      legalName: customer.company,
      status: customer.status === "Inactive" ? "inactive" : customer.status === "Prospect" ? "prospect" : "active",
      industry: customer.industry,
      organisationType: resolveOrganisationType(customer.industry, customer.company),
      contact: {
        email: customer.email,
        phone: customer.phone,
        country: customer.country,
      },
      roles: customer.status === "Prospect" ? ["prospect"] : ["customer"],
      assignedOwner: customer.assignedOwner,
      notes: customer.executiveNotes,
      createdAt: NOW,
      updatedAt: NOW,
    }, customer));
  }

  return [...seen.values()];
}

function buildPersonsFromCustomers(organisations: OrganisationRecord[]): PersonRecord[] {
  const orgByName = new Map(organisations.map((entry) => [entry.displayName.toLowerCase(), entry.id]));
  const persons: PersonRecord[] = [];

  for (const customer of CRM_CUSTOMER_RECORDS) {
    if (customer.name.toLowerCase() === customer.company.toLowerCase()) continue;

    const parts = customer.name.split(" ");
    const firstName = parts[0] ?? customer.name;
    const lastName = parts.slice(1).join(" ") || firstName;
    const orgId = orgByName.get(customer.company.toLowerCase());

    persons.push(enrichPerson({
      id: `person-${customer.id}`,
      organizationId: TENANT,
      kind: "person",
      displayName: customer.name,
      firstName,
      lastName,
      status: customer.status === "Inactive" ? "inactive" : customer.status === "Prospect" ? "prospect" : "active",
      industry: customer.industry,
      contact: {
        email: customer.email,
        phone: customer.phone,
        country: customer.country,
      },
      roles: customer.status === "Prospect" ? ["prospect"] : ["customer"],
      primaryOrganisationId: orgId,
      assignedOwner: customer.assignedOwner,
      notes: customer.executiveNotes,
      createdAt: NOW,
      updatedAt: NOW,
    }, customer));
  }

  persons.push({
    id: "person-abc-industries-dup",
    organizationId: TENANT,
    kind: "person",
    displayName: "ABC Industries Contact",
    firstName: "ABC",
    lastName: "Contact",
    status: "active",
    industry: "Manufacturing",
    contact: {
      email: "procurement@abcindustries.example",
      phone: "+91 98765 66666",
      country: "India",
    },
    roles: ["corporate_contact"],
    primaryOrganisationId: organisations.find((entry) => entry.displayName.includes("ABC"))?.id,
    assignedOwner: "Sales Director",
    createdAt: NOW,
    updatedAt: NOW,
  });

  return persons;
}

const EXTRA_ORGANISATIONS: OrganisationRecord[] = [
  {
    id: "org-party-state-tourism-board",
    organizationId: TENANT,
    kind: "organisation",
    displayName: "State Tourism Board",
    legalName: "Department of Tourism — Government of Maharashtra",
    status: "active",
    industry: "Government",
    organisationType: "government",
    contact: { email: "partnerships@tourism.gov.example", phone: "+91 22 2000 0000", country: "India" },
    roles: ["partner"],
    assignedOwner: "Relationship Manager",
    notes: "Government tourism partnership — seasonal campaign coordination.",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "org-party-global-suppliers-co",
    organizationId: TENANT,
    kind: "organisation",
    displayName: "Global Suppliers Co",
    status: "active",
    industry: "Supply Chain",
    organisationType: "supplier",
    contact: { email: "orders@globalsuppliers.example", phone: "+91 22 3000 0000", country: "India" },
    roles: ["supplier"],
    assignedOwner: "Operations Lead",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "org-party-education-foundation",
    organizationId: TENANT,
    kind: "organisation",
    displayName: "OranIA Education Foundation",
    status: "active",
    industry: "Education",
    organisationType: "ngo",
    contact: { email: "programs@orania-edu.example", country: "India" },
    roles: ["partner", "member"],
    assignedOwner: "Founder",
    notes: "CSR and scholarship partnership channel.",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

function buildRelationships(
  organisations: OrganisationRecord[],
  persons: PersonRecord[],
): PartyRelationship[] {
  const relationships: PartyRelationship[] = [];
  let index = 1;

  for (const person of persons) {
    if (!person.primaryOrganisationId) continue;
    relationships.push({
      id: `party-rel-${index++}`,
      organizationId: TENANT,
      fromPartyId: person.primaryOrganisationId,
      toPartyId: person.id,
      relationshipType: "employs",
      role: person.jobTitle ?? "Contact",
    });
  }

  const hospitality = organisations.find((entry) => entry.displayName.includes("Hospitality"));
  const luxury = organisations.find((entry) => entry.displayName.includes("Luxury"));
  if (hospitality && luxury) {
    relationships.push({
      id: `party-rel-${index++}`,
      organizationId: TENANT,
      fromPartyId: hospitality.id,
      toPartyId: luxury.id,
      relationshipType: "partner",
      role: "Preferred Property Partner",
    });
  }

  return relationships;
}

/** Builds mutable party seed for in-memory repository. */
export function buildPartySeed(): {
  organisations: OrganisationRecord[];
  persons: PersonRecord[];
  relationships: PartyRelationship[];
  roleAssignments: PartyRoleAssignment[];
  timelineEntries: PartyTimelineEntry[];
} {
  const organisations = [...buildOrganisationsFromCustomers(), ...EXTRA_ORGANISATIONS];
  const persons = buildPersonsFromCustomers(organisations);
  const relationships = buildRelationships(organisations, persons);

  const roleAssignments: PartyRoleAssignment[] = organisations.flatMap((org) =>
    org.roles.map((role, index) => ({
      id: `role-${org.id}-${index}`,
      partyId: org.id,
      role,
      assignedAt: NOW,
      assignedBy: org.assignedOwner,
    })),
  );

  const timelineEntries: PartyTimelineEntry[] = [
    {
      id: "timeline-hospitality-1",
      partyId: organisations.find((entry) => entry.displayName.includes("Hospitality"))?.id ?? "",
      type: "interaction",
      summary: "Strategic renewal call completed",
      occurredAt: NOW,
      actorName: "Founder",
    },
    {
      id: "timeline-retail-1",
      partyId: organisations.find((entry) => entry.displayName.includes("Retail"))?.id ?? "",
      type: "note",
      summary: "Churn risk flagged — re-engagement required",
      occurredAt: NOW,
      actorName: "Executive",
    },
  ].filter((entry) => entry.partyId) as PartyTimelineEntry[];

  return { organisations, persons, relationships, roleAssignments, timelineEntries };
}

/** Maps customer record id to linked organisation party id. */
export function resolveCustomerOrganisationId(customerId: string, company: string): string {
  return `org-party-${slugify(company)}`;
}

export { TENANT as CRM_PARTY_SEED_TENANT };
