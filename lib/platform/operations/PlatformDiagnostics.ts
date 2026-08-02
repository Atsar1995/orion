/**
 * Platform diagnostics and structured logging (Mission P-015.8 · ADR-011).
 */

import { validateEnvironment } from "@/lib/config/env";
import { createCorrelationId } from "@/lib/platform/events/PlatformEventFactory";
import { loadStoreConfiguration } from "@/lib/platform/store/StoreConfiguration";
import type { OperationalStatus } from "@/lib/platform/operations/OperationalTypes";

export type StructuredLogLevel = "debug" | "info" | "warn" | "error";

export type StructuredLogEntry = {
  readonly timestamp: string;
  readonly level: StructuredLogLevel;
  readonly message: string;
  readonly correlationId: string;
  readonly service: string;
  readonly category: string;
  readonly metadata?: Record<string, string | number | boolean>;
};

export type PlatformDiagnosticsReport = {
  readonly status: OperationalStatus;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly version: string;
  readonly environment: string;
  readonly storeProvider: string;
  readonly logFormat: "json" | "text";
  readonly checks: readonly { name: string; status: OperationalStatus; message: string }[];
};

const diagnosticsStartedAt = Date.now();

function resolveLogFormat(): "json" | "text" {
  return process.env.ORION_LOG_FORMAT === "json" ? "json" : "text";
}

/** Formats a structured log entry as JSON (ADR-011 production format). */
export function formatStructuredLog(entry: StructuredLogEntry): string {
  return JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    message: entry.message,
    correlationId: entry.correlationId,
    service: entry.service,
    category: entry.category,
    ...(entry.metadata ? { metadata: entry.metadata } : {}),
  });
}

/** Emits a structured log entry to stdout when not in test mode. */
export function emitStructuredLog(
  input: Omit<StructuredLogEntry, "timestamp" | "correlationId"> & {
    correlationId?: string;
    timestamp?: string;
  },
): StructuredLogEntry {
  const entry: StructuredLogEntry = {
    ...input,
    correlationId: input.correlationId ?? createCorrelationId(),
    timestamp: input.timestamp ?? new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "test") {
    const output = resolveLogFormat() === "json" ? formatStructuredLog(entry) : `[ORION:${entry.category}] ${entry.message}`;

    switch (entry.level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      default:
        console.info(output);
    }
  }

  return entry;
}

/** Collects platform diagnostic signals for operational dashboards. */
export class PlatformDiagnostics {
  collect(correlationId = createCorrelationId()): PlatformDiagnosticsReport {
    const env = validateEnvironment();
    const storeConfig = loadStoreConfiguration();
    const checks: { name: string; status: OperationalStatus; message: string }[] = [];

    checks.push({
      name: "environment",
      status: env.valid ? "healthy" : env.isProduction ? "unhealthy" : "degraded",
      message: env.valid ? "Environment valid." : `${env.issues.length} configuration issue(s).`,
    });

    checks.push({
      name: "uptime",
      status: "healthy",
      message: `Process uptime ${Math.floor((Date.now() - diagnosticsStartedAt) / 1000)}s.`,
    });

    checks.push({
      name: "logging",
      status: "healthy",
      message: `Structured logging active (${resolveLogFormat()} format).`,
    });

    const unhealthy = checks.some((check) => check.status === "unhealthy");
    const degraded = checks.some((check) => check.status === "degraded");

    return {
      status: unhealthy ? "unhealthy" : degraded ? "degraded" : "healthy",
      correlationId,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.2.0",
      environment: process.env.NODE_ENV ?? "development",
      storeProvider: storeConfig.provider,
      logFormat: resolveLogFormat(),
      checks,
    };
  }
}

export const platformDiagnostics = new PlatformDiagnostics();
