/**
 * Shared security compliance types (Mission P-015.10 · ADR-008 · ADR-009 · ADR-010).
 */

export type FindingSeverity = "critical" | "high" | "medium" | "low";

export type ComplianceStatus = "pass" | "warn" | "fail";

export type ComplianceCheck = {
  readonly id: string;
  readonly domain: string;
  readonly title: string;
  readonly status: ComplianceStatus;
  readonly message: string;
  readonly severity: FindingSeverity;
  readonly adr?: string;
};

export type SecurityFinding = {
  readonly id: string;
  readonly title: string;
  readonly severity: FindingSeverity;
  readonly status: "open" | "accepted" | "mitigated" | "resolved";
  readonly description: string;
  readonly recommendation: string;
  readonly adr?: string;
};

export type CertificationVerdict = "GO" | "CONDITIONAL GO" | "NO-GO";

export const OWASP_CONTROLS = [
  "A01:2021-Broken Access Control",
  "A02:2021-Cryptographic Failures",
  "A03:2021-Injection",
  "A04:2021-Insecure Design",
  "A05:2021-Security Misconfiguration",
  "A06:2021-Vulnerable Components",
  "A07:2021-Identification and Authentication Failures",
  "A08:2021-Software and Data Integrity Failures",
  "A09:2021-Security Logging and Monitoring Failures",
  "A10:2021-Server-Side Request Forgery",
] as const;

export const ENTERPRISE_PRINCIPLES = [
  "Least Privilege",
  "Defense in Depth",
  "Secure Configuration",
  "Separation of Duties",
  "Auditability",
  "Recovery Procedures",
] as const;
