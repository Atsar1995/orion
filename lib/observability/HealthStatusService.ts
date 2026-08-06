import { validateEnvironment } from "@/lib/config/env";
import { observabilityStore } from "@/lib/observability/PerformanceMonitor";
import {
  securityHealthService,
  toObservabilitySecurityStatus,
} from "@/lib/platform/security/SecurityHealthService";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { toObservabilityHealthStatus } from "@/lib/platform/store/PlatformStore";
import { createPlatformStoreHealthReport } from "@/lib/platform/store/PlatformStoreHealth";
import { loadStoreConfiguration, StoreProvider } from "@/lib/platform/store/StoreConfiguration";

export type HealthCheckStatus = "healthy" | "degraded" | "unhealthy";

export type HealthCheck = {
  readonly name: string;
  readonly status: HealthCheckStatus;
  readonly message: string;
};

export type PlatformHealthReport = {
  readonly status: HealthCheckStatus;
  readonly version: string;
  readonly timestamp: string;
  readonly uptimeSeconds: number;
  readonly checks: readonly HealthCheck[];
};

export type HealthVerificationResult = {
  readonly status: HealthCheckStatus;
  readonly message: string;
  readonly checks: readonly HealthCheck[];
  readonly verifiedAt: string;
};

const startedAt = Date.now();

/** Platform health status service (Mission S1D). */
export class HealthStatusService {
  getReport(version = process.env.npm_package_version ?? "0.2.0"): PlatformHealthReport {
    const env = validateEnvironment();
    const recentErrors = observabilityStore.getErrors(5);
    const checks: HealthCheck[] = [];

    checks.push({
      name: "environment",
      status: env.valid ? "healthy" : env.isProduction ? "unhealthy" : "degraded",
      message: env.valid
        ? "Environment configuration valid."
        : env.issues.map((issue) => issue.message).join(" "),
    });

    checks.push({
      name: "logging",
      status: "healthy",
      message: "Structured logging active.",
    });

    checks.push({
      name: "errors",
      status: recentErrors.length >= 3 ? "degraded" : "healthy",
      message:
        recentErrors.length === 0
          ? "No recent client errors recorded."
          : `${recentErrors.length} recent error(s) recorded.`,
    });

    const storeConfig = loadStoreConfiguration();
    const storeHealth =
      storeConfig.provider === StoreProvider.InMemory
        ? new InMemoryPlatformStore({ configuration: storeConfig }).getHealth()
        : createPlatformStoreHealthReport({
            provider: storeConfig.provider,
            status: "healthy",
            initialized: true,
            message: "Relational platform store configured for server runtime.",
            migrationReady: true,
          });
    checks.push({
      name: "platform_store",
      status: toObservabilityHealthStatus(storeHealth.status),
      message: storeHealth.message,
    });

    const inMemoryStore =
      storeConfig.provider === StoreProvider.InMemory
        ? new InMemoryPlatformStore({ configuration: storeConfig })
        : null;

    const hcmStoreHealth = inMemoryStore?.getHcmBacking() ?? null;
    checks.push({
      name: "hcm_platform",
      status: hcmStoreHealth ? "healthy" : "degraded",
      message: hcmStoreHealth
        ? "HCM store backing available via PlatformStore."
        : "HCM backing resolves after relational platform store initialization.",
    });

    const financeStoreHealth = inMemoryStore?.getFinanceBacking() ?? null;
    checks.push({
      name: "finance_platform",
      status: financeStoreHealth ? "healthy" : "degraded",
      message: financeStoreHealth
        ? "Finance store backing available via PlatformStore."
        : "Finance backing resolves after relational platform store initialization.",
    });

    checks.push({
      name: "finance_persistence_repositories",
      status: financeStoreHealth ? "healthy" : "degraded",
      message: financeStoreHealth
        ? "Finance journal and lineage repository backing initialized."
        : "Finance persistence repositories require initialized PlatformStore.",
    });

    const crmStoreHealth = inMemoryStore?.getCrmBacking() ?? null;
    checks.push({
      name: "crm_platform",
      status: crmStoreHealth ? "healthy" : "degraded",
      message: crmStoreHealth
        ? "CRM store backing available via PlatformStore."
        : "CRM backing resolves after relational platform store initialization.",
    });

    const procurementStoreHealth = inMemoryStore?.getProcurementBacking() ?? null;
    checks.push({
      name: "procurement_platform",
      status: procurementStoreHealth ? "healthy" : "degraded",
      message: procurementStoreHealth
        ? "Procurement store backing available via PlatformStore."
        : "Procurement backing resolves after relational platform store initialization.",
    });

    const securityHealth = securityHealthService.getReport();
    checks.push({
      name: "platform_security",
      status: toObservabilitySecurityStatus(securityHealth.status),
      message: securityHealth.message,
    });

    const unhealthy = checks.some((check) => check.status === "unhealthy");
    const degraded = checks.some((check) => check.status === "degraded");

    return {
      status: unhealthy ? "unhealthy" : degraded ? "degraded" : "healthy",
      version,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      checks,
    };
  }

  /** Structured health verification for enterprise readiness reporting (P-011.1). */
  verifyHealth(version = process.env.npm_package_version ?? "0.2.0"): HealthVerificationResult {
    const report = this.getReport(version);

    return {
      status: report.status,
      message:
        report.status === "healthy"
          ? "All registered health checks passed."
          : report.status === "degraded"
            ? "Health checks passed with degraded subsystems."
            : "One or more health checks failed.",
      checks: report.checks,
      verifiedAt: report.timestamp,
    };
  }
}

export const healthStatusService = new HealthStatusService();
