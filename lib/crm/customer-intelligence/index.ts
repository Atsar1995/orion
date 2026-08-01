import { randomUUID } from "crypto";
import { publishCustomerIntelligenceEvent } from "@/lib/crm/customer-intelligence-events";
import { formatCommercialCurrency } from "@/lib/crm/commercial";
import { HOSPITALITY_ENRICHMENT } from "@/lib/crm/data/seed-customer-intelligence";
import type {
  CustomerIntelligenceBriefSignals,
  CustomerIntelligenceDashboardView,
  CustomerProfileDetailView,
  CustomerProfileHubView,
  CustomerProfileListItem,
} from "@/lib/crm/models/customer-intelligence";
import type { CustomerIntelligenceRepository } from "@/lib/crm/repositories/CustomerIntelligenceRepository";
import type {
  CommunicationPreferences,
  CustomerInsightRecord,
  CustomerProfileRecord,
  CustomerSegmentRecord,
  CustomerSegmentType,
  GrowthOpportunityRecord,
  JourneyEventRecord,
  JourneyStage,
  RetentionRiskLevel,
  RetentionRiskRecord,
} from "@/types/crm-customer-intelligence";
import type { CommercialOpportunityStage } from "@/types/crm-commercial";
import type { OrganisationRecord, PersonRecord } from "@/types/crm-party";
import type { ServiceContext } from "@/types/services";

const OPEN_STAGES: CommercialOpportunityStage[] = [
  "identified",
  "qualified",
  "proposal",
  "negotiation",
];

const SEGMENT_LABELS: Record<CustomerSegmentType, string> = {
  vip: "VIP",
  corporate: "Corporate",
  travel_agent: "Travel Agent",
  leisure: "Leisure",
  government: "Government",
  enterprise: "Enterprise",
  high_growth: "High Growth",
  at_risk: "At Risk",
};

function partyName(repository: CustomerIntelligenceRepository, partyId: string): string {
  return (
    repository.getOrganisation(partyId)?.displayName ??
    repository.getPerson(partyId)?.displayName ??
    partyId
  );
}

function hospitalityKey(partyId: string): string | undefined {
  return Object.keys(HOSPITALITY_ENRICHMENT).find((key) => partyId.includes(key));
}

function computeClv(
  repository: CustomerIntelligenceRepository,
  partyId: string,
  organizationId: string,
): number {
  const won = repository
    .listCommercialOpportunities(organizationId)
    .filter((entry) => entry.partyId === partyId && (entry.stage === "won" || entry.stage === "closed"))
    .reduce((sum, entry) => sum + entry.valueAmount, 0);
  const contracts = repository
    .listContracts(organizationId)
    .filter((entry) => entry.partyId === partyId && entry.status === "active")
    .reduce((sum, entry) => sum + entry.pricing.total, 0);
  const hospKey = hospitalityKey(partyId);
  const hospSpend = hospKey ? HOSPITALITY_ENRICHMENT[hospKey]!.totalSpend : 0;
  return won + contracts + hospSpend;
}

function deriveSegment(
  party: OrganisationRecord | PersonRecord,
  clv: number,
  retentionRisk: RetentionRiskLevel,
  growthPotential: number,
): CustomerSegmentType {
  if (retentionRisk === "high" || retentionRisk === "critical") return "at_risk";
  if (party.isVip) return "vip";
  if (growthPotential >= 75) return "high_growth";
  if (party.kind === "organisation") {
    if (party.organisationType === "government") return "government";
    if (party.organisationType === "travel_agency") return "travel_agent";
    if (party.organisationType === "corporate_account" && clv >= 2000000) return "enterprise";
    if (party.organisationType === "corporate_account") return "corporate";
  }
  if (clv >= 1500000) return "enterprise";
  return "leisure";
}

function deriveRetentionRisk(
  repository: CustomerIntelligenceRepository,
  partyId: string,
  organizationId: string,
  engagementScore: number,
): RetentionRiskLevel {
  const contracts = repository.listContracts(organizationId).filter((entry) => entry.partyId === partyId);
  const expiring = contracts.some((entry) => {
    if (entry.status !== "active") return false;
    const days = Math.ceil((new Date(entry.effectiveTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 45;
  });
  const stalled = repository
    .listCommercialOpportunities(organizationId)
    .filter(
      (entry) =>
        entry.partyId === partyId &&
        OPEN_STAGES.includes(entry.stage) &&
        (entry.stage === "proposal" || entry.stage === "identified"),
    ).length;

  if (expiring && engagementScore < 50) return "critical";
  if (expiring || engagementScore < 40) return "high";
  if (stalled > 0 || engagementScore < 60) return "medium";
  return "low";
}

function buildProfile(
  repository: CustomerIntelligenceRepository,
  party: OrganisationRecord | PersonRecord,
  context: ServiceContext,
): CustomerProfileRecord {
  const clv = computeClv(repository, party.id, context.organizationId);
  const opportunities = repository
    .listCommercialOpportunities(context.organizationId)
    .filter((entry) => entry.partyId === party.id);
  const openCount = opportunities.filter((entry) => OPEN_STAGES.includes(entry.stage)).length;
  const wonCount = opportunities.filter((entry) => entry.stage === "won" || entry.stage === "closed").length;
  const activities = repository.listCommercialActivities(context.organizationId).filter((entry) => entry.partyId === party.id);
  const hospKey = hospitalityKey(party.id);
  const hosp = hospKey ? HOSPITALITY_ENRICHMENT[hospKey] : undefined;

  const engagementScore = Math.min(
    100,
    Math.round(40 + activities.length * 8 + openCount * 5 + (hosp?.stays ?? 0) * 2),
  );
  const loyaltyIndex = Math.min(
    100,
    Math.round(50 + (hosp?.stays ?? 0) * 3 + wonCount * 10 + (party.isVip ? 15 : 0)),
  );
  const growthPotential = Math.min(
    100,
    Math.round(30 + openCount * 15 + (opportunities.some((entry) => entry.stage === "negotiation") ? 25 : 0)),
  );
  const retentionRisk = deriveRetentionRisk(repository, party.id, context.organizationId, engagementScore);
  const relationshipScore = Math.max(
    0,
    Math.min(100, Math.round((loyaltyIndex + engagementScore + (100 - riskToScore(retentionRisk))) / 3)),
  );

  const prefs: CommunicationPreferences = {
    preferredChannel: party.contact.email ? "email" : "phone",
    contactFrequency: party.isVip ? "weekly" : "monthly",
    language: "English",
  };

  return {
    partyId: party.id,
    organizationId: context.organizationId,
    displayName: party.displayName,
    industry: party.industry,
    segment: deriveSegment(party, clv, retentionRisk, growthPotential),
    relationshipScore,
    lifetimeValue: clv,
    loyaltyIndex,
    engagementScore,
    retentionRisk,
    growthPotential,
    communicationPreferences: prefs,
    commercialSummary: `${openCount} open / ${wonCount} won opportunities`,
    hospitalitySummary: hosp
      ? `${hosp.stays} stays · ${hosp.loyaltyTier} · last stay ${hosp.lastStay}`
      : undefined,
    financialSummary: `${formatCommercialCurrency(clv)} lifetime value · ${repository.listContracts(context.organizationId).filter((entry) => entry.partyId === party.id && entry.status === "active").length} active contract(s)`,
    updatedAt: new Date().toISOString(),
  };
}

function riskToScore(risk: RetentionRiskLevel): number {
  if (risk === "critical") return 90;
  if (risk === "high") return 70;
  if (risk === "medium") return 40;
  return 10;
}

function customerParties(repository: CustomerIntelligenceRepository, organizationId: string) {
  return repository
    .listOrganisations(organizationId)
    .filter((entry) => entry.roles.includes("customer"));
}

/** Unified customer profile on partyId (Mission P-008.6). */
export class CustomerProfileService {
  constructor(private readonly repository: CustomerIntelligenceRepository) {}

  list(context: ServiceContext): CustomerProfileListItem[] {
    return customerParties(this.repository, context.organizationId).map((party) => {
      const profile = buildProfile(this.repository, party, context);
      return {
        partyId: profile.partyId,
        displayName: profile.displayName,
        segment: SEGMENT_LABELS[profile.segment],
        relationshipScore: profile.relationshipScore,
        lifetimeValue: formatCommercialCurrency(profile.lifetimeValue),
        retentionRisk: profile.retentionRisk,
        growthPotential: profile.growthPotential,
      };
    });
  }

  get(partyId: string, context: ServiceContext): CustomerProfileDetailView | null {
    const party =
      this.repository.getOrganisation(partyId) ?? this.repository.getPerson(partyId);
    if (!party || party.organizationId !== context.organizationId) return null;

    const profile = buildProfile(this.repository, party, context);
    const journey = new JourneyAnalyticsService(this.repository).getForParty(partyId, context);
    const milestones = this.repository.listMilestonesForParty(partyId).map((entry) => ({
      milestone: entry.milestone,
      recordedAt: entry.recordedAt,
      outcome: entry.outcome,
    }));

    return { ...profile, journey, milestones };
  }

  getHub(context: ServiceContext): CustomerProfileHubView {
    const profiles = this.list(context);
    const vipCount = profiles.filter((entry) => entry.segment === "VIP").length;
    const atRiskCount = profiles.filter(
      (entry) => entry.retentionRisk === "high" || entry.retentionRisk === "critical",
    ).length;
    const totalClv = customerParties(this.repository, context.organizationId).reduce(
      (sum, party) => sum + computeClv(this.repository, party.id, context.organizationId),
      0,
    );

    return {
      profiles,
      vipCount,
      atRiskCount,
      totalLifetimeValue: formatCommercialCurrency(totalClv),
      briefingLine: `${profiles.length} customer profiles — ${vipCount} VIP, ${atRiskCount} at retention risk, ${formatCommercialCurrency(totalClv)} total CLV.`,
    };
  }
}

/** Customer segmentation engine. */
export class SegmentationEngine {
  constructor(private readonly repository: CustomerIntelligenceRepository) {}

  analyze(context: ServiceContext): CustomerSegmentRecord[] {
    const profiles = customerParties(this.repository, context.organizationId).map((party) =>
      buildProfile(this.repository, party, context),
    );
    const segments = Object.keys(SEGMENT_LABELS) as CustomerSegmentType[];

    return segments
      .map((segment) => {
        const members = profiles.filter((entry) => entry.segment === segment);
        if (members.length === 0) return null;
        return {
          segment,
          label: SEGMENT_LABELS[segment],
          count: members.length,
          totalLifetimeValue: members.reduce((sum, entry) => sum + entry.lifetimeValue, 0),
          averageRelationshipScore: Math.round(
            members.reduce((sum, entry) => sum + entry.relationshipScore, 0) / members.length,
          ),
        };
      })
      .filter((entry): entry is CustomerSegmentRecord => entry !== null);
  }
}

/** Journey analytics from operational history across domains. */
export class JourneyAnalyticsService {
  constructor(private readonly repository: CustomerIntelligenceRepository) {}

  getForParty(partyId: string, context: ServiceContext): JourneyEventRecord[] {
    const events: JourneyEventRecord[] = [];
    const orgId = context.organizationId;

    for (const lead of this.repository.listLeads(orgId).filter((entry) => entry.partyId === partyId || entry.organisationPartyId === partyId)) {
      events.push({
        id: `journey-lead-${lead.id}`,
        partyId,
        organizationId: orgId,
        stage: "acquisition",
        title: `Lead acquired — ${lead.source}`,
        description: lead.displayName,
        occurredAt: lead.createdAt,
        sourceDomain: "commercial",
      });
    }

    for (const opp of this.repository.listCommercialOpportunities(orgId).filter((entry) => entry.partyId === partyId)) {
      const stage: JourneyStage =
        opp.stage === "won" || opp.stage === "closed"
          ? "conversion"
          : opp.stage === "negotiation"
            ? "engagement"
            : "engagement";
      events.push({
        id: `journey-opp-${opp.id}`,
        partyId,
        organizationId: orgId,
        stage,
        title: opp.name,
        description: `${opp.stage} · ${formatCommercialCurrency(opp.valueAmount)}`,
        occurredAt: opp.updatedAt,
        sourceDomain: "commercial",
      });
    }

    for (const contract of this.repository.listContracts(orgId).filter((entry) => entry.partyId === partyId)) {
      events.push({
        id: `journey-contract-${contract.id}`,
        partyId,
        organizationId: orgId,
        stage: contract.status === "renewed" ? "renewal" : "service_delivery",
        title: contract.title,
        description: `${contract.status} · ${contract.effectiveFrom} — ${contract.effectiveTo}`,
        occurredAt: contract.signedAt ?? contract.createdAt,
        sourceDomain: "agreements",
      });
    }

    const hospKey = hospitalityKey(partyId);
    if (hospKey) {
      const hosp = HOSPITALITY_ENRICHMENT[hospKey]!;
      events.push({
        id: `journey-hosp-${partyId}`,
        partyId,
        organizationId: orgId,
        stage: "service_delivery",
        title: "Hospitality stays",
        description: `${hosp.stays} stays · ${hosp.loyaltyTier} tier`,
        occurredAt: `${hosp.lastStay}T12:00:00.000Z`,
        sourceDomain: "hospitality",
      });
    }

    for (const milestone of this.repository.listMilestonesForParty(partyId)) {
      events.push({
        id: milestone.id,
        partyId,
        organizationId: orgId,
        stage: milestone.milestone.toLowerCase().includes("renewal") ? "renewal" : "advocacy",
        title: milestone.milestone,
        description: milestone.outcome ?? "",
        occurredAt: milestone.recordedAt,
        sourceDomain: "commercial",
      });
    }

    return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  getSummary(context: ServiceContext): Array<{ stage: string; count: number }> {
    const stages: JourneyStage[] = [
      "acquisition",
      "engagement",
      "conversion",
      "service_delivery",
      "renewal",
      "advocacy",
    ];
    const counts = new Map<JourneyStage, number>();
    for (const party of customerParties(this.repository, context.organizationId)) {
      for (const event of this.getForParty(party.id, context)) {
        counts.set(event.stage, (counts.get(event.stage) ?? 0) + 1);
      }
    }
    return stages.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
  }
}

/** Retention prediction from derived engagement and contract signals. */
export class RetentionPredictionService {
  constructor(private readonly repository: CustomerIntelligenceRepository) {}

  predict(context: ServiceContext): RetentionRiskRecord[] {
    const results: RetentionRiskRecord[] = [];

    for (const party of customerParties(this.repository, context.organizationId)) {
      const profile = buildProfile(this.repository, party, context);
      if (profile.retentionRisk === "low") continue;

      const drivers: string[] = [];
      if (profile.engagementScore < 60) drivers.push("Low engagement score");
      if (profile.retentionRisk === "critical") drivers.push("Contract expiring with low engagement");

      const contracts = this.repository
        .listContracts(context.organizationId)
        .filter((entry) => entry.partyId === party.id && entry.status === "active");
      if (contracts.some((entry) => new Date(entry.effectiveTo).getTime() - Date.now() < 45 * 86400000)) {
        drivers.push("Active contract expiring within 45 days");
      }

      if (profile.retentionRisk === "high" || profile.retentionRisk === "critical") {
        publishCustomerIntelligenceEvent(
          {
            eventType: "RetentionRiskDetected",
            entityId: party.id,
            payload: { risk: profile.retentionRisk },
          },
          context,
        );
      }

      results.push({
        partyId: party.id,
        partyName: profile.displayName,
        riskLevel: profile.retentionRisk,
        score: riskToScore(profile.retentionRisk),
        drivers,
        recommendedAction:
          profile.retentionRisk === "critical"
            ? "Immediate founder outreach and renewal proposal"
            : "Schedule executive check-in within 7 days",
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }
}

/** Growth opportunity identification engine. */
export class GrowthOpportunityEngine {
  constructor(private readonly repository: CustomerIntelligenceRepository) {}

  identify(context: ServiceContext): GrowthOpportunityRecord[] {
    const opportunities: GrowthOpportunityRecord[] = [];

    for (const party of customerParties(this.repository, context.organizationId)) {
      const profile = buildProfile(this.repository, party, context);
      if (profile.growthPotential < 60) continue;

      const openOpps = this.repository
        .listCommercialOpportunities(context.organizationId)
        .filter((entry) => entry.partyId === party.id && OPEN_STAGES.includes(entry.stage));

      if (openOpps.length > 0) {
        const top = openOpps.sort((a, b) => b.valueAmount - a.valueAmount)[0]!;
        opportunities.push({
          id: randomUUID(),
          partyId: party.id,
          partyName: profile.displayName,
          title: `Expand — ${top.name}`,
          description: `High growth potential (${profile.growthPotential}/100) with active ${top.stage} opportunity.`,
          potentialValue: top.valueAmount,
          confidence: top.probability,
        });
      } else if (profile.segment === "high_growth" || profile.loyaltyIndex >= 70) {
        opportunities.push({
          id: randomUUID(),
          partyId: party.id,
          partyName: profile.displayName,
          title: `Account expansion — ${profile.displayName}`,
          description: `Strong loyalty (${profile.loyaltyIndex}/100) — cross-sell or upsell opportunity.`,
          potentialValue: Math.round(profile.lifetimeValue * 0.2),
          confidence: 55,
        });
      }
    }

    if (opportunities.length > 0) {
      publishCustomerIntelligenceEvent(
        {
          eventType: "GrowthOpportunityIdentified",
          entityId: opportunities[0]!.partyId,
          payload: { count: String(opportunities.length) },
        },
        context,
      );
    }

    return opportunities.sort((a, b) => b.potentialValue - a.potentialValue);
  }
}

/** Customer insight generator for executive memory. */
export class CustomerInsightGenerator {
  constructor(
    private readonly repository: CustomerIntelligenceRepository,
    private readonly retention: RetentionPredictionService,
    private readonly growth: GrowthOpportunityEngine,
    private readonly segments: SegmentationEngine,
  ) {}

  generate(context: ServiceContext): CustomerInsightRecord[] {
    const insights: CustomerInsightRecord[] = [];
    const atRisk = this.retention.predict(context);
    const growthOps = this.growth.identify(context);
    const segmentData = this.segments.analyze(context);

    if (atRisk.length > 0) {
      insights.push({
        id: "ci-retention-trend",
        category: "retention",
        title: `${atRisk.length} customer(s) at retention risk`,
        summary: atRisk.map((entry) => entry.partyName).join(", "),
        why: "Derived from engagement scores, contract expiry, and stalled pipeline — not raw operational events.",
        recommendedAction: "Launch retention campaign with founder outreach on critical accounts.",
      });
    }

    const vipSegment = segmentData.find((entry) => entry.segment === "vip");
    if (vipSegment) {
      insights.push({
        id: "ci-loyalty-vip",
        category: "loyalty",
        title: `VIP segment — ${vipSegment.count} accounts`,
        summary: `${formatCommercialCurrency(vipSegment.totalLifetimeValue)} combined CLV, avg score ${vipSegment.averageRelationshipScore}/100`,
        why: "Loyalty index derived from stays, won deals, and VIP status.",
        recommendedAction: "Maintain loyalty initiatives and executive relationship cadence.",
      });
    }

    if (growthOps.length > 0) {
      insights.push({
        id: "ci-growth",
        category: "growth",
        title: `${growthOps.length} growth opportunity(ies) identified`,
        summary: growthOps[0]!.title,
        why: "Growth potential combines open pipeline, negotiation stage, and loyalty signals.",
        recommendedAction: "Prioritize account expansion on top 3 growth accounts.",
      });
    }

    publishCustomerIntelligenceEvent(
      { eventType: "CustomerInsightGenerated", entityId: "insights", payload: { count: String(insights.length) } },
      context,
    );

    return insights;
  }
}

/** Executive dashboard and brief signals. */
export class CustomerIntelligenceAnalyticsService {
  constructor(
    private readonly profiles: CustomerProfileService,
    private readonly segments: SegmentationEngine,
    private readonly journey: JourneyAnalyticsService,
    private readonly retention: RetentionPredictionService,
    private readonly growth: GrowthOpportunityEngine,
    private readonly insights: CustomerInsightGenerator,
  ) {}

  getDashboard(context: ServiceContext): CustomerIntelligenceDashboardView {
    const hub = this.profiles.getHub(context);
    return {
      hub,
      segments: this.segments.analyze(context),
      retention: this.retention.predict(context),
      growth: this.growth.identify(context),
      insights: this.insights.generate(context),
      journeySummary: this.journey.getSummary(context),
    };
  }

  getBriefSignals(context: ServiceContext): CustomerIntelligenceBriefSignals {
    const dashboard = this.getDashboard(context);
    const highRisk = dashboard.retention.filter(
      (entry) => entry.riskLevel === "high" || entry.riskLevel === "critical",
    ).length;

    return {
      vipCustomers: dashboard.hub.vipCount,
      customersAtRisk: highRisk,
      growthOpportunities: dashboard.growth.length,
      retentionTrend: highRisk > 0 ? `${highRisk} accounts need retention attention` : "Retention stable",
      briefingLine: dashboard.hub.briefingLine,
    };
  }
}

/** CRM Customer Analytics & Relationship Intelligence facade (Mission P-008.6). */
export class CrmCustomerIntelligenceFacade {
  readonly profiles: CustomerProfileService;
  readonly segments: SegmentationEngine;
  readonly journey: JourneyAnalyticsService;
  readonly retention: RetentionPredictionService;
  readonly growth: GrowthOpportunityEngine;
  readonly insights: CustomerInsightGenerator;
  readonly executive: CustomerIntelligenceAnalyticsService;

  constructor(repository: CustomerIntelligenceRepository) {
    this.profiles = new CustomerProfileService(repository);
    this.segments = new SegmentationEngine(repository);
    this.journey = new JourneyAnalyticsService(repository);
    this.retention = new RetentionPredictionService(repository);
    this.growth = new GrowthOpportunityEngine(repository);
    this.insights = new CustomerInsightGenerator(
      repository,
      this.retention,
      this.growth,
      this.segments,
    );
    this.executive = new CustomerIntelligenceAnalyticsService(
      this.profiles,
      this.segments,
      this.journey,
      this.retention,
      this.growth,
      this.insights,
    );
  }
}

export { formatCommercialCurrency, partyName, SEGMENT_LABELS };
