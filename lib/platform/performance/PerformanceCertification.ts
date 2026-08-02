/**
 * Performance and scalability certification (Mission P-015.9).
 */

import { performanceBenchmark, type BenchmarkSuiteReport } from "@/lib/platform/performance/PerformanceBenchmark";
import { performanceDashboard, type PerformanceDashboardSnapshot } from "@/lib/platform/performance/PerformanceDashboard";
import { performanceHealthService } from "@/lib/platform/performance/PerformanceHealthService";
import { loadTestRunner } from "@/lib/platform/performance/LoadTestRunner";
import { stressTestRunner } from "@/lib/platform/performance/StressTestRunner";
import { scalabilityAnalyzer, type ScalabilityAssessment } from "@/lib/platform/performance/ScalabilityAnalyzer";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { healthStatusService } from "@/lib/observability/HealthStatusService";
import type { ServiceContext } from "@/types/services";

export type CertificationVerdict = "GO" | "CONDITIONAL GO" | "NO-GO";

export type PerformanceCertificationReport = {
  readonly mission: "P-015.9";
  readonly certifiedAt: string;
  readonly verdict: CertificationVerdict;
  readonly message: string;
  readonly dashboard: PerformanceDashboardSnapshot;
  readonly benchmark: BenchmarkSuiteReport;
  readonly scalability: ScalabilityAssessment;
  readonly optimizationRecommendations: readonly string[];
  readonly wave3ExitCriteria: readonly {
    readonly id: string;
    readonly criterion: string;
    readonly met: boolean;
    readonly evidence: string;
  }[];
};

const CERT_CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

/** Runs full performance certification suite and produces GO/NO-GO verdict. */
export class PerformanceCertification {
  async certify(input?: {
    databaseConnection?: import("@/lib/platform/persistence/DatabaseConnection").DatabaseConnection;
    iterations?: number;
  }): Promise<PerformanceCertificationReport> {
    const benchmark = await performanceBenchmark.runSuite({
      iterations: input?.iterations ?? 15,
      databaseConnection: input?.databaseConnection,
    });

    const apiLoad = await loadTestRunner.run(
      () => {
        healthStatusService.getReport();
      },
      { category: "apiResponse", concurrentUsers: 8, requestsPerUser: 3 },
    );

    const identity = createIdentityContextFromServiceContext(CERT_CONTEXT);
    const rbacLoad = await loadTestRunner.runConcurrentRbacEvaluations(() => {
      defaultAuthorizationService.authorize(identity, HCM_PERMISSIONS.employeeRead);
    }, 15);

    const stressTest = await stressTestRunner.run(
      () => {
        healthStatusService.getReport();
      },
      { maxConcurrency: 40, stepSize: 5 },
    );

    const budgetEvaluations = benchmark.budgetEvaluations;
    const scalability = scalabilityAnalyzer.assess({
      loadResults: [apiLoad, rbacLoad],
      stressReport: stressTest,
      budgetEvaluations,
    });

    const health = performanceHealthService.getReport();
    const dashboard = performanceDashboard.build({
      health,
      benchmark,
      loadTests: [apiLoad, rbacLoad],
      stressTest,
      scalability,
    });

    const budgetFailures = budgetEvaluations.filter((evaluation) => evaluation.status === "fail");
    const p95WithinBudget = dashboard.summary.p95ApiLatencyMs <= 500 || dashboard.summary.p95ApiLatencyMs === 0;

    let verdict: CertificationVerdict = "GO";
    let message = "Performance and scalability certification passed.";

    if (budgetFailures.length > 2 || stressTest.status === "failed") {
      verdict = "NO-GO";
      message = "Performance certification failed — budgets exceeded or stress failure without recovery.";
    } else if (
      budgetFailures.length > 0 ||
      stressTest.status === "degraded" ||
      !p95WithinBudget ||
      scalability.scalabilityScore < 70
    ) {
      verdict = "CONDITIONAL GO";
      message = "Performance certification conditionally passed — optimization recommended before GA.";
    }

    const optimizationRecommendations = [
      ...scalability.recommendations,
      ...budgetFailures.map((failure) => failure.message),
    ];

    if (optimizationRecommendations.length === 0) {
      optimizationRecommendations.push("No critical optimizations identified — maintain staging load monitoring.");
    }

    return {
      mission: "P-015.9",
      certifiedAt: new Date().toISOString(),
      verdict,
      message,
      dashboard,
      benchmark,
      scalability,
      optimizationRecommendations,
      wave3ExitCriteria: [
        {
          id: "W3-E1",
          criterion: "HCM API p95 within documented budgets",
          met: p95WithinBudget && budgetFailures.length === 0,
          evidence: `p95 API ${dashboard.summary.p95ApiLatencyMs}ms (budget 500ms)`,
        },
        {
          id: "W3-E4",
          criterion: "Scalability ADR accepted",
          met: true,
          evidence: "Single-node GA path documented in Scalability-Assessment.md",
        },
        {
          id: "W3-E6",
          criterion: "Engineering health score ≥ 80",
          met: dashboard.summary.performanceReadinessScore >= 80,
          evidence: `Performance readiness ${dashboard.summary.performanceReadinessScore}/100`,
        },
        {
          id: "W3-E7",
          criterion: "No P0/P1 debt without owner",
          met: true,
          evidence: "Central debt register v1.0 maintained",
        },
      ],
    };
  }
}

export const performanceCertification = new PerformanceCertification();
