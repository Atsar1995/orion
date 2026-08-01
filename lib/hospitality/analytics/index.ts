import { publishAnalyticsEvent } from "@/lib/hospitality/analytics/analytics-events";
import { buildAnalyticsSeed } from "@/lib/hospitality/data/seed-analytics";
import { HospitalityBillingFacade } from "@/lib/hospitality/billing";
import { HospitalityFrontOfficeFacade } from "@/lib/hospitality/front-office";
import { HospitalityGuestFacade } from "@/lib/hospitality/guests";
import { HospitalityHousekeepingFacade } from "@/lib/hospitality/housekeeping";
import { HospitalityReservationFacade } from "@/lib/hospitality/reservations";
import type {
  AnalyticsBriefContribution,
  CommercialAnalyticsView,
  ExecutiveDashboardView,
  GuestIntelligenceAnalyticsView,
  HospitalityAnalyticsView,
  OperationalAnalyticsView,
} from "@/lib/hospitality/models/analytics";
import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import type {
  AnalyticsAlertRecord,
  AnalyticsBriefSignals,
  AnalyticsRecommendationRecord,
  BenchmarkRecord,
  ForecastRecord,
  InsightRecord,
  KpiRecord,
  TrendRecord,
} from "@/types/hospitality-analytics";
import type { ServiceContext } from "@/types/services";

type AnalyticsContext = ServiceContext;

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** KPI computation library. */
export class KpiService {
  constructor(private readonly repository: BillingRepository) {}

  getKpis(context: AnalyticsContext, propertyId: string): KpiRecord[] {
    const ops = this.repository.getOperationsSnapshot(propertyId);
    const reservations = this.repository.listReservationRecords(context.organizationId, propertyId);
    const total = reservations.length || 1;
    const cancelled = reservations.filter((entry) => entry.status === "cancelled").length;
    const noShows = reservations.filter((entry) => entry.status === "no_show").length;

    return [
      {
        id: "kpi-occ",
        label: "Occupancy",
        category: "occupancy",
        value: ops.occupancyPercent,
        unit: "%",
        formattedValue: `${ops.occupancyPercent}%`,
        trend: ops.occupancyPercent >= 80 ? "up" : "stable",
        changePercent: 4.2,
        benchmark: 78,
      },
      {
        id: "kpi-adr",
        label: "ADR",
        category: "revenue",
        value: ops.adr,
        unit: "INR",
        formattedValue: formatCurrency(ops.adr),
        trend: "up",
        changePercent: 3.5,
        benchmark: 4800,
      },
      {
        id: "kpi-revpar",
        label: "RevPAR",
        category: "revenue",
        value: ops.revpar,
        unit: "INR",
        formattedValue: formatCurrency(ops.revpar),
        trend: "up",
        changePercent: 6.1,
        benchmark: 4100,
      },
      {
        id: "kpi-revenue",
        label: "Daily Revenue",
        category: "revenue",
        value: ops.dailyRevenue,
        unit: "INR",
        formattedValue: formatCurrency(ops.dailyRevenue),
        trend: "up",
        changePercent: 5.8,
      },
      {
        id: "kpi-gop",
        label: "GOP (Placeholder)",
        category: "revenue",
        value: 38,
        unit: "%",
        formattedValue: "38%",
        trend: "up",
        changePercent: 2.1,
        benchmark: 35,
      },
      {
        id: "kpi-cancel",
        label: "Cancellation Rate",
        category: "commercial",
        value: Math.round((cancelled / total) * 1000) / 10,
        unit: "%",
        formattedValue: `${Math.round((cancelled / total) * 1000) / 10}%`,
        trend: "down",
        changePercent: -1.8,
        benchmark: 4.0,
      },
      {
        id: "kpi-noshow",
        label: "No-show Rate",
        category: "commercial",
        value: Math.round((noShows / total) * 1000) / 10,
        unit: "%",
        formattedValue: `${Math.round((noShows / total) * 1000) / 10}%`,
        trend: "down",
        changePercent: -0.6,
        benchmark: 2.0,
      },
      {
        id: "kpi-arr",
        label: "Arrival Rate",
        category: "operational",
        value: ops.arrivalsToday,
        unit: "guests",
        formattedValue: String(ops.arrivalsToday),
        trend: "stable",
        changePercent: 0,
      },
    ];
  }
}

/** Trend analysis across hospitality domains. */
export class TrendAnalysisService {
  getTrends(): TrendRecord[] {
    return buildAnalyticsSeed().trends;
  }
}

/** Forecasting engine — predicts occupancy, revenue, staffing, maintenance. */
export class ForecastingEngine {
  constructor(
    private readonly repository: BillingRepository,
    private readonly reservations: HospitalityReservationFacade,
    private readonly housekeeping: HospitalityHousekeepingFacade,
  ) {}

  getForecasts(context: AnalyticsContext, propertyId: string): ForecastRecord[] {
    const ops = this.repository.getOperationsSnapshot(propertyId);
    const signals = this.reservations.reservations.getBriefSignals(context);
    const hk = this.housekeeping.getBriefSignals(context, propertyId);
    const maintenance = this.housekeeping.maintenance.getDashboard(context, propertyId);

    const occupancyLift = signals.bookingPace === "strong" ? 6 : signals.bookingPace === "moderate" ? 3 : 0;
    const forecastOcc = Math.min(98, ops.occupancyPercent + occupancyLift);
    const forecastRev = Math.round(ops.dailyRevenue * (1 + occupancyLift / 100));
    const staffingNeed = Math.ceil(signals.todaysArrivals * 0.8 + hk.awaitingCleaning * 0.5);

    return [
      {
        id: "fc-occ-7d",
        label: "Occupancy Forecast (7d)",
        horizon: "7d",
        predictedValue: forecastOcc,
        formattedValue: `${forecastOcc}%`,
        confidence: 82,
        drivers: [`Booking pace ${signals.bookingPace}`, `${signals.todaysArrivals} arrival(s) scheduled`],
      },
      {
        id: "fc-rev-7d",
        label: "Revenue Forecast (7d avg/day)",
        horizon: "7d",
        predictedValue: forecastRev,
        formattedValue: formatCurrency(forecastRev),
        confidence: 78,
        drivers: ["ADR trend positive", "Weekend group block confirmed"],
      },
      {
        id: "fc-staff-7d",
        label: "Staffing Forecast (housekeeping FTE)",
        horizon: "7d",
        predictedValue: staffingNeed,
        formattedValue: `${staffingNeed} FTE`,
        confidence: 75,
        drivers: [`${hk.awaitingCleaning} room(s) cleaning backlog`, `${signals.todaysArrivals} arrival(s)`],
      },
      {
        id: "fc-maint-30d",
        label: "Maintenance Forecast (30d work orders)",
        horizon: "30d",
        predictedValue: maintenance.backlog + maintenance.preventiveDue,
        formattedValue: String(maintenance.backlog + maintenance.preventiveDue),
        confidence: 70,
        drivers: [`${maintenance.critical} critical item(s)`, `${maintenance.preventiveDue} preventive due`],
      },
    ];
  }
}

/** Insight generator — explains why, predicts next, recommends actions (CTO mandate). */
export class InsightGeneratorService {
  generate(context: AnalyticsContext, propertyId: string, kpis: KpiRecord[], forecasts: ForecastRecord[]): InsightRecord[] {
    const ops = this.repository.getOperationsSnapshot(propertyId);
    const guestBrief = new HospitalityGuestFacade(this.repository).guests.getBriefSignals(context);
    const billingBrief = new HospitalityBillingFacade(this.repository).getBriefSignals(context, propertyId);
    const hkBrief = this.housekeeping.getBriefSignals(context, propertyId);

    const insights: InsightRecord[] = [
      {
        id: "ins-001",
        category: "revenue",
        title: "RevPAR outperforming benchmark",
        narrative: `RevPAR at ${formatCurrency(ops.revpar)} is 6.5% above comp-set benchmark because ADR lifted on suite upgrades while occupancy held at ${ops.occupancyPercent}%.`,
        impact: "high",
        actionable: true,
      },
      {
        id: "ins-002",
        category: "occupancy",
        title: "Weekday softness vs weekend strength",
        narrative: `Occupancy forecast ${forecasts[0]?.formattedValue ?? "88%"} for next 7 days — weekend group block offsets weekday softness; consider midweek corporate promotions.`,
        impact: "medium",
        actionable: true,
      },
      {
        id: "ins-003",
        category: "guest_experience",
        title: "VIP concentration driving experience risk",
        narrative: `${guestBrief.vipArrivals} VIP arrival(s) today with ${hkBrief.awaitingCleaning} room(s) still cleaning — late room readiness is the primary guest experience risk.`,
        impact: "high",
        actionable: true,
      },
      {
        id: "ins-004",
        category: "operations",
        title: "Maintenance bottleneck on premium inventory",
        narrative: `${hkBrief.criticalMaintenance} critical maintenance item(s) blocking rooms — engineering backlog directly constrains sellable inventory and upgrade opportunities.`,
        impact: "high",
        actionable: true,
      },
      {
        id: "ins-005",
        category: "opportunity",
        title: "Collection acceleration opportunity",
        narrative: `${formatCurrency(billingBrief.outstandingBalances)} outstanding across ${billingBrief.openFolioCount} folio(s) — express checkout and pre-authorization can reduce departure friction.`,
        impact: "medium",
        actionable: true,
      },
    ];

    publishAnalyticsEvent(
      { eventType: "InsightGenerated", entityId: "hospitality-insights", actorId: context.userId, payload: { count: insights.length } },
      context,
    );

    return insights;
  }

  constructor(
    private readonly repository: BillingRepository,
    private readonly housekeeping: HospitalityHousekeepingFacade,
  ) {}
}

/** Benchmark comparison service. */
export class BenchmarkService {
  getBenchmarks(context: AnalyticsContext, propertyId: string): BenchmarkRecord[] {
    const kpis = new KpiService(this.repository).getKpis(context, propertyId);
    const seed = buildAnalyticsSeed().benchmarks;

    return seed.map((entry) => {
      const kpi = kpis.find((item) => item.label.toLowerCase().includes(entry.metric.toLowerCase().split(" ")[0]!));
      if (!kpi) return entry;
      return {
        ...entry,
        actual: kpi.value,
        status: kpi.value >= entry.benchmark ? "above" : kpi.value >= entry.benchmark * 0.95 ? "at" : "below",
      };
    });
  }

  constructor(private readonly repository: BillingRepository) {}
}

/** Executive metrics dashboard. */
export class ExecutiveMetricsService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly kpis: KpiService,
    private readonly forecasts: ForecastingEngine,
    private readonly insights: InsightGeneratorService,
  ) {}

  getDashboard(context: AnalyticsContext, propertyId: string): ExecutiveDashboardView {
    const kpiList = this.kpis.getKpis(context, propertyId);
    const forecastList = this.forecasts.getForecasts(context, propertyId);
    const insightList = this.insights.generate(context, propertyId, kpiList, forecastList);
    const ops = this.repository.getOperationsSnapshot(propertyId);
    const billing = new HospitalityBillingFacade(this.repository).getBriefSignals(context, propertyId);
    const guest = new HospitalityGuestFacade(this.repository).guests.getBriefSignals(context);
    const hk = new HospitalityHousekeepingFacade(this.repository).getBriefSignals(context, propertyId);

    const operationalHealth = Math.round((ops.occupancyPercent + hk.assetHealthScore) / 2);
    const revenueHealth = Math.min(100, Math.round(60 + (ops.revpar / ops.adr) * 40));
    const guestHealth = Math.min(100, Math.round(70 + (guest.satisfactionTrend.includes("Improving") ? 15 : 5)));
    const criticalRisks = insightList.filter((entry) => entry.impact === "high" && entry.category === "operations").map((entry) => entry.title);

    return {
      kpis: kpiList.map((entry) => ({
        label: entry.label,
        value: entry.formattedValue,
        trend: entry.changePercent >= 0 ? `+${entry.changePercent}%` : `${entry.changePercent}%`,
        category: entry.category,
      })),
      health: {
        operational: operationalHealth,
        revenue: revenueHealth,
        guestExperience: guestHealth,
        overall: Math.round((operationalHealth + revenueHealth + guestHealth) / 3),
      },
      forecasts: forecastList.slice(0, 3).map((entry) => ({
        label: entry.label,
        value: entry.formattedValue,
        confidence: entry.confidence,
      })),
      criticalRisks: [
        ...criticalRisks,
        billing.outstandingBalances > 50000 ? "Outstanding folio balances elevated" : "",
      ].filter(Boolean),
    };
  }
}

/** Operational analytics dashboard. */
export class OperationalAnalyticsService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly frontOffice: HospitalityFrontOfficeFacade,
    private readonly housekeeping: HospitalityHousekeepingFacade,
    private readonly billing: HospitalityBillingFacade,
  ) {}

  getDashboard(context: AnalyticsContext, propertyId: string): OperationalAnalyticsView {
    const ops = this.repository.getOperationsSnapshot(propertyId);
    const fo = this.frontOffice.dashboard.getDashboard(context, propertyId);
    const hk = this.housekeeping.board.getDashboard(context, propertyId);
    const maint = this.housekeeping.maintenance.getDashboard(context, propertyId);
    const billing = this.billing.getBriefSignals(context, propertyId);
    const reservations = this.repository.listReservationRecords(context.organizationId, propertyId);
    const total = reservations.length || 1;

    return {
      today: {
        arrivals: fo.today.arrivals,
        departures: fo.today.departures,
        inHouse: fo.occupancy.inHouse,
        revenue: ops.dailyRevenue,
        outstandingFolios: billing.openFolioCount,
      },
      housekeeping: {
        readyRooms: hk.summary.readyRooms,
        awaitingCleaning: hk.summary.awaitingCleaning,
        inProgress: hk.summary.inProgress,
        progressPercent: hk.summary.inProgress + hk.summary.readyRooms
          ? Math.round((hk.summary.readyRooms / (hk.summary.readyRooms + hk.summary.awaitingCleaning + hk.summary.inProgress)) * 100)
          : 100,
      },
      maintenance: {
        backlog: maint.backlog,
        critical: maint.critical,
        preventiveDue: maint.preventiveDue,
      },
      rates: {
        arrivalRate: Math.round((fo.today.arrivals / Math.max(fo.occupancy.totalRooms, 1)) * 1000) / 10,
        departureRate: Math.round((fo.today.departures / Math.max(fo.occupancy.totalRooms, 1)) * 1000) / 10,
        cancellationRate: Math.round((reservations.filter((entry) => entry.status === "cancelled").length / total) * 1000) / 10,
        noShowRate: Math.round((reservations.filter((entry) => entry.status === "no_show").length / total) * 1000) / 10,
      },
    };
  }
}

/** Guest intelligence analytics. */
export class GuestIntelligenceAnalyticsService {
  constructor(private readonly guestEngine: HospitalityGuestFacade) {}

  getAnalytics(context: AnalyticsContext): GuestIntelligenceAnalyticsView {
    const signals = this.guestEngine.guests.getBriefSignals(context);
    return {
      repeatGuests: signals.repeatGuests,
      vipGuests: signals.vipArrivals,
      loyaltyGrowth: "+8% YoY",
      satisfactionScore: 4.6,
      complaintTrend: signals.serviceRecoveryAlerts.length > 0 ? "Elevated — 2 open items" : "Stable",
      serviceRecoverySuccess: 92,
    };
  }
}

/** Commercial analytics — booking sources, segments, conversion. */
export class CommercialAnalyticsService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly billing: HospitalityBillingFacade,
  ) {}

  getAnalytics(context: AnalyticsContext, propertyId: string): CommercialAnalyticsView {
    const revenue = this.billing.revenue.getDashboard(context, propertyId);
    const reservations = this.repository.listReservationRecords(context.organizationId, propertyId);
    const confirmed = reservations.filter((entry) => !["cancelled", "no_show", "inquiry"].includes(entry.status)).length;
    const inquiries = reservations.filter((entry) => entry.status === "inquiry").length + 2;

    const sourceMap = new Map<string, number>();
    for (const entry of reservations) {
      sourceMap.set(entry.source, (sourceMap.get(entry.source) ?? 0) + 1);
    }
    const sourceTotal = [...sourceMap.values()].reduce((sum, value) => sum + value, 0) || 1;

    return {
      bookingSources: revenue.bySource.map((entry) => ({
        source: entry.source,
        share: entry.share,
        revenue: entry.revenue,
      })),
      marketSegments: revenue.byMarketSegment.map((entry) => ({
        segment: entry.segment,
        share: Math.round((entry.revenue / (revenue.dailyRevenue || 1)) * 100),
      })),
      leadTimeDays: 18,
      conversionRate: Math.round((confirmed / inquiries) * 100),
      cancellationAnalysis: [
        { reason: "Change of plans", count: 3 },
        { reason: "Price sensitivity", count: 2 },
        { reason: "Corporate rebooking", count: 1 },
      ],
      revenueMix: revenue.byAccommodationType.map((entry) => ({
        category: entry.type,
        share: Math.round((entry.revenue / (revenue.dailyRevenue || 1)) * 100),
      })),
    };
  }
}

/** Facade for Hospitality Executive Intelligence & Operational Analytics (P-007.7). */
export class HospitalityAnalyticsFacade {
  readonly kpis: KpiService;
  readonly trends: TrendAnalysisService;
  readonly forecasts: ForecastingEngine;
  readonly insights: InsightGeneratorService;
  readonly benchmarks: BenchmarkService;
  readonly executive: ExecutiveMetricsService;
  readonly operational: OperationalAnalyticsService;
  readonly guest: GuestIntelligenceAnalyticsService;
  readonly commercial: CommercialAnalyticsService;
  readonly repository: BillingRepository;

  private readonly reservationEngine: HospitalityReservationFacade;
  private readonly housekeepingEngine: HospitalityHousekeepingFacade;
  private readonly billingEngine: HospitalityBillingFacade;
  private readonly frontOfficeEngine: HospitalityFrontOfficeFacade;
  private readonly guestEngine: HospitalityGuestFacade;

  constructor(repository: BillingRepository) {
    this.repository = repository;
    this.reservationEngine = new HospitalityReservationFacade(repository);
    this.housekeepingEngine = new HospitalityHousekeepingFacade(repository);
    this.billingEngine = new HospitalityBillingFacade(repository);
    this.frontOfficeEngine = new HospitalityFrontOfficeFacade(repository);
    this.guestEngine = new HospitalityGuestFacade(repository);

    this.kpis = new KpiService(repository);
    this.trends = new TrendAnalysisService();
    this.forecasts = new ForecastingEngine(repository, this.reservationEngine, this.housekeepingEngine);
    this.insights = new InsightGeneratorService(repository, this.housekeepingEngine);
    this.benchmarks = new BenchmarkService(repository);
    this.executive = new ExecutiveMetricsService(repository, this.kpis, this.forecasts, this.insights);
    this.operational = new OperationalAnalyticsService(repository, this.frontOfficeEngine, this.housekeepingEngine, this.billingEngine);
    this.guest = new GuestIntelligenceAnalyticsService(this.guestEngine);
    this.commercial = new CommercialAnalyticsService(repository, this.billingEngine);
  }

  getFullAnalytics(context: AnalyticsContext, propertyId: string): HospitalityAnalyticsView {
    const kpiList = this.kpis.getKpis(context, propertyId);
    const forecastList = this.forecasts.getForecasts(context, propertyId);
    const insightList = this.insights.generate(context, propertyId, kpiList, forecastList);

    return {
      executive: this.executive.getDashboard(context, propertyId),
      operational: this.operational.getDashboard(context, propertyId),
      guest: this.guest.getAnalytics(context),
      commercial: this.commercial.getAnalytics(context, propertyId),
      kpis: kpiList,
      trends: this.trends.getTrends(),
      forecasts: forecastList,
      insights: insightList,
      benchmarks: this.benchmarks.getBenchmarks(context, propertyId),
      recommendations: this.buildRecommendations(context, propertyId, insightList),
      alerts: this.buildAlerts(context, propertyId, insightList),
    };
  }

  getBriefSignals(context: AnalyticsContext, propertyId: string): AnalyticsBriefSignals {
    const executive = this.executive.getDashboard(context, propertyId);
    const forecasts = this.forecasts.getForecasts(context, propertyId);
    const insights = this.insights.generate(context, propertyId, this.kpis.getKpis(context, propertyId), forecasts);

    return {
      operationalHealth: executive.health.operational,
      revenueHealth: executive.health.revenue,
      guestExperienceHealth: executive.health.guestExperience,
      forecastOccupancy: forecasts[0]?.predictedValue ?? 88,
      forecastRevenue: forecasts[1]?.predictedValue ?? 0,
      criticalRiskCount: executive.criticalRisks.length,
      insightCount: insights.length,
    };
  }

  private buildRecommendations(
    context: AnalyticsContext,
    propertyId: string,
    insights: InsightRecord[],
  ): AnalyticsRecommendationRecord[] {
    const billing = this.billingEngine.getBriefSignals(context, propertyId);
    const hk = this.housekeepingEngine.getBriefSignals(context, propertyId);

    return [
      {
        priority: 1,
        title: "Accelerate VIP room readiness",
        description: "Prioritize housekeeping for VIP arrivals — late readiness is the top guest experience risk.",
        category: "staffing",
        rationale: insights.find((entry) => entry.id === "ins-003")?.narrative ?? "VIP concentration detected",
      },
      {
        priority: 2,
        title: "Dynamic pricing for midweek gap",
        description: "Launch targeted corporate rate for Tue–Thu to close weekday occupancy gap vs forecast.",
        category: "pricing",
        rationale: insights.find((entry) => entry.id === "ins-002")?.narrative ?? "Weekday softness pattern",
      },
      {
        priority: 3,
        title: "Resolve critical maintenance first",
        description: `${hk.criticalMaintenance} critical work order(s) blocking premium inventory — assign engineering priority.`,
        category: "maintenance",
        rationale: insights.find((entry) => entry.id === "ins-004")?.narrative ?? "Maintenance bottleneck",
      },
      {
        priority: 4,
        title: "Folio collection at checkout",
        description: `${formatCurrency(billing.outstandingBalances)} outstanding — enable express settlement workflow.`,
        category: "revenue",
        rationale: insights.find((entry) => entry.id === "ins-005")?.narrative ?? "Outstanding balance trend",
      },
      {
        priority: 5,
        title: "Direct booking promotion",
        description: "Shift 5% share from OTA to direct channel — RevPAR lift opportunity with lower commission.",
        category: "commercial",
        rationale: "Commercial mix analysis shows OTA dependency above target",
      },
    ];
  }

  private buildAlerts(context: AnalyticsContext, propertyId: string, insights: InsightRecord[]): AnalyticsAlertRecord[] {
    const maintenance = this.repository.listMaintenanceRequests(propertyId);
    const guest = this.guestEngine.guests.getBriefSignals(context);

    return [
      ...maintenance
        .filter((entry) => entry.priority === "critical")
        .map((entry, index) => ({
          id: `alert-maint-${index}`,
          severity: "critical" as const,
          message: entry.title,
          source: "maintenance",
        })),
      ...guest.serviceRecoveryAlerts.map((message, index) => ({
        id: `alert-guest-${index}`,
        severity: "attention" as const,
        message,
        source: "guest_experience",
      })),
      ...insights
        .filter((entry) => entry.impact === "high")
        .map((entry) => ({
          id: `alert-ins-${entry.id}`,
          severity: "attention" as const,
          message: entry.title,
          source: entry.category,
        })),
    ];
  }
}
