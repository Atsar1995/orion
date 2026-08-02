/**
 * Shared operational readiness types (Mission P-015.8 · ADR-011 · ADR-012).
 */

export type OperationalStatus = "healthy" | "degraded" | "unhealthy";

export type OperationalCheck = {
  readonly name: string;
  readonly status: OperationalStatus;
  readonly message: string;
  readonly details?: Record<string, string>;
};

export const DEFAULT_BACKUP_POLICY = {
  rpoHours: 24,
  rtoMinutes: 60,
  retentionDays: 30,
  verifyAfterBackup: true,
} as const;

export const DEFAULT_ALERT_THRESHOLDS = {
  errorRateDegraded: 3,
  errorRateUnhealthy: 10,
  queueDepthDegraded: 25,
  queueDepthUnhealthy: 100,
  poolUtilizationDegraded: 0.8,
  poolUtilizationUnhealthy: 0.95,
} as const;
