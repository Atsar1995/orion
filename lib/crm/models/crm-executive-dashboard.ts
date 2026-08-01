/** CRM executive dashboard view models (Mission P-008.7). */

import type {
  CommercialRecommendation,
  CommercialInsight,
} from "@/types/crm-commercial-intelligence";
import type {
  DashboardWidget,
  DrillDownTarget,
  ExecutiveAlert,
  PerformanceTrendRecord,
} from "@/types/crm-executive-dashboard";

export type RevenueSummary = {
  pipelineValue: string;
  forecastRevenue: string;
  revenueWon: string;
  revenueLost: string;
  activeContracts: number;
  contractsExpiring: number;
  customerLifetimeValue: string;
  relationshipHealthIndex: number;
};

export type SalesPerformanceView = {
  pipelineByStage: Array<{ stage: string; count: number; value: string }>;
  pipelineByTerritory: Array<{ territory: string; count: number; value: string }>;
  pipelineByIndustry: Array<{ industry: string; count: number; value: string }>;
  winRate: string;
  salesVelocity: string;
  opportunityAging: Array<{
    opportunityId: string;
    title: string;
    daysOpen: number;
    value: string;
    href: string;
  }>;
};

export type CustomerIntelligenceSummary = {
  vipCustomers: Array<{ partyId: string; displayName: string; href: string }>;
  atRiskCustomers: Array<{ partyId: string; displayName: string; risk: string; href: string }>;
  retentionTrend: string;
  growthOpportunities: Array<{ partyId: string; displayName: string; potentialValue: string; href: string }>;
};

export type CommercialActivitySummary = {
  meetings: number;
  calls: number;
  tasks: number;
  followUps: number;
  proposalsPending: number;
  renewalsDue: number;
  recentActivities: Array<{
    id: string;
    type: string;
    customer: string;
    date: string;
    href: string;
  }>;
};

export type ExecutiveReportSection = {
  title: string;
  summary: string;
  highlights: string[];
};

export type ExecutiveReport = {
  id: string;
  title: string;
  generatedAt: string;
  sections: ExecutiveReportSection[];
  briefingLine: string;
};

export type CrmExecutiveDashboardView = {
  summary: RevenueSummary;
  salesPerformance: SalesPerformanceView;
  customerIntelligence: CustomerIntelligenceSummary;
  commercialActivity: CommercialActivitySummary;
  alerts: ExecutiveAlert[];
  widgets: DashboardWidget[];
  trends: PerformanceTrendRecord[];
  recommendations: CommercialRecommendation[];
  insights: CommercialInsight[];
  drillDowns: DrillDownTarget[];
  briefingLine: string;
};

export type CrmExecutiveBriefSignals = {
  pipelineValue: string;
  forecastRevenue: string;
  executiveAlerts: number;
  vipCustomers: number;
  customersAtRisk: number;
  renewalsDue: number;
  briefingLine: string;
};

export type { DashboardWidget, DrillDownTarget, ExecutiveAlert, PerformanceTrendRecord };
