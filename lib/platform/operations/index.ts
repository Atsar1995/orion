/**
 * ORION Platform Operations — public API (Mission P-015.8 · ADR-011 · ADR-012).
 *
 * @see docs/Platform/Operations/Enterprise-Operational-Readiness.md
 */

export type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";
export {
  DEFAULT_ALERT_THRESHOLDS,
  DEFAULT_BACKUP_POLICY,
} from "@/lib/platform/operations/OperationalTypes";

export type { ServiceMetric, ServiceMetricName, PlatformMetricsSnapshot } from "@/lib/platform/operations/OperationalMetrics";
export { OperationalMetrics, operationalMetrics } from "@/lib/platform/operations/OperationalMetrics";

export type {
  StructuredLogEntry,
  StructuredLogLevel,
  PlatformDiagnosticsReport,
} from "@/lib/platform/operations/PlatformDiagnostics";
export {
  PlatformDiagnostics,
  platformDiagnostics,
  formatStructuredLog,
  emitStructuredLog,
} from "@/lib/platform/operations/PlatformDiagnostics";

export type {
  BackupPolicy,
  BackupRecord,
  BackupVerificationResult,
  RestoreValidationResult,
} from "@/lib/platform/operations/BackupService";
export { BackupService, backupService } from "@/lib/platform/operations/BackupService";

export type {
  RecoveryProcedure,
  RecoveryProcedureId,
  RecoveryDrillResult,
} from "@/lib/platform/operations/DisasterRecoveryService";
export {
  DisasterRecoveryService,
  disasterRecoveryService,
} from "@/lib/platform/operations/DisasterRecoveryService";

export type { RunbookCategory, RunbookEntry } from "@/lib/platform/operations/RunbookRegistry";
export { RunbookRegistry, runbookRegistry } from "@/lib/platform/operations/RunbookRegistry";

export type { DeploymentHealthReport } from "@/lib/platform/operations/DeploymentHealth";
export { DeploymentHealth, deploymentHealth } from "@/lib/platform/operations/DeploymentHealth";

export type { OperationalHealthReport } from "@/lib/platform/operations/OperationalHealthService";
export {
  OperationalHealthService,
  operationalHealthService,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/operations/OperationalHealthService";

export type {
  StagingValidationCheck,
  StagingValidationReport,
  OperationalReadinessScores,
  OperationalReadinessReport,
} from "@/lib/platform/operations/OperationalReadinessService";
export {
  OperationalReadinessService,
  operationalReadinessService,
} from "@/lib/platform/operations/OperationalReadinessService";

export type {
  EnterpriseReadinessReport,
  EnterpriseReadinessSections,
  Gate6CertificationVerdict,
  Gate6OperationalBlocker,
  Gate6OperationalEvidenceItem,
  Gate6OperationalValidationReport,
  Gate6ReadinessLevel,
  Gate6SignoffSummary,
  PlatformVerificationResult,
  PostgresCertificationScenario,
  PostgresCertificationVerdict,
  PostgresOperationalCertificationReport,
  ReadinessSection,
  ReadinessSectionStatus,
} from "@/lib/platform/operations/OperationalReadinessReport";
export {
  buildReadinessSection,
  deriveCertificationVerdict,
  deriveGate6CertificationVerdict,
  mapOperationalStatusToCertificationVerdict,
  mapOperationalStatusToReadiness,
  mapReadinessToGate7Level,
  worstOperationalStatus,
  worstReadinessStatus,
} from "@/lib/platform/operations/OperationalReadinessReport";
export {
  EnterpriseReadinessService,
  enterpriseReadinessService,
} from "@/lib/platform/operations/EnterpriseReadinessService";
