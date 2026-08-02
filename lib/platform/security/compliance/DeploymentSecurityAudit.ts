/**
 * Deployment security audit (Mission P-015.10 · ADR-012).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ComplianceCheck, SecurityFinding } from "@/lib/platform/security/compliance/ComplianceTypes";

/** Audits deployment and operational security controls. */
export class DeploymentSecurityAudit {
  audit(input?: { projectRoot?: string }): { checks: readonly ComplianceCheck[]; findings: readonly SecurityFinding[] } {
    const root = input?.projectRoot ?? process.cwd();
    const checks: ComplianceCheck[] = [];
    const findings: SecurityFinding[] = [];

    checks.push({
      id: "DEP-001",
      domain: "deployment",
      title: "Operations runbook documented",
      status: existsSync(join(root, "docs", "Platform", "Operations", "Operations-Runbook.md")) ? "pass" : "warn",
      message: "Platform operations runbook available.",
      severity: "medium",
      adr: "ADR-012",
    });

    checks.push({
      id: "DEP-002",
      domain: "deployment",
      title: "Emergency rollback procedure",
      status: existsSync(join(root, "docs", "Platform", "Operations", "Backup-Recovery-Guide.md")) ? "pass" : "warn",
      message: "Backup and recovery guide documents rollback procedures.",
      severity: "medium",
      adr: "ADR-012",
    });

    checks.push({
      id: "DEP-003",
      domain: "deployment",
      title: "CI quality gate",
      status: existsSync(join(root, ".github", "workflows", "quality-gate.yml")) ? "pass" : "warn",
      message: "GitHub Actions quality gate workflow present.",
      severity: "medium",
      adr: "ADR-012",
    });

    checks.push({
      id: "DEP-004",
      domain: "deployment",
      title: "Production build script",
      status: existsSync(join(root, "package.json")) ? "pass" : "fail",
      message: "package.json with build script available for immutable artifacts.",
      severity: "high",
      adr: "ADR-012",
    });

    checks.push({
      id: "DEP-005",
      domain: "deployment",
      title: "Release branch CI coverage",
      status: "warn",
      message: "CI runs on main only — release branch extension pending (DEP-002).",
      severity: "medium",
      adr: "ADR-012",
    });

    findings.push({
      id: "DEP-F001",
      title: "Release branch CI not extended",
      severity: "medium",
      status: "open",
      description: "Quality gate workflow does not run on release/v1.0.1 branch.",
      recommendation: "Extend CI quality gate to release branch per DEP-002.",
      adr: "ADR-012",
    });

    checks.push({
      id: "OPS-001",
      domain: "operational",
      title: "Security health endpoint",
      status: existsSync(join(root, "app", "api", "health", "operations", "route.ts")) ? "pass" : "warn",
      message: "Operational health endpoint available for security monitoring integration.",
      severity: "low",
      adr: "ADR-011",
    });

    checks.push({
      id: "STORE-001",
      domain: "platform_store",
      title: "PostgreSQL client bundle isolation",
      status: existsSync(join(root, "next.config.ts")) ? "pass" : "warn",
      message: "next.config.ts should declare serverExternalPackages for pg.",
      severity: "high",
      adr: "ADR-007",
    });

    return { checks, findings };
  }
}

export const deploymentSecurityAudit = new DeploymentSecurityAudit();
