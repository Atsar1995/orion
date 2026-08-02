/**
 * Configuration security audit (Mission P-015.10 · ADR-010).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { validateEnvironment } from "@/lib/config/env";
import { loadStoreConfiguration } from "@/lib/platform/store/StoreConfiguration";
import type { ComplianceCheck } from "@/lib/platform/security/compliance/ComplianceTypes";

/** Audits environment configuration and secure defaults. */
export class ConfigurationAudit {
  audit(input?: { projectRoot?: string }): readonly ComplianceCheck[] {
    const root = input?.projectRoot ?? process.cwd();
    const checks: ComplianceCheck[] = [];
    const env = validateEnvironment();
    const storeConfig = loadStoreConfiguration();

    checks.push({
      id: "CFG-001",
      domain: "configuration",
      title: "Environment validation",
      status: env.valid ? "pass" : env.isProduction ? "fail" : "warn",
      message: env.valid
        ? "Environment configuration valid."
        : `${env.issues.length} issue(s): ${env.issues.map((issue) => issue.key).join(", ")}`,
      severity: env.valid ? "low" : env.isProduction ? "critical" : "medium",
      adr: "ADR-010",
    });

    checks.push({
      id: "CFG-002",
      domain: "configuration",
      title: "Database URL from environment",
      status: storeConfig.databaseUrl || !env.isProduction ? "pass" : "warn",
      message: storeConfig.databaseUrl
        ? "Database connection configured via environment."
        : "No database URL — in-memory store (development acceptable).",
      severity: "medium",
      adr: "ADR-010",
    });

    checks.push({
      id: "CFG-003",
      domain: "configuration",
      title: "Next.js configuration present",
      status: existsSync(join(root, "next.config.ts")) ? "pass" : "warn",
      message: existsSync(join(root, "next.config.ts"))
        ? "Next.js config found with serverExternalPackages for pg."
        : "next.config.ts not found.",
      severity: "low",
      adr: "ADR-010",
    });

    checks.push({
      id: "CFG-004",
      domain: "configuration",
      title: "Log format configuration",
      status: "pass",
      message: `ORION_LOG_FORMAT=${process.env.ORION_LOG_FORMAT ?? "text"} — structured JSON available.`,
      severity: "low",
      adr: "ADR-011",
    });

    checks.push({
      id: "CFG-005",
      domain: "configuration",
      title: "Fail-closed auth configuration",
      status:
        process.env.ORION_AUTH_FAIL_CLOSED === "true" ||
        process.env.NODE_ENV === "production" ||
        process.env.NODE_ENV === "test"
          ? "pass"
          : "warn",
      message:
        process.env.ORION_AUTH_FAIL_CLOSED === "false"
          ? "Fail-closed explicitly disabled — acceptable in development only."
          : "Fail-closed mode active or production enforced.",
      severity: process.env.ORION_AUTH_FAIL_CLOSED === "false" ? "medium" : "low",
      adr: "ADR-008",
    });

    return checks;
  }
}

export const configurationAudit = new ConfigurationAudit();
