/** CRM commercial intelligence view models (Mission P-008.5). */

import type {
  BenchmarkRecord,
  CommercialAlert,
  CommercialInsight,
  CommercialKpi,
  CommercialRecommendation,
  ForecastHistoryRecord,
  ForecastRecord,
  PipelineSnapshot,
  RelationshipHealthRecord,
} from "@/types/crm-commercial-intelligence";

export type CommercialExecutiveDashboard = {
  kpis: CommercialKpi[];
  pipelineSnapshot: PipelineSnapshot;
  forecasts: ForecastRecord[];
  relationshipHealth: RelationshipHealthRecord[];
  insights: CommercialInsight[];
  recommendations: CommercialRecommendation[];
  alerts: CommercialAlert[];
  benchmarks: BenchmarkRecord[];
  briefingLine: string;
};

export type CommercialAnalyticsView = {
  pipelineByStage: PipelineSnapshot["byStage"];
  pipelineByOwner: PipelineSnapshot["byOwner"];
  revenueByIndustry: Array<{ industry: string; value: number; count: number }>;
  revenueByTerritory: Array<{ territory: string; value: number; count: number }>;
  revenueByAccount: Array<{ partyName: string; value: number; count: number }>;
};

export type CommercialIntelligenceBriefSignals = {
  pipelineHealthScore: number;
  forecastRevenue: string;
  commercialRisks: number;
  growthOpportunities: number;
  briefingLine: string;
};

export type { ForecastHistoryRecord, BenchmarkRecord, CommercialAlert };
