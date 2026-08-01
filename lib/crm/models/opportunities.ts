/** CRM opportunity domain models (Mission 16A.4). */

import type { CrmActivity } from "@/lib/crm/models/domain";
import type { Recommendation } from "@/types/intelligence";

export type OpportunityStage =
  | "Lead"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

export type OpportunityHealthLabel =
  | "Healthy"
  | "Needs Attention"
  | "High Risk"
  | "Closed Won"
  | "Closed Lost";

export type OpportunityPriorityLabel = "High" | "Medium" | "Low";

export type OpportunityListSortField =
  | "name"
  | "customer"
  | "stage"
  | "value"
  | "probability"
  | "expectedClose"
  | "assignedOwner"
  | "lastUpdated";

export type OpportunityListSortDirection = "asc" | "desc";

export type OpportunityListFilters = {
  stage?: OpportunityStage | "all";
  health?: OpportunityHealthLabel | "all";
  priority?: OpportunityPriorityLabel | "all";
  assignedOwner?: string;
};

export type OpportunityListQuery = {
  search?: string;
  filters?: OpportunityListFilters;
  sortField?: OpportunityListSortField;
  sortDirection?: OpportunityListSortDirection;
  page?: number;
  pageSize?: number;
};

export type CrmOpportunityRecord = {
  id: string;
  name: string;
  customer: string;
  customerId: string;
  stage: OpportunityStage;
  value: string;
  valueAmount: number;
  probability: number;
  expectedClose: string;
  assignedOwner: string;
  lastUpdated: string;
  healthLabel: OpportunityHealthLabel;
  priority: OpportunityPriorityLabel;
  nextAction: string;
  expectedRevenue: string;
  summary: string;
};

export type CrmOpportunityListItem = {
  id: string;
  name: string;
  customer: string;
  stage: OpportunityStage;
  value: string;
  probability: number;
  expectedClose: string;
  assignedOwner: string;
  lastUpdated: string;
  healthLabel: OpportunityHealthLabel;
  priority: OpportunityPriorityLabel;
};

export type CrmOpportunityListResult = {
  items: CrmOpportunityListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filterOptions: {
    stages: OpportunityStage[];
    healthLabels: OpportunityHealthLabel[];
    priorities: OpportunityPriorityLabel[];
    assignedOwners: string[];
  };
};

export type CrmOpportunityPipelineView = {
  stages: OpportunityStage[];
  columns: Record<OpportunityStage, CrmOpportunityListItem[]>;
};

export type CrmOpportunityMetrics = {
  totalPipelineValue: string;
  openOpportunities: number;
  averageDealSize: string;
  expectedMonthlyRevenue: string;
  winRate: string;
};

export type CrmOpportunityDetailView = {
  opportunity: CrmOpportunityRecord;
  recentActivity: CrmActivity[];
  recommendations: Recommendation[];
};

export type CrmOpportunityWorkspaceView = {
  metrics: CrmOpportunityMetrics;
  recommendations: Recommendation[];
  records: CrmOpportunityRecord[];
};
