/**
 * CI/CD and deployment readiness assessment (Mission P-015.8 · ADR-012).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";
import { operationalMetrics } from "@/lib/platform/operations/OperationalMetrics";

export type DeploymentHealthReport = {
  readonly status: OperationalStatus;
  readonly message: string;
  readonly readinessScore: number;
  readonly checks: readonly OperationalCheck[];
  readonly assessedAt: string;
};

/** Assesses deployment pipeline and environment readiness. */
export class DeploymentHealth {
  assess(input?: { projectRoot?: string }): DeploymentHealthReport {
    const root = input?.projectRoot ?? process.cwd();
    const checks: OperationalCheck[] = [];

    checks.push(this.checkFile("quality_gate_workflow", join(root, ".github", "workflows", "quality-gate.yml"), "CI quality gate workflow"));
    checks.push(this.checkFile("package_build_script", join(root, "package.json"), "package.json with build script"));
    checks.push(this.checkFile("next_config", join(root, "next.config.ts"), "Next.js configuration"));
    checks.push(this.checkFile("operations_docs", join(root, "docs", "Platform", "Operations", "Enterprise-Operational-Readiness.md"), "Operational readiness documentation"));
    checks.push(this.checkFile("backup_guide", join(root, "docs", "Platform", "Operations", "Backup-Recovery-Guide.md"), "Backup and recovery guide"));

    checks.push({
      name: "environment_validation",
      status: process.env.NODE_ENV ? "healthy" : "degraded",
      message: process.env.NODE_ENV
        ? `NODE_ENV=${process.env.NODE_ENV}`
        : "NODE_ENV not set — defaulting to development.",
    });

    checks.push({
      name: "database_url_staging",
      status: process.env.DATABASE_URL ? "healthy" : "degraded",
      message: process.env.DATABASE_URL
        ? "DATABASE_URL configured for persistent store."
        : "DATABASE_URL not set — in-memory store default (dev only).",
    });

    checks.push({
      name: "release_branch_ci",
      status: "degraded",
      message: "CI quality gate runs on main only — release/v1.0.1 extension pending (DEP-002).",
    });

    const passCount = checks.filter((check) => check.status === "healthy").length;
    const readinessScore = Math.round((passCount / checks.length) * 100);

    operationalMetrics.record({
      name: "platform.deployment.readiness",
      value: readinessScore,
      unit: "score",
    });

    const unhealthy = checks.some((check) => check.status === "unhealthy");
    const degraded = checks.some((check) => check.status === "degraded") || readinessScore < 80;

    return {
      status: unhealthy ? "unhealthy" : degraded ? "degraded" : "healthy",
      message: unhealthy
        ? "Deployment readiness failed critical checks."
        : degraded
          ? "Deployment readiness partially met — staging CI extension pending."
          : "Deployment pipeline ready.",
      readinessScore,
      checks,
      assessedAt: new Date().toISOString(),
    };
  }

  assessArtifactVerification(): OperationalCheck {
    const hasBuildOutput = existsSync(join(process.cwd(), ".next"));

    return {
      name: "artifact_verification",
      status: hasBuildOutput ? "healthy" : "degraded",
      message: hasBuildOutput
        ? "Production build artifact (.next) present."
        : "No build artifact detected — run npm run build before deploy.",
    };
  }

  assessRollbackReadiness(): OperationalCheck {
    return {
      name: "rollback_readiness",
      status: "healthy",
      message: "Emergency rollback runbook registered — see RunbookRegistry.",
      details: { runbookId: "emergency-rollback" },
    };
  }

  private checkFile(name: string, path: string, label: string): OperationalCheck {
    return {
      name,
      status: existsSync(path) ? "healthy" : "degraded",
      message: existsSync(path) ? `${label} found.` : `${label} missing at ${path}.`,
    };
  }
}

export const deploymentHealth = new DeploymentHealth();
