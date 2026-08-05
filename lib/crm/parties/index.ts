import { randomUUID } from "crypto";
import { publishPartyEngineEvent } from "@/lib/crm/crm-events";
import { CrmCanonicalEventPublisher } from "@/lib/crm/events";
import type { PartyRepository } from "@/lib/crm/repositories/PartyRepository";
import type {
  OrganisationDetailView,
  OrganisationListItem,
  OrganisationListView,
  PartyAnalyticsView,
  PartyBriefSignals,
  PartyRelationshipView,
  PartySearchView,
  PersonDetailView,
  PersonListItem,
} from "@/lib/crm/models/parties";
import type {
  CreateOrganisationInput,
  CreatePersonInput,
  LinkPartyRelationshipInput,
  ModifyPartyInput,
  OrganisationRecord,
  OrganisationType,
  PartyRelationship,
  PartySearchFilter,
  PartyStatus,
  PersonRecord,
} from "@/types/crm-party";
import type { ServiceContext } from "@/types/services";
import {
  DuplicateDetectionEngine,
  IdentityLinkingService,
  IdentityMergeService,
  PartyTimelineService,
  RelationshipExplorerService,
  RoleAssignmentService,
} from "@/lib/crm/parties/party-identity";

type PartyServiceContext = ServiceContext;

function todayIso(): string {
  return new Date().toISOString();
}

function hasCustomerRole(roles: readonly string[]): boolean {
  return roles.includes("customer");
}

function matchesQuery(value: string | undefined, query: string): boolean {
  return (value ?? "").toLowerCase().includes(query.toLowerCase());
}

/** Validation rules for party operations. */
export class PartyRulesEngine {
  validateCreatePerson(input: CreatePersonInput): void {
    if (!input.firstName.trim() || !input.lastName.trim()) throw new Error("INVALID_PERSON_NAME");
    if (!input.email && !input.phone) throw new Error("CONTACT_REQUIRED");
  }

  validateCreateOrganisation(input: CreateOrganisationInput): void {
    if (!input.displayName.trim()) throw new Error("INVALID_ORGANISATION_NAME");
  }

  validateLink(input: LinkPartyRelationshipInput): void {
    if (input.fromPartyId === input.toPartyId) throw new Error("INVALID_RELATIONSHIP");
  }
}

/** Party search across persons and organisations. */
export class PartySearchService {
  constructor(private readonly repository: PartyRepository) {}

  search(filter: PartySearchFilter, context: PartyServiceContext): PartySearchView {
    const organisations = this.repository.searchOrganisations(filter, context.organizationId);
    const persons = this.repository.searchPersons(filter, context.organizationId);

    const items = [
      ...organisations.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        displayName: entry.displayName,
        status: entry.status,
        roles: [...entry.roles],
        email: entry.contact.email,
        phone: entry.contact.phone,
        organisationType: entry.organisationType,
      })),
      ...persons.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        displayName: entry.displayName,
        status: entry.status,
        roles: [...entry.roles],
        email: entry.contact.email,
        phone: entry.contact.phone,
      })),
    ];

    return { total: items.length, items };
  }
}

/** Organisation directory and management. */
export class OrganisationService {
  constructor(
    private readonly repository: PartyRepository,
    private readonly rules: PartyRulesEngine,
    private readonly canonicalPublisher: CrmCanonicalEventPublisher,
  ) {}

  list(context: PartyServiceContext, filter: PartySearchFilter = {}): OrganisationListView {
    const records = this.repository.searchOrganisations(filter, context.organizationId);
    const relationships = this.repository.listPartyRelationships(context.organizationId);

    const items = records.map((record) => this.toListItem(record, relationships));
    const industries = [...new Set(records.map((entry) => entry.industry).filter(Boolean))] as string[];
    const assignedOwners = [...new Set(records.map((entry) => entry.assignedOwner).filter(Boolean))] as string[];

    return {
      total: items.length,
      items,
      filterOptions: {
        organisationTypes: [...new Set(records.map((entry) => entry.organisationType))],
        industries,
        statuses: [...new Set(records.map((entry) => entry.status))],
        assignedOwners,
      },
    };
  }

  getDetail(id: string, context: PartyServiceContext): OrganisationDetailView | null {
    const record = this.repository.getOrganisation(id);
    if (!record || record.organizationId !== context.organizationId) return null;

    const persons = this.repository
      .listPersons(context.organizationId)
      .filter((entry) => entry.primaryOrganisationId === id);
    const relationships = this.mapRelationships(id, context.organizationId);

    return {
      id: record.id,
      displayName: record.displayName,
      legalName: record.legalName,
      organisationType: record.organisationType,
      industry: record.industry,
      status: record.status,
      roles: [...record.roles],
      assignedOwner: record.assignedOwner,
      contact: { ...record.contact },
      registrationNumber: record.registrationNumber,
      taxId: record.taxId,
      employeeCount: record.employeeCount,
      annualRevenue: record.annualRevenue,
      notes: record.notes,
      contacts: persons.map((person) => this.toPersonListItem(person, record.displayName)),
      relationships,
    };
  }

  create(input: CreateOrganisationInput, context: PartyServiceContext, actorName?: string): OrganisationRecord {
    this.rules.validateCreateOrganisation(input);
    const now = todayIso();
    const record: OrganisationRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      kind: "organisation",
      displayName: input.displayName.trim(),
      legalName: input.legalName?.trim() ?? input.displayName.trim(),
      status: input.status ?? "active",
      industry: input.industry,
      organisationType: input.organisationType,
      contact: {
        email: input.email,
        phone: input.phone,
        website: input.website,
      },
      roles: input.roles ?? ["customer"],
      assignedOwner: input.assignedOwner,
      parentOrganisationId: input.parentOrganisationId,
      registrationNumber: input.registrationNumber,
      taxId: input.taxId,
      employeeCount: input.employeeCount,
      annualRevenue: input.annualRevenue,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    const created = this.repository.createOrganisation(record);
    publishPartyEngineEvent(
      {
        eventType: "OrganisationCreated",
        partyId: created.id,
        actorId: context.userId,
        actorName,
        payload: { displayName: created.displayName, organisationType: created.organisationType },
      },
      context,
    );

    if (hasCustomerRole(created.roles)) {
      this.canonicalPublisher.publishCustomerCreated(
        {
          customerId: created.id,
          correlationId: created.id,
          displayName: created.displayName,
        },
        context,
      );
    }

    return created;
  }

  modify(id: string, patch: ModifyPartyInput, context: PartyServiceContext, actorName?: string): OrganisationRecord {
    const existing = this.repository.getOrganisation(id);
    if (!existing || existing.organizationId !== context.organizationId) throw new Error("ORGANISATION_NOT_FOUND");

    const updated =
      this.repository.updateOrganisation(id, { ...patch, updatedAt: todayIso() }) ??
      existing;

    publishPartyEngineEvent(
      {
        eventType: "PartyUpdated",
        partyId: id,
        actorId: context.userId,
        actorName,
        payload: { kind: "organisation" },
      },
      context,
    );

    if (hasCustomerRole(updated.roles)) {
      this.canonicalPublisher.publishCustomerUpdated(
        {
          customerId: id,
          correlationId: id,
          version: updated.updatedAt,
        },
        context,
      );
    }

    return updated;
  }

  private toListItem(record: OrganisationRecord, relationships: PartyRelationship[]): OrganisationListItem {
    const linkedContacts = relationships.filter(
      (entry) => entry.fromPartyId === record.id && entry.relationshipType === "employs",
    ).length;

    return {
      id: record.id,
      displayName: record.displayName,
      legalName: record.legalName,
      organisationType: record.organisationType,
      industry: record.industry,
      status: record.status,
      roles: [...record.roles],
      assignedOwner: record.assignedOwner,
      email: record.contact.email,
      phone: record.contact.phone,
      country: record.contact.country,
      linkedContacts,
    };
  }

  private toPersonListItem(person: PersonRecord, orgName?: string): PersonListItem {
    return {
      id: person.id,
      displayName: person.displayName,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.contact.email,
      phone: person.contact.phone,
      jobTitle: person.jobTitle,
      primaryOrganisationId: person.primaryOrganisationId,
      primaryOrganisationName: orgName,
      status: person.status,
      roles: [...person.roles],
    };
  }

  private mapRelationships(partyId: string, _organizationId: string): PartyRelationshipView[] {
    void _organizationId;
    return this.repository.getPartyRelationshipsForParty(partyId).map((entry) => {
        const relatedId = entry.fromPartyId === partyId ? entry.toPartyId : entry.fromPartyId;
        const org = this.repository.getOrganisation(relatedId);
        const person = this.repository.getPerson(relatedId);
        return {
          id: entry.id,
          relationshipType: entry.relationshipType,
          relatedPartyId: relatedId,
          relatedPartyName: org?.displayName ?? person?.displayName ?? relatedId,
          role: entry.role,
      };
    });
  }
}

/** Person profile management. */
export class PersonService {
  constructor(
    private readonly repository: PartyRepository,
    private readonly rules: PartyRulesEngine,
    private readonly canonicalPublisher: CrmCanonicalEventPublisher,
  ) {}

  getDetail(id: string, context: PartyServiceContext): PersonDetailView | null {
    const record = this.repository.getPerson(id);
    if (!record || record.organizationId !== context.organizationId) return null;

    const org = record.primaryOrganisationId
      ? this.repository.getOrganisation(record.primaryOrganisationId)
      : null;

    return {
      id: record.id,
      displayName: record.displayName,
      firstName: record.firstName,
      lastName: record.lastName,
      title: record.title,
      email: record.contact.email,
      phone: record.contact.phone,
      jobTitle: record.jobTitle,
      primaryOrganisationId: record.primaryOrganisationId,
      primaryOrganisationName: org?.displayName,
      status: record.status,
      roles: [...record.roles],
      industry: record.industry,
      assignedOwner: record.assignedOwner,
      notes: record.notes,
      relationships: this.mapRelationships(record.id, context.organizationId),
    };
  }

  create(input: CreatePersonInput, context: PartyServiceContext, actorName?: string): PersonRecord {
    this.rules.validateCreatePerson(input);
    const now = todayIso();
    const record: PersonRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      kind: "person",
      displayName: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      title: input.title,
      status: input.status ?? "active",
      industry: input.industry,
      contact: { email: input.email, phone: input.phone },
      roles: input.roles ?? ["customer"],
      primaryOrganisationId: input.primaryOrganisationId,
      jobTitle: input.jobTitle,
      assignedOwner: input.assignedOwner,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    const created = this.repository.createPerson(record);
    publishPartyEngineEvent(
      {
        eventType: "PartyCreated",
        partyId: created.id,
        actorId: context.userId,
        actorName,
        payload: { displayName: created.displayName, kind: "person" },
      },
      context,
    );

    if (hasCustomerRole(created.roles)) {
      this.canonicalPublisher.publishCustomerCreated(
        {
          customerId: created.id,
          correlationId: created.id,
          displayName: created.displayName,
        },
        context,
      );
    }

    return created;
  }

  modify(id: string, patch: ModifyPartyInput, context: PartyServiceContext, actorName?: string): PersonRecord {
    const existing = this.repository.getPerson(id);
    if (!existing || existing.organizationId !== context.organizationId) throw new Error("PERSON_NOT_FOUND");

    const updated = this.repository.updatePerson(id, { ...patch, updatedAt: todayIso() }) ?? existing;

    publishPartyEngineEvent(
      {
        eventType: "PartyUpdated",
        partyId: id,
        actorId: context.userId,
        actorName,
        payload: { kind: "person" },
      },
      context,
    );

    if (hasCustomerRole(updated.roles)) {
      this.canonicalPublisher.publishCustomerUpdated(
        {
          customerId: id,
          correlationId: id,
          version: updated.updatedAt,
        },
        context,
      );
    }

    return updated;
  }

  private mapRelationships(partyId: string, _organizationId: string): PartyRelationshipView[] {
    return this.repository
      .getPartyRelationshipsForParty(partyId)
      .map((entry) => {
        const relatedId = entry.fromPartyId === partyId ? entry.toPartyId : entry.fromPartyId;
        const org = this.repository.getOrganisation(relatedId);
        const person = this.repository.getPerson(relatedId);
        return {
          id: entry.id,
          relationshipType: entry.relationshipType,
          relatedPartyId: relatedId,
          relatedPartyName: org?.displayName ?? person?.displayName ?? relatedId,
          role: entry.role,
        };
      });
  }
}

/** Party relationship linking. */
export class PartyRelationshipService {
  constructor(
    private readonly repository: PartyRepository,
    private readonly rules: PartyRulesEngine,
  ) {}

  link(input: LinkPartyRelationshipInput, context: PartyServiceContext, actorName?: string): PartyRelationship {
    this.rules.validateLink(input);
    const relationship: PartyRelationship = {
      id: randomUUID(),
      organizationId: context.organizationId,
      fromPartyId: input.fromPartyId,
      toPartyId: input.toPartyId,
      relationshipType: input.relationshipType,
      role: input.role,
      notes: input.notes,
      validFrom: todayIso().slice(0, 10),
    };

    const linked = this.repository.linkPartyRelationship(relationship);
    publishPartyEngineEvent(
      {
        eventType: "RelationshipLinked",
        partyId: input.fromPartyId,
        actorId: context.userId,
        actorName,
        payload: {
          toPartyId: input.toPartyId,
          relationshipType: input.relationshipType,
        },
      },
      context,
    );
    return linked;
  }

  listForParty(partyId: string, _context: PartyServiceContext): PartyRelationshipView[] {
    void _context;
    return this.repository.getPartyRelationshipsForParty(partyId).map((entry) => {
      const relatedId = entry.fromPartyId === partyId ? entry.toPartyId : entry.fromPartyId;
      const org = this.repository.getOrganisation(relatedId);
      const person = this.repository.getPerson(relatedId);
      return {
        id: entry.id,
        relationshipType: entry.relationshipType,
        relatedPartyId: relatedId,
        relatedPartyName: org?.displayName ?? person?.displayName ?? relatedId,
        role: entry.role,
      };
    });
  }
}

/** Party analytics for CRM intelligence. */
export class PartyAnalyticsService {
  constructor(private readonly repository: PartyRepository) {}

  getAnalytics(context: PartyServiceContext): PartyAnalyticsView {
    const organisations = this.repository.listOrganisations(context.organizationId);
    const persons = this.repository.listPersons(context.organizationId);
    const byType = new Map<OrganisationType, number>();
    const byStatus = new Map<PartyStatus, number>();
    const byRole = new Map<string, number>();

    for (const org of organisations) {
      byType.set(org.organisationType, (byType.get(org.organisationType) ?? 0) + 1);
      byStatus.set(org.status, (byStatus.get(org.status) ?? 0) + 1);
      for (const role of org.roles) byRole.set(role, (byRole.get(role) ?? 0) + 1);
    }

    for (const person of persons) {
      byStatus.set(person.status, (byStatus.get(person.status) ?? 0) + 1);
      for (const role of person.roles) byRole.set(role, (byRole.get(role) ?? 0) + 1);
    }

    return {
      byType: [...byType.entries()].map(([type, count]) => ({ type, count })),
      byStatus: [...byStatus.entries()].map(([status, count]) => ({ status, count })),
      byRole: [...byRole.entries()].map(([role, count]) => ({ role: role as PersonRecord["roles"][number], count })),
    };
  }

  getBriefSignals(context: PartyServiceContext): PartyBriefSignals {
    const analytics = this.getAnalytics(context);
    const organisations = this.repository.listOrganisations(context.organizationId);
    const persons = this.repository.listPersons(context.organizationId);
    const activeCustomers = [...organisations, ...persons].filter(
      (entry) => entry.roles.includes("customer") && entry.status === "active",
    ).length;
    const prospectCount = [...organisations, ...persons].filter((entry) => entry.status === "prospect").length;
    const vipCount = [...organisations, ...persons].filter((entry) => entry.isVip).length;
    const corporateGrowth = organisations.filter((entry) => entry.organisationType === "corporate_account").length;
    const organisationTypes = Object.fromEntries(analytics.byType.map((entry) => [entry.type, entry.count]));

    return {
      totalParties: organisations.length + persons.length,
      totalOrganisations: organisations.length,
      totalPersons: persons.length,
      activeCustomers,
      prospectCount,
      vipCount,
      corporateGrowth,
      relationshipHealthScore: Math.min(100, Math.round((activeCustomers / Math.max(1, organisations.length + persons.length)) * 100)),
      organisationTypes,
      briefingLine: `${organisations.length} organisations (+${corporateGrowth} corporate) and ${persons.length} contacts — ${activeCustomers} active relationships, ${vipCount} VIP parties.`,
    };
  }
}

/** CRM Universal Party & Organization facade (Mission P-008.1). */
export class CrmPartyFacade {
  readonly organisations: OrganisationService;
  readonly persons: PersonService;
  readonly search: PartySearchService;
  readonly relationships: PartyRelationshipService;
  readonly analytics: PartyAnalyticsService;
  readonly roles: RoleAssignmentService;
  readonly duplicates: DuplicateDetectionEngine;
  readonly merge: IdentityMergeService;
  readonly identity: IdentityLinkingService;
  readonly timeline: PartyTimelineService;
  readonly explorer: RelationshipExplorerService;

  constructor(
    repository: PartyRepository,
    canonicalPublisher: CrmCanonicalEventPublisher,
  ) {
    const rules = new PartyRulesEngine();
    this.organisations = new OrganisationService(repository, rules, canonicalPublisher);
    this.persons = new PersonService(repository, rules, canonicalPublisher);
    this.search = new PartySearchService(repository);
    this.relationships = new PartyRelationshipService(repository, rules);
    this.analytics = new PartyAnalyticsService(repository);
    this.roles = new RoleAssignmentService(repository);
    this.duplicates = new DuplicateDetectionEngine(repository);
    this.merge = new IdentityMergeService(repository);
    this.identity = new IdentityLinkingService(repository);
    this.timeline = new PartyTimelineService(repository);
    this.explorer = new RelationshipExplorerService(repository);
  }
}

export { matchesQuery };
