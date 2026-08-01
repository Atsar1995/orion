export type ExecutiveDashboardView = {
  readonly kpis: readonly {
    readonly label: string;
    readonly value: string;
    readonly trend?: string;
    readonly category: string;
  }[];
  readonly health: {
    readonly operational: number;
    readonly revenue: number;
    readonly guestExperience: number;
    readonly overall: number;
  };
  readonly forecasts: readonly { readonly label: string; readonly value: string; readonly confidence: number }[];
  readonly criticalRisks: readonly string[];
};

export type OperationalAnalyticsView = {
  readonly today: {
    readonly arrivals: number;
    readonly departures: number;
    readonly inHouse: number;
    readonly revenue: number;
    readonly outstandingFolios: number;
  };
  readonly housekeeping: {
    readonly readyRooms: number;
    readonly awaitingCleaning: number;
    readonly inProgress: number;
    readonly progressPercent: number;
  };
  readonly maintenance: {
    readonly backlog: number;
    readonly critical: number;
    readonly preventiveDue: number;
  };
  readonly rates: {
    readonly arrivalRate: number;
    readonly departureRate: number;
    readonly cancellationRate: number;
    readonly noShowRate: number;
  };
};

export type GuestIntelligenceAnalyticsView = {
  readonly repeatGuests: number;
  readonly vipGuests: number;
  readonly loyaltyGrowth: string;
  readonly satisfactionScore: number;
  readonly complaintTrend: string;
  readonly serviceRecoverySuccess: number;
};

export type CommercialAnalyticsView = {
  readonly bookingSources: readonly { readonly source: string; readonly share: number; readonly revenue: number }[];
  readonly marketSegments: readonly { readonly segment: string; readonly share: number }[];
  readonly leadTimeDays: number;
  readonly conversionRate: number;
  readonly cancellationAnalysis: readonly { readonly reason: string; readonly count: number }[];
  readonly revenueMix: readonly { readonly category: string; readonly share: number }[];
};

export type HospitalityAnalyticsView = {
  readonly executive: ExecutiveDashboardView;
  readonly operational: OperationalAnalyticsView;
  readonly guest: GuestIntelligenceAnalyticsView;
  readonly commercial: CommercialAnalyticsView;
  readonly kpis: readonly import("@/types/hospitality-analytics").KpiRecord[];
  readonly trends: readonly import("@/types/hospitality-analytics").TrendRecord[];
  readonly forecasts: readonly import("@/types/hospitality-analytics").ForecastRecord[];
  readonly insights: readonly import("@/types/hospitality-analytics").InsightRecord[];
  readonly benchmarks: readonly import("@/types/hospitality-analytics").BenchmarkRecord[];
  readonly recommendations: readonly import("@/types/hospitality-analytics").AnalyticsRecommendationRecord[];
  readonly alerts: readonly import("@/types/hospitality-analytics").AnalyticsAlertRecord[];
};

export type AnalyticsBriefContribution = {
  readonly operationalHealth: number;
  readonly revenueHealth: number;
  readonly guestExperienceHealth: number;
  readonly forecastOccupancy: number;
  readonly forecastRevenue: number;
  readonly criticalRiskCount: number;
  readonly topInsight: string;
};
