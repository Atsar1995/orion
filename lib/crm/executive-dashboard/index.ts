import { CrmAgreementsFacade } from "@/lib/crm/agreements";
import { formatCommercialCurrency } from "@/lib/crm/commercial";
import { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
import { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
import type {
  CrmExecutiveBriefSignals,
  CrmExecutiveDashboardView,
  ExecutiveReport,
} from "@/lib/crm/models/crm-executive-dashboard";
import type { ExecutiveDashboardRepository } from "@/lib/crm/repositories/ExecutiveDashboardRepository";
import type {
  DashboardWidget,
  DrillDownTarget,
  ExecutiveAlert,
  ExecutiveAlertCategory,
  ExecutiveAlertSeverity,
} from "@/types/crm-executive-dashboard";
import type { CommercialOpportunityStage } from "@/types/crm-commercial";
import type { ServiceContext } from "@/types/services";

const OPEN_STAGES: CommercialOpportunityStage[] = [
  "identified",
  "qualified",
  "proposal",
  "negotiation",
];

const SEVERITY_RANK: Record<ExecutiveAlertSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function kpiValue(
  kpis: ReturnType<CrmCommercialIntelligenceFacade["kpis"]["getKpis"]>,
  id: string,
): { display: string; numeric: number } {
  const entry = kpis.find((kpi) => kpi.id === id);
  return { display: entry?.value ?? "₹0", numeric: entry?.numericValue ?? 0 };
}

function mapCommercialCategory(category: string): ExecutiveAlertCategory {
  if (category === "renewal_risk") return "renewal_deadline";
  if (category === "opportunity_stall") return "stalled_opportunity";
  if (category === "account_risk") return "account_risk";
  if (category === "revenue_growth") return "revenue_variance";
  return "relationship";
}

/** Aggregates executive KPIs from commercial and customer intelligence. */
export class ExecutiveKpiAggregator {
  constructor(
    private readonly commercial: CrmCommercialIntelligenceFacade,
    private readonly customer: CrmCustomerIntelligenceFacade,
    private readonly agreements: CrmAgreementsFacade,
  ) {}

  getSummary(context: ServiceContext) {
    const kpis = this.commercial.kpis.getKpis(context);
    const renewalDashboard = this.agreements.renewals.getDashboard(context);
    const customerHub = this.customer.profiles.getHub(context);

    return {
      pipelineValue: kpiValue(kpis, "kpi-pipeline-value").display,
      forecastRevenue: kpiValue(kpis, "kpi-forecast-revenue").display,
      revenueWon: kpiValue(kpis, "kpi-won-revenue").display,
      revenueLost: kpiValue(kpis, "kpi-lost-revenue").display,
      activeContracts: this.agreements.contracts
        .list(context)
        .filter((entry) => entry.status === "active").length,
      contractsExpiring: renewalDashboard.expiring.length,
      customerLifetimeValue: customerHub.totalLifetimeValue,
      relationshipHealthIndex: kpiValue(kpis, "kpi-relationship-health").numeric,
    };
  }
}

/** Builds exception-first dashboard widgets (CTO: prioritize what requires attention). */
export class CommercialWidgetLibrary {
  build(context: ServiceContext, dashboard: CrmExecutiveDashboardView): DashboardWidget[] {
    const widgets: DashboardWidget[] = [
      {
        id: "widget-alerts",
        type: "alert",
        title: "Executive Alerts",
        priority: 100,
        summary: `${dashboard.alerts.length} item(s) require executive attention`,
        drillDownHref: "/crm/executive#alerts",
      },
      {
        id: "widget-at-risk",
        type: "list",
        title: "At-Risk Customers",
        priority: 90,
        summary: `${dashboard.customerIntelligence.atRiskCustomers.length} account(s) at retention risk`,
        drillDownHref: "/crm/customer-analytics",
      },
      {
        id: "widget-renewals",
        type: "list",
        title: "Renewal Deadlines",
        priority: 85,
        summary: `${dashboard.summary.contractsExpiring} contract(s) expiring within 45 days`,
        drillDownHref: "/crm/renewals",
      },
      {
        id: "widget-pipeline",
        type: "kpi",
        title: "Pipeline Value",
        priority: 70,
        summary: dashboard.summary.pipelineValue,
        drillDownHref: "/crm/opportunities",
      },
      {
        id: "widget-forecast",
        type: "kpi",
        title: "Forecast Revenue",
        priority: 65,
        summary: dashboard.summary.forecastRevenue,
        drillDownHref: "/crm/forecast",
      },
      {
        id: "widget-vip",
        type: "list",
        title: "VIP Customers",
        priority: 60,
        summary: `${dashboard.customerIntelligence.vipCustomers.length} strategic account(s)`,
        drillDownHref: "/crm/customer-analytics",
      },
      {
        id: "widget-growth",
        type: "list",
        title: "Growth Opportunities",
        priority: 55,
        summary: `${dashboard.customerIntelligence.growthOpportunities.length} expansion opportunity(ies)`,
        drillDownHref: "/crm/customer-analytics",
      },
      {
        id: "widget-activities",
        type: "list",
        title: "Commercial Activity",
        priority: 40,
        summary: `${dashboard.commercialActivity.meetings} meetings · ${dashboard.commercialActivity.calls} calls · ${dashboard.commercialActivity.followUps} follow-ups`,
        drillDownHref: "/crm/activities",
      },
    ];

    return widgets.sort((left, right) => right.priority - left.priority);
  }
}

/** Surfaces commercial exceptions — anomalies, risks, and deadlines first. */
export class AlertManagementService {
  constructor(
    private readonly repository: ExecutiveDashboardRepository,
    private readonly commercial: CrmCommercialIntelligenceFacade,
    private readonly customer: CrmCustomerIntelligenceFacade,
    private readonly agreements: CrmAgreementsFacade,
  ) {}

  list(context: ServiceContext): ExecutiveAlert[] {
    const alerts: ExecutiveAlert[] = [];
    const orgId = context.organizationId;

    for (const alert of this.repository.listCommercialAlerts(orgId)) {
      alerts.push({
        id: alert.id,
        severity: alert.severity,
        category: mapCommercialCategory(alert.entityType ?? "relationship"),
        title: alert.title,
        message: alert.message,
        recommendedAction: "Review account and schedule executive intervention.",
        entityType: alert.entityType,
        entityId: alert.entityId,
        drillDownHref: alert.entityType === "contract" ? "/crm/contracts" : "/crm/opportunities",
        createdAt: alert.createdAt,
      });
    }

    for (const risk of this.customer.retention.predict(context)) {
      if (risk.riskLevel === "low") continue;
      alerts.push({
        id: `exec-alert-retention-${risk.partyId}`,
        severity: risk.riskLevel === "critical" ? "critical" : "high",
        category: "account_risk",
        title: `Retention risk — ${risk.partyName}`,
        message: risk.drivers.join(" · "),
        recommendedAction: risk.recommendedAction,
        entityType: "party",
        entityId: risk.partyId,
        drillDownHref: `/crm/customer-analytics/${risk.partyId}`,
        createdAt: new Date().toISOString(),
      });
    }

    for (const insight of this.commercial.insights.generate(context)) {
      if (insight.impact !== "critical" && insight.impact !== "high") continue;
      if (insight.category !== "opportunity_stall" && insight.category !== "renewal_risk") continue;
      alerts.push({
        id: `exec-alert-insight-${insight.id}`,
        severity: insight.impact,
        category: mapCommercialCategory(insight.category),
        title: insight.title,
        message: insight.summary,
        recommendedAction: insight.likelyNext,
        drillDownHref: "/crm/opportunities",
        createdAt: new Date().toISOString(),
      });
    }

    for (const contract of this.agreements.renewals.getDashboard(context).expiring) {
      alerts.push({
        id: `exec-alert-renewal-${contract.id}`,
        severity: (contract.daysToExpiry ?? 99) <= 14 ? "critical" : "high",
        category: "renewal_deadline",
        title: `Renewal deadline — ${contract.title}`,
        message: `Contract expires in ${contract.daysToExpiry ?? "?"} days.`,
        recommendedAction: "Prioritize renewal negotiation and executive outreach.",
        entityType: "contract",
        entityId: contract.id,
        drillDownHref: `/crm/contracts/${contract.id}`,
        createdAt: new Date().toISOString(),
      });
    }

    for (const benchmark of this.repository.listBenchmarks(orgId)) {
      if (benchmark.variance >= 0) continue;
      alerts.push({
        id: `exec-alert-variance-${benchmark.id}`,
        severity: benchmark.variance <= -15 ? "high" : "medium",
        category: "revenue_variance",
        title: `Revenue variance — ${benchmark.label}`,
        message: `${benchmark.actual}${benchmark.unit} vs benchmark ${benchmark.benchmark}${benchmark.unit} (${benchmark.variance}%)`,
        recommendedAction: "Review pricing, pipeline mix, and sales effectiveness.",
        drillDownHref: "/crm/analytics",
        createdAt: new Date().toISOString(),
      });
    }

    return alerts.sort(
      (left, right) => SEVERITY_RANK[right.severity] - SEVERITY_RANK[left.severity],
    );
  }
}

/** Provides drill-down navigation from enterprise metrics to entity detail. */
export class DrillDownNavigationService {
  build(context: ServiceContext, repository: ExecutiveDashboardRepository): DrillDownTarget[] {
    const targets: DrillDownTarget[] = [
      { label: "Pipeline", href: "/crm/opportunities", entityType: "workspace" },
      { label: "Contracts", href: "/crm/contracts", entityType: "workspace" },
      { label: "Customer Profiles", href: "/crm/customer-analytics", entityType: "workspace" },
      { label: "Commercial Analytics", href: "/crm/analytics", entityType: "workspace" },
      { label: "Activities", href: "/crm/activities", entityType: "workspace" },
      { label: "Renewals", href: "/crm/renewals", entityType: "workspace" },
    ];

    const topOpportunity = repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => OPEN_STAGES.includes(entry.stage))
      .sort((left, right) => right.valueAmount - left.valueAmount)[0];

    if (topOpportunity) {
      targets.push({
        label: topOpportunity.name,
        href: `/crm/opportunities/${topOpportunity.id}`,
        entityType: "opportunity",
        entityId: topOpportunity.id,
      });
    }

    const vip = this.customerFacade.profiles.list(context).find((entry) => entry.segment === "VIP");
    if (vip) {
      targets.push({
        label: vip.displayName,
        href: `/crm/customer-analytics/${vip.partyId}`,
        entityType: "party",
        entityId: vip.partyId,
      });
    }

    return targets;
  }

  constructor(private readonly customerFacade: CrmCustomerIntelligenceFacade) {}
}

/** Generates executive commercial reports from dashboard composition. */
export class ExecutiveReportingService {
  generate(dashboard: CrmExecutiveDashboardView): ExecutiveReport {
    return {
      id: `report-${Date.now()}`,
      title: "Daily Commercial Brief",
      generatedAt: new Date().toISOString(),
      briefingLine: dashboard.briefingLine,
      sections: [
        {
          title: "Revenue Summary",
          summary: `Pipeline ${dashboard.summary.pipelineValue} · Forecast ${dashboard.summary.forecastRevenue} · Won ${dashboard.summary.revenueWon}`,
          highlights: [
            `${dashboard.summary.activeContracts} active contracts`,
            `${dashboard.summary.contractsExpiring} contracts expiring soon`,
            `Relationship health ${dashboard.summary.relationshipHealthIndex}/100`,
          ],
        },
        {
          title: "Customer Intelligence",
          summary: `${dashboard.customerIntelligence.vipCustomers.length} VIP · ${dashboard.customerIntelligence.atRiskCustomers.length} at risk`,
          highlights: [
            dashboard.customerIntelligence.retentionTrend,
            `${dashboard.customerIntelligence.growthOpportunities.length} growth opportunities identified`,
          ],
        },
        {
          title: "Executive Alerts",
          summary: `${dashboard.alerts.length} exception(s) surfaced for executive attention`,
          highlights: dashboard.alerts.slice(0, 5).map((entry) => entry.title),
        },
        {
          title: "Recommended Actions",
          summary: `${dashboard.recommendations.length} decision-ready recommendation(s)`,
          highlights: dashboard.recommendations.slice(0, 5).map((entry) => entry.title),
        },
      ],
    };
  }
}

/** Unified commercial executive dashboard (Mission P-008.7). */
export class CommercialDashboardService {
  constructor(
    private readonly repository: ExecutiveDashboardRepository,
    private readonly commercial: CrmCommercialIntelligenceFacade,
    private readonly customer: CrmCustomerIntelligenceFacade,
    private readonly agreements: CrmAgreementsFacade,
    private readonly kpis: ExecutiveKpiAggregator,
    private readonly alerts: AlertManagementService,
    private readonly widgets: CommercialWidgetLibrary,
    private readonly drillDown: DrillDownNavigationService,
    private readonly reporting: ExecutiveReportingService,
  ) {}

  getDashboard(context: ServiceContext): CrmExecutiveDashboardView {
    const commercialDashboard = this.commercial.executive.getExecutiveDashboard(context);
    const customerDashboard = this.customer.executive.getDashboard(context);
    const analytics = this.commercial.analytics.getAnalytics(context);
    const summary = this.kpis.getSummary(context);
    const alertList = this.alerts.list(context);

    const salesPerformance = {
      pipelineByStage: commercialDashboard.pipelineSnapshot.byStage.map((entry) => ({
        stage: entry.stage,
        count: entry.count,
        value: formatCommercialCurrency(entry.value),
      })),
      pipelineByTerritory: analytics.revenueByTerritory.map((entry) => ({
        territory: entry.territory,
        count: entry.count,
        value: formatCommercialCurrency(entry.value),
      })),
      pipelineByIndustry: analytics.revenueByIndustry.map((entry) => ({
        industry: entry.industry,
        count: entry.count,
        value: formatCommercialCurrency(entry.value),
      })),
      winRate: kpiValue(commercialDashboard.kpis, "kpi-win-rate").display,
      salesVelocity: kpiValue(commercialDashboard.kpis, "kpi-sales-velocity").display,
      opportunityAging: this.buildOpportunityAging(context),
    };

    const customerIntelligence = {
      vipCustomers: customerDashboard.hub.profiles
        .filter((entry) => entry.segment === "VIP")
        .map((entry) => ({
          partyId: entry.partyId,
          displayName: entry.displayName,
          href: `/crm/customer-analytics/${entry.partyId}`,
        })),
      atRiskCustomers: customerDashboard.retention
        .filter((entry) => entry.riskLevel === "high" || entry.riskLevel === "critical")
        .map((entry) => ({
          partyId: entry.partyId,
          displayName: entry.partyName,
          risk: entry.riskLevel,
          href: `/crm/customer-analytics/${entry.partyId}`,
        })),
      retentionTrend: customerDashboard.hub.atRiskCount > 0 ? "Elevated retention risk" : "Stable retention",
      growthOpportunities: customerDashboard.growth.map((entry) => ({
        partyId: entry.partyId,
        displayName: entry.partyName,
        potentialValue: formatCommercialCurrency(entry.potentialValue),
        href: `/crm/customer-analytics/${entry.partyId}`,
      })),
    };

    const dashboard: CrmExecutiveDashboardView = {
      summary,
      salesPerformance,
      customerIntelligence,
      commercialActivity: this.buildActivitySummary(context),
      alerts: alertList,
      widgets: [],
      trends: this.repository.listPerformanceTrends(context.organizationId),
      recommendations: commercialDashboard.recommendations,
      insights: commercialDashboard.insights,
      drillDowns: this.drillDown.build(context, this.repository),
      briefingLine: "",
    };

    dashboard.widgets = this.widgets.build(context, dashboard);
    dashboard.briefingLine = this.buildBriefingLine(dashboard);

    return dashboard;
  }

  getReport(context: ServiceContext): ExecutiveReport {
    return this.reporting.generate(this.getDashboard(context));
  }

  getBriefSignals(context: ServiceContext): CrmExecutiveBriefSignals {
    const dashboard = this.getDashboard(context);
    return {
      pipelineValue: dashboard.summary.pipelineValue,
      forecastRevenue: dashboard.summary.forecastRevenue,
      executiveAlerts: dashboard.alerts.length,
      vipCustomers: dashboard.customerIntelligence.vipCustomers.length,
      customersAtRisk: dashboard.customerIntelligence.atRiskCustomers.length,
      renewalsDue: dashboard.summary.contractsExpiring,
      briefingLine: dashboard.briefingLine,
    };
  }

  private buildBriefingLine(dashboard: CrmExecutiveDashboardView): string {
    const critical = dashboard.alerts.filter((entry) => entry.severity === "critical").length;
    return `${dashboard.summary.pipelineValue} pipeline · ${dashboard.summary.forecastRevenue} forecast · ${dashboard.alerts.length} alert(s) (${critical} critical) · ${dashboard.customerIntelligence.vipCustomers.length} VIP · ${dashboard.customerIntelligence.atRiskCustomers.length} at risk.`;
  }

  private buildOpportunityAging(context: ServiceContext) {
    const now = Date.now();
    return this.repository
      .listCommercialOpportunities(context.organizationId)
      .filter((entry) => OPEN_STAGES.includes(entry.stage))
      .map((entry) => {
        const updated = new Date(entry.updatedAt).getTime();
        const daysOpen = Math.max(1, Math.round((now - updated) / (1000 * 60 * 60 * 24)));
        return {
          opportunityId: entry.id,
          title: entry.name,
          daysOpen,
          value: formatCommercialCurrency(entry.valueAmount),
          href: `/crm/opportunities/${entry.id}`,
        };
      })
      .sort((left, right) => right.daysOpen - left.daysOpen)
      .slice(0, 8);
  }

  private buildActivitySummary(context: ServiceContext) {
    const legacyActivities = this.repository.getActivityRecords();
    const commercialActivities = this.repository.listCommercialActivities(context.organizationId);
    const proposals = this.repository
      .listProposals(context.organizationId)
      .filter((entry) => entry.status === "review" || entry.status === "issued" || entry.status === "draft");
    const renewals = this.agreements.renewals.getDashboard(context).upcoming;

    const meetings =
      legacyActivities.filter((entry) => entry.type === "Meeting").length +
      commercialActivities.filter((entry) => entry.type === "meeting").length;
    const calls =
      legacyActivities.filter((entry) => entry.type === "Phone Call").length +
      commercialActivities.filter((entry) => entry.type === "call").length;
    const tasks =
      legacyActivities.filter((entry) => entry.type === "Task").length +
      commercialActivities.filter((entry) => entry.type === "task").length;
    const followUps = legacyActivities.filter(
      (entry) => entry.status === "Pending" || entry.status === "Overdue",
    ).length;

    const recentActivities = [
      ...legacyActivities.slice(0, 5).map((entry) => ({
        id: entry.id,
        type: entry.type,
        customer: entry.customer,
        date: entry.date,
        href: "/crm/activities",
      })),
      ...commercialActivities.slice(0, 3).map((entry) => ({
        id: entry.id,
        type: entry.type,
        customer: entry.subject,
        date: entry.dueAt?.slice(0, 10) ?? entry.createdAt.slice(0, 10),
        href: "/crm/activities",
      })),
    ].slice(0, 8);

    return {
      meetings,
      calls,
      tasks,
      followUps,
      proposalsPending: proposals.length,
      renewalsDue: renewals.length,
      recentActivities,
    };
  }
}

/** CRM Commercial Executive Dashboard facade (Mission P-008.7). */
export class CrmExecutiveDashboardFacade {
  readonly dashboard: CommercialDashboardService;
  readonly kpis: ExecutiveKpiAggregator;
  readonly alerts: AlertManagementService;
  readonly widgets: CommercialWidgetLibrary;
  readonly drillDown: DrillDownNavigationService;
  readonly reporting: ExecutiveReportingService;
  readonly executive: CommercialDashboardService;

  constructor(repository: ExecutiveDashboardRepository) {
    const commercial = new CrmCommercialIntelligenceFacade(repository);
    const customer = new CrmCustomerIntelligenceFacade(repository);
    const agreements = new CrmAgreementsFacade(repository);
    this.kpis = new ExecutiveKpiAggregator(commercial, customer, agreements);
    this.alerts = new AlertManagementService(repository, commercial, customer, agreements);
    this.widgets = new CommercialWidgetLibrary();
    this.drillDown = new DrillDownNavigationService(customer);
    this.reporting = new ExecutiveReportingService();
    this.dashboard = new CommercialDashboardService(
      repository,
      commercial,
      customer,
      agreements,
      this.kpis,
      this.alerts,
      this.widgets,
      this.drillDown,
      this.reporting,
    );
    this.executive = this.dashboard;
  }
}
