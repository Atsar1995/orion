/**
 * Enterprise operational readiness report model (Mission P-011.1 · P-017.1 §15).
 */

import type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";

/** Section readiness for Gate 6 / Gate 7 certification evidence. */
export type ReadinessSectionStatus = "ready" | "partial" | "not_ready";

export type ReadinessSection = {
  readonly name: string;
  readonly status: ReadinessSectionStatus;
  readonly message: string;
  readonly checks: readonly OperationalCheck[];
};

export type PlatformVerificationResult = {
  readonly name: string;
  readonly status: OperationalStatus;
  readonly message: string;
  readonly checks: readonly OperationalCheck[];
  readonly verifiedAt: string;
};

export type EnterpriseReadinessSections = {
  readonly platform: ReadinessSection;
  readonly persistence: ReadinessSection;
  readonly health: ReadinessSection;
  readonly security: ReadinessSection;
  readonly rbac: ReadinessSection;
  readonly rest: ReadinessSection;
  readonly canonicalEvents: ReadinessSection;
  readonly platformStore: ReadinessSection;
  readonly compositionRoots: ReadinessSection;
  readonly postgresql: ReadinessSection;
  readonly monitoring: ReadinessSection;
  readonly operations: ReadinessSection;
};

/** Structured enterprise readiness report for OPS-001 and Gate 7 validation. */
export type EnterpriseReadinessReport = {
  readonly status: OperationalStatus;
  readonly message: string;
  readonly overallReadiness: ReadinessSectionStatus;
  readonly assessedAt: string;
  readonly sections: EnterpriseReadinessSections;
  readonly startupVerification: PlatformVerificationResult;
  readonly shutdownVerification: PlatformVerificationResult;
};

export function mapOperationalStatusToReadiness(
  status: OperationalStatus,
): ReadinessSectionStatus {
  if (status === "healthy") {
    return "ready";
  }

  if (status === "degraded") {
    return "partial";
  }

  return "not_ready";
}

export function worstOperationalStatus(
  ...statuses: OperationalStatus[]
): OperationalStatus {
  if (statuses.some((status) => status === "unhealthy")) {
    return "unhealthy";
  }

  if (statuses.some((status) => status === "degraded")) {
    return "degraded";
  }

  return "healthy";
}

export function worstReadinessStatus(
  ...statuses: ReadinessSectionStatus[]
): ReadinessSectionStatus {
  if (statuses.some((status) => status === "not_ready")) {
    return "not_ready";
  }

  if (statuses.some((status) => status === "partial")) {
    return "partial";
  }

  return "ready";
}

export function buildReadinessSection(
  name: string,
  checks: readonly OperationalCheck[],
  readyMessage: string,
  partialMessage: string,
  notReadyMessage: string,
): ReadinessSection {
  const unhealthy = checks.some((check) => check.status === "unhealthy");
  const degraded = checks.some((check) => check.status === "degraded");

  const status: ReadinessSectionStatus = unhealthy
    ? "not_ready"
    : degraded
      ? "partial"
      : "ready";

  return {
    name,
    status,
    message: unhealthy ? notReadyMessage : degraded ? partialMessage : readyMessage,
    checks,
  };
}
