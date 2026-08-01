/**
 * ORION Commercial Domain — Lead & Opportunity Management (Mission P-008.2).
 * Commercial entities reference Universal Party — they do not own identity.
 */

export type LeadSource =
  | "website"
  | "referral"
  | "travel_agent"
  | "corporate"
  | "campaign"
  | "walk_in"
  | "phone"
  | "email"
  | "social_media"
  | "import";

export type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "proposal_requested"
  | "converted"
  | "lost"
  | "archived";

export type CommercialOpportunityStage =
  | "identified"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"
  | "closed";

export type CommercialActivityType = "call" | "email" | "meeting" | "note" | "task";

export type LeadRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId?: string;
  readonly organisationPartyId?: string;
  readonly displayName: string;
  readonly source: LeadSource;
  readonly industry?: string;
  readonly territory?: string;
  readonly owner: string;
  readonly estimatedValue: number;
  readonly probability: number;
  readonly expectedClose?: string;
  readonly nextActivity?: string;
  readonly tags?: readonly string[];
  readonly status: LeadStatus;
  readonly convertedOpportunityId?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CommercialOpportunityRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly organisationPartyId?: string;
  readonly leadId?: string;
  readonly name: string;
  readonly stage: CommercialOpportunityStage;
  readonly source?: LeadSource;
  readonly industry?: string;
  readonly territory?: string;
  readonly owner: string;
  readonly valueAmount: number;
  readonly probability: number;
  readonly expectedClose: string;
  readonly nextActivity: string;
  readonly tags?: readonly string[];
  readonly score: number;
  readonly summary: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CommercialActivityRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId?: string;
  readonly leadId?: string;
  readonly opportunityId?: string;
  readonly type: CommercialActivityType;
  readonly subject: string;
  readonly dueAt?: string;
  readonly completedAt?: string;
  readonly owner: string;
  readonly createdAt: string;
};

export type RevenueForecastRecord = {
  readonly period: string;
  readonly projectedRevenue: number;
  readonly confidence: number;
  readonly opportunityCount: number;
  readonly weightedPipeline: number;
};

export type LeadSearchFilter = {
  query?: string;
  source?: LeadSource;
  status?: LeadStatus;
  owner?: string;
  territory?: string;
};

export type OpportunitySearchFilter = {
  query?: string;
  stage?: CommercialOpportunityStage;
  owner?: string;
  partyId?: string;
};

export type CreateLeadInput = {
  displayName: string;
  source: LeadSource;
  partyId?: string;
  organisationPartyId?: string;
  industry?: string;
  territory?: string;
  owner: string;
  estimatedValue?: number;
  probability?: number;
  expectedClose?: string;
  nextActivity?: string;
  tags?: string[];
  notes?: string;
};

export type CreateOpportunityInput = {
  name: string;
  partyId: string;
  organisationPartyId?: string;
  leadId?: string;
  stage?: CommercialOpportunityStage;
  source?: LeadSource;
  industry?: string;
  territory?: string;
  owner: string;
  valueAmount: number;
  probability: number;
  expectedClose: string;
  nextActivity?: string;
  tags?: string[];
  summary?: string;
};

export type ModifyLeadInput = Partial<Omit<LeadRecord, "id" | "organizationId" | "createdAt">>;
export type ModifyOpportunityInput = Partial<
  Omit<CommercialOpportunityRecord, "id" | "organizationId" | "createdAt">
>;

export type ConvertLeadInput = {
  leadId: string;
  name: string;
  valueAmount: number;
  probability: number;
  expectedClose: string;
};

export type CommercialEngineEventType =
  | "LeadCreated"
  | "OpportunityCreated"
  | "OpportunityWon"
  | "OpportunityLost"
  | "ForecastUpdated";

export type PublishCommercialEngineEventInput = {
  eventType: CommercialEngineEventType;
  entityId: string;
  actorId?: string;
  actorName?: string;
  payload?: Record<string, string>;
};
