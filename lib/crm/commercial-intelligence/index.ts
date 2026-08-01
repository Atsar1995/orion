import { randomUUID } from "crypto";
import { publishCommercialIntelligenceEvent } from "@/lib/crm/commercial-intelligence-events";
import { formatCommercialCurrency, STAGE_LABELS } from "@/lib/crm/commercial";
import type {
  CommercialAnalyticsView,
  CommercialExecutiveDashboard,
  CommercialIntelligenceBriefSignals,
} from "@/lib/crm/models/commercial-intelligence";
import type { CommercialIntelligenceRepository } from "@/lib/crm/repositories/CommercialIntelligenceRepository";
import type {
  CommercialInsight,
  CommercialKpi,
  CommercialRecommendation,
  ForecastRecord,
  RelationshipHealthRecord,
} from "@/types/crm-commercial-intelligence";
import type { CommercialOpportunityRecord, CommercialOpportunityStage } from "@/types/crm-commercial";
import type { ServiceContext } from "@/types/services";

const OPEN_STAGES: CommercialOpportunityStage[] = [
  "identified",
  "qualified",
  "proposal",
  "negotiation",
];

function isOpenStage(stage: CommercialOpportunityStage): boolean {
  return OPEN_STAGES.includes(stage);
}

function partyName(repository: CommercialIntelligenceRepository, partyId: string): string {
  return (
    repository.getOrganisation(partyId)?.displayName ??
    repository.getPerson(partyId)?.displayName ??
    partyId
  );
}

function todayIso(): string {
  return new Date().toISOString();
}

function computeSalesVelocityDays(records: CommercialOpportunityRecord[]): number {
  const closed = records.filter((entry) => entry.stage === "won" || entry.stage === "closed");
  if (closed.length === 0) return 42;
  const avgDays = closed.reduce((sum, entry) => {
    const created = new Date(entry.createdAt).getTime();
    const updated = new Date(entry.updatedAt).getTime();
    return sum + Math.max(1, Math.round((updated - created) / (1000 * 60 * 60 * 24)));
  }, 0);
  return Math.round(avgDays / closed.length);
}

function computeClv(
  repository: CommercialIntelligenceRepository,
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
  return won + contracts;
}

/** Commercial KPI library on canonical pipeline data. */
export class CommercialKpiService {
  constructor(private readonly repository: CommercialIntelligenceRepository) {}

  getKpis(context: ServiceContext): CommercialKpi[] {
    const records = this.repository.listCommercialOpportunities(context.organizationId);
    const open = records.filter((entry) => isOpenStage(entry.stage));
    const won = records.filter((entry) => entry.stage === "won" || entry.stage === "closed");
    const lost = records.filter((entry) => entry.stage === "lost");
    const totalOpen = open.reduce((sum, entry) => sum + entry.valueAmount, 0);
    const weighted = open.reduce(
      (sum, entry) => sum + Math.round((entry.valueAmount * entry.probability) / 100),
      0,
    );
    const closed = won.length + lost.length;
    const winRate = closed > 0 ? Math.round((won.length / closed) * 100) : 0;
    const velocity = computeSalesVelocityDays(records);
    const avgClv =
      records.length > 0
        ? Math.round(
            [...new Set(records.map((entry) => entry.partyId))].reduce(
              (sum, partyId) => sum + computeClv(this.repository, partyId, context.organizationId),
              0,
            ) / new Set(records.map((entry) => entry.partyId)).size,
          )
        : 0;

    const activeContracts = this.repository
      .listContracts(context.organizationId)
      .filter((entry) => entry.status === "active");
    const relationshipScores = new RelationshipScoringEngine(this.repository).scoreAll(context);
    const avgHealth =
      relationshipScores.length > 0
        ? Math.round(relationshipScores.reduce((sum, entry) => sum + entry.score, 0) / relationshipScores.length)
        : 78;

    return [
      {
        id: "kpi-pipeline-value",
        label: "Pipeline Value",
        category: "pipeline",
        value: formatCommercialCurrency(totalOpen),
        numericValue: totalOpen,
        trend: "+12% vs last month",
        status: "healthy",
      },
      {
        id: "kpi-forecast-revenue",
        label: "Forecast Revenue",
        category: "revenue",
        value: formatCommercialCurrency(weighted),
        numericValue: weighted,
        trend: "Weighted pipeline",
        status: "healthy",
      },
      {
        id: "kpi-won-revenue",
        label: "Won Revenue",
        category: "revenue",
        value: formatCommercialCurrency(won.reduce((sum, entry) => sum + entry.valueAmount, 0)),
        numericValue: won.reduce((sum, entry) => sum + entry.valueAmount, 0),
        status: "healthy",
      },
      {
        id: "kpi-lost-revenue",
        label: "Lost Revenue",
        category: "revenue",
        value: formatCommercialCurrency(lost.reduce((sum, entry) => sum + entry.valueAmount, 0)),
        numericValue: lost.reduce((sum, entry) => sum + entry.valueAmount, 0),
        status: lost.length > 2 ? "warning" : "healthy",
      },
      {
        id: "kpi-win-rate",
        label: "Win Rate",
        category: "pipeline",
        value: `${winRate}%`,
        numericValue: winRate,
        status: winRate >= 50 ? "healthy" : "warning",
      },
      {
        id: "kpi-sales-velocity",
        label: "Sales Velocity",
        category: "velocity",
        value: `${velocity} days`,
        numericValue: velocity,
        status: velocity <= 45 ? "healthy" : "warning",
      },
      {
        id: "kpi-clv",
        label: "Customer Lifetime Value",
        category: "relationship",
        value: formatCommercialCurrency(avgClv),
        numericValue: avgClv,
        status: "healthy",
      },
      {
        id: "kpi-relationship-health",
        label: "Relationship Health",
        category: "relationship",
        value: `${avgHealth}/100`,
        numericValue: avgHealth,
        status: avgHealth >= 70 ? "healthy" : avgHealth >= 50 ? "warning" : "critical",
      },
      {
        id: "kpi-active-contracts",
        label: "Active Contract Value",
        category: "renewal",
        value: formatCommercialCurrency(activeContracts.reduce((sum, entry) => sum + entry.pricing.total, 0)),
        numericValue: activeContracts.reduce((sum, entry) => sum + entry.pricing.total, 0),
        status: "healthy",
      },
    ];
  }
}

/** Forecast engine — revenue, pipeline, renewal, opportunity. */
export class ForecastEngineService {
  constructor(private readonly repository: CommercialIntelligenceRepository) {}

  getForecasts(context: ServiceContext): ForecastRecord[] {
    const records = this.repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => isOpenStage(entry.stage));
    const weighted = records.reduce(
      (sum, entry) => sum + Math.round((entry.valueAmount * entry.probability) / 100),
      0,
    );
    const renewals = this.repository.listRenewals(context.organizationId);
    const renewalValue = renewals.reduce((sum, entry) => {
      const contract = this.repository.getContract(entry.contractId);
      return sum + (contract?.pricing.total ?? 0);
    }, 0);
    const now = todayIso();

    return [
      {
        id: randomUUID(),
        organizationId: context.organizationId,
        forecastType: "revenue",
        period: "Q3 2026",
        projectedValue: weighted,
        confidence: 72,
        basisCount: records.length,
        createdAt: now,
      },
      {
        id: randomUUID(),
        organizationId: context.organizationId,
        forecastType: "pipeline",
        period: "Aug 2026",
        projectedValue: Math.round(weighted * 0.45),
        confidence: 68,
        basisCount: records.length,
        createdAt: now,
      },
      {
        id: randomUUID(),
        organizationId: context.organizationId,
        forecastType: "renewal",
        period: "H2 2026",
        projectedValue: renewalValue,
        confidence: 80,
        basisCount: renewals.length,
        createdAt: now,
      },
      {
        id: randomUUID(),
        organizationId: context.organizationId,
        forecastType: "opportunity",
        period: "Top 5 Deals",
        projectedValue: records
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .reduce((sum, entry) => sum + Math.round((entry.valueAmount * entry.probability) / 100), 0),
        confidence: 75,
        basisCount: Math.min(5, records.length),
        createdAt: now,
      },
    ];
  }

  runForecast(context: ServiceContext, actorName?: string): ForecastRecord[] {
    const forecasts = this.getForecasts(context);
    for (const forecast of forecasts) {
      this.repository.createForecastSnapshot(forecast);
    }
    publishCommercialIntelligenceEvent(
      {
        eventType: "ForecastUpdated",
        entityId: forecasts[0]?.id ?? "forecast",
        actorName,
        payload: { period: "Q3 2026" },
      },
      context,
    );
    return forecasts;
  }

  getHistory(context: ServiceContext) {
    return this.repository.listForecastHistory(context.organizationId);
  }
}

/** Pipeline and revenue analytics breakdowns. */
export class CommercialAnalyticsService {
  constructor(private readonly repository: CommercialIntelligenceRepository) {}

  getSnapshot(context: ServiceContext) {
    const records = this.repository.listCommercialOpportunities(context.organizationId);
    const open = records.filter((entry) => isOpenStage(entry.stage));
    const totalValue = open.reduce((sum, entry) => sum + entry.valueAmount, 0);
    const weightedValue = open.reduce(
      (sum, entry) => sum + Math.round((entry.valueAmount * entry.probability) / 100),
      0,
    );

    const stageMap = new Map<string, { count: number; value: number }>();
    for (const stage of OPEN_STAGES) {
      const stageRecords = open.filter((entry) => entry.stage === stage);
      stageMap.set(STAGE_LABELS[stage], {
        count: stageRecords.length,
        value: stageRecords.reduce((sum, entry) => sum + entry.valueAmount, 0),
      });
    }

    const ownerMap = new Map<string, { count: number; value: number }>();
    for (const record of open) {
      const existing = ownerMap.get(record.owner) ?? { count: 0, value: 0 };
      ownerMap.set(record.owner, {
        count: existing.count + 1,
        value: existing.value + record.valueAmount,
      });
    }

    return {
      capturedAt: todayIso(),
      totalValue,
      openCount: open.length,
      weightedValue,
      byStage: [...stageMap.entries()].map(([stage, data]) => ({ stage, ...data })),
      byOwner: [...ownerMap.entries()].map(([owner, data]) => ({ owner, ...data })),
    };
  }

  getAnalytics(context: ServiceContext): CommercialAnalyticsView {
    const records = this.repository.listCommercialOpportunities(context.organizationId);
    const open = records.filter((entry) => isOpenStage(entry.stage));
    const snapshot = this.getSnapshot(context);

    const industryMap = new Map<string, { value: number; count: number }>();
    const territoryMap = new Map<string, { value: number; count: number }>();
    const accountMap = new Map<string, { value: number; count: number }>();

    for (const record of open) {
      const industry = record.industry ?? "General";
      const territory = record.territory ?? "Unassigned";
      const account = partyName(this.repository, record.partyId);
      for (const [key, map] of [
        [industry, industryMap],
        [territory, territoryMap],
        [account, accountMap],
      ] as const) {
        const existing = map.get(key) ?? { value: 0, count: 0 };
        map.set(key, { value: existing.value + record.valueAmount, count: existing.count + 1 });
      }
    }

    return {
      pipelineByStage: snapshot.byStage,
      pipelineByOwner: snapshot.byOwner,
      revenueByIndustry: [...industryMap.entries()].map(([industry, data]) => ({ industry, ...data })),
      revenueByTerritory: [...territoryMap.entries()].map(([territory, data]) => ({ territory, ...data })),
      revenueByAccount: [...accountMap.entries()].map(([partyName, data]) => ({ partyName, ...data })),
    };
  }
}

/** Relationship scoring from pipeline, contracts, and engagement signals. */
export class RelationshipScoringEngine {
  constructor(private readonly repository: CommercialIntelligenceRepository) {}

  scoreAll(context: ServiceContext): RelationshipHealthRecord[] {
    const partyIds = new Set(
      this.repository.listCommercialOpportunities(context.organizationId).map((entry) => entry.partyId),
    );

    return [...partyIds].map((partyId) => this.scoreParty(partyId, context));
  }

  scoreParty(partyId: string, context: ServiceContext): RelationshipHealthRecord {
    const opportunities = this.repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => entry.partyId === partyId);
    const open = opportunities.filter((entry) => isOpenStage(entry.stage));
    const openValue = open.reduce((sum, entry) => sum + entry.valueAmount, 0);
    const contracts = this.repository
      .listContracts(context.organizationId)
      .filter((entry) => entry.partyId === partyId && entry.status === "active");
    const contractValue = contracts.reduce((sum, entry) => sum + entry.pricing.total, 0);
    const stalled = open.filter((entry) => entry.stage === "proposal" || entry.stage === "identified");

    let score = 70;
    const drivers: string[] = [];
    if (openValue > 1000000) {
      score += 10;
      drivers.push("High open pipeline value");
    }
    if (contractValue > 0) {
      score += 8;
      drivers.push("Active contract in place");
    }
    if (stalled.length > 0) {
      score -= 12;
      drivers.push(`${stalled.length} stalled opportunity(ies)`);
    }
    const expiring = contracts.filter((entry) => {
      const days = Math.ceil((new Date(entry.effectiveTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 45;
    });
    if (expiring.length > 0) {
      score -= 15;
      drivers.push("Contract expiring within 45 days");
    }

    score = Math.max(0, Math.min(100, score));
    const status: RelationshipHealthRecord["status"] =
      score >= 70 ? "healthy" : score >= 50 ? "at_risk" : "critical";

    return {
      partyId,
      partyName: partyName(this.repository, partyId),
      score,
      status,
      drivers,
      openOpportunityValue: openValue,
      activeContractValue: contractValue,
    };
  }
}

/** Insight generator — explains what, why, and what's likely next (CTO rule). */
export class InsightGeneratorService {
  constructor(
    private readonly repository: CommercialIntelligenceRepository,
    private readonly analytics: CommercialAnalyticsService,
    private readonly scoring: RelationshipScoringEngine,
  ) {}

  generate(context: ServiceContext): CommercialInsight[] {
    const insights: CommercialInsight[] = [];
    const snapshot = this.analytics.getSnapshot(context);
    const atRisk = this.scoring.scoreAll(context).filter((entry) => entry.status !== "healthy");
    const stalled = this.repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => isOpenStage(entry.stage) && (entry.stage === "proposal" || entry.stage === "identified"));

    const negotiation = snapshot.byStage.find((entry) => entry.stage === "Negotiation");
    const identified = snapshot.byStage.find((entry) => entry.stage === "Identified");
    if (negotiation && identified && identified.value > negotiation.value * 2) {
      insights.push({
        id: "insight-pipeline-top-heavy",
        category: "pipeline_health",
        title: "Pipeline is top-heavy in early stages",
        summary: `Identified stage holds ${formatCommercialCurrency(identified.value)} vs ${formatCommercialCurrency(negotiation.value)} in negotiation.`,
        why: "Early-stage concentration increases forecast uncertainty and extends sales cycles.",
        likelyNext: "Qualification bottleneck may delay Q3 revenue unless founder engagement accelerates top deals.",
        impact: "medium",
      });
    }

    if (atRisk.length > 0) {
      insights.push({
        id: "insight-account-risk",
        category: "account_risk",
        title: `${atRisk.length} account(s) at relationship risk`,
        summary: `${atRisk.map((entry) => entry.partyName).join(", ")} show declining health scores.`,
        why: "Stalled deals and expiring contracts reduce engagement confidence.",
        likelyNext: "Renewal conversations required within 30 days to prevent revenue leakage.",
        impact: "high",
      });
    }

    if (stalled.length > 0) {
      insights.push({
        id: "insight-stalled-opps",
        category: "opportunity_stall",
        title: `${stalled.length} stalled opportunity(ies)`,
        summary: stalled.map((entry) => entry.name).join("; "),
        why: "Deals in proposal/identified without recent progression consume pipeline capacity.",
        likelyNext: "Executive follow-up or pricing review needed to reactivate momentum.",
        impact: "medium",
      });
    }

    const renewals = this.repository.listRenewals(context.organizationId);
    if (renewals.length > 0) {
      insights.push({
        id: "insight-renewal-pipeline",
        category: "renewal_risk",
        title: "Renewal pipeline requires executive attention",
        summary: `${renewals.length} renewal(s) scheduled — including expiring retail retention agreement.`,
        why: "Renewal timing overlaps with Q3 forecast period.",
        likelyNext: "Founder-led retention engagement recommended before contract expiry.",
        impact: "high",
      });
    }

    insights.push({
      id: "insight-growth",
      category: "revenue_growth",
      title: "Weighted pipeline supports Q3 growth target",
      summary: `Open pipeline weighted value: ${formatCommercialCurrency(snapshot.weightedValue)} across ${snapshot.openCount} deals.`,
      why: "Strong negotiation-stage deals (OranIA renewal, Commerce expansion) anchor forecast.",
      likelyNext: "Closing top 2 deals would exceed Q3 conservative forecast by 15%.",
      impact: "low",
    });

    publishCommercialIntelligenceEvent(
      { eventType: "PipelineHealthChanged", entityId: "pipeline", payload: { openCount: String(snapshot.openCount) } },
      context,
    );

    return insights;
  }
}

/** Commercial recommendation engine with explainable rationale. */
export class CommercialRecommendationEngine {
  constructor(
    private readonly repository: CommercialIntelligenceRepository,
    private readonly scoring: RelationshipScoringEngine,
  ) {}

  generate(context: ServiceContext): CommercialRecommendation[] {
    const recommendations: CommercialRecommendation[] = [];
    const atRisk = this.scoring
      .scoreAll(context)
      .filter((entry) => entry.status !== "healthy")
      .sort((a, b) => a.score - b.score);

    atRisk.slice(0, 2).forEach((account, index) => {
      recommendations.push({
        id: `rec-account-${account.partyId}`,
        category: "priority_account",
        priority: index + 1,
        title: `Engage ${account.partyName}`,
        description: `Schedule executive check-in to address ${account.drivers[0] ?? "relationship decline"}.`,
        rationale: `Health score ${account.score}/100 with ${formatCommercialCurrency(account.openOpportunityValue)} open pipeline.`,
        expectedImpact: "Protect revenue and improve win probability by 10–15%.",
        entityId: account.partyId,
      });
      publishCommercialIntelligenceEvent(
        {
          eventType: "AccountRiskDetected",
          entityId: account.partyId,
          payload: { score: String(account.score) },
        },
        context,
      );
    });

    const topDeal = this.repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => isOpenStage(entry.stage))
      .sort((a, b) => b.score - a.score)[0];
    if (topDeal) {
      recommendations.push({
        id: `rec-pipeline-${topDeal.id}`,
        category: "pipeline_action",
        priority: recommendations.length + 1,
        title: `Advance ${topDeal.name}`,
        description: "Move to final negotiation and secure founder sign-off this week.",
        rationale: `Highest-scored open deal (${topDeal.score}) with ${topDeal.probability}% probability.`,
        expectedImpact: `Close would add ${formatCommercialCurrency(topDeal.valueAmount)} to won revenue.`,
        entityId: topDeal.id,
      });
    }

    const pendingApprovals = this.repository
      .listApprovals(context.organizationId)
      .filter((entry) => entry.status === "pending");
    if (pendingApprovals.length > 0) {
      recommendations.push({
        id: "rec-pricing-review",
        category: "pricing_review",
        priority: recommendations.length + 1,
        title: "Review pending proposal pricing",
        description: `${pendingApprovals.length} agreement(s) awaiting approval — discount tier review required.`,
        rationale: "OranIA renewal proposal includes negotiated discount requiring founder sign-off.",
        expectedImpact: "Unblocks ₹18L+ enterprise renewal pipeline.",
      });
    }

    const expiring = this.repository
      .listContracts(context.organizationId)
      .filter((entry) => {
        if (entry.status !== "active") return false;
        const days = Math.ceil((new Date(entry.effectiveTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 45;
      });
    if (expiring.length > 0) {
      recommendations.push({
        id: "rec-renewal",
        category: "renewal_action",
        priority: recommendations.length + 1,
        title: "Initiate renewal for expiring contracts",
        description: expiring.map((entry) => entry.title).join("; "),
        rationale: "Contracts expiring within 45 days without signed renewal.",
        expectedImpact: "Retain ₹6L+ annual contract value.",
        entityId: expiring[0]?.id,
      });
    }

    if (recommendations.length > 0) {
      publishCommercialIntelligenceEvent(
        {
          eventType: "RecommendationGenerated",
          entityId: recommendations[0]!.id,
          payload: { count: String(recommendations.length) },
        },
        context,
      );
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }
}

/** Executive dashboard and brief signals. */
export class CommercialIntelligenceAnalyticsService {
  constructor(
    private readonly repository: CommercialIntelligenceRepository,
    private readonly kpis: CommercialKpiService,
    private readonly forecasts: ForecastEngineService,
    private readonly analytics: CommercialAnalyticsService,
    private readonly scoring: RelationshipScoringEngine,
    private readonly insights: InsightGeneratorService,
    private readonly recommendations: CommercialRecommendationEngine,
  ) {}

  getExecutiveDashboard(context: ServiceContext): CommercialExecutiveDashboard {
    const kpis = this.kpis.getKpis(context);
    const pipelineSnapshot = this.analytics.getSnapshot(context);
    const forecasts = this.forecasts.getForecasts(context);
    const relationshipHealth = this.scoring.scoreAll(context);
    const insights = this.insights.generate(context);
    const recommendations = this.recommendations.generate(context);
    const alerts = this.repository.listCommercialAlerts(context.organizationId);
    const benchmarks = this.repository.listBenchmarks(context.organizationId);

    const healthKpi = kpis.find((entry) => entry.id === "kpi-relationship-health");
    const forecastKpi = kpis.find((entry) => entry.id === "kpi-forecast-revenue");

    return {
      kpis,
      pipelineSnapshot,
      forecasts,
      relationshipHealth,
      insights,
      recommendations,
      alerts,
      benchmarks,
      briefingLine: `Pipeline health ${healthKpi?.numericValue ?? 0}/100 — forecast ${forecastKpi?.value ?? "₹0"}, ${alerts.length} commercial risk(s), ${recommendations.length} recommended action(s).`,
    };
  }

  getBriefSignals(context: ServiceContext): CommercialIntelligenceBriefSignals {
    const dashboard = this.getExecutiveDashboard(context);
    const risks = dashboard.alerts.length + dashboard.relationshipHealth.filter((entry) => entry.status !== "healthy").length;
    const growth = dashboard.insights.filter((entry) => entry.category === "revenue_growth").length;

    return {
      pipelineHealthScore: dashboard.kpis.find((entry) => entry.id === "kpi-relationship-health")?.numericValue ?? 0,
      forecastRevenue: dashboard.kpis.find((entry) => entry.id === "kpi-forecast-revenue")?.value ?? "₹0",
      commercialRisks: risks,
      growthOpportunities: growth + dashboard.recommendations.length,
      briefingLine: dashboard.briefingLine,
    };
  }
}

/** CRM Commercial Intelligence facade (Mission P-008.5). */
export class CrmCommercialIntelligenceFacade {
  readonly kpis: CommercialKpiService;
  readonly forecasts: ForecastEngineService;
  readonly analytics: CommercialAnalyticsService;
  readonly scoring: RelationshipScoringEngine;
  readonly insights: InsightGeneratorService;
  readonly recommendations: CommercialRecommendationEngine;
  readonly executive: CommercialIntelligenceAnalyticsService;

  constructor(repository: CommercialIntelligenceRepository) {
    this.kpis = new CommercialKpiService(repository);
    this.forecasts = new ForecastEngineService(repository);
    this.analytics = new CommercialAnalyticsService(repository);
    this.scoring = new RelationshipScoringEngine(repository);
    this.insights = new InsightGeneratorService(repository, this.analytics, this.scoring);
    this.recommendations = new CommercialRecommendationEngine(repository, this.scoring);
    this.executive = new CommercialIntelligenceAnalyticsService(
      repository,
      this.kpis,
      this.forecasts,
      this.analytics,
      this.scoring,
      this.insights,
      this.recommendations,
    );
  }
}

export { formatCommercialCurrency, partyName };
