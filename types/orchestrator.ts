import type { AlertPanelSnapshot } from "@/types/alerts";
import type { DailyExecutiveBrief } from "@/types/brief";
import type { RecommendationBundle } from "@/types/recommendations";
import type { ProviderDashboardContribution } from "@/types/providers";
import type {
  BusinessHealth,
  DashboardSnapshot,
  ExecutiveBrief,
  ExecutiveMetricsBundle,
  ExecutiveTask,
  Recommendation,
  Trend,
} from "@/types/intelligence";

/** Lifecycle status of a registered intelligence engine. */
export type EngineStatus = "idle" | "running" | "ready" | "error" | "disabled";

/** Registration metadata for an orchestrated engine or service. */
export type EngineRegistration = {
  id: string;
  name: string;
  version: string;
  status: EngineStatus;
  description?: string;
};

/** Pipeline stage identifier and execution metadata. */
export type PipelineStage = {
  id: string;
  name: string;
  order: number;
  parallelGroup?: string;
  required: boolean;
};

/** Structured pipeline error captured during stage execution. */
export type PipelineError = {
  stageId: string;
  message: string;
  timestamp: string;
  recoverable: boolean;
};

/** Per-engine and pipeline-level execution metrics. */
export type ExecutionMetrics = {
  pipelineDurationMs: number;
  stageDurationsMs: Record<string, number>;
  engineDurationsMs: Record<string, number>;
  failureCount: number;
  warningCount: number;
  executionCount: number;
};

/** Result envelope for a single pipeline stage. */
export type PipelineResult<T = unknown> = {
  stageId: string;
  success: boolean;
  durationMs: number;
  data?: T;
  error?: PipelineError;
  warnings?: string[];
};

/** Shared mutable context passed through pipeline stages. */
export type ExecutionContext = {
  executionId: string;
  startedAt: string;
  contributions: ProviderDashboardContribution[];
  normalizedContributions: ProviderDashboardContribution[];
  metrics: ExecutiveMetricsBundle | null;
  brief: ExecutiveBrief | null;
  dailyBrief: DailyExecutiveBrief | null;
  recommendations: Recommendation[];
  recommendationBundle: RecommendationBundle | null;
  alertPanel: AlertPanelSnapshot | null;
  businessHealth: BusinessHealth | null;
  trends: Trend[];
  tasks: ExecutiveTask[];
  snapshot: DashboardSnapshot | null;
  errors: PipelineError[];
  warnings: string[];
  stageResults: PipelineResult[];
};

/** Full pipeline execution record for observability. */
export type PipelineExecution = {
  id: string;
  startedAt: string;
  completedAt: string;
  success: boolean;
  metrics: ExecutionMetrics;
  errors: PipelineError[];
  warnings: string[];
  stageResults: PipelineResult[];
};

/** Log entry emitted during pipeline execution. */
export type PipelineLogEntry = {
  timestamp: string;
  level: "info" | "warn" | "error";
  stageId?: string;
  engineId?: string;
  message: string;
};

/** Scheduler metadata for future background execution. */
export type ScheduledExecution = {
  id: string;
  scheduledFor: string;
  cadence: "manual" | "interval" | "cron";
  enabled: boolean;
};

/** Final orchestrator pipeline output. */
export type OrchestratorPipelineOutput = {
  execution: PipelineExecution;
  snapshot: DashboardSnapshot;
};
