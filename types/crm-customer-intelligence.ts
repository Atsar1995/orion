/**
 * ORION Customer Analytics & Relationship Intelligence (Mission P-008.6).
 * D-006 domain. Derived strategic metrics on partyId — does not own identity or operational events.
 */

export type CustomerSegmentType =
  | "vip"
  | "corporate"
  | "travel_agent"
  | "leisure"
  | "government"
  | "enterprise"
  | "high_growth"
  | "at_risk";

export type JourneyStage =
  | "acquisition"
  | "engagement"
  | "conversion"
  | "service_delivery"
  | "renewal"
  | "advocacy";

export type RetentionRiskLevel = "low" | "medium" | "high" | "critical";

export type CustomerIntelligenceEventType =
  | "CustomerSegmentChanged"
  | "RelationshipScoreUpdated"
  | "RetentionRiskDetected"
  | "GrowthOpportunityIdentified"
  | "CustomerInsightGenerated";

export type PublishCustomerIntelligenceEventInput = {
  eventType: CustomerIntelligenceEventType;
  entityId: string;
  actorId?: string;
  actorName?: string;
  payload?: Record<string, string>;
};

export type CommunicationPreferences = {
  readonly preferredChannel: "email" | "phone" | "in_person" | "portal";
  readonly contactFrequency: "weekly" | "monthly" | "quarterly";
  readonly language?: string;
};

export type CustomerProfileRecord = {
  readonly partyId: string;
  readonly organizationId: string;
  readonly displayName: string;
  readonly industry?: string;
  readonly segment: CustomerSegmentType;
  readonly relationshipScore: number;
  readonly lifetimeValue: number;
  readonly loyaltyIndex: number;
  readonly engagementScore: number;
  readonly retentionRisk: RetentionRiskLevel;
  readonly growthPotential: number;
  readonly communicationPreferences: CommunicationPreferences;
  readonly commercialSummary: string;
  readonly hospitalitySummary?: string;
  readonly financialSummary: string;
  readonly updatedAt: string;
};

export type JourneyEventRecord = {
  readonly id: string;
  readonly partyId: string;
  readonly organizationId: string;
  readonly stage: JourneyStage;
  readonly title: string;
  readonly description: string;
  readonly occurredAt: string;
  readonly sourceDomain: "commercial" | "agreements" | "hospitality" | "engagement";
};

export type CustomerSegmentRecord = {
  readonly segment: CustomerSegmentType;
  readonly label: string;
  readonly count: number;
  readonly totalLifetimeValue: number;
  readonly averageRelationshipScore: number;
};

export type RetentionRiskRecord = {
  readonly partyId: string;
  readonly partyName: string;
  readonly riskLevel: RetentionRiskLevel;
  readonly score: number;
  readonly drivers: readonly string[];
  readonly recommendedAction: string;
};

export type GrowthOpportunityRecord = {
  readonly id: string;
  readonly partyId: string;
  readonly partyName: string;
  readonly title: string;
  readonly description: string;
  readonly potentialValue: number;
  readonly confidence: number;
};

export type CustomerInsightRecord = {
  readonly id: string;
  readonly partyId?: string;
  readonly category: "retention" | "loyalty" | "growth" | "segment" | "journey";
  readonly title: string;
  readonly summary: string;
  readonly why: string;
  readonly recommendedAction: string;
};

export type RelationshipMilestoneRecord = {
  readonly id: string;
  readonly partyId: string;
  readonly organizationId: string;
  readonly milestone: string;
  readonly recordedAt: string;
  readonly outcome?: string;
};
