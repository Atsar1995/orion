/** CRM customer intelligence view models (Mission P-008.6). */

import type {
  CustomerInsightRecord,
  CustomerProfileRecord,
  CustomerSegmentRecord,
  GrowthOpportunityRecord,
  JourneyEventRecord,
  RetentionRiskRecord,
} from "@/types/crm-customer-intelligence";

export type CustomerProfileHubView = {
  profiles: CustomerProfileListItem[];
  vipCount: number;
  atRiskCount: number;
  totalLifetimeValue: string;
  briefingLine: string;
};

export type CustomerProfileListItem = {
  partyId: string;
  displayName: string;
  segment: string;
  relationshipScore: number;
  lifetimeValue: string;
  retentionRisk: string;
  growthPotential: number;
};

export type CustomerProfileDetailView = CustomerProfileRecord & {
  journey: JourneyEventRecord[];
  milestones: Array<{ milestone: string; recordedAt: string; outcome?: string }>;
};

export type CustomerIntelligenceDashboardView = {
  hub: CustomerProfileHubView;
  segments: CustomerSegmentRecord[];
  retention: RetentionRiskRecord[];
  growth: GrowthOpportunityRecord[];
  insights: CustomerInsightRecord[];
  journeySummary: Array<{ stage: string; count: number }>;
};

export type CustomerIntelligenceBriefSignals = {
  vipCustomers: number;
  customersAtRisk: number;
  growthOpportunities: number;
  retentionTrend: string;
  briefingLine: string;
};

export type {
  CustomerInsightRecord,
  CustomerSegmentRecord,
  GrowthOpportunityRecord,
  JourneyEventRecord,
  RetentionRiskRecord,
};
