/**
 * Security compliance dashboard aggregation (Mission P-015.10).
 */

import type { SecurityAssessmentReport } from "@/lib/platform/security/compliance/SecurityAssessment";
import type { SecurityComplianceReport } from "@/lib/platform/security/compliance/SecurityCompliance";
import type { SecurityScorecard } from "@/lib/platform/security/compliance/SecurityScorecard";
import { complianceChecklist } from "@/lib/platform/security/compliance/ComplianceChecklist";

export type ComplianceDashboardSnapshot = {
  readonly generatedAt: string;
  readonly assessment: SecurityAssessmentReport;
  readonly compliance: SecurityComplianceReport;
  readonly scorecard: SecurityScorecard;
  readonly checklistSummary: ReturnType<typeof complianceChecklist.evaluateMappedChecks>;
  readonly productionReadinessContribution: number;
};

/** Aggregates security assessment data for certification and reporting. */
export class ComplianceDashboard {
  build(input: {
    assessment: SecurityAssessmentReport;
    compliance: SecurityComplianceReport;
    scorecard: SecurityScorecard;
  }): ComplianceDashboardSnapshot {
    const checklistSummary = complianceChecklist.evaluateMappedChecks(input.assessment.checks);

    const productionReadinessContribution = Math.round(
      input.scorecard.overallSecurityScore * 0.15 + 78 * 0.85,
    );

    return {
      generatedAt: new Date().toISOString(),
      assessment: input.assessment,
      compliance: input.compliance,
      scorecard: input.scorecard,
      checklistSummary,
      productionReadinessContribution: Math.min(100, productionReadinessContribution),
    };
  }
}

export const complianceDashboard = new ComplianceDashboard();
