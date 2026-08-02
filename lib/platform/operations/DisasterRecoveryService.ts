/**
 * Disaster recovery procedures and validation (Mission P-015.8 · ADR-012).
 */

import { backupService } from "@/lib/platform/operations/BackupService";
import { runbookRegistry } from "@/lib/platform/operations/RunbookRegistry";
import type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";
import { emitStructuredLog } from "@/lib/platform/operations/PlatformDiagnostics";

export type RecoveryProcedureId =
  | "database_recovery"
  | "platform_restart"
  | "configuration_recovery"
  | "release_rollback"
  | "migration_rollback";

export type RecoveryProcedure = {
  readonly id: RecoveryProcedureId;
  readonly title: string;
  readonly runbookId: string;
  readonly steps: readonly string[];
  readonly estimatedRtoMinutes: number;
};

export type RecoveryDrillResult = {
  readonly procedureId: RecoveryProcedureId;
  readonly status: OperationalStatus;
  readonly message: string;
  readonly executedAt: string;
  readonly checks: readonly OperationalCheck[];
};

const RECOVERY_PROCEDURES: readonly RecoveryProcedure[] = [
  {
    id: "database_recovery",
    title: "PostgreSQL Database Recovery",
    runbookId: "database-recovery",
    estimatedRtoMinutes: 60,
    steps: [
      "Verify backup integrity via BackupService.validateRestore",
      "Stop application traffic to platform APIs",
      "Restore PostgreSQL from latest verified backup",
      "Run pending migrations if schema drift detected",
      "Execute health verification runbook",
    ],
  },
  {
    id: "platform_restart",
    title: "Platform Process Restart",
    runbookId: "platform-startup",
    estimatedRtoMinutes: 15,
    steps: [
      "Graceful shutdown via platform shutdown runbook",
      "Verify DATABASE_URL and store configuration",
      "Start application process",
      "Wait for PlatformStore initialization",
      "Verify /api/health returns healthy",
    ],
  },
  {
    id: "configuration_recovery",
    title: "Configuration Recovery",
    runbookId: "incident-response",
    estimatedRtoMinutes: 30,
    steps: [
      "Identify configuration drift from deployment manifest",
      "Restore environment variables from secrets store",
      "Validate environment via validateEnvironment()",
      "Restart affected services",
    ],
  },
  {
    id: "release_rollback",
    title: "Emergency Release Rollback",
    runbookId: "emergency-rollback",
    estimatedRtoMinutes: 45,
    steps: [
      "Identify last known-good release artifact",
      "Deploy previous release tag",
      "Verify migration compatibility",
      "Execute smoke test suite",
      "Confirm RBAC fail-closed in staging/production",
    ],
  },
  {
    id: "migration_rollback",
    title: "Migration Rollback",
    runbookId: "migration-execution",
    estimatedRtoMinutes: 90,
    steps: [
      "Stop write traffic",
      "Review migration runner status",
      "Apply down migration if available",
      "Restore from backup if down migration unavailable",
      "Re-run health and readiness checks",
    ],
  },
] as const;

/** Documents and validates disaster recovery readiness. */
export class DisasterRecoveryService {
  listProcedures(): readonly RecoveryProcedure[] {
    return RECOVERY_PROCEDURES;
  }

  getProcedure(id: RecoveryProcedureId): RecoveryProcedure | undefined {
    return RECOVERY_PROCEDURES.find((procedure) => procedure.id === id);
  }

  validateRecoveryReadiness(): {
    status: OperationalStatus;
    message: string;
    checks: readonly OperationalCheck[];
  } {
    const checks: OperationalCheck[] = [];
    const backupReadiness = backupService.assessBackupReadiness();

    checks.push({
      name: "backup_available",
      status: backupReadiness.status,
      message: backupReadiness.message,
      details: { latestBackupId: backupReadiness.latestBackupId ?? "none" },
    });

    const requiredRunbooks = [
      "database-recovery",
      "platform-startup",
      "emergency-rollback",
      "health-verification",
    ];

    for (const runbookId of requiredRunbooks) {
      const runbook = runbookRegistry.getRunbook(runbookId);
      checks.push({
        name: `runbook_${runbookId}`,
        status: runbook ? "healthy" : "degraded",
        message: runbook
          ? `Runbook '${runbook.title}' registered.`
          : `Runbook '${runbookId}' not registered.`,
      });
    }

    const policy = backupService.getPolicy();
    checks.push({
      name: "rpo_rto_defined",
      status: "healthy",
      message: `RPO ${policy.rpoHours}h · RTO ${policy.rtoMinutes}min · retention ${policy.retentionDays}d.`,
      details: {
        rpoHours: String(policy.rpoHours),
        rtoMinutes: String(policy.rtoMinutes),
        retentionDays: String(policy.retentionDays),
      },
    });

    const unhealthy = checks.some((check) => check.status === "unhealthy");
    const degraded = checks.some((check) => check.status === "degraded");

    return {
      status: unhealthy ? "unhealthy" : degraded ? "degraded" : "healthy",
      message: unhealthy
        ? "Disaster recovery readiness failed."
        : degraded
          ? "Disaster recovery partially ready."
          : "Disaster recovery procedures validated.",
      checks,
    };
  }

  executeRecoveryDrill(procedureId: RecoveryProcedureId): RecoveryDrillResult {
    const procedure = this.getProcedure(procedureId);
    const executedAt = new Date().toISOString();

    if (!procedure) {
      return {
        procedureId,
        status: "unhealthy",
        message: "Unknown recovery procedure.",
        executedAt,
        checks: [],
      };
    }

    const runbook = runbookRegistry.getRunbook(procedure.runbookId);
    const checks: OperationalCheck[] = [
      {
        name: "procedure_defined",
        status: "healthy",
        message: `${procedure.steps.length} recovery steps documented.`,
      },
      {
        name: "runbook_linked",
        status: runbook ? "healthy" : "degraded",
        message: runbook
          ? `Linked runbook '${procedure.runbookId}' available.`
          : `Runbook '${procedure.runbookId}' missing from registry.`,
      },
      {
        name: "rto_within_policy",
        status:
          procedure.estimatedRtoMinutes <= backupService.getPolicy().rtoMinutes
            ? "healthy"
            : "degraded",
        message: `Estimated RTO ${procedure.estimatedRtoMinutes}min.`,
      },
    ];

    emitStructuredLog({
      level: "info",
      message: `Recovery drill executed: ${procedureId}`,
      service: "platform-dr",
      category: "operations",
      metadata: { procedureId, status: "simulated" },
    });

    const degraded = checks.some((check) => check.status === "degraded");

    return {
      procedureId,
      status: degraded ? "degraded" : "healthy",
      message: `Recovery drill for '${procedure.title}' completed (simulated).`,
      executedAt,
      checks,
    };
  }
}

export const disasterRecoveryService = new DisasterRecoveryService();
