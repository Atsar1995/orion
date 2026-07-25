import type { ConfidenceScore } from "@/types/executive/confidence";
import type { HealthSnapshot } from "@/types/executive/health";
import type { ExecutiveRecommendation } from "@/types/executive/recommendation";

/** Brief lifecycle states from EC-001. */
export type BriefLifecycleState =
  | "fresh"
  | "updated"
  | "stale"
  | "incomplete"
  | "offline";

export type BriefGreeting = {
  period: string;
  executiveName: string;
  headline: string;
  subheadline: string;
  dateLabel: string;
};

export type BriefAlert = {
  id: string;
  severity: "critical" | "attention";
  message: string;
  category: string;
  ageLabel?: string;
};

export type OvernightChange = {
  id: string;
  label: string;
  value: string;
  direction: "up" | "down" | "neutral";
};

export type BriefPriority = {
  id: string;
  rank: number;
  title: string;
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

/** EC-001 Morning Executive Brief composed view (EC-000). */
export type BriefView = {
  id: string;
  generatedAt: string;
  lastSyncedAt: string;
  lifecycle: BriefLifecycleState;
  changesSinceLastView?: number;
  greeting: BriefGreeting;
  businessHealth: HealthSnapshot;
  criticalAlerts: BriefAlert[];
  overnightChanges: OvernightChange[];
  recommendations: ExecutiveRecommendation[];
  priorities: BriefPriority[];
  aiSummary: AiExecutiveSummary;
  endSummary: BriefEndSummary;
};
