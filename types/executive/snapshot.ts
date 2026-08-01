import type { ConfidenceScore } from "@/types/executive/confidence";
import type { HealthSnapshot } from "@/types/executive/health";
import type { ExecutiveEvidence } from "@/types/executive/evidence";
import type { ExecutiveRecommendation } from "@/types/executive/recommendation";
import type { HospitalityBriefContribution } from "@/lib/hospitality/models/dashboard";
import type { OrganizationHealthSnapshot } from "@/types/organization";
import type { IntelligenceFeedItem } from "@/types/intelligence-integration";

/** Brief lifecycle states from EC-001. */
export type BriefLifecycleState =
  | "fresh"
  | "updated"
  | "stale"
  | "incomplete"
  | "offline";

export type BriefOperatingMode = "standard" | "growth" | "recovery" | "planning";

export type BriefGreeting = {
  period: string;
  executiveName: string;
  headline: string;
  subheadline: string;
  dateLabel: string;
  organizationName: string;
  profileLabel: string;
  operatingMode: BriefOperatingMode;
};

export type BriefAlert = {
  id: string;
  severity: "critical" | "attention";
  message: string;
  category: string;
  ageLabel?: string;
  href?: string;
};

export type OvernightChange = {
  id: string;
  label: string;
  value: string;
  direction: "up" | "down" | "neutral";
  href?: string;
};

export type BriefPriority = {
  id: string;
  rank: number;
  title: string;
  href?: string;
};

/** Enhanced priority with decision intelligence (Mission P-002). */
export type BriefPriorityDecision = {
  id: string;
  rank: number;
  title: string;
  priority: number;
  confidence: ConfidenceScore;
  businessImpact: string;
  recommendedAction: string;
  evidence: readonly ExecutiveEvidence[];
  decisionId?: string;
  href?: string;
};

export type BriefHealthInsight = {
  id: string;
  label: string;
  summary: string;
  severity: "critical" | "attention" | "positive";
};

export type BriefBusinessHealth = HealthSnapshot & {
  majorRisks: readonly BriefHealthInsight[];
  majorOpportunities: readonly BriefHealthInsight[];
};

export type BriefDecisionItem = {
  id: string;
  title: string;
  status: string;
  href: string;
  priority?: number;
  delegatedTo?: string;
};

export type ExecutiveDecisionsSummary = {
  pending: readonly BriefDecisionItem[];
  delegated: readonly BriefDecisionItem[];
  awaitingReview: readonly BriefDecisionItem[];
  recentlyCompleted: readonly BriefDecisionItem[];
};

export type CrossWorkspaceSignal = {
  workspaceId: string;
  label: string;
  status: "live" | "partial" | "pending";
  summary: string;
  href?: string;
  signalCount: number;
};

export type ExecutiveMemoryItem = {
  id: string;
  type: "decision" | "lesson" | "context" | "pattern";
  title: string;
  detail: string;
  recordedAt?: string;
  href?: string;
};

export type BusinessTrendItem = {
  id: string;
  label: string;
  direction: "positive" | "negative" | "emerging_risk" | "emerging_opportunity";
  summary: string;
  confidence: ConfidenceScore;
};

export type MorningBriefSummary = {
  todaySummary: string;
  criticalDecisions: readonly string[];
  businessHealthHeadline: string;
  priorityActions: readonly string[];
  executiveNotes: readonly string[];
};

export type AiExecutiveSummary = {
  narrative: string;
  sources: string[];
  confidence: ConfidenceScore;
  generatedAt: string;
};

export type BriefEndSummary = {
  condition: string;
  priority: string;
  firstAction: string;
};

/** Executive Brief v1.0 composed view (EC-001 / Mission P-002). */
export type BriefView = {
  id: string;
  generatedAt: string;
  lastSyncedAt: string;
  lifecycle: BriefLifecycleState;
  changesSinceLastView?: number;
  greeting: BriefGreeting;
  businessHealth: BriefBusinessHealth;
  organizationHealth?: OrganizationHealthSnapshot;
  hospitalityHealth?: HospitalityBriefContribution;
  intelligenceFeed?: readonly IntelligenceFeedItem[];
  criticalAlerts: BriefAlert[];
  overnightChanges: OvernightChange[];
  recommendations: ExecutiveRecommendation[];
  priorities: BriefPriority[];
  priorityDecisions: readonly BriefPriorityDecision[];
  executiveDecisions: ExecutiveDecisionsSummary;
  crossWorkspaceSignals: readonly CrossWorkspaceSignal[];
  executiveMemory: readonly ExecutiveMemoryItem[];
  businessTrends: readonly BusinessTrendItem[];
  morningSummary: MorningBriefSummary;
  aiSummary: AiExecutiveSummary;
  endSummary: BriefEndSummary;
};
