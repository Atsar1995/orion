/**
 * Security compliance checklist definitions (Mission P-015.10).
 */

import type { ComplianceCheck } from "@/lib/platform/security/compliance/ComplianceTypes";

export type ChecklistCategory =
  | "identity"
  | "authentication"
  | "authorization"
  | "secrets"
  | "configuration"
  | "platform_store"
  | "database"
  | "audit"
  | "api"
  | "deployment"
  | "operational";

export type ChecklistItem = {
  readonly id: string;
  readonly category: ChecklistCategory;
  readonly title: string;
  readonly adr: string;
  readonly requirement: string;
};

export const COMPLIANCE_CHECKLIST: readonly ChecklistItem[] = [
  { id: "ID-001", category: "identity", title: "Identity context model", adr: "ADR-008", requirement: "Session-derived IdentityContext with organization binding" },
  { id: "ID-002", category: "identity", title: "No default ServiceContext on APIs", adr: "ADR-008", requirement: "Fail-closed authentication on domain REST" },
  { id: "AUTH-001", category: "authentication", title: "Session-based authentication", adr: "ADR-008", requirement: "HMAC-signed session tokens" },
  { id: "AUTH-002", category: "authentication", title: "Fail-closed production mode", adr: "ADR-008", requirement: "ORION_AUTH_FAIL_CLOSED or NODE_ENV=production" },
  { id: "AUTHZ-001", category: "authorization", title: "Default deny RBAC", adr: "ADR-009", requirement: "Unknown permissions rejected" },
  { id: "AUTHZ-002", category: "authorization", title: "Organization isolation", adr: "ADR-009", requirement: "Cross-org access denied except super_admin" },
  { id: "AUTHZ-003", category: "authorization", title: "Permission inheritance", adr: "ADR-009", requirement: "Role registry resolves effective permissions" },
  { id: "AUTHZ-004", category: "authorization", title: "HCM route permissions", adr: "ADR-009", requirement: "All HCM API routes derive permissions" },
  { id: "SEC-001", category: "secrets", title: "No hard-coded production secrets", adr: "ADR-010", requirement: "Secrets from environment only" },
  { id: "SEC-002", category: "secrets", title: "Production secret validation", adr: "ADR-010", requirement: "validateEnvironment rejects weak secrets" },
  { id: "CFG-001", category: "configuration", title: "Environment validation at startup", adr: "ADR-010", requirement: "validateEnvironment() integrated in health" },
  { id: "CFG-002", category: "configuration", title: "Database URL from environment", adr: "ADR-010", requirement: "DATABASE_URL / ORION_DATABASE_URL only" },
  { id: "STORE-001", category: "platform_store", title: "Server-only persistence", adr: "ADR-007", requirement: "pg externalized from client bundles" },
  { id: "STORE-002", category: "platform_store", title: "Store factory isolation", adr: "ADR-007", requirement: "Lazy require for PostgreSQL modules" },
  { id: "DB-001", category: "database", title: "Connection string security", adr: "ADR-007", requirement: "No credentials in source code" },
  { id: "DB-002", category: "database", title: "Parameterized queries", adr: "ADR-007", requirement: "DatabaseConnection uses parameterized SQL" },
  { id: "AUDIT-001", category: "audit", title: "Authorization audit trail", adr: "ADR-009", requirement: "Denials logged via enterprise audit" },
  { id: "AUDIT-002", category: "audit", title: "Structured logging", adr: "ADR-011", requirement: "JSON logging with correlation IDs available" },
  { id: "API-001", category: "api", title: "401/403 mapping", adr: "ADR-008", requirement: "HCM API returns proper auth errors" },
  { id: "API-002", category: "api", title: "Health endpoint exposure", adr: "ADR-011", requirement: "Health endpoints do not expose secrets" },
  { id: "DEP-001", category: "deployment", title: "Deployment runbooks", adr: "ADR-012", requirement: "Release and rollback procedures documented" },
  { id: "DEP-002", category: "deployment", title: "Immutable artifacts", adr: "ADR-012", requirement: "Production build via npm run build" },
  { id: "OPS-001", category: "operational", title: "Incident response runbook", adr: "ADR-012", requirement: "Operational runbooks registered" },
  { id: "OPS-002", category: "operational", title: "Backup and recovery", adr: "ADR-012", requirement: "DR procedures documented" },
] as const;

/** Maps checklist items to compliance check results. */
export class ComplianceChecklist {
  listItems(category?: ChecklistCategory): readonly ChecklistItem[] {
    if (!category) {
      return COMPLIANCE_CHECKLIST;
    }

    return COMPLIANCE_CHECKLIST.filter((item) => item.category === category);
  }

  evaluateMappedChecks(
    results: readonly ComplianceCheck[],
  ): { passed: number; warned: number; failed: number; total: number } {
    let passed = 0;
    let warned = 0;
    let failed = 0;

    for (const check of results) {
      if (check.status === "pass") {
        passed += 1;
      } else if (check.status === "warn") {
        warned += 1;
      } else {
        failed += 1;
      }
    }

    return { passed, warned, failed, total: results.length };
  }
}

export const complianceChecklist = new ComplianceChecklist();
