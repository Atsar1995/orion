import { randomUUID } from "crypto";
import { publishCommercialEngineEvent } from "@/lib/crm/commercial-events";
import { CrmCanonicalEventPublisher } from "@/lib/crm/events";
import { mapCommercialToLegacyOpportunity } from "@/lib/crm/commercial/commercial-mapper";
import { formatCommercialCurrency } from "@/lib/crm/data/seed-commercial";
import type {
  CommercialBriefSignals,
  ForecastDashboardView,
  LeadDetailView,
  LeadListItem,
  LeadListView,
  PipelineMetricsView,
  PipelineView,
} from "@/lib/crm/models/commercial";
import type { CommercialRepository } from "@/lib/crm/repositories/CommercialRepository";
import type {
  CommercialActivityRecord,
  CommercialOpportunityRecord,
  CommercialOpportunityStage,
  ConvertLeadInput,
  CreateLeadInput,
  CreateOpportunityInput,
  LeadRecord,
  LeadSearchFilter,
  LeadStatus,
  ModifyLeadInput,
  ModifyOpportunityInput,
  OpportunitySearchFilter,
  RevenueForecastRecord,
} from "@/types/crm-commercial";
import type { ServiceContext } from "@/types/services";

const STAGE_LABELS: Record<CommercialOpportunityStage, string> = {
  identified: "Identified",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
  closed: "Closed",
};

const OPEN_STAGES: CommercialOpportunityStage[] = [
  "identified",
  "qualified",
  "proposal",
  "negotiation",
];

function todayIso(): string {
  return new Date().toISOString();
}

function isOpenStage(stage: CommercialOpportunityStage): boolean {
  return OPEN_STAGES.includes(stage);
}

/** Lead scoring and qualification engine. */
export class ScoringEngine {
  scoreLead(lead: LeadRecord): number {
    let score = lead.probability;
    if (lead.source === "referral" || lead.source === "corporate") score += 15;
    if (lead.source === "website" || lead.source === "campaign") score += 8;
    if (lead.status === "qualified" || lead.status === "proposal_requested") score += 20;
    if (lead.estimatedValue >= 1000000) score += 10;
    return Math.min(100, score);
  }

  scoreOpportunity(record: CommercialOpportunityRecord): number {
    let score = record.probability;
    if (record.stage === "negotiation") score += 15;
    if (record.stage === "proposal") score += 8;
    if (record.valueAmount >= 1000000) score += 10;
    return Math.min(100, Math.max(0, score));
  }
}

/** Lead lifecycle management. */
export class LeadService {
  constructor(
    private readonly repository: CommercialRepository,
    private readonly scoring: ScoringEngine,
    private readonly canonicalPublisher: CrmCanonicalEventPublisher,
  ) {}

  list(context: ServiceContext, filter: LeadSearchFilter = {}): LeadListView {
    const records = this.repository.searchLeads(filter, context.organizationId);
    const items = records.map((record) => this.toListItem(record));
    return {
      total: items.length,
      items,
      filterOptions: {
        sources: [...new Set(records.map((entry) => entry.source))],
        statuses: [...new Set(records.map((entry) => entry.status))],
        owners: [...new Set(records.map((entry) => entry.owner))],
        territories: [...new Set(records.map((entry) => entry.territory).filter(Boolean))] as string[],
      },
    };
  }

  getDetail(id: string, context: ServiceContext): LeadDetailView | null {
    const record = this.repository.getLead(id);
    if (!record || record.organizationId !== context.organizationId) return null;
    return { ...this.toListItem(record), partyId: record.partyId, organisationPartyId: record.organisationPartyId, tags: record.tags ? [...record.tags] : undefined, notes: record.notes, convertedOpportunityId: record.convertedOpportunityId };
  }

  create(input: CreateLeadInput, context: ServiceContext, actorName?: string): LeadRecord {
    if (!input.displayName.trim()) throw new Error("INVALID_LEAD_NAME");
    const now = todayIso();
    const record: LeadRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      displayName: input.displayName.trim(),
      source: input.source,
      partyId: input.partyId,
      organisationPartyId: input.organisationPartyId,
      industry: input.industry,
      territory: input.territory,
      owner: input.owner,
      estimatedValue: input.estimatedValue ?? 0,
      probability: input.probability ?? 10,
      expectedClose: input.expectedClose,
      nextActivity: input.nextActivity,
      tags: input.tags,
      status: "new",
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    const created = this.repository.createLead(record);
    publishCommercialEngineEvent(
      { eventType: "LeadCreated", entityId: created.id, actorId: context.userId, actorName, payload: { source: created.source } },
      context,
    );
    this.canonicalPublisher.publishLeadCreated(
      {
        leadId: created.id,
        correlationId: created.id,
        source: created.source,
        owner: created.owner,
      },
      context,
    );
    return created;
  }

  modify(id: string, patch: ModifyLeadInput, context: ServiceContext): LeadRecord {
    const existing = this.repository.getLead(id);
    if (!existing || existing.organizationId !== context.organizationId) throw new Error("LEAD_NOT_FOUND");
    const updated = this.repository.updateLead(id, { ...patch, updatedAt: todayIso() }) ?? existing;

    if (patch.status === "qualified" && existing.status !== "qualified") {
      this.canonicalPublisher.publishLeadQualified(
        {
          leadId: id,
          correlationId: id,
          qualifiedBy: context.userId,
        },
        context,
      );
    }

    return updated;
  }

  qualify(id: string, context: ServiceContext): LeadRecord {
    return this.modify(id, { status: "qualified" as LeadStatus }, context);
  }

  private toListItem(record: LeadRecord): LeadListItem {
    return {
      id: record.id,
      displayName: record.displayName,
      source: record.source,
      status: record.status,
      owner: record.owner,
      estimatedValue: formatCommercialCurrency(record.estimatedValue),
      probability: this.scoring.scoreLead(record),
      expectedClose: record.expectedClose,
      nextActivity: record.nextActivity,
      industry: record.industry,
      territory: record.territory,
    };
  }
}

/** Opportunity lifecycle management — independent of reservations. */
export class OpportunityService {
  constructor(
    private readonly repository: CommercialRepository,
    private readonly scoring: ScoringEngine,
    private readonly canonicalPublisher: CrmCanonicalEventPublisher,
  ) {}

  list(context: ServiceContext, filter: OpportunitySearchFilter = {}) {
    const records = this.repository.searchCommercialOpportunities(filter, context.organizationId);
    return records.map((record) => mapCommercialToLegacyOpportunity(record, this.repository));
  }

  get(id: string, context: ServiceContext): CommercialOpportunityRecord | null {
    const record = this.repository.getCommercialOpportunity(id);
    if (!record || record.organizationId !== context.organizationId) return null;
    return record;
  }

  create(input: CreateOpportunityInput, context: ServiceContext, actorName?: string): CommercialOpportunityRecord {
    if (!input.partyId) throw new Error("PARTY_REQUIRED");
    const now = todayIso();
    const base: CommercialOpportunityRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      partyId: input.partyId,
      organisationPartyId: input.organisationPartyId ?? input.partyId,
      leadId: input.leadId,
      name: input.name,
      stage: input.stage ?? "identified",
      source: input.source,
      industry: input.industry,
      territory: input.territory,
      owner: input.owner,
      valueAmount: input.valueAmount,
      probability: input.probability,
      expectedClose: input.expectedClose,
      nextActivity: input.nextActivity ?? "Initial follow-up",
      tags: input.tags,
      score: 0,
      summary: input.summary ?? "",
      createdAt: now,
      updatedAt: now,
    };
    const record = { ...base, score: this.scoring.scoreOpportunity(base) };
    const created = this.repository.createCommercialOpportunity(record);
    publishCommercialEngineEvent(
      { eventType: "OpportunityCreated", entityId: created.id, actorId: context.userId, actorName, payload: { stage: created.stage, partyId: created.partyId } },
      context,
    );
    this.canonicalPublisher.publishOpportunityCreated(
      {
        opportunityId: created.id,
        correlationId: created.id,
        leadId: created.leadId,
        stage: created.stage,
      },
      context,
    );
    return created;
  }

  modify(id: string, patch: ModifyOpportunityInput, context: ServiceContext, actorName?: string): CommercialOpportunityRecord {
    const existing = this.repository.getCommercialOpportunity(id);
    if (!existing || existing.organizationId !== context.organizationId) throw new Error("OPPORTUNITY_NOT_FOUND");
    const updated = this.repository.updateCommercialOpportunity(id, {
      ...patch,
      score: patch.probability !== undefined || patch.stage !== undefined
        ? this.scoring.scoreOpportunity({ ...existing, ...patch })
        : existing.score,
      updatedAt: todayIso(),
    }) ?? existing;

    if (patch.stage === "won") {
      publishCommercialEngineEvent({ eventType: "OpportunityWon", entityId: id, actorId: context.userId, actorName }, context);
    } else if (patch.stage === "lost") {
      publishCommercialEngineEvent({ eventType: "OpportunityLost", entityId: id, actorId: context.userId, actorName }, context);
    }

    if (
      patch.stage !== undefined &&
      patch.stage !== existing.stage &&
      (patch.stage === "won" || patch.stage === "lost" || patch.stage === "closed")
    ) {
      const outcome = patch.stage === "lost" ? "lost" : "won";
      this.canonicalPublisher.publishOpportunityClosed(
        {
          opportunityId: id,
          correlationId: id,
          outcome,
          amount: String(updated.valueAmount),
        },
        context,
      );
    }

    return updated;
  }

  convertLead(input: ConvertLeadInput, context: ServiceContext, actorName?: string): CommercialOpportunityRecord {
    const lead = this.repository.getLead(input.leadId);
    if (!lead || lead.organizationId !== context.organizationId) throw new Error("LEAD_NOT_FOUND");
    if (lead.status === "converted") throw new Error("LEAD_ALREADY_CONVERTED");

    const opportunity = this.create(
      {
        name: input.name,
        partyId: lead.organisationPartyId ?? lead.partyId ?? lead.id,
        organisationPartyId: lead.organisationPartyId,
        leadId: lead.id,
        source: lead.source,
        industry: lead.industry,
        territory: lead.territory,
        owner: lead.owner,
        valueAmount: input.valueAmount,
        probability: input.probability,
        expectedClose: input.expectedClose,
        stage: "qualified",
        summary: `Converted from lead: ${lead.displayName}`,
      },
      context,
      actorName,
    );

    this.repository.updateLead(lead.id, {
      status: "converted",
      convertedOpportunityId: opportunity.id,
      updatedAt: todayIso(),
    });

    return opportunity;
  }
}

/** Sales pipeline aggregation. */
export class PipelineService {
  constructor(private readonly repository: CommercialRepository) {}

  getView(context: ServiceContext): PipelineView {
    const records = this.repository.listCommercialOpportunities(context.organizationId);
    const columns = (Object.keys(STAGE_LABELS) as CommercialOpportunityStage[]).map((stage) => {
      const stageRecords = records.filter((entry) => entry.stage === stage);
      const total = stageRecords.reduce((sum, entry) => sum + entry.valueAmount, 0);
      return {
        stage,
        label: STAGE_LABELS[stage],
        count: stageRecords.length,
        totalValue: formatCommercialCurrency(total),
        items: stageRecords.map((entry) => ({
          id: entry.id,
          name: entry.name,
          customer: this.repository.getOrganisation(entry.organisationPartyId ?? entry.partyId)?.displayName ?? entry.partyId,
          value: formatCommercialCurrency(entry.valueAmount),
          probability: entry.probability,
          owner: entry.owner,
          score: entry.score,
        })),
      };
    });

    return { columns, metrics: this.getMetrics(context) };
  }

  getMetrics(context: ServiceContext): PipelineMetricsView {
    const records = this.repository.listCommercialOpportunities(context.organizationId);
    const open = records.filter((entry) => isOpenStage(entry.stage));
    const totalOpenValue = open.reduce((sum, entry) => sum + entry.valueAmount, 0);
    const weighted = open.reduce((sum, entry) => sum + Math.round((entry.valueAmount * entry.probability) / 100), 0);
    const won = records.filter((entry) => entry.stage === "won" || entry.stage === "closed").length;
    const lost = records.filter((entry) => entry.stage === "lost").length;
    const closed = won + lost;

    return {
      totalPipelineValue: formatCommercialCurrency(totalOpenValue),
      openOpportunities: open.length,
      averageDealSize: formatCommercialCurrency(open.length > 0 ? Math.round(totalOpenValue / open.length) : 0),
      expectedMonthlyRevenue: formatCommercialCurrency(weighted),
      winRate: closed > 0 ? `${Math.round((won / closed) * 100)}%` : "0%",
      salesVelocityDays: 42,
    };
  }
}

/** Revenue forecast engine. */
export class ForecastService {
  constructor(private readonly repository: CommercialRepository) {}

  getForecasts(context: ServiceContext): RevenueForecastRecord[] {
    const records = this.repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => isOpenStage(entry.stage));

    const weighted = records.reduce(
      (sum, entry) => sum + Math.round((entry.valueAmount * entry.probability) / 100),
      0,
    );

    return [
      { period: "Jul 2026", projectedRevenue: Math.round(weighted * 0.3), confidence: 78, opportunityCount: records.length, weightedPipeline: weighted },
      { period: "Aug 2026", projectedRevenue: Math.round(weighted * 0.45), confidence: 72, opportunityCount: records.length, weightedPipeline: weighted },
      { period: "Sep 2026", projectedRevenue: Math.round(weighted * 0.55), confidence: 65, opportunityCount: records.length, weightedPipeline: weighted },
      { period: "Q3 2026", projectedRevenue: weighted, confidence: 70, opportunityCount: records.length, weightedPipeline: weighted },
    ];
  }

  getDashboard(context: ServiceContext): ForecastDashboardView {
    const forecasts = this.getForecasts(context);
    const records = this.repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => isOpenStage(entry.stage))
      .sort((a, b) => b.score - a.score);

    const top = records.slice(0, 5).map((entry) => ({
      id: entry.id,
      name: entry.name,
      value: formatCommercialCurrency(entry.valueAmount),
      expectedRevenue: formatCommercialCurrency(Math.round((entry.valueAmount * entry.probability) / 100)),
      probability: entry.probability,
      stage: STAGE_LABELS[entry.stage],
      owner: entry.owner,
    }));

    return {
      forecasts,
      topOpportunities: top,
      briefingLine: `Q3 forecast ${formatCommercialCurrency(forecasts[3]?.projectedRevenue ?? 0)} across ${records.length} open opportunities — top deal: ${top[0]?.name ?? "None"}.`,
    };
  }

  getBriefSignals(context: ServiceContext): CommercialBriefSignals {
    const pipeline = new PipelineService(this.repository).getMetrics(context);
    const dashboard = this.getDashboard(context);
    const activeLeads = this.repository
      .listLeads(context.organizationId)
      .filter((entry) => entry.status !== "converted" && entry.status !== "archived" && entry.status !== "lost").length;

    return {
      pipelineValue: pipeline.totalPipelineValue,
      openOpportunities: pipeline.openOpportunities,
      topOpportunityName: dashboard.topOpportunities[0]?.name ?? "None",
      topOpportunityValue: dashboard.topOpportunities[0]?.value ?? "₹0",
      forecastRevenue: formatCommercialCurrency(dashboard.forecasts[3]?.projectedRevenue ?? 0),
      winRate: pipeline.winRate,
      activeLeads,
      briefingLine: `${pipeline.openOpportunities} open opportunities worth ${pipeline.totalPipelineValue} — ${activeLeads} active leads, Q3 forecast ${formatCommercialCurrency(dashboard.forecasts[3]?.projectedRevenue ?? 0)}.`,
    };
  }
}

/** Commercial activity tracking. */
export class CommercialActivityService {
  constructor(private readonly repository: CommercialRepository) {}

  list(context: ServiceContext): CommercialActivityRecord[] {
    return this.repository.listCommercialActivities(context.organizationId);
  }

  listForLead(leadId: string, context: ServiceContext): CommercialActivityRecord[] {
    return this.repository.getCommercialActivitiesForEntity({ leadId }).filter((entry) => entry.organizationId === context.organizationId);
  }

  listForOpportunity(opportunityId: string, context: ServiceContext): CommercialActivityRecord[] {
    return this.repository.getCommercialActivitiesForEntity({ opportunityId }).filter((entry) => entry.organizationId === context.organizationId);
  }
}

/** CRM Commercial Domain facade (Mission P-008.2). */
export class CrmCommercialFacade {
  readonly leads: LeadService;
  readonly opportunities: OpportunityService;
  readonly pipeline: PipelineService;
  readonly forecast: ForecastService;
  readonly activities: CommercialActivityService;
  readonly scoring: ScoringEngine;

  constructor(
    repository: CommercialRepository,
    canonicalPublisher: CrmCanonicalEventPublisher,
  ) {
    const scoring = new ScoringEngine();
    this.scoring = scoring;
    this.leads = new LeadService(repository, scoring, canonicalPublisher);
    this.opportunities = new OpportunityService(repository, scoring, canonicalPublisher);
    this.pipeline = new PipelineService(repository);
    this.forecast = new ForecastService(repository);
    this.activities = new CommercialActivityService(repository);
  }
}

export { STAGE_LABELS, formatCommercialCurrency };
