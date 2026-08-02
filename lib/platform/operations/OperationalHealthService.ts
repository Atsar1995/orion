/**
 * Operational health aggregation (Mission P-015.8 · ADR-011).
 */

import { validateEnvironment } from "@/lib/config/env";
import { observabilityStore } from "@/lib/observability/PerformanceMonitor";
import { healthStatusService } from "@/lib/observability/HealthStatusService";
import { backupService } from "@/lib/platform/operations/BackupService";
import { deploymentHealth } from "@/lib/platform/operations/DeploymentHealth";
import { disasterRecoveryService } from "@/lib/platform/operations/DisasterRecoveryService";
import { operationalMetrics } from "@/lib/platform/operations/OperationalMetrics";
import type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";
import { platformDiagnostics } from "@/lib/platform/operations/PlatformDiagnostics";
import { securityHealthService } from "@/lib/platform/security/SecurityHealthService";
import {
  ensureDefaultPlatformStoreInitialized,
  getDefaultPlatformStore,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/store/PlatformStoreFactory";
import { toObservabilityHealthStatus } from "@/lib/platform/store/PlatformStore";
import { loadStoreConfiguration, StoreProvider } from "@/lib/platform/store/StoreConfiguration";

export type OperationalHealthReport = {
  readonly status: OperationalStatus;
  readonly timestamp: string;
  readonly uptimeSeconds: number;
  readonly version: string;
  readonly checks: readonly OperationalCheck[];
  readonly diagnostics: ReturnType<typeof platformDiagnostics.collect>;
};

const startedAt = Date.now();

/** Aggregates platform operational health with async dependency probes. */
export class OperationalHealthService {
  async getAggregatedReport(version = process.env.npm_package_version ?? "0.2.0"): Promise<OperationalHealthReport> {
    const started = Date.now();
    const checks: OperationalCheck[] = [];
    const baseHealth = healthStatusService.getReport(version);

    for (const check of baseHealth.checks) {
      checks.push({
        name: check.name,
        status: check.status,
        message: check.message,
      });
    }

    const storeConfig = loadStoreConfiguration();

    try {
      if (storeConfig.provider === StoreProvider.PostgreSQL && storeConfig.databaseUrl) {
        const store = await ensureDefaultPlatformStoreInitialized();
        const storeHealth = await store.checkHealth();

        checks.push({
          name: "platform_store_live",
          status: toObservabilityHealthStatus(storeHealth.status),
          message: storeHealth.message,
          details: storeHealth.details,
        });

        operationalMetrics.record({
          name: "platform.store.initialized",
          value: store.isInitialized() ? 1 : 0,
          unit: "boolean",
        });
      } else {
        const store = getDefaultPlatformStore();
        const storeHealth = store.getHealth();

        checks.push({
          name: "platform_store_live",
          status: toObservabilityHealthStatus(storeHealth.status),
          message: `${storeHealth.message} (in-memory dev mode).`,
        });
      }
    } catch (error) {
      checks.push({
        name: "platform_store_live",
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Platform store health probe failed.",
      });
    }

    const securityHealth = securityHealthService.getReport();
    checks.push({
      name: "rbac_fail_closed",
      status: securityHealth.status,
      message: securityHealth.failClosed
        ? "RBAC fail-closed mode active."
        : "RBAC fail-closed disabled — review AuthenticationContext.",
      details: {
        permissionCount: String(securityHealth.permissionCount),
        failClosed: String(securityHealth.failClosed),
      },
    });

    operationalMetrics.record({
      name: "platform.security.fail_closed",
      value: securityHealth.failClosed ? 1 : 0,
      unit: "boolean",
    });

    const backupReadiness = backupService.assessBackupReadiness();
    checks.push({
      name: "backup_readiness",
      status: backupReadiness.status,
      message: backupReadiness.message,
    });

    const drReadiness = disasterRecoveryService.validateRecoveryReadiness();
    checks.push({
      name: "disaster_recovery",
      status: drReadiness.status,
      message: drReadiness.message,
    });

    const deployReport = deploymentHealth.assess();
    checks.push({
      name: "deployment_readiness",
      status: deployReport.status,
      message: `${deployReport.message} Score: ${deployReport.readinessScore}/100.`,
      details: { readinessScore: String(deployReport.readinessScore) },
    });

    const env = validateEnvironment();
    if (!env.valid) {
      checks.push({
        name: "staging_environment",
        status: env.isProduction ? "unhealthy" : "degraded",
        message: `${env.issues.length} environment validation issue(s).`,
      });
    } else {
      checks.push({
        name: "staging_environment",
        status: "healthy",
        message: "Environment validation passed.",
      });
    }

    const recentErrors = observabilityStore.getErrors(5);
    checks.push({
      name: "client_errors",
      status: recentErrors.length >= 3 ? "degraded" : "healthy",
      message:
        recentErrors.length === 0
          ? "No recent client errors."
          : `${recentErrors.length} recent client error(s).`,
    });

    operationalMetrics.recordHealthCheckLatency(Date.now() - started);

    const unhealthy = checks.some((check) => check.status === "unhealthy");
    const degraded = checks.some((check) => check.status === "degraded");
    const diagnostics = platformDiagnostics.collect();

    return {
      status: unhealthy ? "unhealthy" : degraded ? "degraded" : "healthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      version,
      checks,
      diagnostics,
    };
  }
}

export const operationalHealthService = new OperationalHealthService();

export { resetDefaultPlatformStoreForTests };
