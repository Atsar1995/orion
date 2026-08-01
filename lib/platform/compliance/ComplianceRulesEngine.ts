import type {
  AuditSearchQuery,
  ComplianceCategory,
  RecordAuditInput,
  RetentionPolicyRecord,
} from "@/types/enterprise-audit";
import type { ServiceContext } from "@/types/services";

export type ComplianceValidationError = {
  readonly code: string;
  readonly message: string;
};

/** Domain-agnostic compliance validation (Mission P-010.6). */
export class ComplianceRulesEngine {
  validateOrganizationAccess(
    record: { readonly organizationId: string },
    context: ServiceContext,
  ): ComplianceValidationError | null {
    if (record.organizationId !== context.organizationId && context.role !== "super_admin") {
      return { code: "ORGANIZATION_ISOLATION", message: "Organization access denied." };
    }
    return null;
  }

  validateAuditInput(input: RecordAuditInput): ComplianceValidationError[] {
    const errors: ComplianceValidationError[] = [];
    if (!input.domainKey.trim()) errors.push({ code: "INVALID_DOMAIN", message: "Domain key is required." });
    if (!input.entityType.trim()) errors.push({ code: "INVALID_ENTITY_TYPE", message: "Entity type is required." });
    if (!input.entityId.trim()) errors.push({ code: "INVALID_ENTITY_ID", message: "Entity id is required." });
    if (!input.sourceService.trim()) errors.push({ code: "INVALID_SOURCE", message: "Source service is required." });
    return errors;
  }

  validateSearchQuery(query: AuditSearchQuery): ComplianceValidationError[] {
    const errors: ComplianceValidationError[] = [];
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    if (page < 1) errors.push({ code: "INVALID_PAGE", message: "Page must be >= 1." });
    if (pageSize < 1 || pageSize > 200) {
      errors.push({ code: "INVALID_PAGE_SIZE", message: "Page size must be between 1 and 200." });
    }
    if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
      errors.push({ code: "INVALID_DATE_RANGE", message: "dateFrom must be before dateTo." });
    }
    return errors;
  }

  validateRetentionPolicy(policy: Omit<RetentionPolicyRecord, "id" | "updatedAt">): ComplianceValidationError[] {
    const errors: ComplianceValidationError[] = [];
    if (policy.retentionDays < 1) {
      errors.push({ code: "INVALID_RETENTION", message: "Retention days must be at least 1." });
    }
    if (policy.archiveAfterDays !== undefined && policy.archiveAfterDays >= policy.retentionDays) {
      errors.push({ code: "INVALID_ARCHIVE", message: "Archive days must be less than retention days." });
    }
    return errors;
  }

  validateCorrelationId(correlationId?: string): ComplianceValidationError | null {
    if (correlationId !== undefined && !correlationId.trim()) {
      return { code: "INVALID_CORRELATION", message: "Correlation id cannot be empty when provided." };
    }
    return null;
  }

  validateCategory(category: string): ComplianceValidationError | null {
    const valid: ComplianceCategory[] = ["security", "financial", "operational", "governance", "privacy", "custom"];
    if (!valid.includes(category as ComplianceCategory)) {
      return { code: "INVALID_CATEGORY", message: `Invalid compliance category: ${category}` };
    }
    return null;
  }

  mapInboundAction(eventType: string): RecordAuditInput["action"] {
    switch (eventType) {
      case "EntityCreated":
        return "entity_created";
      case "EntityUpdated":
      case "DocumentUpdated":
        return "entity_updated";
      case "EntityDeleted":
        return "entity_deleted";
      case "WorkflowCompleted":
        return "workflow_completed";
      case "NotificationSent":
        return "custom";
      case "JournalPosted":
        return "financial_posting";
      default:
        return "custom";
    }
  }
}

export const complianceRulesEngine = new ComplianceRulesEngine();
