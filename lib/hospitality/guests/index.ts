import { randomUUID } from "crypto";
import { toLegacyGuestProfile } from "@/lib/hospitality/guests/guest-mapper";
import { publishGuestEngineEvent } from "@/lib/hospitality/guests/guest-events";
import type { GuestRepository } from "@/lib/hospitality/repositories/GuestRepository";
import type {
  CreateGuestInput,
  GuestBriefSignals,
  GuestConsent,
  GuestPreference,
  GuestRecord,
  GuestRelationship,
  GuestSearchFilter,
  GuestTimelineEntry,
  ModifyGuestInput,
  MergeGuestsInput,
} from "@/types/hospitality-guest";
import type {
  GuestAnalyticsView,
  GuestDetailView,
  GuestListViewItem,
  GuestSearchView,
  GuestTimelineView,
} from "@/lib/hospitality/models/guests";
import type { ServiceContext } from "@/types/services";

type GuestServiceContext = ServiceContext;

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function normalizePhone(phone?: string): string {
  return (phone ?? "").replace(/\D/g, "");
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Duplicate detection engine (Mission P-007.3). */
export class DuplicateDetectionEngine {
  constructor(private readonly repository: GuestRepository) {}

  findDuplicates(record: GuestRecord, organizationId: string, excludeId?: string): { guestId: string; fullName: string; score: number }[] {
    const candidates = this.repository.listGuestRecords(organizationId).filter((entry) => entry.id !== record.id && entry.id !== excludeId);
    const results: { guestId: string; fullName: string; score: number }[] = [];

    for (const candidate of candidates) {
      let score = 0;
      if (record.contact.email && candidate.contact.email?.toLowerCase() === record.contact.email.toLowerCase()) score += 40;
      if (normalizePhone(record.contact.phone) && normalizePhone(record.contact.phone) === normalizePhone(candidate.contact.phone)) score += 35;
      if (record.identity?.passportNumber && record.identity.passportNumber === candidate.identity?.passportNumber) score += 50;
      if (this.similarNames(record.fullName, candidate.fullName)) score += 25;
      if (score >= 35) {
        results.push({ guestId: candidate.id, fullName: candidate.fullName, score });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private similarNames(a: string, b: string): boolean {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");
    const na = normalize(a);
    const nb = normalize(b);
    return na.includes(nb.slice(0, 4)) || nb.includes(na.slice(0, 4));
  }
}

/** Guest validation rules. */
export class GuestRulesEngine {
  validateCreate(input: CreateGuestInput): void {
    if (!input.fullName.trim()) throw new Error("INVALID_GUEST_NAME");
    if (!input.email && !input.phone) throw new Error("CONTACT_REQUIRED");
  }

  validateMerge(primary: GuestRecord | null, duplicate: GuestRecord | null, organizationId: string): void {
    if (!primary || primary.organizationId !== organizationId) throw new Error("GUEST_NOT_FOUND");
    if (!duplicate || duplicate.organizationId !== organizationId) throw new Error("DUPLICATE_NOT_FOUND");
    if (primary.id === duplicate.id) throw new Error("INVALID_MERGE");
  }
}

/** Guest search service. */
export class GuestSearchService {
  constructor(private readonly repository: GuestRepository) {}

  search(filter: GuestSearchFilter, context: GuestServiceContext): GuestSearchView {
    let records = this.repository.searchGuestRecords(filter, context.organizationId);

    if (filter.reservationNumber) {
      const reservation = this.repository.getReservationByNumber(context.organizationId, filter.reservationNumber);
      if (reservation) {
        records = records.filter((entry) => entry.id === reservation.guestId);
      } else {
        records = [];
      }
    }

    return {
      total: records.length,
      items: records.map((record) => this.toListItem(record)),
      filters: [
        { key: "query", label: "Search" },
        { key: "loyaltyTier", label: "Loyalty Tier" },
        { key: "company", label: "Company" },
        { key: "isVip", label: "VIP" },
      ],
    };
  }

  toListItem(record: GuestRecord): GuestListViewItem {
    return {
      id: record.id,
      fullName: record.fullName,
      preferredName: record.preferredName,
      email: record.contact.email,
      phone: record.contact.phone ?? record.contact.mobile,
      loyaltyTier: record.loyaltyTier,
      loyaltyNumber: record.loyaltyNumber,
      company: record.company,
      stayCount: record.stayCount,
      totalSpend: formatCurrency(record.totalSpend),
      isVip: record.isVip,
      satisfactionScore: record.satisfactionScore,
      tags: record.tags.map((tag) => tag.label),
    };
  }
}

/** Communication timeline service. */
export class GuestTimelineService {
  constructor(private readonly repository: GuestRepository) {}

  getTimeline(guestId: string, context: GuestServiceContext): GuestTimelineView | null {
    const record = this.repository.getGuestRecord(guestId);
    if (!record || record.organizationId !== context.organizationId) return null;

    const reservationEntries = this.repository
      .listReservationRecords(context.organizationId)
      .filter((entry) => entry.guestId === guestId)
      .map(
        (entry): GuestTimelineEntry => ({
          id: `tl-res-${entry.id}`,
          guestId,
          type: entry.status === "cancelled" ? "cancellation" : entry.status === "no_show" ? "no_show" : "reservation",
          title: `${entry.reservationNumber} — ${entry.status.replaceAll("_", " ")}`,
          summary: `${entry.arrival} → ${entry.departure} · ₹${entry.rate.toLocaleString("en-IN")}`,
          occurredAt: entry.createdAt,
          relatedEntityId: entry.id,
        }),
      );

    const stored = this.repository.listGuestTimeline(guestId);
    const entries = [...stored, ...reservationEntries].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    return {
      guestId,
      fullName: record.fullName,
      entries,
      total: entries.length,
    };
  }
}

/** Guest analytics service. */
export class GuestAnalyticsService {
  constructor(private readonly repository: GuestRepository) {}

  getAnalytics(record: GuestRecord, context: GuestServiceContext): GuestAnalyticsView {
    const allGuests = this.repository.listGuestRecords(context.organizationId);
    const sorted = [...allGuests].sort((a, b) => b.totalSpend - a.totalSpend);
    const rank = sorted.findIndex((entry) => entry.id === record.id) + 1;

    const reservations = this.repository
      .listReservationRecords(context.organizationId)
      .filter((entry) => entry.guestId === record.id);
    const cancelled = reservations.filter((entry) => entry.status === "cancelled").length;
    const cancellationRate = reservations.length > 0 ? Math.round((cancelled / reservations.length) * 100) : 0;
    const avgStay = record.stayCount > 0 ? record.totalSpend / record.stayCount : 0;

    return {
      lifetimeValue: formatCurrency(record.totalSpend),
      averageStayValue: formatCurrency(avgStay),
      repeatRate: record.stayCount >= 3 ? "High" : record.stayCount >= 2 ? "Moderate" : "New",
      cancellationRate: `${cancellationRate}%`,
      satisfactionTrend: (record.satisfactionScore ?? 80) >= 85 ? "Positive" : "Needs attention",
      loyaltyTier: record.loyaltyTier,
      revenueRank: rank,
    };
  }

  getPortfolioAnalytics(context: GuestServiceContext) {
    const guests = this.repository.listGuestRecords(context.organizationId);
    return {
      totalGuests: guests.length,
      vipCount: guests.filter((entry) => entry.isVip).length,
      repeatGuests: guests.filter((entry) => entry.stayCount >= 2).length,
      highValueGuests: guests.filter((entry) => entry.totalSpend >= 200000).length,
      averageSatisfaction:
        guests.reduce((sum, entry) => sum + (entry.satisfactionScore ?? 80), 0) / Math.max(guests.length, 1),
    };
  }
}

/** Preference management service. */
export class PreferenceService {
  constructor(private readonly repository: GuestRepository) {}

  list(guestId: string, context: GuestServiceContext): GuestPreference[] {
    const record = this.repository.getGuestRecord(guestId);
    if (!record || record.organizationId !== context.organizationId) throw new Error("GUEST_NOT_FOUND");
    return [...record.preferences];
  }

  update(
    guestId: string,
    preferences: GuestPreference[],
    context: GuestServiceContext,
    actorName: string,
  ): GuestRecord {
    const updated = this.repository.updateGuestRecord(guestId, {
      preferences,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error("GUEST_NOT_FOUND");
    publishGuestEngineEvent(
      { eventType: "PreferenceUpdated", guestId, actorId: context.userId, actorName },
      context,
    );
    this.repository.addGuestTimelineEntry({
      id: randomUUID(),
      guestId,
      type: "preference_change",
      title: "Preferences updated",
      summary: `${preferences.length} preference(s) on file`,
      occurredAt: new Date().toISOString(),
    });
    return updated;
  }
}

/** Relationship management service. */
export class RelationshipService {
  constructor(private readonly repository: GuestRepository) {}

  list(guestId: string, context: GuestServiceContext): GuestRelationship[] {
    const record = this.repository.getGuestRecord(guestId);
    if (!record || record.organizationId !== context.organizationId) throw new Error("GUEST_NOT_FOUND");
    return [...record.relationships];
  }

  update(
    guestId: string,
    relationships: GuestRelationship[],
    context: GuestServiceContext,
  ): GuestRecord {
    const updated = this.repository.updateGuestRecord(guestId, {
      relationships,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error("GUEST_NOT_FOUND");
    return updated;
  }
}

/** Consent management service. */
export class ConsentManagementService {
  constructor(private readonly repository: GuestRepository) {}

  list(guestId: string, context: GuestServiceContext): GuestConsent[] {
    const record = this.repository.getGuestRecord(guestId);
    if (!record || record.organizationId !== context.organizationId) throw new Error("GUEST_NOT_FOUND");
    return [...record.consents];
  }

  update(guestId: string, consents: GuestConsent[], context: GuestServiceContext, actorName: string): GuestRecord {
    const updated = this.repository.updateGuestRecord(guestId, {
      consents,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) throw new Error("GUEST_NOT_FOUND");
    publishGuestEngineEvent({ eventType: "ConsentUpdated", guestId, actorId: context.userId, actorName }, context);
    this.repository.addGuestTimelineEntry({
      id: randomUUID(),
      guestId,
      type: "consent_change",
      title: "Consent preferences updated",
      summary: consents.map((entry) => `${entry.type}: ${entry.status}`).join(", "),
      occurredAt: new Date().toISOString(),
    });
    return updated;
  }
}

/** Core guest profile service. */
export class GuestService {
  constructor(
    private readonly repository: GuestRepository,
    private readonly rules: GuestRulesEngine,
    private readonly searchService: GuestSearchService,
    private readonly timelineService: GuestTimelineService,
    private readonly analyticsService: GuestAnalyticsService,
    private readonly duplicateEngine: DuplicateDetectionEngine,
  ) {}

  list(context: GuestServiceContext): readonly GuestListViewItem[] {
    return this.search({}, context).items;
  }

  search(filter: GuestSearchFilter, context: GuestServiceContext): GuestSearchView {
    return this.searchService.search(filter, context);
  }

  getDetail(id: string, context: GuestServiceContext): GuestDetailView | null {
    const record = this.repository.getGuestRecord(id);
    if (!record || record.organizationId !== context.organizationId) return null;

    const stayHistory = this.repository
      .listReservationRecords(context.organizationId)
      .filter((entry) => entry.guestId === id)
      .map((entry) => ({
        reservationId: entry.id,
        reservationNumber: entry.reservationNumber,
        arrival: entry.arrival,
        departure: entry.departure,
        status: entry.status,
        revenue: entry.rate,
      }));

    const timeline = this.timelineService.getTimeline(id, context)?.entries ?? [];
    const duplicateCandidates = this.duplicateEngine.findDuplicates(record, context.organizationId);

    return {
      record,
      timeline,
      stayHistory,
      duplicateCandidates,
      analytics: this.analyticsService.getAnalytics(record, context),
    };
  }

  create(input: CreateGuestInput, context: GuestServiceContext, actorName: string): GuestRecord {
    this.rules.validateCreate(input);
    const now = new Date().toISOString();
    const isVip = input.isVip ?? false;
    const record: GuestRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      fullName: input.fullName.trim(),
      preferredName: input.preferredName ?? input.fullName.split(" ")[0],
      contact: { email: input.email, phone: input.phone, mobile: input.phone },
      nationality: input.nationality,
      languages: input.languages ?? ["English"],
      loyaltyTier: input.loyaltyTier ?? "standard",
      loyaltyNumber: `LOY-${randomUUID().slice(0, 8).toUpperCase()}`,
      preferredCurrency: input.preferredCurrency ?? "INR",
      preferredChannel: input.preferredChannel ?? "email",
      consents: [{ type: "data_processing", status: "granted", grantedAt: now }],
      accessibilityRequirements: input.accessibilityRequirements ?? [],
      dietaryPreferences: input.dietaryPreferences ?? [],
      preferences: (input.dietaryPreferences ?? []).map((value) => ({
        category: "dietary",
        value,
        updatedAt: now,
      })),
      relationships: [],
      documents: [],
      communications: [],
      tags: isVip ? [{ id: randomUUID(), label: "VIP" }] : [],
      isVip,
      company: input.company,
      stayCount: 0,
      totalSpend: 0,
      createdAt: now,
      updatedAt: now,
    };

    const created = this.repository.createGuestRecord(record);
    publishGuestEngineEvent({ eventType: "GuestCreated", guestId: created.id, actorId: context.userId, actorName }, context);
    if (isVip) {
      publishGuestEngineEvent({ eventType: "VipFlagged", guestId: created.id, actorId: context.userId, actorName }, context);
    }
    return created;
  }

  modify(id: string, input: ModifyGuestInput, context: GuestServiceContext, actorName: string): GuestRecord {
    const existing = this.repository.getGuestRecord(id);
    if (!existing || existing.organizationId !== context.organizationId) throw new Error("GUEST_NOT_FOUND");

    const patch: Partial<GuestRecord> = {
      updatedAt: new Date().toISOString(),
      ...(input.fullName ? { fullName: input.fullName.trim() } : {}),
      ...(input.preferredName !== undefined ? { preferredName: input.preferredName } : {}),
      ...(input.email || input.phone
        ? {
            contact: {
              ...existing.contact,
              ...(input.email !== undefined ? { email: input.email } : {}),
              ...(input.phone !== undefined ? { phone: input.phone, mobile: input.phone } : {}),
            },
          }
        : {}),
      ...(input.nationality !== undefined ? { nationality: input.nationality } : {}),
      ...(input.languages ? { languages: input.languages } : {}),
      ...(input.loyaltyTier ? { loyaltyTier: input.loyaltyTier } : {}),
      ...(input.company !== undefined ? { company: input.company } : {}),
      ...(input.isVip !== undefined ? { isVip: input.isVip } : {}),
      ...(input.photographUrl !== undefined ? { photographUrl: input.photographUrl } : {}),
      ...(input.dietaryPreferences ? { dietaryPreferences: input.dietaryPreferences } : {}),
      ...(input.accessibilityRequirements ? { accessibilityRequirements: input.accessibilityRequirements } : {}),
    };

    const updated = this.repository.updateGuestRecord(id, patch);
    if (!updated) throw new Error("GUEST_NOT_FOUND");
    publishGuestEngineEvent({ eventType: "GuestUpdated", guestId: id, actorId: context.userId, actorName }, context);
    return updated;
  }

  merge(input: MergeGuestsInput, context: GuestServiceContext, actorName: string): GuestRecord {
    const primary = this.repository.getGuestRecord(input.primaryGuestId);
    const duplicate = this.repository.getGuestRecord(input.duplicateGuestId);
    this.rules.validateMerge(primary, duplicate, context.organizationId);

    const now = new Date().toISOString();
    const merged: Partial<GuestRecord> = {
      stayCount: (primary!.stayCount + duplicate!.stayCount),
      totalSpend: primary!.totalSpend + duplicate!.totalSpend,
      preferences: [...primary!.preferences, ...duplicate!.preferences],
      relationships: [...primary!.relationships, ...duplicate!.relationships],
      documents: [...primary!.documents, ...duplicate!.documents],
      communications: [...primary!.communications, ...duplicate!.communications],
      updatedAt: now,
    };

    const updated = this.repository.updateGuestRecord(input.primaryGuestId, merged);
    this.repository.deleteGuestRecord(input.duplicateGuestId);

    this.repository.addGuestTimelineEntry({
      id: randomUUID(),
      guestId: input.primaryGuestId,
      type: "merge",
      title: `Merged duplicate guest ${duplicate!.fullName}`,
      summary: `Combined profile from ${duplicate!.id}`,
      occurredAt: now,
      relatedEntityId: input.duplicateGuestId,
    });

    publishGuestEngineEvent(
      {
        eventType: "GuestMerged",
        guestId: input.primaryGuestId,
        actorId: context.userId,
        actorName,
        payload: { duplicateGuestId: input.duplicateGuestId },
      },
      context,
    );

    return updated!;
  }

  findDuplicates(context: GuestServiceContext) {
    const guests = this.repository.listGuestRecords(context.organizationId);
    const pairs: { primary: GuestListViewItem; duplicate: GuestListViewItem; score: number }[] = [];

    for (const guest of guests) {
      for (const match of this.duplicateEngine.findDuplicates(guest, context.organizationId)) {
        pairs.push({
          primary: this.searchService.toListItem(guest),
          duplicate: this.searchService.toListItem(this.repository.getGuestRecord(match.guestId)!),
          score: match.score,
        });
      }
    }

    return pairs.sort((a, b) => b.score - a.score);
  }

  getBriefSignals(context: GuestServiceContext): GuestBriefSignals {
    const guests = this.repository.listGuestRecords(context.organizationId);
    const today = todayIso();
    const reservations = this.repository.listReservationRecords(context.organizationId);
    const arrivalsToday = reservations.filter((entry) => entry.arrival === today);

    const vipArrivals = arrivalsToday.filter((entry) => {
      const guest = this.repository.getGuestRecord(entry.guestId);
      return guest?.isVip;
    }).length;

    const repeatGuests = guests.filter((entry) => entry.stayCount >= 2).length;
    const highValueGuests = guests.filter((entry) => entry.totalSpend >= 200000).length;

    const serviceRecoveryAlerts: string[] = [];
    for (const guest of guests) {
      for (const entry of this.repository.listGuestTimeline(guest.id)) {
        if (entry.type === "service_recovery" || entry.type === "complaint") {
          serviceRecoveryAlerts.push(`${guest.fullName}: ${entry.title}`);
        }
      }
    }

    const avgSatisfaction =
      guests.reduce((sum, entry) => sum + (entry.satisfactionScore ?? 80), 0) / Math.max(guests.length, 1);

    return {
      vipArrivals,
      repeatGuests,
      highValueGuests,
      serviceRecoveryAlerts: serviceRecoveryAlerts.slice(0, 3),
      satisfactionTrend: avgSatisfaction >= 85 ? "Improving" : "Stable",
      guestRetentionOpportunity: repeatGuests >= 3 ? "Strong loyalty base" : "Focus on second-stay conversion",
    };
  }

  /** Legacy list for HospitalityService backward compatibility. */
  listLegacy(context: GuestServiceContext) {
    return this.repository.listGuestRecords(context.organizationId).map(toLegacyGuestProfile);
  }
}

/** Facade for Guest Intelligence & Relationship Platform (Mission P-007.3). */
export class HospitalityGuestFacade {
  readonly guests: GuestService;
  readonly search: GuestSearchService;
  readonly timeline: GuestTimelineService;
  readonly preferences: PreferenceService;
  readonly relationships: RelationshipService;
  readonly consent: ConsentManagementService;
  readonly analytics: GuestAnalyticsService;
  readonly duplicates: DuplicateDetectionEngine;
  readonly rules: GuestRulesEngine;

  constructor(repository: GuestRepository) {
    this.duplicates = new DuplicateDetectionEngine(repository);
    this.rules = new GuestRulesEngine();
    this.search = new GuestSearchService(repository);
    this.timeline = new GuestTimelineService(repository);
    this.analytics = new GuestAnalyticsService(repository);
    this.preferences = new PreferenceService(repository);
    this.relationships = new RelationshipService(repository);
    this.consent = new ConsentManagementService(repository);
    this.guests = new GuestService(
      repository,
      this.rules,
      this.search,
      this.timeline,
      this.analytics,
      this.duplicates,
    );
  }
}
