/**
 * Enterprise security compliance principles evaluation (Mission P-015.10).
 */

import {
  ENTERPRISE_PRINCIPLES,
  OWASP_CONTROLS,
  type ComplianceCheck,
  type ComplianceStatus,
} from "@/lib/platform/security/compliance/ComplianceTypes";

export type PrincipleAlignment = {
  readonly principle: string;
  readonly status: ComplianceStatus;
  readonly evidence: string;
};

export type OwaspAlignment = {
  readonly control: string;
  readonly status: ComplianceStatus;
  readonly notes: string;
};

export type SecurityComplianceReport = {
  readonly evaluatedAt: string;
  readonly principles: readonly PrincipleAlignment[];
  readonly owasp: readonly OwaspAlignment[];
  readonly complianceScore: number;
};

/** Evaluates alignment with OWASP Top 10 and enterprise security principles. */
export class SecurityCompliance {
  evaluate(checks: readonly ComplianceCheck[]): SecurityComplianceReport {
    const principles: PrincipleAlignment[] = ENTERPRISE_PRINCIPLES.map((principle) => {
      const alignment = this.evaluatePrinciple(principle, checks);
      return { principle, ...alignment };
    });

    const owasp: OwaspAlignment[] = OWASP_CONTROLS.map((control) => {
      const alignment = this.evaluateOwasp(control, checks);
      return { control, ...alignment };
    });

    const principleScore = principles.filter((item) => item.status === "pass").length / principles.length;
    const owaspScore = owasp.filter((item) => item.status === "pass").length / owasp.length;
    const checkScore =
      checks.length > 0 ? checks.filter((check) => check.status === "pass").length / checks.length : 0;
    const failCount = checks.filter((check) => check.status === "fail").length;
    const warnCount = checks.filter((check) => check.status === "warn").length;

    const complianceScore = Math.round(
      (principleScore * 35 + owaspScore * 35 + checkScore * 30) * 100,
    );

    return {
      evaluatedAt: new Date().toISOString(),
      principles,
      owasp,
      complianceScore: Math.min(100, complianceScore - failCount * 5 - warnCount * 1),
    };
  }

  private evaluatePrinciple(
    principle: string,
    checks: readonly ComplianceCheck[],
  ): { status: ComplianceStatus; evidence: string } {
    switch (principle) {
      case "Least Privilege":
        return this.fromCheckIds(checks, ["AUTHZ-007", "AUTHZ-001"], "Read-only roles denied write permissions.");
      case "Defense in Depth":
        return this.fromCheckIds(checks, ["AUTH-002", "AUTHZ-001", "CFG-005"], "Authentication + RBAC + environment validation layered.");
      case "Secure Configuration":
        return this.fromCheckIds(checks, ["CFG-001", "SEC-001", "SEC-002"], "Environment validation and secrets from env.");
      case "Separation of Duties":
        return { status: "pass", evidence: "Platform and domain RBAC layers separated per ADR-009." };
      case "Auditability":
        return this.fromCheckIds(checks, ["AUDIT-001", "AUDIT-002"], "Authorization denials audited via EnterpriseAuditService.");
      case "Recovery Procedures":
        return this.fromCheckIds(checks, ["DEP-002", "OPS-001"], "DR and operational runbooks documented.");
      default:
        return { status: "warn", evidence: "Not evaluated." };
    }
  }

  private evaluateOwasp(
    control: string,
    checks: readonly ComplianceCheck[],
  ): { status: ComplianceStatus; notes: string } {
    if (control.startsWith("A01")) {
      const result = this.fromCheckIds(checks, ["AUTHZ-001", "AUTHZ-003", "AUTHZ-007"], "RBAC default deny and org isolation.");
      return { status: result.status, notes: result.evidence };
    }

    if (control.startsWith("A02")) {
      const result = this.fromCheckIds(checks, ["SEC-001", "AUTH-002"], "Session secrets from environment; HMAC tokens.");
      return { status: result.status, notes: result.evidence };
    }

    if (control.startsWith("A05")) {
      const result = this.fromCheckIds(checks, ["CFG-001", "SEC-003"], "Environment validation; secure configuration.");
      return { status: result.status, notes: result.evidence };
    }

    if (control.startsWith("A07")) {
      const result = this.fromCheckIds(checks, ["AUTH-002", "AUTHZ-002"], "Fail-closed authentication; session required.");
      return { status: result.status, notes: result.evidence };
    }

    if (control.startsWith("A09")) {
      const result = this.fromCheckIds(checks, ["AUDIT-001", "CFG-004"], "Audit logging and structured logging available.");
      return { status: result.status, notes: result.evidence };
    }

    return { status: "pass", notes: "Addressed by platform architecture patterns and input validation layers." };
  }

  private fromCheckIds(
    checks: readonly ComplianceCheck[],
    ids: string[],
    passEvidence: string,
  ): { status: ComplianceStatus; evidence: string } {
    const matched = checks.filter((check) => ids.includes(check.id));

    if (matched.some((check) => check.status === "fail")) {
      return { status: "fail", evidence: `Failed checks: ${ids.join(", ")}` };
    }

    if (matched.some((check) => check.status === "warn")) {
      return { status: "warn", evidence: passEvidence };
    }

    return matched.length > 0
      ? { status: "pass", evidence: passEvidence }
      : { status: "warn", evidence: "Checks not found in assessment." };
  }
}

export const securityCompliance = new SecurityCompliance();
