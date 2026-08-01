/** CRM commercial view models (Mission P-008.2). */

import type {
  CommercialActivityRecord,
  CommercialOpportunityStage,
  LeadSource,
  LeadStatus,
  RevenueForecastRecord,
} from "@/types/crm-commercial";

export type LeadListItem = {
  id: string;
  displayName: string;
  source: LeadSource;
  status: LeadStatus;
  owner: string;
  estimatedValue: string;
  probability: number;
  expectedClose?: string;
  nextActivity?: string;
  industry?: string;
  territory?: string;
};

export type LeadListView = {
  total: number;
  items: LeadListItem[];
  filterOptions: {
    sources: LeadSource[];
    statuses: LeadStatus[];
    owners: string[];
    territories: string[];
  };
};

export type LeadDetailView = LeadListItem & {
  partyId?: string;
  organisationPartyId?: string;
  tags?: string[];
  notes?: string;
  convertedOpportunityId?: string;
};

export type PipelineColumnView = {
  stage: CommercialOpportunityStage;
  label: string;
  count: number;
  totalValue: string;
  items: Array<{
    id: string;
    name: string;
    customer: string;
    value: string;
    probability: number;
    owner: string;
    score: number;
  }>;
};

export type PipelineView = {
  columns: PipelineColumnView[];
  metrics: PipelineMetricsView;
};

export type PipelineMetricsView = {
  totalPipelineValue: string;
  openOpportunities: number;
  averageDealSize: string;
  expectedMonthlyRevenue: string;
  winRate: string;
  salesVelocityDays: number;
};

export type ForecastDashboardView = {
  forecasts: RevenueForecastRecord[];
  topOpportunities: Array<{
    id: string;
    name: string;
    value: string;
    expectedRevenue: string;
    probability: number;
    stage: string;
    owner: string;
  }>;
  briefingLine: string;
};

export type CommercialBriefSignals = {
  pipelineValue: string;
  openOpportunities: number;
  topOpportunityName: string;
  topOpportunityValue: string;
  forecastRevenue: string;
  winRate: string;
  activeLeads: number;
  briefingLine: string;
};

export type { CommercialActivityRecord, RevenueForecastRecord };
