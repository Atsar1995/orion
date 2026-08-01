import { validateEnvironment } from "@/lib/config/env";
import { observabilityStore } from "@/lib/observability/PerformanceMonitor";

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
}

export const healthStatusService = new HealthStatusService();
