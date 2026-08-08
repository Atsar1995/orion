/** Aurora platform types (WP-A001 · ES-AURORA-005). */

import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";

export type HealthStatus = {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly message?: string;
  readonly checkedAt: string;
  readonly latencyMs?: number;
};

export type QueueHealthStatus = HealthStatus & {
  readonly depth: number;
  readonly activeWorkers: number;
};

export type AuroraHealthReport = {
  readonly lifecycle: PlatformLifecycleState;
  readonly modules: Readonly<Record<string, HealthStatus>>;
  readonly infrastructure: Readonly<Record<string, HealthStatus>>;
  readonly queues: Readonly<Record<string, QueueHealthStatus>>;
  readonly uptime: number;
  readonly degradedReasons: readonly string[];
  readonly version: string;
};

export type ConfigValidationResult = {
  readonly valid: boolean;
  readonly errors: readonly string[];
};

export type BootPhase =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;

export type PhaseResult = {
  readonly phase: BootPhase;
  readonly success: boolean;
  readonly durationMs: number;
  readonly error?: string;
};

export type BootResult = {
  readonly success: boolean;
  readonly state: PlatformLifecycleState;
  readonly wiring: import("@/lib/aurora/wiring/AuroraWiring").AuroraWiring;
  readonly phaseResults: readonly PhaseResult[];
  readonly totalDurationMs: number;
  readonly degradedReasons: readonly string[];
};

export type ShutdownPhaseResult = {
  readonly step: number;
  readonly name: string;
  readonly success: boolean;
  readonly durationMs: number;
};

export type ShutdownResult = {
  readonly success: boolean;
  readonly durationMs: number;
  readonly drainedJobs: number;
  readonly forceCancelledJobs: number;
  readonly phases: readonly ShutdownPhaseResult[];
};

export type RecoveryVerificationResult = {
  readonly success: boolean;
  readonly message: string;
};
