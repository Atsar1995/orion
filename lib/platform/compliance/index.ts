import { defaultComplianceRepository } from "@/lib/platform/compliance/repositories/InMemoryComplianceRepository";
import { ComplianceService } from "@/lib/platform/compliance/ComplianceService";
import { EnterpriseAuditService } from "@/lib/platform/compliance/EnterpriseAuditService";
import { EntityHistoryService } from "@/lib/platform/compliance/EntityHistoryService";
import { RetentionService } from "@/lib/platform/compliance/RetentionService";
import { ReportingService } from "@/lib/platform/compliance/ReportingService";

/** Public compliance facade — exposes only approved services (Mission P-010.6). */
export class ComplianceFacade {
  readonly audit: EnterpriseAuditService;
  readonly compliance: ComplianceService;
  readonly history: EntityHistoryService;
  readonly retention: RetentionService;
  readonly reporting: ReportingService;

  constructor(repository = defaultComplianceRepository) {
    this.audit = new EnterpriseAuditService(repository);
    this.compliance = new ComplianceService(repository);
    this.history = new EntityHistoryService(repository);
    this.retention = new RetentionService(repository);
    this.reporting = new ReportingService(repository);
  }
}

export const PLATFORM_MISSION_COMPLIANCE = "P-010.6";
export const complianceFacade = new ComplianceFacade();

/** Public API exports — no repository implementations exposed. */
export const enterpriseAuditService = complianceFacade.audit;
export const complianceService = complianceFacade.compliance;
export const entityHistoryService = complianceFacade.history;
export const retentionService = complianceFacade.retention;
export const reportingService = complianceFacade.reporting;

export { registerComplianceSubscribers } from "@/lib/platform/compliance/register-compliance-subscribers";
