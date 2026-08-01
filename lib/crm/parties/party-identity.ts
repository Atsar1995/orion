import { randomUUID } from "crypto";
import { publishPartyEngineEvent } from "@/lib/crm/crm-events";
import type { PartyRepository } from "@/lib/crm/repositories/PartyRepository";
import type {
  AssignPartyRoleInput,
  LinkExternalIdentifierInput,
  MergePartiesInput,
  PartyDuplicateCandidate,
  PartyExternalIdentifier,
  PartyRoleAssignment,
  PartyRoleType,
  PartyTimelineEntry,
  PersonRecord,
} from "@/types/crm-party";
import type { ServiceContext } from "@/types/services";

function todayIso(): string {
  return new Date().toISOString();
}

function normalizePhone(phone?: string): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** Assigns and revokes workspace-agnostic party roles. */
export class RoleAssignmentService {
  constructor(private readonly repository: PartyRepository) {}

  list(partyId: string, context: ServiceContext): PartyRoleAssignment[] {
    return this.repository.listRoleAssignments(partyId, context.organizationId);
  }

  assign(input: AssignPartyRoleInput, context: ServiceContext, actorName?: string): PartyRoleType[] {
    const party = this.repository.getPerson(input.partyId) ?? this.repository.getOrganisation(input.partyId);
    if (!party || party.organizationId !== context.organizationId) throw new Error("PARTY_NOT_FOUND");

    const assignment: PartyRoleAssignment = {
      id: randomUUID(),
      partyId: input.partyId,
      role: input.role,
      workspaceId: input.workspaceId,
      assignedAt: todayIso(),
      assignedBy: actorName,
      notes: input.notes,
    };
    this.repository.addRoleAssignment(assignment);

    const roles = [...new Set([...party.roles, input.role])];
    if (party.kind === "person") {
      this.repository.updatePerson(input.partyId, { roles, updatedAt: todayIso() });
    } else {
      this.repository.updateOrganisation(input.partyId, { roles, updatedAt: todayIso() });
    }

    this.repository.addTimelineEntry({
      id: randomUUID(),
      partyId: input.partyId,
      type: "role_change",
      summary: `Role assigned: ${input.role}`,
      occurredAt: todayIso(),
      actorName,
      metadata: { role: input.role },
    });

    publishPartyEngineEvent(
      {
        eventType: "RoleAssigned",
        partyId: input.partyId,
        actorId: context.userId,
        actorName,
        payload: { role: input.role },
      },
      context,
    );

    return roles;
  }

  revoke(partyId: string, role: PartyRoleType, context: ServiceContext, actorName?: string): PartyRoleType[] {
    const party = this.repository.getPerson(partyId) ?? this.repository.getOrganisation(partyId);
    if (!party || party.organizationId !== context.organizationId) throw new Error("PARTY_NOT_FOUND");

    const roles = party.roles.filter((entry) => entry !== role);
    if (party.kind === "person") {
      this.repository.updatePerson(partyId, { roles, updatedAt: todayIso() });
    } else {
      this.repository.updateOrganisation(partyId, { roles, updatedAt: todayIso() });
    }

    this.repository.addTimelineEntry({
      id: randomUUID(),
      partyId,
      type: "role_change",
      summary: `Role revoked: ${role}`,
      occurredAt: todayIso(),
      actorName,
      metadata: { role },
    });

    return roles;
  }
}

/** Duplicate detection across person records. */
export class DuplicateDetectionEngine {
  constructor(private readonly repository: PartyRepository) {}

  findDuplicates(context: ServiceContext): PartyDuplicateCandidate[] {
    const persons = this.repository.listPersons(context.organizationId);
    const results: PartyDuplicateCandidate[] = [];

    for (let i = 0; i < persons.length; i++) {
      for (let j = i + 1; j < persons.length; j++) {
        const primary = persons[i]!;
        const duplicate = persons[j]!;
        const match = this.scorePair(primary, duplicate);
        if (match.score >= 35) {
          results.push({
            primaryPartyId: primary.id,
            primaryDisplayName: primary.displayName,
            duplicatePartyId: duplicate.id,
            duplicateDisplayName: duplicate.displayName,
            score: match.score,
            reasons: match.reasons,
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  findDuplicatesForParty(partyId: string, context: ServiceContext): PartyDuplicateCandidate[] {
    const record = this.repository.getPerson(partyId);
    if (!record) return [];

    return this.repository
      .listPersons(context.organizationId)
      .filter((entry) => entry.id !== partyId)
      .map((candidate) => {
        const match = this.scorePair(record, candidate);
        return {
          primaryPartyId: record.id,
          primaryDisplayName: record.displayName,
          duplicatePartyId: candidate.id,
          duplicateDisplayName: candidate.displayName,
          score: match.score,
          reasons: match.reasons,
        };
      })
      .filter((entry) => entry.score >= 35)
      .sort((a, b) => b.score - a.score);
  }

  private scorePair(a: PersonRecord, b: PersonRecord): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    if (a.contact.email && b.contact.email?.toLowerCase() === a.contact.email.toLowerCase()) {
      score += 40;
      reasons.push("Matching email");
    }
    if (normalizePhone(a.contact.phone) && normalizePhone(a.contact.phone) === normalizePhone(b.contact.phone)) {
      score += 35;
      reasons.push("Matching phone");
    }
    if (this.similarNames(a.displayName, b.displayName)) {
      score += 25;
      reasons.push("Similar name");
    }

    return { score, reasons };
  }

  private similarNames(a: string, b: string): boolean {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");
    const na = normalize(a);
    const nb = normalize(b);
    return na.includes(nb.slice(0, 4)) || nb.includes(na.slice(0, 4));
  }
}

/** Merges duplicate party records into a primary identity. */
export class IdentityMergeService {
  constructor(private readonly repository: PartyRepository) {}

  merge(input: MergePartiesInput, context: ServiceContext, actorName?: string): PersonRecord {
    const primary = this.repository.getPerson(input.primaryPartyId);
    const duplicate = this.repository.getPerson(input.duplicatePartyId);

    if (!primary || primary.organizationId !== context.organizationId) throw new Error("PRIMARY_NOT_FOUND");
    if (!duplicate || duplicate.organizationId !== context.organizationId) throw new Error("DUPLICATE_NOT_FOUND");
    if (primary.id === duplicate.id) throw new Error("INVALID_MERGE");

    const mergedRoles = [...new Set([...primary.roles, ...duplicate.roles])];
    const mergedIdentifiers = [
      ...(primary.externalIdentifiers ?? []),
      ...(duplicate.externalIdentifiers ?? []),
    ];
    const mergedContactMethods = [
      ...(primary.contactMethods ?? []),
      ...(duplicate.contactMethods ?? []),
    ];

    const updated = this.repository.updatePerson(primary.id, {
      roles: mergedRoles,
      externalIdentifiers: mergedIdentifiers,
      contactMethods: mergedContactMethods,
      notes: [primary.notes, duplicate.notes].filter(Boolean).join(" | ") || undefined,
      isVip: primary.isVip || duplicate.isVip,
      updatedAt: todayIso(),
    })!;

    this.repository.reassignRelationships(duplicate.id, primary.id);
    this.repository.deletePerson(duplicate.id);

    this.repository.addTimelineEntry({
      id: randomUUID(),
      partyId: primary.id,
      type: "merge",
      summary: `Merged duplicate identity: ${duplicate.displayName}`,
      occurredAt: todayIso(),
      actorName,
      metadata: { duplicatePartyId: duplicate.id },
    });

    publishPartyEngineEvent(
      {
        eventType: "PartyMerged",
        partyId: primary.id,
        actorId: context.userId,
        actorName,
        payload: { duplicatePartyId: duplicate.id },
      },
      context,
    );

    return updated;
  }
}

/** Links external system identifiers to canonical party records. */
export class IdentityLinkingService {
  constructor(private readonly repository: PartyRepository) {}

  link(input: LinkExternalIdentifierInput, context: ServiceContext, actorName?: string): PartyExternalIdentifier {
    const party = this.repository.getPerson(input.partyId) ?? this.repository.getOrganisation(input.partyId);
    if (!party || party.organizationId !== context.organizationId) throw new Error("PARTY_NOT_FOUND");

    const identifier: PartyExternalIdentifier = {
      id: randomUUID(),
      system: input.system,
      externalId: input.externalId,
      linkedAt: todayIso(),
    };

    this.repository.addExternalIdentifier(input.partyId, identifier);

    this.repository.addTimelineEntry({
      id: randomUUID(),
      partyId: input.partyId,
      type: "identifier_linked",
      summary: `Linked ${input.system} identifier`,
      occurredAt: todayIso(),
      actorName,
      metadata: { system: input.system, externalId: input.externalId },
    });

    publishPartyEngineEvent(
      {
        eventType: "IdentifierLinked",
        partyId: input.partyId,
        actorId: context.userId,
        actorName,
        payload: { system: input.system, externalId: input.externalId },
      },
      context,
    );

    return identifier;
  }

  list(partyId: string, context: ServiceContext): PartyExternalIdentifier[] {
    const party = this.repository.getPerson(partyId) ?? this.repository.getOrganisation(partyId);
    if (!party || party.organizationId !== context.organizationId) return [];
    return [...(party.externalIdentifiers ?? [])];
  }
}

/** Executive memory timeline for party relationship history. */
export class PartyTimelineService {
  constructor(private readonly repository: PartyRepository) {}

  list(partyId: string, context: ServiceContext): PartyTimelineEntry[] {
    return this.repository
      .listTimelineEntries(partyId)
      .filter(() => {
        const party = this.repository.getPerson(partyId) ?? this.repository.getOrganisation(partyId);
        return party?.organizationId === context.organizationId;
      })
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
}

/** Relationship graph explorer for organisational learning. */
export class RelationshipExplorerService {
  constructor(private readonly repository: PartyRepository) {}

  getGraph(context: ServiceContext) {
    const relationships = this.repository.listPartyRelationships(context.organizationId);
    const nodes = new Map<string, { id: string; displayName: string; kind: string; roles: PartyRoleType[] }>();

    for (const rel of relationships) {
      for (const partyId of [rel.fromPartyId, rel.toPartyId]) {
        if (nodes.has(partyId)) continue;
        const org = this.repository.getOrganisation(partyId);
        const person = this.repository.getPerson(partyId);
        const party = org ?? person;
        if (!party) continue;
        nodes.set(partyId, {
          id: partyId,
          displayName: party.displayName,
          kind: party.kind,
          roles: [...party.roles],
        });
      }
    }

    return {
      nodes: [...nodes.values()],
      edges: relationships.map((rel) => ({
        id: rel.id,
        from: rel.fromPartyId,
        to: rel.toPartyId,
        type: rel.relationshipType,
        role: rel.role,
      })),
      ecosystemCount: nodes.size,
      highValueOrganisations: [...nodes.values()].filter((node) =>
        node.roles.includes("customer") || node.roles.includes("partner"),
      ).length,
    };
  }
}
