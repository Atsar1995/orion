import type { ValidationReport } from "@/types/enterprise-data-validation";
import type { ValidationRepository } from "@/lib/platform/data/repositories/ValidationRepository";
import type { ServiceContext } from "@/types/services";

/** Validation report retrieval (Mission P-011.4). */
export class ValidationReportService {
  constructor(private readonly repository: ValidationRepository) {}

  getReport(reportId: string, context: ServiceContext): ValidationReport | null {
    return this.repository.findReport(context.organizationId, reportId);
  }

  listReports(context: ServiceContext, limit = 50): readonly ValidationReport[] {
    return this.repository.listReports(context.organizationId, limit);
  }
}
