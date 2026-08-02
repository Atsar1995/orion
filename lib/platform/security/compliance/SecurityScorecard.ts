/**
 * Security scorecard and risk scoring (Mission P-015.10).
 */

import type {
  ComplianceCheck,
  FindingSeverity,
  SecurityFinding,
} from "@/lib/platform/security/compliance/ComplianceTypes";

export type SecurityScorecard = {
  readonly overallSecurityScore: number;
  readonly complianceScore: number;
  readonly identityScore: number;
  readonly authenticationScore: number;
  readonly authorizationScore: number;
  readonly secretsScore: number;
  readonly configurationScore: number;
  readonly deploymentScore: number;
  readonly auditScore: number;
  readonly criticalFindings: number;
  readonly highFindings: number;
  readonly mediumFindings: number;
  readonly lowFindings: number;
  readonly openFindings: number;
  readonly generatedAt: string;
};

/** Computes security scores from compliance checks and findings. */
export class SecurityScorecardService {
  build(input: {
    checks: readonly ComplianceCheck[];
    findings: readonly SecurityFinding[];
    complianceScore: number;
  }): SecurityScorecard {
    const findingsBySeverity = this.countBySeverity(input.findings);
    const openFindings = input.findings.filter((finding) => finding.status === "open").length;

    const domainScores = {
      identity: this.scoreDomain(input.checks, ["ID-001", "ID-002"]),
      authentication: this.scoreDomain(input.checks, ["AUTH-001", "AUTH-002", "AUTHZ-002"]),
      authorization: this.scoreDomain(input.checks, ["AUTHZ-001", "AUTHZ-003", "AUTHZ-004", "AUTHZ-005", "AUTHZ-006", "AUTHZ-007"]),
      secrets: this.scoreDomain(input.checks, ["SEC-001", "SEC-002", "SEC-003", "SEC-004", "SEC-005"]),
      configuration: this.scoreDomain(input.checks, ["CFG-001", "CFG-002", "CFG-003", "CFG-004", "CFG-005"]),
      deployment: this.scoreDomain(input.checks, ["DEP-001", "DEP-002", "DEP-003", "DEP-004", "DEP-005", "STORE-001", "OPS-001"]),
      audit: this.scoreDomain(input.checks, ["AUDIT-001", "AUDIT-002", "API-001"]),
    };

    const weightedOverall = Math.round(
      domainScores.identity * 0.1 +
        domainScores.authentication * 0.15 +
        domainScores.authorization * 0.25 +
        domainScores.secrets * 0.15 +
        domainScores.configuration * 0.1 +
        domainScores.deployment * 0.1 +
        domainScores.audit * 0.15,
    );

    const penalty =
      findingsBySeverity.critical * 15 +
      findingsBySeverity.high * 8 +
      findingsBySeverity.medium * 3 +
      findingsBySeverity.low * 1;

    return {
      overallSecurityScore: Math.max(0, Math.min(100, weightedOverall - penalty + Math.round(input.complianceScore * 0.1))),
      complianceScore: input.complianceScore,
      identityScore: domainScores.identity,
      authenticationScore: domainScores.authentication,
      authorizationScore: domainScores.authorization,
      secretsScore: domainScores.secrets,
      configurationScore: domainScores.configuration,
      deploymentScore: domainScores.deployment,
      auditScore: domainScores.audit,
      criticalFindings: findingsBySeverity.critical,
      highFindings: findingsBySeverity.high,
      mediumFindings: findingsBySeverity.medium,
      lowFindings: findingsBySeverity.low,
      openFindings,
      generatedAt: new Date().toISOString(),
    };
  }

  private scoreDomain(checks: readonly ComplianceCheck[], ids: string[]): number {
    const matched = checks.filter((check) => ids.includes(check.id));

    if (matched.length === 0) {
      return 70;
    }

    const points = matched.reduce((sum, check) => {
      if (check.status === "pass") {
        return sum + 100;
      }

      if (check.status === "warn") {
        return sum + 70;
      }

      return sum + 30;
    }, 0);

    return Math.round(points / matched.length);
  }

  private countBySeverity(findings: readonly SecurityFinding[]): Record<FindingSeverity, number> {
    return findings.reduce(
      (counts, finding) => {
        counts[finding.severity] += 1;
        return counts;
      },
      { critical: 0, high: 0, medium: 0, low: 0 },
    );
  }
}

export const securityScorecardService = new SecurityScorecardService();
