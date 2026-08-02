/**
 * ORION Platform Security Compliance — public API (Mission P-015.10 · ADR-008 · ADR-009 · ADR-010).
 *
 * @see docs/Platform/Security/Enterprise-Security-Certification.md
 */

export type {
  FindingSeverity,
  ComplianceStatus,
  ComplianceCheck,
  SecurityFinding,
  CertificationVerdict,
} from "@/lib/platform/security/compliance/ComplianceTypes";
export { OWASP_CONTROLS, ENTERPRISE_PRINCIPLES } from "@/lib/platform/security/compliance/ComplianceTypes";

export type { ChecklistCategory, ChecklistItem } from "@/lib/platform/security/compliance/ComplianceChecklist";
export { COMPLIANCE_CHECKLIST, ComplianceChecklist, complianceChecklist } from "@/lib/platform/security/compliance/ComplianceChecklist";

export { ConfigurationAudit, configurationAudit } from "@/lib/platform/security/compliance/ConfigurationAudit";
export { SecretsAudit, secretsAudit } from "@/lib/platform/security/compliance/SecretsAudit";
export { AuthorizationAudit, authorizationAudit } from "@/lib/platform/security/compliance/AuthorizationAudit";
export { DeploymentSecurityAudit, deploymentSecurityAudit } from "@/lib/platform/security/compliance/DeploymentSecurityAudit";

export type { SecurityAssessmentReport } from "@/lib/platform/security/compliance/SecurityAssessment";
export { SecurityAssessment, securityAssessment } from "@/lib/platform/security/compliance/SecurityAssessment";

export type {
  PrincipleAlignment,
  OwaspAlignment,
  SecurityComplianceReport,
} from "@/lib/platform/security/compliance/SecurityCompliance";
export { SecurityCompliance, securityCompliance } from "@/lib/platform/security/compliance/SecurityCompliance";

export type { SecurityScorecard } from "@/lib/platform/security/compliance/SecurityScorecard";
export { SecurityScorecardService, securityScorecardService } from "@/lib/platform/security/compliance/SecurityScorecard";

export type { ComplianceDashboardSnapshot } from "@/lib/platform/security/compliance/ComplianceDashboard";
export { ComplianceDashboard, complianceDashboard } from "@/lib/platform/security/compliance/ComplianceDashboard";

export type { SecurityCertificationReport } from "@/lib/platform/security/compliance/SecurityCertification";
export { SecurityCertification, securityCertification } from "@/lib/platform/security/compliance/SecurityCertification";
