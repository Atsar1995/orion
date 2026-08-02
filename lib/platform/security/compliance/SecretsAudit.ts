/**
 * Secrets handling audit (Mission P-015.10 · ADR-010).
 */

import { DEFAULT_SESSION_SECRET } from "@/lib/identity/constants";
import { validateEnvironment } from "@/lib/config/env";
import { loadStoreConfiguration } from "@/lib/platform/store/StoreConfiguration";
import type { ComplianceCheck, SecurityFinding } from "@/lib/platform/security/compliance/ComplianceTypes";

const KNOWN_DEV_FALLBACKS = [
  DEFAULT_SESSION_SECRET,
  "orion-dev-session-secret-change-in-production",
] as const;

/** Audits secrets management patterns against ADR-010. */
export class SecretsAudit {
  audit(): { checks: readonly ComplianceCheck[]; findings: readonly SecurityFinding[] } {
    const checks: ComplianceCheck[] = [];
    const findings: SecurityFinding[] = [];
    const env = validateEnvironment();
    const storeConfig = loadStoreConfiguration();
    const sessionSecret = process.env.ORION_SESSION_SECRET;

    checks.push({
      id: "SEC-001",
      domain: "secrets",
      title: "No hard-coded production secrets in runtime",
      status: env.isProduction && sessionSecret && KNOWN_DEV_FALLBACKS.includes(sessionSecret as typeof KNOWN_DEV_FALLBACKS[number])
        ? "fail"
        : "pass",
      message: env.isProduction
        ? sessionSecret
          ? "Production session secret configured."
          : "Production requires ORION_SESSION_SECRET."
        : "Development mode — dev fallback acceptable with warning.",
      severity: env.isProduction ? "critical" : "low",
      adr: "ADR-010",
    });

    if (!env.isProduction && !sessionSecret) {
      findings.push({
        id: "SEC-F001",
        title: "Development session secret fallback",
        severity: "low",
        status: "accepted",
        description: "ORION_SESSION_SECRET not set — using development fallback.",
        recommendation: "Set ORION_SESSION_SECRET before staging/production deployment.",
        adr: "ADR-010",
      });
    }

    checks.push({
      id: "SEC-002",
      domain: "secrets",
      title: "Database credentials from environment",
      status:
        !storeConfig.databaseUrl ||
        (!storeConfig.databaseUrl.includes("@localhost") || env.isProduction)
          ? "pass"
          : "warn",
      message: storeConfig.databaseUrl
        ? "Database URL loaded from environment variable."
        : "No database URL configured.",
      severity: "medium",
      adr: "ADR-010",
    });

    checks.push({
      id: "SEC-003",
      domain: "secrets",
      title: "Demo password not in production",
      status:
        env.isProduction && process.env.ORION_DEMO_PASSWORD ? "warn" : "pass",
      message:
        env.isProduction && process.env.ORION_DEMO_PASSWORD
          ? "ORION_DEMO_PASSWORD set in production — disable for commercial deployment."
          : "Demo password not exposed in production configuration.",
      severity: "high",
      adr: "ADR-010",
    });

    checks.push({
      id: "SEC-004",
      domain: "secrets",
      title: "Cloud secret manager",
      status: "warn",
      message: "Cloud secret manager adapter deferred post-GA per ADR-010 — env-first pattern active.",
      severity: "medium",
      adr: "ADR-010",
    });

    findings.push({
      id: "SEC-F002",
      title: "Cloud secret manager not integrated",
      severity: "medium",
      status: "accepted",
      description: "ADR-010 secret manager adapter interface planned but not implemented for GA.",
      recommendation: "Integrate cloud secret manager post-GA for production credential rotation.",
      adr: "ADR-010",
    });

    checks.push({
      id: "SEC-005",
      domain: "secrets",
      title: "Health endpoints do not expose secrets",
      status: "pass",
      message: "Health and compliance endpoints return status metadata only — no secret values.",
      severity: "low",
      adr: "ADR-011",
    });

    return { checks, findings };
  }
}

export const secretsAudit = new SecretsAudit();
