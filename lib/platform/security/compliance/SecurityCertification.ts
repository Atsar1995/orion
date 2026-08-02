/**
 * Enterprise security certification (Mission P-015.10 · ADR-008 · ADR-009 · ADR-010).
 */

import { complianceDashboard, type ComplianceDashboardSnapshot } from "@/lib/platform/security/compliance/ComplianceDashboard";
import { securityAssessment } from "@/lib/platform/security/compliance/SecurityAssessment";
import { securityCompliance } from "@/lib/platform/security/compliance/SecurityCompliance";
import { securityScorecardService } from "@/lib/platform/security/compliance/SecurityScorecard";
import type {
  CertificationVerdict,
  SecurityFinding,
} from "@/lib/platform/security/compliance/ComplianceTypes";

export type SecurityCertificationReport = {
  readonly mission: "P-015.10";
  readonly certifiedAt: string;
  readonly verdict: CertificationVerdict;
  readonly executiveRecommendation: string;
  readonly message: string;
  readonly dashboard: ComplianceDashboardSnapshot;
  readonly riskRegister: readonly SecurityFinding[];
  readonly recommendations: readonly string[];
  readonly wave4ExitCriteria: readonly {
    readonly id: string;
    readonly criterion: string;
    readonly met: boolean;
    readonly evidence: string;
  }[];
  readonly outOfScope: readonly string[];
};

const POST_GA_ROADMAP = [
  "OAuth2 / OIDC",
  "SSO",
  "MFA",
  "Cloud IAM integration",
  "External identity providers",
] as const;

/** Runs full security and compliance certification producing GO verdict. */
export class SecurityCertification {
  certify(input?: { projectRoot?: string }): SecurityCertificationReport {
    const assessment = securityAssessment.assess(input);
    const compliance = securityCompliance.evaluate(assessment.checks);
    const scorecard = securityScorecardService.build({
      checks: assessment.checks,
      findings: assessment.findings,
      complianceScore: compliance.complianceScore,
    });
    const dashboard = complianceDashboard.build({ assessment, compliance, scorecard });

    const criticalOpen = assessment.findings.filter(
      (finding) => finding.severity === "critical" && finding.status === "open",
    );
    const highOpen = assessment.findings.filter(
      (finding) => finding.severity === "high" && finding.status === "open",
    );
    const failedChecks = assessment.checks.filter((check) => check.status === "fail");

    let verdict: CertificationVerdict = "GO";
    let message = "Security and compliance certification passed for current GA architecture.";
    let executiveRecommendation =
      "Proceed to Wave 5 GA certification with staging fail-closed verification.";

    if (criticalOpen.length > 0 || failedChecks.some((check) => check.severity === "critical")) {
      verdict = "NO-GO";
      message = "Security certification failed — critical findings require remediation.";
      executiveRecommendation = "Do not proceed to GA until critical security findings are resolved.";
    } else if (
      highOpen.length > 0 ||
      failedChecks.length > 0 ||
      scorecard.overallSecurityScore < 80 ||
      compliance.complianceScore < 80
    ) {
      verdict = "CONDITIONAL GO";
      message =
        "Security certification conditionally passed — address high findings and staging verification before GA.";
      executiveRecommendation =
        "Approve Wave 4 completion with conditions: resolve open high findings and verify fail-closed in staging.";
    }

    const recommendations = [
      ...assessment.findings
        .filter((finding) => finding.status === "open")
        .map((finding) => finding.recommendation),
      "Verify fail-closed RBAC on staging with unauthenticated HCM API requests.",
      "Set ORION_SESSION_SECRET before any staging/production deployment.",
      "Extend CI quality gate to release branch (DEP-002).",
    ];

    if (recommendations.length === 0) {
      recommendations.push("Maintain security regression suite in CI.");
    }

    return {
      mission: "P-015.10",
      certifiedAt: new Date().toISOString(),
      verdict,
      executiveRecommendation,
      message,
      dashboard,
      riskRegister: assessment.findings,
      recommendations: [...new Set(recommendations)],
      wave4ExitCriteria: [
        {
          id: "W4-E1",
          criterion: "Security validation complete",
          met: verdict !== "NO-GO",
          evidence: `Security score ${scorecard.overallSecurityScore}/100`,
        },
        {
          id: "W4-E2",
          criterion: "Fail-closed verified",
          met: assessment.checks.some((check) => check.id === "AUTHZ-002" && check.status === "pass"),
          evidence: "Fail-closed mode active in test/production configuration",
        },
        {
          id: "W4-E3",
          criterion: "Audit trail operational",
          met: assessment.auditIntegration,
          evidence: "EnterpriseAuditService + authorization audit hook",
        },
        {
          id: "W4-E4",
          criterion: "No critical open findings",
          met: criticalOpen.length === 0,
          evidence: `${criticalOpen.length} critical open finding(s)`,
        },
      ],
      outOfScope: [...POST_GA_ROADMAP],
    };
  }
}

export const securityCertification = new SecurityCertification();
