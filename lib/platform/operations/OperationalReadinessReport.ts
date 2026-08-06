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

/** PostgreSQL operational certification verdict (Mission P-011.2 · OPS-001). */
export type PostgresCertificationVerdict = "pass" | "conditional" | "fail";

export type PostgresCertificationScenario = PlatformVerificationResult;

/** Engineering evidence report for Gate 7 PostgreSQL operational certification. */
export type PostgresOperationalCertificationReport = {
  readonly verdict: PostgresCertificationVerdict;
  readonly message: string;
  readonly certifiedAt: string;
  readonly scenarios: readonly PostgresCertificationScenario[];
  readonly evidence: readonly string[];
  readonly recommendations: readonly string[];
  readonly readinessReport: EnterpriseReadinessReport;
};

export function mapOperationalStatusToCertificationVerdict(
  status: OperationalStatus,
): PostgresCertificationVerdict {
  if (status === "healthy") {
    return "pass";
  }

  if (status === "degraded") {
    return "conditional";
  }

  return "fail";
}

export function deriveCertificationVerdict(
  ...statuses: OperationalStatus[]
): PostgresCertificationVerdict {
  return mapOperationalStatusToCertificationVerdict(worstOperationalStatus(...statuses));
}

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

/** Gate 6 operational validation verdict (Mission P-011.3 · P-017.1 §15.3). */
export type Gate6CertificationVerdict = "pass" | "conditional_pass" | "fail";

export type Gate6ReadinessLevel = "ready" | "partial" | "not_ready";

/** Operational evidence item for Gate 6 authorization package. */
export type Gate6OperationalEvidenceItem = {
  readonly dimension: keyof EnterpriseReadinessSections | "recovery" | "domains" | "overall";
  readonly status: ReadinessSectionStatus;
  readonly message: string;
  readonly evidence: readonly string[];
};

/** Remaining blocker tracked for Gate 7 / GA closure. */
export type Gate6OperationalBlocker = {
  readonly id: string;
  readonly severity: "P0" | "P1" | "P2";
  readonly message: string;
  readonly owner: string;
  readonly gateTarget: "Gate 6" | "Gate 7" | "GA";
};

/** Executive signoff summary for Gate 6 authorization. */
export type Gate6SignoffSummary = {
  readonly platformOps: Gate6CertificationVerdict;
  readonly architectureReviewBoard: Gate6CertificationVerdict;
  readonly executiveSponsor: Gate6CertificationVerdict;
  readonly authorizationStatement: string;
};

/** Gate 6 operational validation report — evidence package for Gate 7 review (P-011.3). */
export type Gate6OperationalValidationReport = {
  readonly mission: "P-011.3";
  readonly verdict: Gate6CertificationVerdict;
  readonly message: string;
  readonly validatedAt: string;
  readonly evidence: readonly Gate6OperationalEvidenceItem[];
  readonly blockers: readonly Gate6OperationalBlocker[];
  readonly recommendations: readonly string[];
  readonly gate7Readiness: Gate6ReadinessLevel;
  readonly generalAvailabilityImpact: string;
  readonly readinessReport: EnterpriseReadinessReport;
  readonly postgresCertification: PostgresOperationalCertificationReport;
  readonly signoff: Gate6SignoffSummary;
};

export function deriveGate6CertificationVerdict(input: {
  readonly postgresVerdict: PostgresCertificationVerdict;
  readonly overallReadiness: ReadinessSectionStatus;
  readonly hasUnhealthyCriticalPath: boolean;
  readonly liveStagingRequired: boolean;
}): Gate6CertificationVerdict {
  if (input.hasUnhealthyCriticalPath || input.postgresVerdict === "fail") {
    return "fail";
  }

  if (
    input.postgresVerdict === "pass" &&
    input.overallReadiness === "ready" &&
    !input.liveStagingRequired
  ) {
    return "pass";
  }

  return "conditional_pass";
}

export function mapReadinessToGate7Level(
  readiness: ReadinessSectionStatus,
  postgresVerdict: PostgresCertificationVerdict,
): Gate6ReadinessLevel {
  if (readiness === "not_ready" || postgresVerdict === "fail") {
    return "not_ready";
  }

  if (readiness === "ready" && postgresVerdict === "pass") {
    return "ready";
  }

  return "partial";
}
